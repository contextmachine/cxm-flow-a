import { gql } from "@apollo/client";
import ExtensionEntity from "../../entity/extension-entity";
import { ExtensionEntityInterface } from "../../entity/extension-entity.types";
import client from "@/components/graphql/client/client";
import QueryEntity from "./entities/query-entity";
import { BehaviorSubject } from "rxjs";
import {
  QueryEntityTreeItem,
  QueryRawData,
} from "./entities/query-entity.types";
import { QuerySectionTreeItem } from "./query-extension.types";

class QueryExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public name: string;

  private _queries: QueryEntity[] = [];
  private _queryMap: Map<number, QueryEntity> = new Map();

  private _queries$ = new BehaviorSubject<QueryEntity[]>([]);
  private _treeData$ = new BehaviorSubject<QuerySectionTreeItem[]>([]);

  private _openedEditForm$ = new BehaviorSubject<boolean>(false);
  private _editQueryId$ = new BehaviorSubject<number | null>(null);

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

  public assembleTreeData = () => {
    const restQueries: QueryEntityTreeItem[] = this._queries.map(
      (query) => query.treeItem
    );

    const treeData: QuerySectionTreeItem[] = [
      {
        label: "REST",
        id: "rest",
        children: restQueries,
        isQuerySection: true,
      },
    ];

    this._treeData$.next(treeData);
  };

  public getQuery = (queryId: number) => {
    return this._queryMap.get(queryId);
  };

  public editQuery = (queryId: number) => {
    this._editQueryId$.next(queryId);
    this._openedEditForm$.next(true);
  };

  public closeEditForm = () => {
    this._openedEditForm$.next(false);
    this._editQueryId$.next(null);
  };

  public openEditForm = () => {
    this._editQueryId$.next(null);
    this._openedEditForm$.next(true);
  };

  public get queries$() {
    return this._queries$.asObservable();
  }

  public get treeData$() {
    return this._treeData$.asObservable();
  }

  public get openedEditForm$() {
    return this._openedEditForm$.asObservable();
  }

  public get editQueryId$() {
    return this._editQueryId$.asObservable();
  }

  public async unload() {
    console.log("QueryExtension unloaded");

    this._queries = [];
    this._queryMap.clear();

    this._queries$.complete();
    this._treeData$.complete();
  }
}

export default QueryExtension;
