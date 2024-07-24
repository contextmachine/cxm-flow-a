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
  isShowed: boolean;
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

  public onFilter(filterInput: string) {
    if (filterInput !== "") {
      const toExpand: Set<string> = new Set();
      const hitObjects: Set<string> = new Set();

      const checkItem = (item: OutlinerItem): boolean => {
        let children = false;
        if (item.children) {
          const childrenResult = item.children?.map((x) => checkItem(x));
          children = childrenResult.some((x) => x);
        }

        const hit = item.entity.name.toLowerCase().includes(filterInput);

        if (hit) {
          hitObjects.add(item.entity.id);
        }

        if (children) {
          toExpand.add(item.entity.id);
        }

        return hit || children;
      };

      this._tree.forEach((x) => checkItem(x));

      this._treeMap.forEach((x) => {
        x.expanded = toExpand.has(x.entity.id);
        x.isShowed = toExpand.has(x.entity.id) || hitObjects.has(x.entity.id);
      });
    } else {
      this._treeMap.forEach((x) => {
        x.isShowed = true;
        x.expanded = false;
      });
    }

    this._$tree.next([...this._tree]);
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
        isShowed: true,
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

const traverseAncessors = (
  item: OutlinerItem,
  f: (item: OutlinerItem) => void
) => {
  if (item.parent) {
    traverseAncessors(item.parent, f);
  }
  f(item);
};

const traverseTree = (item: OutlinerItem, f: (item: OutlinerItem) => void) => {
  f(item);
  item.children?.forEach(f);
};
