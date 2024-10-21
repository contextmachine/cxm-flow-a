import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";
import { ProductsDto } from "../../product-service/products.types";
import { Entity } from "@/src/objects/entities/entity";
import { Mixed, MixedValue } from "./params/mixed";
import { defineParamType } from "./selection-props-widget/utils";
import { groupBy } from "@/src/utils";
import { UserMetadata } from "../../auth-service/auth-service.types";
import { ProjectModel } from "@/src/objects/project-model";
import axios from "axios";
import * as RX from "rxjs";

export interface PropertyValue {
  paramName: string;
  type: string;
  beenChanged: boolean;
  value: Mixed<any>;
  oldValue: Mixed<any>;
}

type UpdatingStatus = "idle" | "updating" | "success" | "error";

class SelectionPropsExtension extends ExtensionEntity {
  private _selectionState: Entity[] = [];
  private _$selectionState = new RX.Subject<Entity[]>();
  private _freezeSelectionToolbar = false;

  private _status: UpdatingStatus = "idle";
  private _$status = new RX.Subject<UpdatingStatus>();

  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);
    this.name = "selection-props";
    this.id = productData.id;

    this.isInitialized = true;

    this._subscriptions.push(
      this._viewer.selectionTool.$selected.subscribe((e) => {
        if (!this._freezeSelectionToolbar) {
          this._selectionState = e;
          this._$selectionState.next(this._selectionState);
        }
      })
    );
  }

  public setStatus(status: UpdatingStatus) {
    this._status = status;
    this._$status.next(status);
  }

  public get selectionState() {
    return this._selectionState;
  }

  public get $selectionState() {
    return this._$selectionState;
  }

  public get status() {
    return this._status;
  }

  public get $status() {
    return this._$status;
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

  public async submitChanges(
    formState: Map<string, PropertyValue>,
    userMetadata: UserMetadata
  ) {
    const changedProperties = new Map(
      [...formState.entries()].filter((x) => x[1].beenChanged)
    );

    this.setStatus("updating");

    const selectedObjects = this._viewer.selectionTool.selected;
    const selectionState = selectedObjects.map((x) => x.id);

    const { updatedModels, failedToUpdate } = await this.updateProps(
      selectedObjects,
      changedProperties,
      userMetadata
    );

    if (updatedModels.length > 0) {
      this._freezeSelectionToolbar = true;

      this._viewer.selectionTool.clearSelection();

      for (const model of updatedModels) {
        await this._viewer.loader.reloadApiObject(model.queryId);
      }

      this._viewer.selectionTool.needsRestoreSelection = selectionState;
      this._freezeSelectionToolbar = false;
    }

    this._viewer.setMessage(
      failedToUpdate.length > 0
        ? { message: "Some of models hasn't been updated", status: "warning" }
        : { message: "Succsesfully updated props", status: "success" }
    );

    this.setStatus(failedToUpdate.length > 0 ? "error" : "success");

    setTimeout(() => {
      if (this.status !== "updating") {
        this.setStatus("idle");
      }
    }, 10000);
  }

  public async updateProps(
    entities: Entity[],
    newProps: Map<string, any>,
    userMetadata: UserMetadata
  ): Promise<{
    updatedModels: ProjectModel[];
    failedToUpdate: ProjectModel[];
  }> {
    const groupedByModel = groupBy(entities, (x) => x.model);

    const params = new Map(
      [...newProps.entries()].map((x) => [x[0], x[1].value])
    );

    const updatedModels: ProjectModel[] = [];
    const failedToUpdate: ProjectModel[] = [];

    for (const data of [...groupedByModel.entries()]) {
      const [model, objects] = data;

      const entry = this.getUpdatePropsEntry(model);

      const newPropsValuesOnly = new Map(
        [...newProps.entries()].map((x) => [x[0], x[1].value])
      );

      const updatedProps = Object.fromEntries(
        [...newPropsValuesOnly.entries()].filter((x) => x[1] !== undefined)
      );

      const deletedProps = [...newPropsValuesOnly.entries()]
        .filter((x) => x[1] === undefined)
        .map((x) => x[0]);

      const body = {
        scene_id: this._viewer.sceneService.sceneId,
        user_id: userMetadata.id,
        model_id: 5,
        endpoint: {
          type: "rest",
          entry: entry,
          query: model.endPoint.endpoint,
        },
        props_data: {
          object_uuids: objects.map((x) => x.id),
          updated_props: updatedProps,
          deleted_props: deletedProps,
        },
      };

      try {
        const res = await axios.post(entry, body);
        if (res.status === 200) {
          updatedModels.push(model);
        }
      } catch (e) {
        failedToUpdate.push(model);
      }
    }

    return { updatedModels, failedToUpdate };
  }

  public async load() {
    console.log("Selection props extension loaded");
  }

  public unload(): void {
    console.log("props selection extension unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }

  private getUpdatePropsEntry(model: ProjectModel): string {
    const defaultUpdateProps =
      "https://props-server.dev.contextmachine.cloud/props-update";

    return defaultUpdateProps;
  }
}

export default SelectionPropsExtension;
