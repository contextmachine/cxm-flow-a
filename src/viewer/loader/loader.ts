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
import QueryEntity from "@/components/services/extension-service/extensions/query-extension/entities/query-entity";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type LoaderStatus = "loading" | "initObjects" | "idle";
export type StatusHistoryEntry = {
  status: LoaderStatus;
  service: string;
};

class Loader {
  private _status: LoaderStatus = "idle";
  private _statusSubject = new RX.Subject<LoaderStatus>();

  constructor(private _viewer: Viewer) {
    this._statusSubject.next(this._status);
  }

  public get status(): LoaderStatus {
    return this._status;
  }

  public get $status(): RX.Observable<LoaderStatus> {
    return this._statusSubject;
  }

  public async loadQueryModel(queryEntity: QueryEntity): Promise<ProjectModel> {
    console.log("a");
    const data = queryEntity.rawData;
    const jsonObject = findThreeJSJSON(data);

    console.log("b");

    const object3d = await parseJSON(jsonObject);

    console.log("c");

    console.log("object3d", object3d);

    const model = new ProjectModel(this._viewer, object3d, queryEntity);

    this._viewer.entityControl.addModel(model);
    this._viewer.cameraService.fitToScene();

    return model;
  }

  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader;
