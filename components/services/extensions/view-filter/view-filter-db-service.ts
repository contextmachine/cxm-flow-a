import Viewer from "@/src/viewer/viewer";
import ViewFilterExtension, {
  FilterItem,
  FilterPreset,
} from "./view-filter-extension";
import { getGQLData, mutateGQLData } from "@/src/data-access/utils";
import { gql } from "@apollo/client";
import { assertDefined } from "@/src/utils";
import { v4 } from "uuid";

class ViewFilterDbService {
  private _sceneId: number;

  constructor(extension: ViewFilterExtension, viewer: Viewer) {
    this._sceneId = assertDefined(viewer.sceneService.sceneId);
  }

  public fetchPresets() {
    const query = gql`
      query FetchFilters($scene_id: Int!) {
        extensionsv3_view_filters(where: { scene: { _eq: $scene_id } }) {
          filters
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
          const filterPreset: FilterPreset = {
            id: x.id,
            name: x.name,
            filters: new Map(
              x.filters.map((filter: any) => [
                filter.id,
                {
                  id: filter.id,
                  key: filter.key,
                  enabled: filter.enabled,
                  condition: filter.condition.map((condition: any) => ({
                    value: condition.value,
                    operator: condition.operator,
                  })),
                },
              ])
            ),
          };
          return filterPreset;
        })
      );
  }

  public addPreset() {
    const query = gql`
      mutation MyMutation($scene_id: Int!, $name: String!, $filters: jsonb!) {
        insert_extensionsv3_view_filters_one(
          object: { filters: $filters, name: $name, scene: $scene_id }
        ) {
          id
        }
      }
    `;

    const variables = {
      scene_id: this._sceneId,
      name: "Filter preset",
      filters: [],
    };

    return mutateGQLData(query, variables);
  }

  public updatePreset(preset: FilterPreset) {
    const query = gql`
      mutation MyMutation($filters: jsonb, $name: String, $id: Int!) {
        update_extensionsv3_view_filters_by_pk(
          pk_columns: { id: $id }
          _set: { filters: $filters, name: $name }
        ) {
          id
          filters
        }
      }
    `;

    const variables = {
      id: preset.id,
      name: preset.name,
      filters: [...preset.filters.values()],
    };

    mutateGQLData(query, variables);
  }
}

export default ViewFilterDbService;
