import Viewer from "@/src/viewer/viewer";
import SceneService from "../../scene-service/scene-service";
import { v4 as uuidv4 } from "uuid";
import { ExtensionEntityInterface } from "./extension-entity.types";
import * as RX from "rxjs";

class ExtensionEntity implements ExtensionEntityInterface {
  protected _subscriptions: RX.Unsubscribable[] = [];
  protected _viewer: Viewer;
  protected _sceneService: SceneService;

  private _isInitialized: boolean;
  protected _enabledOnlyInActiveToolset = true;
  protected _enabled = true;

  public id: number;
  public name: string;

  constructor(viewer: Viewer) {
    this._viewer = viewer;
    this._sceneService = viewer.sceneService;

    this.name = "default";

    this.id = -1;

    this._isInitialized = false;

    this._subscriptions.push(
      this._sceneService.toolsetService.activeToolset$.subscribe((e) => {
        console.log("trigger on extension");
        const activeProducts = e
          ? e.toolset_products.map((x) => x.product_id)
          : [];
        if (
          this._enabledOnlyInActiveToolset &&
          activeProducts.includes(this.id)
        ) {
          this._enabled = true;
          this.onEnable();
        } else {
          this._enabled = false;
          this.onDisable();
        }
      })
    );
  }

  public get isInitialized() {
    return this._isInitialized;
  }

  public set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  protected onEnable() {}

  protected onDisable() {}

  public load() {
    return;
  }

  public unload() {
    this._subscriptions.forEach((x) => x.unsubscribe());
    return;
  }
}

export default ExtensionEntity;
