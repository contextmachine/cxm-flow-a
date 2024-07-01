import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";
import * as RX from "rxjs";
import { Entity } from "@/src/objects/entities/entity";

class OutlinerExtension extends ExtensionEntity {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _tree: Entity[] = [];
  private _$tree = new RX.Subject<Entity[]>();

  constructor(viewer: Viewer) {
    super(viewer);
    this.name = "outliner";
  }

  public get tree() {
    return this._tree;
  }

  public get $tree() {
    return this._$tree;
  }

  public onItemClick(item: Entity) {
    this._viewer.selectionTool.clearSelection();
    this._viewer.selectionTool.addToSelection([item.id]);
  }

  public load() {
    console.log("outliner loaded");

    this.updateTree();

    this._subscriptions.push(
      this._viewer.entityControl.$projectModels.subscribe(() => {
        this.updateTree();
      })
    );
  }

  private updateTree() {
    this._tree = [...this._viewer.entityControl.projectModels.values()].map(
      (x) => x.entity
    );
    this._$tree.next([...this._tree]);
  }

  public unload() {
    console.log("outliner unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}
export default OutlinerExtension;
