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

export type LoaderStatus = "loading" | "idle";
export type StatusHistoryEntry = {
  status: LoaderStatus;
  service: string;
};

class Loader {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _status: LoaderStatus = "idle";
  private _statusSubject = new RX.Subject<LoaderStatus>();

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

  private setStatus(status: LoaderStatus) {
    this._status = status;
    this._statusSubject.next(status);
  }

  public get status(): LoaderStatus {
    return this._status;
  }

  public get $status(): RX.Observable<LoaderStatus> {
    return this._statusSubject;
  }

  public get $queries(): RX.Observable<ApiObject[]> {
    return this._queriesSubject;
  }

  private updateApiObjects() {
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

  private async removeApiObject(apiObject: ApiObject) {
    if (this._queries.has(apiObject)) {
      this._queries.delete(apiObject);
      if (apiObject.model) {
        this._viewer.entityControl.removeModel(apiObject.model);
      }
    }
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
    const object3d = await parseJSON(jsonObject);

    const model = new ProjectModel(this._viewer, object3d, apiObject);
    this._viewer.entityControl.addModel(model);

    return model;
  }

  public get queries() {
    return this._queries;
  }

  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader;
