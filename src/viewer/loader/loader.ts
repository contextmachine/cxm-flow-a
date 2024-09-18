import * as THREE from "three";
import parseJSON from "./utils/parse-json";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import axios from "axios";
import * as RX from "rxjs";
import Viewer from "../viewer";
import { findThreeJSJSON } from "./utils/findThreejsJSON";
import ApiObject from "./objects/api-object";
import { ProjectModel } from "@/src/objects/project-model";
import { getQueries } from "@/src/data-access/queries";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type LoaderState = "compute" | "loading" | "idle";

export type StatusHistoryEntry = {
  status: LoaderState;
  service: string;
};

class Loader {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _status: LoaderState = "idle";
  private _statusSubject = new RX.Subject<LoaderState>();

  private _queries: Set<ApiObject> = new Set();
  private _queriesSubject = new RX.Subject<ApiObject[]>();

  constructor(private _viewer: Viewer) {
    this._statusSubject.next(this._status);

    this._subscriptions.push(
      this._viewer.sceneService.$sceneMetadata
        .pipe(RX.first())
        .subscribe((e) => {
          this.updateFromDb();
        })
    );
  }

  private setStatus(status: LoaderState) {
    // this._viewer.setStatus(status);
    this._status = status;
    this._statusSubject.next(status);
  }

  public get status(): LoaderState {
    return this._status;
  }

  public get $status(): RX.Observable<LoaderState> {
    return this._statusSubject;
  }

  public get $queries(): RX.Observable<ApiObject[]> {
    return this._queriesSubject;
  }

  public get queries() {
    return this._queries;
  }

  private updateApiObjects() {
    console.log("update");
    this._queriesSubject.next([...this._queries.values()]);
  }

  public async updateFromDb() {
    this.setStatus("loading");

    const dbQueries = await getQueries(this._viewer.sceneService.sceneId!);

    const newQueries: ApiObject[] = [];
    const deletedQueries: ApiObject[] = [];
    const reloadQueries: ApiObject[] = [];
    const updatedQueries: ApiObject[] = [];

    const list = [...this._queries.values()];

    const existingQueriesMap = new Map(list.map((x) => [x.id, x]));
    const dbQueriesMap = new Map(dbQueries.map((x) => [x.id, x]));

    dbQueriesMap.forEach((dbQuery) => {
      const existingQuery = existingQueriesMap.get(dbQuery.id);
      if (existingQuery) {
        updatedQueries.push(existingQuery);
        if (existingQuery.endpoint !== dbQuery.endpoint) {
          reloadQueries.push(existingQuery);
        }
        existingQuery.updateApiObject(dbQuery);
      } else {
        newQueries.push(new ApiObject(dbQuery));
      }
    });

    existingQueriesMap.forEach((existingQuery) => {
      if (!dbQueriesMap.get(existingQuery.id)) {
        deletedQueries.push(existingQuery);
      }
    });

    const needsToLoad = [...reloadQueries, ...newQueries];

    for (const apiObject of needsToLoad) {
      await this.loadApiObject(apiObject);
    }

    for (const apiObject of deletedQueries) {
      this.removeApiObject(apiObject);
    }

    if (needsToLoad.length > 0 || deletedQueries.length > 0) {
      this._viewer.controls.fitToScene();
    }

    this.updateApiObjects();
    this.setStatus("idle");
  }

  public reloadApiObject(id: number) {
    const list = [...this._queries.values()];

    const existingQueriesMap = new Map(list.map((x) => [x.id, x]));

    const apiObject = existingQueriesMap.get(id);

    if (apiObject) {
      this.setStatus("loading");
      this.removeApiObject(apiObject);
      this.loadApiObject(apiObject);
      this.updateApiObjects();
      this.setStatus("idle");
    }
  }

  private async removeApiObject(apiObject: ApiObject) {
    if (this._queries.has(apiObject)) {
      this._queries.delete(apiObject);
      if (apiObject.model) {
        this._viewer.entityControl.removeModel(apiObject.model);
      }
    }
  }

  public setLoaderStatus(status: LoaderState) {
    this.setStatus(status);
  }

  public async loadApiObject(
    apiObject: ApiObject,
    options?: { useData?: any }
  ) {
    const exsisting = this._queries.has(apiObject);

    if (exsisting) {
      if (apiObject.model) {
        this._viewer.entityControl.removeModel(apiObject.model);
      }
    } else {
      this._queries.add(apiObject);
    }

    let data;
    if (options?.useData) {
      // use data from options
      data = options.useData;
    } else {
      // fetch data from endpoint
      const response = await axios.get(apiObject.endpoint);
      data = response.data;
    }

    const jsonObject = findThreeJSJSON(data);

    console.log(jsonObject);
    if (jsonObject) {
      const object3d = await parseJSON(jsonObject);

      const model = new ProjectModel(this._viewer, object3d, apiObject);
      this._viewer.entityControl.addModel(model);
      return model;
    } else {
      return undefined;
    }
  }

  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader;
