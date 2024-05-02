import * as THREE from "three";
import * as RX from "rxjs";
import Viewer from "../viewer";
import { Entity } from "@/src/objects/entities/entity";
import Picker from "./picker";
import { Group } from "@/src/objects/entities/group";
import { activeGroupBoxHelperColor } from "@/src/objects/materials/object-materials";



class SelectionControl {
  private _subscriptions: RX.Subscription[] = [];
  private _entitiesMap: Map<string, Entity> = new Map();

  private _selectionSet: Set<string>;

  private _currentGroup: Group | undefined
  private _currentGroupObservable = new RX.Subject<Group | undefined>()

  private _selected: Entity[] = [];
  private _selectedSubject = new RX.Subject<Entity[]>();

  private _needsReloadSelection: string[] | undefined;

  private _updateSelectionSubject = new RX.Subject<{
    type: "added" | "removed";
    object: Entity;
  }>();

  constructor(private _viewer: Viewer) {

    const picker = new Picker(this._viewer, this)

    this._selectionSet = new Set<string>();

    this._entitiesMap = this._viewer.entityControl.entities;
    this._subscriptions.push(
      this._viewer.entityControl.$entities.subscribe(
        (objects) => {
          this._entitiesMap = objects;
          if (this._needsReloadSelection) {
            const ids = this._needsReloadSelection.filter((x) =>
              this._entitiesMap.has(x)
            );
            this.addToSelection(ids);
            this._needsReloadSelection = undefined;
          }
        })
    );

  }

  public get selected(): Entity[] {
    return this._selected;
  }

  public get $selected(): RX.Observable<Entity[]> {
    return this._selectedSubject;
  }

  public get $selectionUpdate() {
    return this._updateSelectionSubject;
  }

  public set needsReloadSelection(e: string[] | undefined) {
    this._needsReloadSelection = e;
  }

  public get currentGroup(): Group | undefined {
    return this._currentGroup;
  }

  public get $currentGroup(): RX.Observable<Group | undefined> {
    return this._currentGroupObservable;
  }

  public setCurrentGroup(group: Group | undefined) {
    console.log('current group: ', group, group?.children)
    this.clearSelection()

    if (this.currentGroup) {
      this.currentGroup.setBboxVisibilty(false)
      this._viewer.removeFromScene(this.currentGroup.bbox)
      this.currentGroup.children.forEach(x => x.onDisable())
    }

    if (group) {
      group.setBboxVisibilty(true, activeGroupBoxHelperColor)
      this._viewer.controls.setOrbit(group.center)
      group.children.forEach(x => x.onEnable())
    } else {
      this._viewer.entityControl.objectsOnCurrentLevel.forEach(x => x.onEnable())
    }

    this._currentGroupObservable.next(group)
    this._currentGroup = group
  }

  public clearSelection() {
    Array.from(this._selectionSet).forEach((x) => {
      this.deselectObject(x);
    });
    this._selectionSet.clear();
    this.updateState();
  }

  public addToSelection(ids: string[]) {
    ids.forEach((id) => {
      if (!this._selectionSet.has(id)) {
        this.selectObject(id);
      }
    });
    this.updateState();
  }

  public removeFromSelection(ids: string[]) {
    ids.forEach((id) => {
      if (this._selectionSet.has(id)) {
        this.deselectObject(id);
      }
    });
    this.updateState();
  }

  private selectObject(id: string) {
    const projectObject = this._entitiesMap.get(id);
    if (projectObject && projectObject.isSelectable) {
      this._updateSelectionSubject.next({
        type: "added",
        object: this._entitiesMap.get(id)!,
      });
      projectObject.onSelect();
      this._selectionSet.add(id);
    }


  }

  private deselectObject(id: string) {
    const entity = this._entitiesMap.get(id)!;
    if (entity) {
      this._updateSelectionSubject.next({
        type: "removed",
        object: this._entitiesMap.get(id)!,
      });
      entity.onDeselect();
      this._selectionSet.delete(id);
    }


  }

  private updateState() {
    this._viewer.updateViewer();

    this._selected = [...this._selectionSet]
      .map((x) => this._entitiesMap.get(x))
      .filter((x) => x !== undefined) as Entity[];
    this._selectedSubject.next(this._selected);


  }

  public dispose() {
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default SelectionControl;
