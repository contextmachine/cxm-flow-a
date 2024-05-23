import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";

import * as RX from "rxjs";
import { Entity } from "@/src/objects/entities/entity";
import { assertDefined } from "@/src/utils";
import { v4 } from "uuid";

interface FilterCondition {
  id: string;
  propertyName: string;
  enabled: boolean;
  condition: any;
}

class ViewFilterExtension extends ExtensionEntity {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _properties = new Map<string, Entity[]>();
  private _$properties = new RX.Subject<Map<string, Entity[]>>();

  private _filters = new Map<string, FilterCondition>();
  private _$filters = new RX.Subject<FilterCondition[]>();

  constructor(viewer: Viewer) {
    super(viewer);
    this.name = "view-filter";
  }

  public get properties() {
    return this._properties;
  }

  public get $properties() {
    return this._$properties;
  }

  public get filters() {
    return this._filters;
  }

  public get $filters() {
    return this._$filters;
  }

  public async load() {
    console.log("View Filter extension loaded");

    this.updatePropsMap();

    this._subscriptions.push(
      this._viewer.entityControl.$entities.subscribe(() => {
        this.updatePropsMap();
        this.executeFiltering();
      })
    );

    this._subscriptions.push(
      this._$filters.subscribe((filters) => {
        this.executeFiltering();
      })
    );
  }

  private executeFiltering() {
    console.log("execute filtering");
  }

  public addFilter(propertyName: string, condition: any) {
    const filter: FilterCondition = {
      id: v4(),
      propertyName: propertyName,
      condition,
      enabled: true,
    };

    this._filters.set(filter.id, filter);
    this._$filters.next([...this._filters.values()]);
  }

  public removeFilter(id: string) {
    this._filters.delete(id);
    this._$filters.next([...this._filters.values()]);
  }

  public updateFilter(id: string, filter: FilterCondition) {
    this._filters.set(id, filter);
    this._$filters.next([...this._filters.values()]);
  }

  private updatePropsMap() {
    this._properties.clear();

    const entities = this._viewer.entityControl.entities;

    entities.forEach((entity) => {
      if (entity.props) {
        [...entity.props.keys()].forEach((key) => {
          if (this._properties.has(key)) {
            assertDefined(this._properties.get(key)).push(entity);
          } else {
            this._properties.set(key, [entity]);
          }
        });
      }
    });

    this._$properties.next(this._properties);
  }

  public unload(): void {
    console.log("filter extension unloaded");
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default ViewFilterExtension;
