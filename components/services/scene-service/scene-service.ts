import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import WorkspaceService from "../workspace-service/workspace-service";
import { SceneMetadataDto } from "./scene-service.types";
import ProductService from "../product-service/product-service";
import ToolsetService from "../toolset-service/toolset-service";
import Viewer from "@/src/viewer/viewer";
import * as RX from "rxjs";
// TODO: Investigate
//import CameraViewsExtensions from "../extension-service/extensions/camera-views-extension/camera-views-extension";

class SceneService {
  private _workspaceService: WorkspaceService;
  private _metadata: SceneMetadataDto | null;
  private _metadataSubject: RX.Subject<SceneMetadataDto> = new RX.Subject();

  private $setSceneMetadata: any;

  private _viewer: Viewer | undefined;

  private _productService: ProductService;
  private _toolsetService: ToolsetService;

  constructor(private _authService: AuthService) {
    this._workspaceService = this._authService.workspaceService;
    this._metadata = null;

    this._productService = new ProductService(this);
    this._toolsetService = new ToolsetService(this);

    this.updateTitle = this.updateTitle.bind(this);
  }

  public initViewer(root: HTMLDivElement): Viewer {
    this._viewer = new Viewer(this);
    this._viewer.init(root);

    return this._viewer;
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
    this._metadataSubject.next(metadata);
  }

  public provideStates(states: any) {
    this.$setSceneMetadata = states.setSceneMetadata;
  }

  public get $sceneMetadata() {
    return this._metadataSubject;
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

  public get sceneId() {
    return this._metadata?.id;
  }

  public get toolsetService() {
    return this._toolsetService;
  }

  public get viewer() {
    return this._viewer;
  }

  public dispose() {
    this._metadata = null;
    this.$setSceneMetadata = null;

    this._productService.dispose();
    this._toolsetService.dispose();
  }
}

export default SceneService;
