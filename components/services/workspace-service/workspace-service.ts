import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import {
  CollectionDto,
  SceneDto,
  WorkspaceDto,
  WorkspaceUserDto,
} from "./workspace-service.types";
import WorkspaceEntity from "./entities/workspace-entity";
import SceneEntity from "./entities/scene-entity";
import UserWorkspaceEntity from "./entities/user-workspace-entity";
import { BehaviorSubject } from "rxjs";

class WorkspaceService {
  private _workspaces: Map<number, WorkspaceEntity>;
  private _activeWorkspace: WorkspaceEntity | null;
  private _activeWorkspaceUsers: Map<string, UserWorkspaceEntity>; // Attached to active workspace
  private _activeScenes: Map<number, SceneEntity>;

  private _isDataFetched: boolean;

  private $setWorkspaces: any;
  private $setActiveWorkspace: any;
  private $setActiveScenes: any;
  private $setActiveWorkspaceUsers: any;
  private $setError: any;
  private $setWorkspaceLogId: any;
  private $setIsDataFetched: any;

  private _collections$ = new BehaviorSubject<CollectionDto[]>([]);

  constructor(private _authService: AuthService) {
    this._workspaces = new Map();
    this._activeWorkspace = null;
    this._activeWorkspaceUsers = new Map();

    this._activeScenes = new Map();

    this.$setWorkspaces = null;
    this.$setActiveWorkspace = null;
    this.$setActiveScenes = null;
    this.$setActiveWorkspaceUsers = null;

    this._isDataFetched = false;

    this.addWorkspace = this.addWorkspace.bind(this);
    this.addScene = this.addScene.bind(this);
    this.updateUserRole = this.updateUserRole.bind(this);
    this.addUserToWorkspace = this.addUserToWorkspace.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.deleteWorkspace = this.deleteWorkspace.bind(this);
  }

  public async fetchWorkspaces() {
    try {
      const userMetadata = this._authService.userMetadata;
      if (!userMetadata) return;

      const response = await client.query({
        query: gql`
          query GetUser($userId: Int!) {
            appv3_user_by_pk(id: $userId) {
              created_at
              email
              id
              password
              username
              user_workspaces {
                workspace {
                  name
                  id
                  description
                  created_at
                  scenes {
                    created_at
                    description
                    id
                    name
                  }
                  user_workspaces {
                    user {
                      id
                      username
                    }
                    role {
                      id
                      name
                    }
                  }
                }
              }
              user_collections {
                id
                name
                tmp_type
                collection_workspaces {
                  workspace_id
                  workspace {
                    id
                    name
                  }
                }
              }
            }
          }
        `,
        variables: {
          userId: userMetadata.id,
        },
        fetchPolicy: "network-only",
      });

      const workspacesDto = response?.data?.appv3_user_by_pk?.user_workspaces;
      if (!workspacesDto) {
        this.$setError("Workspaces not found.");
        throw new Error("Workspaces not found.");
      }

      // If no workspaces found, add a new workspace
      if (workspacesDto.length === 0) {
        await this.addWorkspace();
        return;
      }

      this._workspaces.clear();
      workspacesDto.forEach((workspace: any) => {
        const workspaceEntity = new WorkspaceEntity(this, workspace.workspace);
        this._workspaces.set(workspaceEntity.id, workspaceEntity);
      });

      this.updateWorkspaces();

      const collections = await this._prepareCollections(
        response?.data?.appv3_user_by_pk?.user_collections
      );

      this._collections$.next(collections);

      // get initial active workspace
      if (this._workspaces.size > 0) {
        let workspaceId = this._workspaces.keys().next().value;

        if (
          this._activeWorkspace?.id &&
          this._workspaces.has(this._activeWorkspace.id)
        ) {
          workspaceId = this._activeWorkspace.id;
        }

        this.setActiveWorkspace(workspaceId);
      }

      this._isDataFetched = true;
      this.$setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  }

  private async fetchCollections(): Promise<CollectionDto[]> {
    try {
      const query = gql`
        query GetCollections($userId: Int!) {
          appv3_collection(where: { user_id: { _eq: $userId } }) {
            id
            name
            tmp_type
            collection_workspaces {
              workspace {
                id
                name
              }
            }
          }
        }
      `;

      const response = await client.query({
        query,
        variables: {
          userId: this._authService.userMetadata?.id,
        },
      });

      const collections = (response?.data?.appv3_collection ||
        []) as CollectionDto[];

      return collections;
    } catch (error) {
      console.error("Error fetching collections:", error);
      return [];
    }
  }

  private async _prepareCollections(collections: CollectionDto[]) {
    const workspaces = this._workspaces;

    const types = ["Shared", "Favourites", "Trash"];
    const existingTypes = new Set(collections.map((c) => c.tmp_type));

    const missingTypes = types.filter((type) => !existingTypes.has(type));

    const mutation = gql`
      mutation AddCollections($objects: [appv3_collection_insert_input!]!) {
        insert_appv3_collection(objects: $objects) {
          affected_rows
        }
      }
    `;

    const objects = missingTypes.map((type) => ({
      name: type,
      user_id: this._authService.userMetadata?.id,
      tmp_type: type,
    }));

    if (objects.length !== 0) {
      try {
        await client.mutate({
          mutation,
          variables: { objects },
        });

        const newCollections = await this.fetchCollections();
        collections = newCollections;
        //return newCollections;
      } catch (error) {
        console.error("Error adding default collections:", error);
      }
    }

    const restWorkspaces = Array.from(workspaces.keys()).filter((id) => {
      return !collections.some((c) => {
        return c.collection_workspaces.some((cw) => {
          return cw.workspace.id === id;
        });
      });
    });

    const defaultCollection: CollectionDto = {
      id: -1,
      name: "Personal",
      tmp_type: "Personal",
      created_at: new Date().toISOString(),
      collection_workspaces: restWorkspaces.map((id) => ({
        workspace: { id, name: workspaces.get(id)?.name || "" },
      })),
      __typename: "appv3_collection",
    };

    // we need to sort collection in that way, that trash is always in the end
    const sortedCollections = [...collections]?.sort((a, b) => {
      console.log(a, b);

      if (a?.tmp_type === "Trash") return 1;
      if (b?.tmp_type === "Trash") return -1;
      return 0;
    });

    return [defaultCollection, ...sortedCollections];
  }

  public updateWorkspaces() {
    const workspacesArray = Array.from(this._workspaces.values());
    this?.$setWorkspaces([
      ...workspacesArray.map((workspace) => workspace.data),
    ]);
  }

  public updateActiveScenes() {
    const scenesArray = Array.from(this._activeScenes.values());
    this?.$setActiveScenes([...scenesArray].map((scene) => scene.data));
  }

  public updateActiveWorkspaceUsers() {
    const workspaceUsersArray = Array.from(this._activeWorkspaceUsers.values());
    this?.$setActiveWorkspaceUsers(
      [...workspaceUsersArray].map((user) => user.data)
    );
  }

  public setActiveWorkspace(workspaceId: number) {
    this._activeWorkspace = this._workspaces.get(workspaceId) || null;
    this?.$setActiveWorkspace(this._activeWorkspace);

    // Active workspace scenes
    const scenes = this._activeWorkspace?.scenes || new Map();
    this._activeScenes = new Map(scenes);

    this.updateActiveScenes();

    // Active workspace users
    this._activeWorkspaceUsers.clear();
    const workspaceUsers = this._activeWorkspace?.user_workspaces || [];
    workspaceUsers.forEach((workspaceUser: any) => {
      this._activeWorkspaceUsers.set(workspaceUser.user.id, workspaceUser);
    });

    this.updateActiveWorkspaceUsers();
  }

  public async addCollection() {
    const mutation = gql`
      mutation AddCollection($name: String!, $user_id: Int!) {
        insert_appv3_collection(objects: { name: $name, user_id: $user_id }) {
          affected_rows
        }
      }
    `;

    // amount of all collections
    const collections = this._collections$.value;
    const collectionName = `Collection ${collections.length + 1}`;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          name: collectionName,
          user_id: this._authService.userMetadata?.id,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteCollection(collectionId: number) {
    // delete and all linked workspaces
    const mutation = gql`
      mutation DeleteCollection($collection_id: Int!) {
        delete_appv3_collection(where: { id: { _eq: $collection_id } }) {
          affected_rows
        }

        delete_appv3_collection_workspace(
          where: { collection_id: { _eq: $collection_id } }
        ) {
          affected_rows
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          collection_id: collectionId,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteScene(sceneId: number) {
    const mutation = gql`
      mutation DeleteScene($id: Int!) {
        delete_appv3_toolset(where: { scene_id: { _eq: $id } }) {
          affected_rows
        }

        delete_appv3_scene(where: { id: { _eq: $id } }) {
          affected_rows
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          id: sceneId,
        },
      });

      this.fetchWorkspaces();

      this.$setError("Scene deleted successfully.");
    } catch (error) {
      console.error(error);
    }
  }

  public async moveSceneToWorkspace(sceneId: number, workspaceId: number) {
    const mutation = gql`
      mutation MoveSceneToWorkspace($id: Int!, $workspace_id: Int!) {
        update_appv3_scene_by_pk(
          pk_columns: { id: $id }
          _set: { workspace_id: $workspace_id }
        ) {
          id
        }
      }
    `;
    try {
      const data = await client.mutate({
        mutation,
        variables: {
          id: sceneId,
          workspace_id: workspaceId,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async addWorkspace(collectionId?: number) {
    const mutation = gql`
      mutation AddWorkspace(
        $workspace_name: String!
        $user_id: Int!
        $role_id: Int!
        $scene_name: String!
      ) {
        insert_appv3_workspace(
          objects: {
            name: $workspace_name
            user_workspaces: { data: { role_id: $role_id, user_id: $user_id } }
            scenes: { data: { name: $scene_name } }
          }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    const mutation2 = gql`
      mutation AddCollectionWorkspace(
        $collection_id: Int!
        $workspace_id: Int!
      ) {
        insert_appv3_collection_workspace(
          objects: {
            collection_id: $collection_id
            workspace_id: $workspace_id
          }
        ) {
          affected_rows
        }
      }
    `;

    // Call the mutation using the Apollo client
    const authService = this._authService;
    const workspaceName = `Workspace ${authService.userMetadata?.id}-${
      this._workspaces.size + 1
    }`;

    try {
      const adminRoleId = 1;

      const data = await client.mutate({
        mutation,
        variables: {
          workspace_name: workspaceName, // Provide the desired values for the variables
          user_id: authService.userMetadata?.id,
          role_id: adminRoleId,
          scene_name: "Default Scene",
        },
      });

      if (collectionId && collectionId !== -1) {
        await client.mutate({
          mutation: mutation2,
          variables: {
            collection_id: collectionId,
            workspace_id: data.data.insert_appv3_workspace.returning[0].id,
          },
        });
      }

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async renameWorkspace(workspaceId: number, name: string) {
    const mutation = gql`
      mutation RenameWorkspace($id: Int!, $name: String!) {
        update_appv3_workspace_by_pk(
          pk_columns: { id: $id }
          _set: { name: $name }
        ) {
          id
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          id: workspaceId,
          name,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async renameCollection(collectionId: number, name: string) {
    const mutation = gql`
      mutation RenameCollection($id: Int!, $name: String!) {
        update_appv3_collection_by_pk(
          pk_columns: { id: $id }
          _set: { name: $name }
        ) {
          id
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          id: collectionId,
          name,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async moveWorkspaceToCollection(
    workspaceId: number,
    collectionId: number
  ) {
    const mutation = gql`
      mutation DeleteWorkspaceFromCollections(
        $collection_id: Int!
        $workspace_id: Int!
      ) {
        delete_appv3_collection_workspace(
          where: { workspace_id: { _eq: $workspace_id } }
        ) {
          affected_rows
        }

        insert_appv3_collection_workspace(
          objects: {
            collection_id: $collection_id
            workspace_id: $workspace_id
          }
        ) {
          affected_rows
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          collection_id: collectionId,
          workspace_id: workspaceId,
        },
      });

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }

    try {
      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async moveWorkspaceToTrash(workspaceId: number) {
    const trashCollection = this._collections$.value.find(
      (c) => c.tmp_type === "Trash"
    );

    if (!trashCollection) {
      this.$setError("Trash collection not found.");
      console.error("Trash collection not found.");
      return;
    }

    await this.moveWorkspaceToCollection(workspaceId, trashCollection.id);
  }

  public async deleteWorkspace(id?: number) {
    const workspaceId = typeof id === "number" ? id : this._activeWorkspace?.id;

    const mutation = gql`
      mutation DeleteWorkspace($id: Int!) {
        delete_appv3_workspace_product(where: { workspace_id: { _eq: $id } }) {
          affected_rows
        }

        delete_appv3_user_workspace(where: { workspace_id: { _eq: $id } }) {
          affected_rows
        }

        delete_appv3_toolset(where: { workspace_id: { _eq: $id } }) {
          affected_rows
        }

        delete_appv3_scene(where: { workspace_id: { _eq: $id } }) {
          affected_rows
        }

        delete_appv3_collection_workspace(
          where: { workspace_id: { _eq: $id } }
        ) {
          affected_rows
        }

        delete_appv3_workspace_by_pk(id: $id) {
          id
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          id: workspaceId,
        },
      });

      this.fetchWorkspaces();

      this.$setError("Workspace deleted successfully.");

      // Handle the response data here
    } catch (error) {
      this.$setError("Error deleting workspace.");
      console.error(error);
    }
  }

  public async addScene() {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.addScene();
  }

  public updateUserRole(userId: number, roleId: number) {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.updateUserRole(userId, roleId);
  }

  public addUserToWorkspace(email: string) {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.addUserToWorkspace(email);
  }

  public removeUserFromWorkspace(userId: number) {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.removeUserFromWorkspace(userId);
  }

  public updateTitle(title: string) {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.updateTitle(title);
  }

  public getUserRoleWithinWorkspace(
    userId: number,
    workspaceId: number
  ): null | {
    id: number;
    name: string;
  } {
    const workspace = this._workspaces.get(workspaceId);
    if (!workspace) return null;

    return workspace.getUserRole(userId) || null;
  }

  public provideStates(states: any) {
    this.$setWorkspaces = states.setWorkspaces;
    this.$setActiveWorkspace = states.setActiveWorkspace;
    this.$setActiveScenes = states.setActiveScenes;
    this.$setActiveWorkspaceUsers = states.setActiveWorkspaceUsers;
    this.$setError = states.setError;
    this.$setWorkspaceLogId = states.setWorkspaceLogId;
    this.$setIsDataFetched = states.setIsDataFetched;
  }

  public get setError() {
    return this.$setError;
  }

  public get collections$() {
    return this._collections$.asObservable();
  }

  public dispose() {
    this._workspaces.clear();
    this._activeWorkspace = null;
    this._activeWorkspaceUsers.clear();
    this._activeScenes.clear();

    this._isDataFetched = false;

    this.$setWorkspaces = null;
  }
}

export default WorkspaceService;
