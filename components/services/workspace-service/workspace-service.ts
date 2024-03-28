import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import {
  SceneDto,
  WorkspaceDto,
  WorkspaceUserDto,
} from "./workspace-service.types";
import WorkspaceEntity from "./entities/workspace-entity";
import SceneEntity from "./entities/scene-entity";
import UserWorkspaceEntity from "./entities/user-workspace-entity";

class WorkspaceService {
  private _workspaces: Map<number, WorkspaceEntity>;
  private _activeWorkspace: WorkspaceEntity | null;
  private _activeWorkspaceUsers: Map<string, UserWorkspaceEntity>; // Attached to active workspace
  private _activeScenes: Map<number, SceneEntity>;

  private $setWorkspaces: any;
  private $setActiveWorkspace: any;
  private $setActiveScenes: any;
  private $setActiveWorkspaceUsers: any;
  private $setError: any;
  private $setWorkspaceLogId: any;

  constructor(private _authService: AuthService) {
    this._workspaces = new Map();
    this._activeWorkspace = null;
    this._activeWorkspaceUsers = new Map();

    this._activeScenes = new Map();

    this.$setWorkspaces = null;
    this.$setActiveWorkspace = null;
    this.$setActiveScenes = null;
    this.$setActiveWorkspaceUsers = null;

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

      this._workspaces.clear();
      workspacesDto.forEach((workspace: any) => {
        const workspaceEntity = new WorkspaceEntity(this, workspace.workspace);
        this._workspaces.set(workspaceEntity.id, workspaceEntity);
      });

      this.updateWorkspaces();

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
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
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

  public async addWorkspace() {
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

      this.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteWorkspace() {
    const workspaceId = this._activeWorkspace?.id;

    const mutation = gql`
      mutation DeleteWorkspace($id: Int!) {
        delete_appv3_scene(where: { workspace_id: { _eq: $_eq } }) {
          affected_rows
        }

        delete_appv3_workspace(where: { id: { _eq: $id } }) {
          affected_rows
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

  public updateTitle(title: string) {
    if (!this._activeWorkspace)
      return this.$setError("No active workspace found.");

    this._activeWorkspace?.updateTitle(title);
  }

  public provideStates(states: any) {
    this.$setWorkspaces = states.setWorkspaces;
    this.$setActiveWorkspace = states.setActiveWorkspace;
    this.$setActiveScenes = states.setActiveScenes;
    this.$setActiveWorkspaceUsers = states.setActiveWorkspaceUsers;
    this.$setError = states.setError;
    this.$setWorkspaceLogId = states.setWorkspaceLogId;
  }

  public get setError() {
    return this.$setError;
  }

  public dispose() {
    this._workspaces.clear();
    this._activeWorkspace = null;
    this._activeWorkspaceUsers.clear();
    this._activeScenes.clear();

    this.$setWorkspaces = null;
  }
}

export default WorkspaceService;
