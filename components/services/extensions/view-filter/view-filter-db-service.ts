import Viewer from "@/src/viewer/viewer";
import ViewFilterExtension, {
  FilterGroup,
  FilterItem,
  FilterPreset,
} from "./view-filter-extension";
import { getGQLData, mutateGQLData } from "@/src/data-access/utils";
import { gql } from "@apollo/client";
import { assertDefined } from "@/src/utils";
import { v4 } from "uuid";

export interface FilterGroupDto {
  id: string;
  type: "group";
  groupType: "any" | "all";
  conditions: any[];
}

class ViewFilterDbService {
  private _sceneId: number;

  constructor(extension: ViewFilterExtension, viewer: Viewer) {
    this._sceneId = assertDefined(viewer.sceneService.sceneId);
  }

  private groupDtoToGroup(group: FilterGroupDto): FilterGroup {
    const filterGroup: FilterGroup = {
      ...group,
      conditions: new Map(
        group.conditions.map((x) => [
          x.id,
          x.type === "group" ? this.groupDtoToGroup(x) : { ...x },
        ])
      ),
    };

    return filterGroup;
  }

  private groupToGroupDto(group: FilterGroup): FilterGroupDto {
    const filterGroup: FilterGroupDto = {
      ...group,
      conditions: [...group.conditions.values()].map((x) =>
        x.type === "group" ? this.groupToGroupDto(x) : { ...x }
      ),
    };

    return filterGroup;
  }

  public fetchPresets() {
    const query = gql`
      query FetchFilters($scene_id: Int!) {
        extensionsv3_view_filters(where: { scene: { _eq: $scene_id } }) {
          filters
          enabled
          id
          name
        }
      }
    `;

    const variables = {
      scene_id: this._sceneId,
    };

    return getGQLData(query, variables)
      .then((e) => e.data.extensionsv3_view_filters as any[])
      .then((data) =>
        data.map((x) => {
          const filterPreset = {
            id: x.id,
            name: x.name,
            enabled: x.enabled,
            filter: this.groupDtoToGroup(x.filters),
          };

          return filterPreset;
        })
      );
  }

  public addPreset() {
    const query = gql`
      mutation MyMutation(
        $scene_id: Int!
        $name: String!
        $filters: jsonb!
        $enabled: Boolean!
      ) {
        insert_extensionsv3_view_filters_one(
          object: {
            filters: $filters
            name: $name
            scene: $scene_id
            enabled: $enabled
          }
        ) {
          id
        }
      }
    `;

    const variables = {
      scene_id: this._sceneId,
      name: "Filter preset",
      enabled: true,
      filters: {
        id: v4(),
        type: "group",
        groupType: "any",
        conditions: [],
      },
    };

    return mutateGQLData(query, variables);
  }

  public updatePreset(preset: FilterPreset) {
    const query = gql`
      mutation MyMutation(
        $filters: jsonb
        $name: String
        $id: Int!
        $enabled: Boolean!
      ) {
        update_extensionsv3_view_filters_by_pk(
          pk_columns: { id: $id }
          _set: { filters: $filters, name: $name, enabled: $enabled }
        ) {
          id
          filters
        }
      }
    `;

    const variables = {
      id: preset.id,
      name: preset.name,
      enabled: preset.enabled,
      filters: this.groupToGroupDto(preset.filter),
    };

    mutateGQLData(query, variables);
  }
}

export default ViewFilterDbService;
