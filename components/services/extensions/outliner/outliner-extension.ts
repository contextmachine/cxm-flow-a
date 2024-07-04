import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";
import * as RX from "rxjs";
import { Entity } from "@/src/objects/entities/entity";
import { assertDefined } from "@/src/utils";

export interface OutlinerItem {
  entity: Entity;
  selected: boolean;
  expanded: boolean;
  isGroupActive: boolean;
  children: OutlinerItem[] | undefined;
  parent: OutlinerItem | undefined;
}

type OutlinerTree = OutlinerItem[];

class OutlinerExtension extends ExtensionEntity {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _tree: OutlinerTree = [];
  private _$tree = new RX.Subject<OutlinerTree>();
  private _treeMap: Map<string, OutlinerItem> = new Map();

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

    this.constructTree();

    this._subscriptions.push(
      this._viewer.entityControl.$projectModels.subscribe(() => {
        this.constructTree();
      })
    );

    this._subscriptions.push(
      this._viewer.selectionTool.$selectionUpdate.subscribe((event) => {
        const item = this._treeMap.get(event.object.id);
        if (item) {
          item.selected = event.type === "added";
          this._$tree.next([...this._tree]);
        }
      })
    );

    this._subscriptions.push(
      this._viewer.selectionTool.picker.$currentGroup.subscribe((group) => {
        const traverseAncessors = (
          item: OutlinerItem,
          f: (item: OutlinerItem) => void
        ) => {
          if (item.parent) {
            traverseAncessors(item.parent, f);
          }
          f(item);
        };

        this._treeMap.forEach((x) => {
          x.expanded = false;
          x.isGroupActive = false;
        });
        if (group) {
          const item = assertDefined(this._treeMap.get(group.id));
          item.isGroupActive = true;
          traverseAncessors(item, (item) => (item.expanded = true));
        }
        this._$tree.next([...this._tree]);
      })
    );
  }

  private constructTree() {
    this._treeMap.clear();

    const makeItem = (
      entity: Entity,
      parent: OutlinerItem | undefined
    ): OutlinerItem => {
      const item: OutlinerItem = {
        entity: entity,
        expanded: false,
        selected: false,
        isGroupActive: false,
        children: undefined,
        parent: parent,
      };

      if (entity.children) {
        item.children = entity.children.map((x) => makeItem(x, item));
      }
      this._treeMap.set(entity.id, item);

      return item;
    };

    this._tree = [...this._viewer.entityControl.projectModels.values()].map(
      (x) => {
        return makeItem(x.entity, undefined);
      }
    );

    this._$tree.next([...this._tree]);
  }

  public unload() {
    console.log("outliner unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}
export default OutlinerExtension;
