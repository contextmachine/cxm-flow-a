import ExtensionEntity from "../../extension-service/entity/extension-entity";
import * as RX from "rxjs";
import {
  QueryEntityTreeItem,
  QuerySectionTreeItem,
} from "./query-extension.types";
import {
  QueryRawData,
  addQuery,
  deleteQuery,
  updateQuery,
} from "@/src/data-access/queries";
import ApiObject from "@/src/viewer/loader/objects/api-object";
import Viewer from "@/src/viewer/viewer";
import { assertDefined } from "@/src/utils";

class QueryExtension extends ExtensionEntity {
  public name: string;

  private _subscriptions: RX.Unsubscribable[] = [];

  private _queryMap: Map<number, ApiObject> = new Map();
  private _$treeData = new RX.BehaviorSubject<QuerySectionTreeItem[]>([]);

  private _$openedEditForm = new RX.BehaviorSubject<boolean>(false);
  private _$editQueryId = new RX.BehaviorSubject<number | null>(null);

  constructor(viewer: Viewer) {
    super(viewer);

    this.name = "queries";
  }

  public async load() {
    console.log("QueryExtension loaded");

    this._queryMap = new Map(
      [...this._viewer.loader.queries.values()].map((x) => [x.id, x])
    );
    this.assembleTreeData();

    this._subscriptions.push(
      this._viewer.loader.$queries.subscribe((queries) => {
        this._queryMap = new Map(queries.map((x) => [x.id, x]));
        this.assembleTreeData();
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

  public assembleTreeData = () => {
    const items: QueryEntityTreeItem[] = [...this._queryMap.values()].map(
      (query) => ({
        id: `rest-${query.id}`,
        endpoint: query.endpoint,
        type: query.type,
        label: query.name,
        children: [],
        loading: false,
        queryLoaded: true,
        modelLoaded: true,
        failed: false,
        queryId: query.id,
      })
    );

    const treeData: QuerySectionTreeItem[] = [
      {
        label: "REST",
        id: "rest",
        children: items,
        isQuerySection: true,
      },
    ];

    this._$treeData.next(treeData);
  };

  public getQuery = (queryId: number) => {
    return this._queryMap.get(queryId);
  };

  public editQuery = (queryId: number) => {
    this._$editQueryId.next(queryId);
    this._$openedEditForm.next(true);
  };

  public closeEditForm = () => {
    this._$openedEditForm.next(false);
    this._$editQueryId.next(null);
  };

  public openEditForm = () => {
    this._$editQueryId.next(null);
    this._$openedEditForm.next(true);
  };

  public get $treeData() {
    return this._$treeData.asObservable();
  }

  public get $openedEditForm() {
    return this._$openedEditForm.asObservable();
  }

  public get $editQueryId() {
    return this._$editQueryId.asObservable();
  }

  public async unload() {
    console.log("QueryExtension unloaded");

    this._subscriptions.forEach((x) => x.unsubscribe());

    this._queryMap.clear();

    this._$treeData.complete();
  }
}

export default QueryExtension;
