import * as RX from "rxjs";

import {
  QueryRawData,
  addQuery,
  deleteQuery,
  updateQuery,
} from "@/src/data-access/queries";
import ApiObject from "@/src/viewer/loader/objects/api-object";
import Viewer from "@/src/viewer/viewer";
import { assertDefined } from "@/src/utils";

class QueryControl {
  public name: string;

  private _viewer: Viewer;

  private _subscriptions: RX.Unsubscribable[] = [];

  private _queryMap: Map<number, ApiObject> = new Map();
  private _$queries = new RX.Subject<Map<number, ApiObject>>();

  constructor(viewer: Viewer) {
    this._viewer = viewer;

    this.load();
    this.name = "queries";
  }

  public async load() {
    console.log("QueryExtension loaded");

    this._queryMap = new Map(
      [...this._viewer.loader.queries.values()].map((x) => [x.id, x])
    );

    this._subscriptions.push(
      this._viewer.loader.$queries.subscribe((queries) => {
        this._queryMap = new Map(queries.map((x) => [x.id, x]));
        this._$queries.next(this._queryMap);
      })
    );
  }

  public addApiObject = async ({
    endpoint,
    name,
  }: {
    endpoint: string;
    name: string;
  }) => {
    const id = await addQuery(
      endpoint,
      name,
      this._viewer.sceneService.sceneId!,
      "rest"
    );

    const viewer = assertDefined(this._viewer);
    viewer.loader.updateFromDb();
  };

  public async reloadQuery(queryId: number) {
    this._viewer.loader.reloadApiObject(queryId);
  }

  public updateQuery = async (
    queryId: number,
    { endpoint, name }: { endpoint: string; name: string }
  ) => {
    const data: QueryRawData = {
      id: queryId,
      endpoint,
      name,
      type: "rest",
      scene_id: this._viewer.sceneService!.sceneId!,
    };

    await updateQuery(data);

    this._viewer.loader.updateFromDb();
  };

  public deleteApiObject = async (queryId: number) => {
    await deleteQuery(queryId);

    this._viewer.loader.updateFromDb();
  };

  public getQuery = (queryId: number) => {
    return this._queryMap.get(queryId);
  };

  public get queries() {
    return this._queryMap;
  }

  public get $queries() {
    return this._$queries;
  }

  public async unload() {
    console.log("QueryExtension unloaded");

    this._subscriptions.forEach((x) => x.unsubscribe());

    this._queryMap.clear();

    this._$queries.complete();
  }
}

export default QueryControl;
