import { gql } from "@apollo/client";
import WorkspaceService from "../workspace-service";
import { RoleTypes, SceneDto, WorkspaceDto } from "../workspace-service.types";
import SceneEntity from "./scene-entity";
import client from "@/components/graphql/client/client";
import UserWorkspaceEntity from "./user-workspace-entity";

class WorkspaceEntity {
  private _id: number;

  private _created_at: string;
  private _description: string | null;
  private _name: string;
  private _scenes: Map<number, SceneEntity>;
  private _user_workspaces: Map<string, UserWorkspaceEntity>;

  constructor(
    private _workspaceService: WorkspaceService,
    workspaceDataDto: WorkspaceDto
  ) {
    this._id = workspaceDataDto.id;
    this._created_at = workspaceDataDto.created_at;
    this._description = workspaceDataDto.description;
    this._name = workspaceDataDto.name || "";

    this._scenes = new Map();
    this._updateScenes(workspaceDataDto.scenes);

    this._user_workspaces = new Map();
    this._updateUserWorkspaces(workspaceDataDto.user_workspaces);

    this.addUserToWorkspace = this.addUserToWorkspace.bind(this);
    this.addScene = this.addScene.bind(this);
    this.updateUserRole = this.updateUserRole.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
  }

  private _updateScenes(scenesDto: SceneDto[]) {
    this._scenes = new Map();
    scenesDto.forEach((sceneDto) => {
      const sceneEntity = new SceneEntity(this, sceneDto);

      this._scenes.set(sceneEntity.id, sceneEntity);
    });
  }

  private _updateUserWorkspaces(userWorkspaces: any[]) {
    this._user_workspaces = new Map();
    userWorkspaces.forEach((userWorkspace) => {
      const userWorkspaceEntity = new UserWorkspaceEntity(this, userWorkspace);
      this._user_workspaces.set(userWorkspaceEntity.id, userWorkspaceEntity);
    });
  }

  public async addScene() {
    const mutation = gql`
      mutation AddScene($scene_name: String!, $workspace_id: Int!) {
        insert_appv3_scene(
          objects: { name: $scene_name, workspace_id: $workspace_id }
        ) {
          returning {
            id
          }
        }
      }
    `;

    const workspaceId = this._id;

    // Call the mutation using the Apollo client
    try {
      const { data }: any = await client.mutate({
        mutation,
        variables: {
          scene_name: "New Scene",
          workspace_id: workspaceId,
        },
      });

      const scene = data.insert_appv3_scene.returning[0];
      if (!scene) {
        throw new Error("Scene not found.");
      }

      const sceneId = scene.id;
      window.location.href = `/scene/${sceneId}`;
    } catch (error) {
      console.error(error);
    }
  }

  public async updateUserRole(userId: number, roleId: number) {
    const mutation = gql`
      mutation MyQuery($user_id: Int!, $workspace_id: Int!, $role_id: Int!) {
        update_appv3_user_workspace_by_pk(
          pk_columns: { user_id: $user_id, workspace_id: $workspace_id }
          _set: { role_id: $role_id }
        ) {
          user_id
        }
      }
    `;

    const workspaceId = this._id;

    // Call the mutation using the Apollo client
    try {
      const { data }: any = await client.mutate({
        mutation,
        variables: {
          user_id: userId,
          role_id: roleId,
          workspace_id: workspaceId,
        },
      });

      const updatedUser = data.update_appv3_user_workspace_by_pk;
      if (!updatedUser) {
        throw new Error("User not found.");
      }

      this._workspaceService.fetchWorkspaces();
    } catch (error) {
      console.error(error);
    }
  }

  public async addUserToWorkspace(email: string) {
    const roleId = RoleTypes.VIEWER; // Viewer

    // Find the user by email
    const findUserQuery = gql`
      query FindUser($email: String!) {
        appv3_user(where: { email: { _eq: $email } }) {
          id
        }
      }
    `;

    try {
      const { data }: any = await client.query({
        query: findUserQuery,
        variables: {
          email: email,
        },
      });

      const userId = data.appv3_user[0]?.id;
      if (!userId) {
        throw new Error("User not found.");
      }

      const mutation = gql`
        mutation AddUserToWorkspace(
          $role_id: Int!
          $workspace_id: Int!
          $user_id: Int!
        ) {
          insert_appv3_user_workspace(
            objects: {
              role_id: $role_id
              workspace_id: $workspace_id
              user_id: $user_id
            }
          ) {
            affected_rows
          }
        }
      `;

      const workspaceId = this._id;

      // Call the mutation using the Apollo client
      const { data: mutationData }: any = await client.mutate({
        mutation,
        variables: {
          role_id: roleId,
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      const affectedRows =
        mutationData.insert_appv3_user_workspace.affected_rows;
      if (affectedRows === 0) {
        throw new Error("Failed to add user to workspace.");
      }

      this._workspaceService.fetchWorkspaces();
    } catch (error: any) {
      this._workspaceService.setError(error.message);
      console.error(error);
    }
  }

  public async removeUserFromWorkspace(userId: number) {
    const mutation = gql`
      mutation MyQuery($user_id: Int!, $workspace_id: Int!) {
        delete_appv3_user_workspace(
          where: {
            user_id: { _eq: $user_id }
            workspace_id: { _eq: $workspace_id }
          }
        ) {
          affected_rows
        }
      }
    `;

    const workspaceId = this._id;

    try {
      // Call the mutation using the Apollo client
      const { data: mutationData }: any = await client.mutate({
        mutation,
        variables: {
          workspace_id: workspaceId,
          user_id: userId,
        },
      });

      const affectedRows =
        mutationData.delete_appv3_user_workspace.affected_rows;
      if (affectedRows === 0) {
        throw new Error("Failed to add user to workspace.");
      }

      this._workspaceService.setError("User removed from workspace.");

      this._workspaceService.fetchWorkspaces();
    } catch (error) {
      this._workspaceService.setError("Error removing user from workspace.");
      console.error(error);
    }
  }

  public async updateTitle(title: string) {
    try {
      this._name = title;
      const mutation = gql`
        mutation MyQuery($id: Int!, $name: String!) {
          update_appv3_workspace_by_pk(
            pk_columns: { id: $id }
            _set: { name: $name }
          ) {
            id
            name
          }
        }
      `;
      // Execute the mutation using Apollo Client
      await client.mutate({
        mutation,
        variables: {
          id: this._id,
          name: title,
        },
      });

      this._workspaceService.fetchWorkspaces();
    } catch (error) {
      this._workspaceService.setError(
        "An error occurred while updating the workspace title."
      );
      console.error("Error updating workspace title:", error);
    }
  }

  public get id() {
    return this._id;
  }

  public get created_at() {
    return this._created_at;
  }

  public get name() {
    return this._name;
  }

  public get description() {
    return this._description;
  }

  public get scenes() {
    return new Map(this._scenes);
  }

  public get user_workspaces() {
    return this._user_workspaces;
  }

  public getUserRole(userId: number) {
    const user_workspaces = this._user_workspaces;
    let userRole = null;

    user_workspaces.forEach((userWorkspace) => {
      const user = userWorkspace.user;
      if (user.id === userId) {
        userRole = userWorkspace.role;
      }
    });

    return userRole;
  }

  public get data() {
    return {
      id: this._id,
      created_at: this._created_at,
      name: this._name,
      description: this._description,
      scenes: Array.from(this._scenes.values()).map((scene) => scene.data),
      user_workspaces: Array.from(this._user_workspaces.values()).map(
        (userWorkspace) => userWorkspace.data
      ),
    };
  }
}

export default WorkspaceEntity;
