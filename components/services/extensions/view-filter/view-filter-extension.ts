import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";

import * as RX from "rxjs";
import { Entity } from "@/src/objects/entities/entity";
import { assertDefined } from "@/src/utils";
import { v4 } from "uuid";

export interface FilterItem {
  id: string;
  key: string;
  enabled: boolean;
  condition: FilterCondition[];
}

type FilterCondition = {
  value: number | string;
  operator: "EQUAL" | "NOT_EQUAL" | "GREATER_THAN" | "LESS_THAN" | "DEFINED";
};

class ViewFilterExtension extends ExtensionEntity {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _properties = new Map<string, Entity[]>();
  private _$properties = new RX.Subject<Map<string, Entity[]>>();

  private _filters = new Map<string, FilterItem>();
  private _$filters = new RX.Subject<FilterItem[]>();

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
    const activeFilters = [...this._filters.values()].filter((x) => x.enabled);

    if (activeFilters.length > 0) {
      const entities = [...this._viewer.entityControl.entities.values()];

      const f = filterEntities(entities, activeFilters);

      // const entitiesSets: Set<Entity>[] = activeFilters.map((filter) => {
      //   return new Set(this._properties.get(filter.key));
      // });

      // let filtered = entitiesSets[0];

      // for (let i = 1; i < entitiesSets.length; i++) {
      //   filtered = new Set([...filtered].filter((x) => entitiesSets[i].has(x)));
      // }

      this._viewer.selectionTool.picker.setFlattenedEntitySet(new Set(f));
    } else {
      this._viewer.selectionTool.picker.setFlattenedEntitySet(undefined);
    }
  }

  public addFilter(key: string) {
    const filter: FilterItem = {
      id: v4(),
      key,
      condition: [],
      enabled: true,
    };

    this._filters.set(filter.id, filter);
    this._$filters.next([...this._filters.values()]);
  }

  public removeFilter(id: string) {
    this._filters.delete(id);
    this._$filters.next([...this._filters.values()]);
  }

  public updateFilter(filter: FilterItem) {
    console.log(filter);

    this._filters.set(filter.id, filter);
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

function filterEntities(
  entities: Entity[],
  filterItems: FilterItem[]
): Entity[] {
  return entities.filter((entity) => {
    return filterItems.every((filterItem) => {
      const entityValue = entity.props?.get(filterItem.key);

      const conditions =
        filterItem.condition.length > 0
          ? filterItem.condition
          : [{ operator: "DEFINED", value: undefined }];

      return conditions.some((condition) => {
        switch (condition.operator) {
          case "DEFINED":
            return entityValue && true;
          case "EQUAL":
            return entityValue === condition.value;
          case "NOT_EQUAL":
            return entityValue !== condition.value;
          case "GREATER_THAN":
            return (
              typeof entityValue === "number" &&
              entityValue > (condition.value as number)
            );
          case "LESS_THAN":
            return (
              typeof entityValue === "number" &&
              entityValue < (condition.value as number)
            );
          default:
            return false;
        }
      });
    });
  });
}
