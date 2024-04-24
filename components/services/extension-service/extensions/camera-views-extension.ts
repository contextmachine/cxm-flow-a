import { Scene } from "three";
import ExtensionEntity from "../entity/extension-entity";
import SceneService from "../../scene-service/scene-service";
import { ExtensionEntityInterface } from "../entity/extension-entity.types";

class CameraViewsExtensions
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public name: string;

  constructor() {
    super();

    this.name = "CameraViewsExtensions";
  }

  public load() {
    console.log(
      "CameraViewsExtensions loaded",
      this._sceneService,
      this._viewer
    );
  }

  public unload() {
    console.log("CameraViewsExtensions unloaded");
  }
}

export default CameraViewsExtensions;
