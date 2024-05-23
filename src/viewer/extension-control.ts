import ExtensionEntity from "@/components/services/extension-service/entity/extension-entity";
import CameraViewsExtensions from "@/components/services/extensions/camera-views-extension/camera-views-extension";
import QueryExtension from "@/components/services/extensions/query-extension/query-extension";
import * as RX from "rxjs";
import { assertDefined } from "../utils";
import Viewer from "./viewer";
import ViewFilterExtension from "@/components/services/extensions/view-filter/view-filter-extension";

class ExtensionControl {
  private _viewer: Viewer;
  private _extensions: Map<string, ExtensionEntity>;

  private _$extensions = new RX.Subject<Map<string, ExtensionEntity>>();

  constructor(viewer: Viewer) {
    this._extensions = new Map<string, ExtensionEntity>();
    this._viewer = viewer;

    this._viewer.sceneService.productService.$widgetProducts.subscribe(
      (products) => {
        console.log(products);
        products.forEach((data) => {
          if (!this._extensions.has(data.name)) {
            const extension = this.createExtension(data.name);
            if (extension) {
              this.addExtension(extension);
            } else {
              console.log(`extension with name ${data.name} not Implemeted`);
            }
          }
        });

        const productsNameSet = new Set(products.map((x) => x.name));
        this._extensions.forEach((extension) => {
          if (!productsNameSet.has(extension.name)) {
            this.removeExtension(extension.name);
          }
        });
      }
    );
  }

  public getExtension(name: string) {
    return this._extensions.get(name);
  }

  public addExtension = (extension: ExtensionEntity): ExtensionEntity => {
    if (this._extensions.has(extension.name))
      throw new Error(`Extension with name ${extension.name} already exists`);

    this._extensions.set(extension.name, extension);
    extension.load();

    this._$extensions.next(this._extensions);

    return extension;
  };

  public get extensions() {
    return this._extensions;
  }

  public get $extensions() {
    return this._$extensions;
  }

  public removeExtension = (name: string) => {
    if (!this._extensions.has(name))
      throw new Error(`Extension with name ${name} does not exist`);

    const extension = this._extensions.get(name);

    assertDefined(extension).unload();

    this._extensions.delete(name);
    this._$extensions.next(this._extensions);
  };

  private createExtension(name: string): ExtensionEntity | undefined {
    switch (name) {
      case "queries":
        return new QueryExtension(this._viewer);
      case "views":
        return new CameraViewsExtensions(this._viewer);
      case "view-filter":
        return new ViewFilterExtension(this._viewer);
      default:
        return undefined;
    }
  }
}

export default ExtensionControl;
