import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import { WorkspaceDto } from "../workspace-service/workspace-service.types";
import WorkspaceService from "../workspace-service/workspace-service";
import { SceneMetadataDto } from "./scene-service.types";

class SceneService {
  private _workspaceService: WorkspaceService;
  private _metadata: SceneMetadataDto | null;

  private $setSceneMetadata: any;

  constructor(private _authService: AuthService) {
    this._workspaceService = this._authService.workspaceService;
    this._metadata = null;

    this.updateTitle = this.updateTitle.bind(this);
  }

  public async setScene(_sceneId: string) {
    const sceneId = parseInt(_sceneId);

    // Load the scene using the sceneId
    const query = gql`
      query GetScene($sceneId: Int!) {
        appv3_scene_by_pk(id: $sceneId) {
          name
          id
          description
          created_at
        }
      }
    `;

    try {
      const variables = {
        sceneId: sceneId,
      };

      const response = await client.query({
        query,
        variables,
        fetchPolicy: "network-only",
      });
      const scene = response.data.appv3_scene_by_pk;
      if (!scene) throw new Error("Scene not found");

      this.updateSceneMetadata(scene);
    } catch (error) {
      console.error("Error loading scene:", error);
    }
  }

  public async updateTitle(title: string) {
    const query = gql`
      mutation MyQuery($id: Int!, $name: String!) {
        update_appv3_scene_by_pk(
          pk_columns: { id: $id }
          _set: { name: $name }
        ) {
          id
        }
      }
    `;

    try {
      const response = await client.mutate({
        mutation: query,
        variables: {
          id: this._metadata?.id,
          name: title,
        },
      });
      const updatedSceneId = response.data.update_appv3_scene_by_pk.id;

      this.setScene(updatedSceneId);
    } catch (error) {
      console.error("Error updating scene:", error);
    }
  }

  public updateSceneMetadata(metadata: any) {
    this._metadata = metadata;
    this.$setSceneMetadata(metadata ? { ...metadata } : null);
  }

  public provideStates(states: any) {
    this.$setSceneMetadata = states.setSceneMetadata;
  }

  public dispose() {
    this._metadata = null;
    this.$setSceneMetadata = null;
  }
}

export default SceneService;
