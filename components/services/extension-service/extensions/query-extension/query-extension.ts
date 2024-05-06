import { gql } from "@apollo/client";
import ExtensionEntity from "../../entity/extension-entity";
import { ExtensionEntityInterface } from "../../entity/extension-entity.types";
import client from "@/components/graphql/client/client";
import QueryEntity from "./entities/query-entity";
import { BehaviorSubject } from "rxjs";
import { QueryRawData } from "./entities/query-entity.types";

class QueryExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public name: string;

  private _queries: QueryEntity[] = [];
  private _queryMap: Map<number, QueryEntity> = new Map();

  private _queries$ = new BehaviorSubject<QueryEntity[]>([]);

  constructor() {
    super();

    this.name = "QueryExtension";
  }

  public async load() {
    console.log("QueryExtension loaded");

    await this.fetchQueries();
  }

  public fetchQueries = async () => {
    const query = gql`
      query getQueries($sceneId: Int!) {
        appv3_scene_query(where: { scene_id: { _eq: $sceneId } }) {
          query_id
          id
          scene_id
          query {
            endpoint
            id
            name
            type
          }
        }
      }
    `;

    try {
      const variables = {
        sceneId: this.sceneService!.sceneId,
      };

      const response = await client.query({
        query,
        variables,
      });

      const queries = response.data.appv3_scene_query;
      const queryEntities = queries.map((query: QueryRawData) => {
        const queryEntity = new QueryEntity(this, query);
        queryEntity.load();

        return queryEntity;
      });

      this._queries = queryEntities;
      this._queryMap = new Map(
        queryEntities.map((query: QueryEntity) => [query.id, query])
      );

      this._queries$.next(this._queries);
    } catch (error) {
      console.error("fetchQueries error", error);
    }
  };

  public addQuery = async ({
    endpoint,
    name,
  }: {
    endpoint: string;
    name: string;
  }) => {
    const mutation = gql`
      mutation addViewScene(
        $endpoint: String!
        $name: String!
        $type: String!
      ) {
        insert_appv3_query(
          objects: { endpoint: $endpoint, name: $name, type: $type }
        ) {
          affected_rows
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          endpoint,
          name,
          type: "rest",
        },
      });

      await this.fetchQueries();
    } catch (error) {
      console.error("addQuery error", error);
    }
  };

  public async unload() {
    console.log("QueryExtension unloaded");

    this._queries = [];
    this._queryMap.clear();

    this._queries$.complete();
  }
}

export default QueryExtension;
