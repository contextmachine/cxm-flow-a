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
    const existingQueryIds = new Set(this._queries.map((query) => query.id));

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
        fetchPolicy: "network-only",
      });

      const queries = response.data.appv3_scene_query;
      const newQueries: QueryEntity[] = [];
      const updatedQueries: QueryEntity[] = [];

      for (const query of queries) {
        const queryEntity = this._queryMap.get(query.id);
        if (queryEntity) {
          queryEntity.update(query);
          updatedQueries.push(queryEntity);
        } else {
          const queryEntity = new QueryEntity(this, query);
          queryEntity.load();
          newQueries.push(queryEntity);
        }
      }

      // Find and unload deleted queries
      const deletedQueries = await Promise.all(
        this._queries
          .filter((query) => !existingQueryIds.has(query.id))
          .map(async (query) => {
            query.unload();
            return query.id;
          })
      );

      // Remove deleted queries from _queries array and _queryMap
      for (const deletedQueryId of deletedQueries) {
        this._queries = this._queries.filter(
          (query) => query.id !== deletedQueryId
        );
        this._queryMap.delete(deletedQueryId);
      }

      // Update _queries array with new and updated queries
      this._queries = [...newQueries, ...updatedQueries];

      // Update _queryMap with new queries
      this._queryMap.clear();
      this._queries.forEach((query) => this._queryMap.set(query.id, query));

      // Notify subscribers of _queries$ with the updated _queries array
      this._queries$.next(this._queries);

      this.assembleTreeData();
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
        $sceneId: Int!
      ) {
        insert_appv3_scene_query(
          objects: {
            query: { data: { endpoint: $endpoint, name: $name, type: $type } }
            scene_id: $sceneId
          }
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
          sceneId: this.sceneService!.sceneId,
          type: "rest",
        },
      });

      await this.fetchQueries();
    } catch (error) {
      console.error("addQuery error", error);
    }
  };

  public updateQuery = async (
    queryId: number,
    { endpoint, name }: { endpoint: string; name: string }
  ) => {
    const mutation = gql`
      mutation updateQuery($queryId: Int!, $endpoint: String!, $name: String!) {
        update_appv3_query_by_pk(
          pk_columns: { id: $queryId }
          _set: { endpoint: $endpoint, name: $name }
        ) {
          id
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          queryId,
          endpoint,
          name,
        },
      });

      await this.fetchQueries();
    } catch (error) {
      console.error("updateQuery error", error);
    }
  };

  public deleteQuery = async (queryId: number) => {
    const mutation = gql`
      mutation deleteQuery($queryId: Int!, $sceneId: Int!) {
        delete_appv3_scene_query(
          where: { query_id: { _eq: $queryId }, scene_id: { _eq: $sceneId } }
        ) {
          affected_rows
        }

        delete_appv3_query_by_pk(id: $queryId) {
          id
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          queryId,
          sceneId: this.sceneService!.sceneId,
        },
      });

      await this.fetchQueries();
    } catch (error) {
      console.error("deleteQuery error", error);
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
