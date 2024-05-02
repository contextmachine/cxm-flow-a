import Viewer from "@/src/viewer/viewer";
import SceneService from "../../scene-service/scene-service";

class ExtensionEntity {
  protected _sceneService: SceneService | null;
  protected _viewer: Viewer | null;

  private _isInitialized: boolean;

  constructor() {
    this._sceneService = null;
    this._viewer = null;

    this._isInitialized = false;
  }

  public provideStates(states: any) {
    if (states.sceneService) {
      this._sceneService = states.sceneService;
    }

    if (states.viewer) {
      this._viewer = states.viewer;
    }
  }

  public get isInitialized() {
    return this._isInitialized;
  }

  public set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  public get sceneService() {
    return this._sceneService;
  }
}

export default ExtensionEntity;
