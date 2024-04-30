import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import { WorkspaceDto } from "../workspace-service/workspace-service.types";
import WorkspaceService from "../workspace-service/workspace-service";
import { SceneMetadataDto } from "./scene-service.types";
import ProductService from "../product-service/product-service";
import ToolsetService from "../toolset-service/toolset-service";
import Viewer from "@/src/viewer/viewer";
import { ExtensionEntityInterface } from "../extension-service/entity/extension-entity.types";
import CameraViewsExtensions from "../extension-service/extensions/camera-views-extension";

class SceneService {
  private _workspaceService: WorkspaceService;
  private _metadata: SceneMetadataDto | null;

  private _extensions: Map<string, any>;

  private $setSceneMetadata: any;

  private _viewer: Viewer | null;

  private _productService: ProductService;
  private _toolsetService: ToolsetService;

  constructor(private _authService: AuthService) {
    this._workspaceService = this._authService.workspaceService;
    this._metadata = null;

    this._extensions = new Map<string, any>();

    this._productService = new ProductService(this);
    this._toolsetService = new ToolsetService(this);

    this._viewer = null;

    console.log('scene service constructor')

    this.updateTitle = this.updateTitle.bind(this);

    this.addExtension(new CameraViewsExtensions());
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
          workspace_id
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

      this._productService.init();
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

  public get productService() {
    return this._productService;
  }

  public get authService() {
    return this._authService;
  }

  public get workspaceId() {
    return this._metadata?.workspace_id;
  }

  public get sceneMetadata() {
    return this._metadata;
  }

  public get toolsetService() {
    return this._toolsetService;
  }

  public get viewer() {
    return this._viewer;
  }

  public addServices = (services: Record<"Viewer", Viewer>) => {
    this._viewer = services.Viewer;

    this.updateExtensions();
  };

  public addExtension = (extension: ExtensionEntityInterface) => {
    if (this._extensions.has(extension.name))
      throw new Error(`Extension with name ${extension.name} already exists`);

    this._extensions.set(extension.name, extension);

    this.updateExtensions();
  };

  public updateExtensions = () => {
    if (!this._viewer) return;

    this._extensions.forEach((extension) => {
      if (extension.isInitialized) return;

      extension.provideStates({
        sceneService: this,
        viewer: this._viewer,
      });

      extension.isInitialized = true;

      extension.load();
    });
  };

  public dispose() {
    this._metadata = null;
    this.$setSceneMetadata = null;

    this._productService.dispose();
    this._toolsetService.dispose();
  }
}

export default SceneService;
