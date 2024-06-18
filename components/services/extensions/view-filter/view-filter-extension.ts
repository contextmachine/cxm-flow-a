import Viewer from "@/src/viewer/viewer";
import ExtensionEntity from "../../extension-service/entity/extension-entity";

import * as RX from "rxjs";
import { Entity } from "@/src/objects/entities/entity";
import { assertDefined } from "@/src/utils";
import { v4 } from "uuid";
import ViewFilterDbService from "./view-filter-db-service";

export interface FilterPreset {
  id: number;
  name: string;
  enabled: string | undefined;
  filter: FilterGroup;
}

export type FilterItem = FilterGroup | FilterCondition;

export interface FilterGroup {
  id: string;
  type: "group";
  groupType: "any" | "all";
  conditions: Map<string, FilterItem>;
}

export type ConditionOperator =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "DEFINED";

export type ParamType = "string" | "number" | "boolean";

export interface FilterCondition {
  id: string;
  key: string;
  type: "condition";
  valueType: ParamType;
  value: number | string[] | boolean | undefined;
  operator: ConditionOperator;
}

class ViewFilterExtension extends ExtensionEntity {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _properties = new Map<string, Entity[]>();
  private _$properties = new RX.Subject<Map<string, Entity[]>>();

  private _filterPreset: FilterPreset | undefined;
  private _$filterPreset = new RX.Subject<FilterPreset>();

  private _$currentScopeCount = new RX.Subject<number | undefined>();
  private _$childrenCount = new RX.Subject<number | undefined>();

  private _dbService: ViewFilterDbService;

  constructor(viewer: Viewer) {
    super(viewer);
    this.name = "view-filter";

    this._dbService = new ViewFilterDbService(this, this._viewer);
  }

  public get properties() {
    return this._properties;
  }

  public get $properties() {
    return this._$properties;
  }

  public get filter() {
    return this._filterPreset;
  }

  public get $filter() {
    return this._$filterPreset;
  }

  public get $currentScopeCount() {
    return this._$currentScopeCount;
  }
  public get $childrenCount() {
    return this._$childrenCount;
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
      this._$filterPreset.subscribe(() => {
        this.executeFiltering();
      })
    );

    this._subscriptions.push(
      this._viewer.selectionTool.picker.$currentGroup.subscribe(() => {
        this.executeFiltering();
      })
    );

    const filterPresets = await this._dbService.fetchPresets();

    if (filterPresets.length > 0) {
      this._filterPreset = filterPresets[0];
    } else {
      await this._dbService.addPreset();

      const filterPresets = await this._dbService.fetchPresets();

      if (filterPresets.length === 0) {
        throw new Error("failed to load filter presets");
      }
      this._filterPreset = filterPresets[0];
    }

    this._$filterPreset.next(this._filterPreset);
  }

  private executeFiltering() {
    console.log("execute filtering");
    if (this._filterPreset && this._filterPreset.enabled) {
      const filterPreset = this._filterPreset;

      console.log(this._filterPreset);

      const objects = this._viewer.selectionTool.picker.objectsOnCurrentLevel;

      [...this._viewer.entityControl.projectModels.values()].forEach((x) =>
        x.entity.onDisable()
      );

      const filteredObjects: Entity[] = [];
      const fittingChildrens: Entity[] = [];

      const traverseEntity = (
        entity: Entity,
        filterItem: FilterItem,
        isParentFits: boolean
      ) => {
        const result = filterEntity(entity, filterItem);

        if (result) {
          if (!isParentFits) {
            entity.onEnable();
            filteredObjects.push(entity);
          }
          if (isParentFits) {
            fittingChildrens.push(entity);
          }
        } else if (!result && !isParentFits) {
          entity.onDisable();
        }

        if (entity.children) {
          entity.children.forEach((x) =>
            traverseEntity(x, filterItem, result || isParentFits)
          );
        }
      };

      objects.forEach((x) => traverseEntity(x, filterPreset.filter, false));

      this._viewer.selectionTool.picker.setCustomEntityScope(filteredObjects);

      this._$currentScopeCount.next(filteredObjects.length);
      this._$childrenCount.next(fittingChildrens.length);
    } else {
      this._viewer.selectionTool.picker.setCustomEntityScope(undefined);
      this._viewer.selectionTool.picker.objectsOnCurrentLevel.forEach((x) =>
        x.onEnable()
      );
      this._$currentScopeCount.next(undefined);
      this._$childrenCount.next(undefined);
    }

    this._viewer.updateViewer();
  }

  public addCondition(
    parentGroup: FilterGroup,
    key: string,
    valueType: ParamType
  ) {
    if (this._filterPreset) {
      const filter: FilterItem = {
        id: v4(),
        type: "condition",
        key,
        valueType,
        operator: "DEFINED",
        value: valueType === "string" ? [] : undefined,
      };

      parentGroup.conditions.set(filter.id, filter);

      this._$filterPreset.next({ ...this._filterPreset });
      this._dbService.updatePreset(this._filterPreset);
    }
  }

  public addGroup(parentGroup: FilterGroup) {
    if (this._filterPreset) {
      const group: FilterGroup = {
        id: v4(),
        type: "group",
        groupType: "any",
        conditions: new Map(),
      };

      parentGroup.conditions.set(group.id, group);

      console.log("add group", this._filterPreset);
      console.log("add group", parentGroup);

      this._$filterPreset.next({ ...this._filterPreset });
      this._dbService.updatePreset(this._filterPreset);
    }
  }

  public removeFilterItem(parentGroup: FilterGroup, id: string) {
    if (this._filterPreset) {
      parentGroup.conditions.delete(id);
      this._$filterPreset.next({ ...this._filterPreset });
      this._dbService.updatePreset(this._filterPreset!);
    }
  }

  public updateFilterCondition(filter: FilterCondition) {
    if (this._filterPreset) {
      this._$filterPreset.next({ ...this._filterPreset });
      this._dbService.updatePreset(this._filterPreset!);
    }
  }

  public updateFilterGroup(
    parentGroup: FilterGroup | undefined,
    group: FilterGroup
  ) {
    if (this._filterPreset) {
      if (parentGroup) {
        parentGroup.conditions.set(group.id, group);
      } else {
        this._filterPreset.filter = group;
      }
      this._$filterPreset.next({ ...this._filterPreset });

      this.executeFiltering();
      this._dbService.updatePreset(this._filterPreset!);
    }
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
    this._viewer.selectionTool.picker.setCustomEntityScope(undefined);
    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default ViewFilterExtension;

function filterEntity(entity: Entity, filterItem: FilterItem): boolean {
  if (filterItem.type === "group") {
    if (filterItem.conditions.size === 0) {
      return true;
    }

    if (filterItem.groupType === "all") {
      return [...filterItem.conditions.values()].every((condition) => {
        return filterEntity(entity, condition);
      });
    } else if (filterItem.groupType === "any") {
      return [...filterItem.conditions.values()].some((condition) => {
        return filterEntity(entity, condition);
      });
    } else {
      return false;
    }
  } else if (filterItem.type === "condition") {
    const entityValue = entity.props?.get(filterItem.key);

    const isArray = Array.isArray(filterItem.value);

    if (isArray) {
      const values = filterItem.value as string[];

      switch (filterItem.operator) {
        case "EQUAL":
          return values.includes(entityValue);
        case "NOT_EQUAL":
          return values.every((x) => x !== entityValue);
        default:
          return false;
      }
    }

    switch (filterItem.operator) {
      case "DEFINED":
        return entityValue !== undefined;
      case "EQUAL":
        return entityValue === filterItem.value;
      case "NOT_EQUAL":
        return entityValue !== filterItem.value;
      case "GREATER_THAN":
        return (
          typeof entityValue === "number" &&
          entityValue > (filterItem.value as number)
        );
      case "LESS_THAN":
        return (
          typeof entityValue === "number" &&
          entityValue < (filterItem.value as number)
        );
      default:
        return false;
    }
  } else {
    return false;
  }
}
