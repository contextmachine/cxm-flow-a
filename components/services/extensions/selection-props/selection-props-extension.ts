import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";
import * as RX from "rxjs";
import { ProductsDto } from "../../product-service/products.types";

class SelectionPropsExtension extends ExtensionEntity {
  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);
    this.name = "selection-props";
    this.id = productData.id;

    this.isInitialized = true;
  }

  protected onEnable() {}

  protected onDisable() {}

  public async load() {
    console.log("Selection props extension loaded");
  }

  public unload(): void {
    console.log("props selection extension unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default SelectionPropsExtension;
