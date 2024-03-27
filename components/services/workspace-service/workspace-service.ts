import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import {
  SceneDto,
  WorkspaceDto,
  WorkspaceUserDto,
} from "./workspace-service.types";

class WorkspaceService {
  private _workspaces: Map<number, WorkspaceDto>;
  private _activeWorkspace: WorkspaceDto | null;
  private _activeWorkspaceUsers: Map<string, WorkspaceUserDto>; // Attached to active workspace
  private _activeScenes: Map<number, SceneDto>;

  private $setWorkspaces: any;
  private $setActiveWorkspace: any;
  private $setActiveScenes: any;
  private $setActiveWorkspaceUsers: any;

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
        throw new Error("Workspaces not found.");
      }

      this._workspaces.clear();
      workspacesDto.forEach((workspace: any) => {
        this._workspaces.set(workspace.workspace.id, workspace.workspace);
      });

      console.log("this._workspaces", this._workspaces);

      this.updateWorkspaces();

      // get initial active workspace
      if (this._workspaces.size > 0) {
        const workspaceId = this._workspaces.keys().next().value;
        this.setActiveWorkspace(workspaceId);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  }

  public updateWorkspaces() {
    const workspacesArray = Array.from(this._workspaces.values());
    this?.$setWorkspaces([...workspacesArray]);
  }

  public updateActiveScenes() {
    const scenesArray = Array.from(this._activeScenes.values());
    this?.$setActiveScenes([...scenesArray]);
  }

  public updateActiveWorkspaceUsers() {
    const workspaceUsersArray = Array.from(this._activeWorkspaceUsers.values());
    this?.$setActiveWorkspaceUsers([...workspaceUsersArray]);
  }

  public setActiveWorkspace(workspaceId: number) {
    this._activeWorkspace = this._workspaces.get(workspaceId) || null;
    this?.$setActiveWorkspace(this._activeWorkspace);

    // Active workspace scenes
    const scenes = this._activeWorkspace?.scenes || [];
    this._activeScenes.clear();
    scenes.forEach((scene: any) => {
      this._activeScenes.set(scene.id, scene);
    });

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

    const workspaceId = this._activeWorkspace?.id;

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

  public provideStates(states: any) {
    this.$setWorkspaces = states.setWorkspaces;
    this.$setActiveWorkspace = states.setActiveWorkspace;
    this.$setActiveScenes = states.setActiveScenes;
    this.$setActiveWorkspaceUsers = states.setActiveWorkspaceUsers;
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
