import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";

class OutlinerExtension extends ExtensionEntity {
  constructor(viewer: Viewer) {
    super(viewer);
    this.name = "outliner";
  }

  public load() {
    console.log("outliner loaded");
  }

  public unload() {
    console.log("outliner unloaded");
  }
}
export default OutlinerExtension;
