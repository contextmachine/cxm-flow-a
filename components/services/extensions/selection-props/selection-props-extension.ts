import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";
import { ProductsDto } from "../../product-service/products.types";
import { Entity } from "@/src/objects/entities/entity";
import { Mixed, MixedValue } from "./params/mixed";
import { defineParamType } from "./selection-props-widget/utils";
import { groupBy } from "@/src/utils";

export interface PropertyValue {
  paramName: string;
  type: string;
  beenChanged: boolean;
  value: Mixed<any>;
  oldValue: Mixed<any>;
}

class SelectionPropsExtension extends ExtensionEntity {
  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);
    this.name = "selection-props";
    this.id = productData.id;

    this.isInitialized = true;
  }

  protected onEnable() {}

  protected onDisable() {}

  public getSelectionParams(selected: Entity[]) {
    const params = new Map<string, PropertyValue>();
    const objectList = selected.filter((o) => o.props);

    const allKeys = new Set<string>();
    objectList.forEach((o) => {
      [...o.props!].forEach(([key, _]) => {
        allKeys.add(key);
      });
    });

    objectList.forEach((po) => {
      [...allKeys].forEach((key) => {
        const value = po.props!.get(key);
        if (params.has(key)) {
          const param = params.get(key)!;
          if (param.value !== value) {
            param.value = new MixedValue();
            param.oldValue = param.value;
          }
        } else {
          const valueType = defineParamType(value);

          if (valueType) {
            params.set(key, {
              paramName: key,
              oldValue: value,
              value,
              type: valueType,
              beenChanged: false,
            });
          } else {
            params.set(key, {
              paramName: key,
              oldValue: value,
              value,
              type: "string",
              beenChanged: false,
            });
          }
        }
      });
    });

    return params;
  }

  public async submitChanges(formState: Map<string, PropertyValue>) {
    // const selectionState = selected.map((x) => x.id);
    // viewer.selectionService.clearSelection();

    const changedProperties = new Map(
      [...formState.entries()].filter((x) => x[1].beenChanged)
    );

    const selectedObjects = this._viewer.selectionTool.selected;
    this._viewer.selectionTool.clearSelection();

    await this.updateProps(selectedObjects, changedProperties);
  }

  public async updateProps(entities: Entity[], newProps: Map<string, any>) {
    const groupedByModel = groupBy(entities, (x) => x.model);

    const params = new Map(
      [...newProps.entries()].map((x) => [x[0], x[1].value])
    );

    console.log(params);

    for (const data of [...groupedByModel.entries()]) {
      const [model, objects] = data;

      const body = {
        uuids: objects.map((x) => x.id),
        props: Object.fromEntries(params),
      };

      // let endpointEntry: UserdataEntry | undefined;

      // if (objects.length === 1) {
      //   const [object] = objects;
      //   endpointEntry = object.userdata?.getEntry("update_props");
      // }

      // if (!endpointEntry)
      //   endpointEntry = model.projectObject.userdata?.getEntry("update_props");

      // if (!endpointEntry) throw Error("endpoint not found");

      // const endpoint = endpointEntry.endpoint;
      // const url = endpoint.url;
      await this._viewer.loader.reloadApiObject(model.queryId);
      console.log(body);
    }
  }

  public async load() {
    console.log("Selection props extension loaded");
  }

  public unload(): void {
    console.log("props selection extension unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default SelectionPropsExtension;
