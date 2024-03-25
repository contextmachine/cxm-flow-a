import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import { SceneDto, WorkspaceDto } from "./workspace-service.types";

class WorkspaceService {
  private _workspaces: Map<number, WorkspaceDto>;
  private _activeWorkspace: WorkspaceDto | null;
  private _activeScenes: Map<number, SceneDto>;

  private $setWorkspaces: any;
  private $setActiveWorkspace: any;
  private $setActiveScenes: any;

  constructor(private _authService: AuthService) {
    this._workspaces = new Map();
    this._activeWorkspace = null;
    this._activeScenes = new Map();

    this.$setWorkspaces = null;
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
                  }
                }
              }
            }
          }
        `,
        variables: {
          userId: userMetadata.id,
        },
      });

      const workspacesDto = response?.data?.appv3_user_by_pk?.user_workspaces;
      if (!workspacesDto) {
        throw new Error("Workspaces not found.");
      }

      this._workspaces.clear();
      workspacesDto.forEach((workspace: any) => {
        this._workspaces.set(workspace.workspace.id, workspace.workspace);
      });

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

  public setActiveWorkspace(workspaceId: number) {
    this._activeWorkspace = this._workspaces.get(workspaceId) || null;
    this?.$setActiveWorkspace(this._activeWorkspace);

    const scenes = this._activeWorkspace?.scenes || [];
    this._activeScenes.clear();
    scenes.forEach((scene: any) => {
      this._activeScenes.set(scene.id, scene);
    });

    this.updateActiveScenes();
  }

  public provideStates(states: any) {
    this.$setWorkspaces = states.setWorkspaces;
    this.$setActiveWorkspace = states.setActiveWorkspace;
    this.$setActiveScenes = states.setActiveScenes;
  }

  public dispose() {
    this._workspaces.clear();
    this._activeWorkspace = null;
    this._activeScenes.clear();

    this.$setWorkspaces = null;
  }
}

export default WorkspaceService;
