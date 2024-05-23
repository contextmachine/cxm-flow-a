import SceneService from "@/components/services/scene-service/scene-service";
import CameraViewsExtensions from "./camera-views-extension";
import { gql } from "@apollo/client";
import client from "@/components/graphql/client/client";
import { ViewState } from "@/src/viewer/camera-control.types";
import { BehaviorSubject } from "rxjs";
import html2canvas from "html2canvas";
import { sanityClient } from "@/components/uploader/sanity/client";
import Viewer from "@/src/viewer/viewer";

class CameraViewsDbService {
  private _viewer: Viewer;

  private _sceneId: number;
  private _allViews$: BehaviorSubject<ViewStateItem[]> | null = null;
  private _animationViews$: BehaviorSubject<ViewStateItem[]> | null = null;

  private _adding$ = new BehaviorSubject<boolean>(false);
  private _pending$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _cameraViewsExtension: CameraViewsExtensions,
    viewer: Viewer
  ) {
    const sceneService = this._cameraViewsExtension;
    this._viewer = viewer;
    this._sceneId = this._viewer.sceneService.sceneMetadata!.id;
  }

  public load() {
    this._allViews$ = new BehaviorSubject<ViewStateItem[]>([]);
    this._animationViews$ = new BehaviorSubject<ViewStateItem[]>([]);

    this.fetchViews();
  }

  public async addView() {
    if (!this._sceneId) return;

    this._adding$.next(true);

    const viewState = this._viewer.controls.getState();

    const thumbUrl = await this._createThumb();

    const mutation = gql`
      mutation getViews($name: String!, $state: jsonb!, $thumb: String) {
        insert_extensionsv3_view(
          objects: { name: $name, state: $state, thumb: $thumb }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    let result: any;

    try {
      result = await client.mutate({
        mutation,
        variables: {
          name: "View",
          state: viewState,
          thumb: thumbUrl || undefined,
        },
      });
    } catch (e) {
      console.log(e);
    }

    const viewId = result.data.insert_extensionsv3_view.returning[0].id;

    if (typeof viewId !== "number") return;

    try {
      // add Link to scene
      const linkMutation = gql`
        mutation addViewLink(
          $sceneId: Int!
          $viewId: Int!
          $parentType: String!
        ) {
          insert_extensionsv3_view_scene(
            objects: {
              parent_type: $parentType
              scene_id: $sceneId
              view_id: $viewId
            }
          ) {
            affected_rows
          }
        }
      `;

      await client.mutate({
        mutation: linkMutation,
        variables: {
          sceneId: this._sceneId,
          viewId,
          parentType: "all",
        },
      });
    } catch (e) {
      console.log(e);
      this._adding$.next(false);
    }

    await this.fetchViews();

    this._adding$.next(false);
  }

  public async updateView(viewId: number, data: Partial<ViewStateItem>) {
    const mutation = gql`
      mutation addViewScene($viewId: Int!, $set: extensionsv3_view_set_input!) {
        update_extensionsv3_view(where: { id: { _eq: $viewId } }, _set: $set) {
          affected_rows
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          viewId,
          set: data,
        },
      });
    } catch (e) {
      console.log(e);
    }

    await this.fetchViews();
  }

  public async deleteView(viewId: number) {
    const mutation = gql`
      mutation addViewScene($viewId: Int!) {
        delete_extensionsv3_view_scene(where: { view_id: { _eq: $viewId } }) {
          affected_rows
        }

        delete_extensionsv3_view(where: { id: { _eq: $viewId } }) {
          affected_rows
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          viewId,
        },
      });
    } catch (e) {
      console.log(e);
    }

    await this.fetchViews();
  }

  public async fetchViews() {
    this._pending$.next(true);

    try {
      const scene_id = this._sceneId;
      if (!scene_id) return;

      const query = gql`
        query getViews($sceneId: Int!) {
          extensionsv3_view_scene(
            where: {
              scene_id: { _eq: $sceneId }
              view: { state: { _is_null: false } }
            }
            order_by: { id: asc }
          ) {
            id
            parent_type
            scene_id
            view_id
            view {
              id
              name
              state
              thumb
            }
          }
        }
      `;

      const result = await client.query({
        query,
        variables: {
          sceneId: scene_id,
        },
        fetchPolicy: "network-only",
      });

      const data = result.data.extensionsv3_view_scene;

      const allViews = data
        .filter((item: ViewStateLinkItem) => item.parent_type === "all")
        .map((item: ViewStateLinkItem) => item.view);

      const animationViews = data
        .filter((item: ViewStateLinkItem) => item.parent_type === "animation")
        .map((item: ViewStateLinkItem) => item.view);

      this._allViews$?.next([...allViews]);
      this._animationViews$?.next([...animationViews]);
    } catch (e) {
      console.error(e);
    }

    this._pending$.next(false);
  }

  private async _createThumb() {
    const originalCanvas = this._viewer.canvas;
    if (!originalCanvas) {
      console.error("Original canvas is not available.");
      return "";
    }

    // Calculate the necessary scale to ensure the largest dimension does not exceed 400px
    const maxDimension = Math.max(originalCanvas.width, originalCanvas.height);
    const scale = Math.min(1, 400 / maxDimension);

    const canvas = await html2canvas(originalCanvas, {
      scale,
    });

    // Convert the off-screen canvas to a data URL
    const dataURL = canvas.toDataURL("image/png");

    const response = await fetch(dataURL);
    const blob = await response.blob();

    try {
      const imageAsset: ImageResponse = await sanityClient.assets.upload(
        "image",
        blob
      );
      const url = imageAsset.url;

      return url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  public unload() {
    this._allViews$?.complete();
    this._allViews$ = null;
    this._animationViews$?.complete();
    this._animationViews$ = null;

    this._pending$.complete();
    this._adding$.complete();
  }

  public get allViews$() {
    return this._allViews$?.asObservable();
  }

  public get animationViews$() {
    return this._animationViews$?.asObservable();
  }

  public get adding$() {
    return this._adding$.asObservable();
  }

  public get pending$() {
    return this._pending$.asObservable();
  }

  dispose() {}
}

export interface ViewStateLinkItem {
  id: number;
  parent_type: "all" | "animation";
  scene_id: number;
  view_id: number;
  view: ViewStateItem;
}

export interface ViewStateItem {
  id: number;
  name: string;
  thumb: string;
  state: ViewState;
}

interface ImageResponse {
  url: string;
  metadata: any;
  [key: string]: any;
}

export default CameraViewsDbService;
