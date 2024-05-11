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

  public async testLoad() {
    console.log("test load");

    ///const endpoint = 'https://storage.yandexcloud.net/lahta.contextmachine.online/files/pretty_celling.json'
    const endpoint =
      "https://storage.yandexcloud.net/lahta.contextmachine.online/files/sbm_lengths1.json";

    const apiObject = new ApiObject(endpoint);

    const response = await axios.get(endpoint);
    const jsonObject = findThreeJSJSON(response.data);

    const object3d = await parseJSON(jsonObject);

    const model = new ProjectModel(this._viewer, object3d, apiObject);

    return model;
  }

  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader;
