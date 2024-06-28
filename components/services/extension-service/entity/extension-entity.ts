import Viewer from "@/src/viewer/viewer";
import SceneService from "../../scene-service/scene-service";
import { v4 as uuidv4 } from "uuid";
import { ExtensionEntityInterface } from "./extension-entity.types";

class ExtensionEntity implements ExtensionEntityInterface {
  protected _viewer: Viewer;
  protected _sceneService: SceneService;

  private _isInitialized: boolean;

  public id: string;
  public name: string;

  constructor(viewer: Viewer) {
    this._viewer = viewer;
    this._sceneService = viewer.sceneService;

    this.name = "default";

    this.id = uuidv4();

    this._isInitialized = false;
  }

  public get isInitialized() {
    return this._isInitialized;
  }

  public set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  public load() {
    return;
  }

  public unload() {
    return;
  }
}

export default ExtensionEntity;
