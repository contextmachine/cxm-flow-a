import GqlObject from "@/objects/api_objects/gql-object";
import * as RX from "rxjs";
import RestObject from "@/src/objects/api_objects/rest-object";
import Viewer from "@/viewer/viewer";
import { ApiEntry, ApiType } from "./api-service.types";

export type GqlObjectsMap = Map<string, GqlObject>;
export type RestObjectsMap = Map<string, RestObject>;
export type ApiObjectsMap = Map<string, GqlObject | RestObject>;

type ApolloMutation = (options?: any) => Promise<{ data?: any }>;

class ApiHandler {
  private _gqlObjects: GqlObjectsMap = new Map<string, GqlObject>();
  private _restObjects: RestObjectsMap = new Map<string, RestObject>();

  private _addQuery: ApolloMutation | undefined;
  private _updateQuery: ApolloMutation | undefined;

  private _subscriptions: RX.Subscription[] = [];

  private _apiObjects: ApiObjectsMap = new Map<
    string,
    GqlObject | RestObject
  >();
  private _apiObjectsObservable = new RX.Subject<ApiObjectsMap>();

  private _aoInner = new RX.Subject<ApiObjectsMap>();

  private _refetch: () => void = () => { };

  constructor(private _viewer: Viewer) {
    this._subscriptions.push(
      this._aoInner.pipe(RX.debounceTime(1000)).subscribe(() => {
        this._apiObjectsObservable.next(this._apiObjects);
      })
    );
  }

  public updateDB({ id, ...attrs }: { id: string;[key: string]: any }) {
    if (this._updateQuery) {
      this._updateQuery({ variables: { id, ...attrs } })
        .then((a) => {
          this.refetch();
        })
        .catch((a: any) => console.log("a", a));
    }
  }

  public update(data: ApiEntry[], refetch: () => void) {
    const newDataIds = new Set(data.map((entry) => entry.id));

    // Утилизация и удаление объектов, не вошедших в новые данные
    for (const [id, apiObject] of this._apiObjects.entries()) {
      if (!newDataIds.has(id)) {
        apiObject.dispose();

        if (apiObject instanceof GqlObject) {
          this._gqlObjects.delete(id);
        } else if (apiObject instanceof RestObject) {
          this._restObjects.delete(id);
        }

        this._apiObjects.delete(id);
      }
    }

    // Добавление новых записей из данных или обновление существующих
    data.forEach((entry: ApiEntry) => {
      const existingApiObject = this._apiObjects.get(entry.id);

      if (existingApiObject) {
        // Если объект уже существует, просто обновите его
        existingApiObject.update(entry);
      } else {
        // Обработка производится только в том случае, если это новая запись
        const type: ApiType = entry.type;

        if (type === "gql" || type === "GRAPHQL") {
          const gqlObject = new GqlObject(this, this._viewer);
          gqlObject.update(entry);

          this._gqlObjects.set(entry.id, gqlObject);
          this._apiObjects.set(entry.id, gqlObject);
        } else if (
          type === "controlPoints" ||
          type === "rest" ||
          type === "REST" ||
          type === "restScene"
        ) {
          const restObject = new RestObject(this, this._viewer);
          restObject.update(entry);

          this._restObjects.set(entry.id, restObject);
          this._apiObjects.set(entry.id, restObject);
        }
      }
    });

    this._refetch = refetch;

    this.updateApiObjects();
  }

  public updateApiObjects() {
    this._aoInner.next(this._apiObjects);
  }

  public get apiObjects(): ApiObjectsMap {
    return this._apiObjects;
  }

  public get $apiObjects(): RX.Observable<ApiObjectsMap> {
    return this._apiObjectsObservable;
  }

  public get refetch(): () => void {
    return this._refetch;
  }

  public provideAddUpdate(
    addQuery: ApolloMutation,
    updateQuery: ApolloMutation
  ) {
    this._addQuery = addQuery;
    this._updateQuery = updateQuery;
  }

  public dispose() {
    Array.from(this._apiObjects.values()).forEach((apiObject) => {
      apiObject.dispose();
    });

    this._subscriptions.forEach((x) => x.unsubscribe());
  }
}

export default ApiHandler;
