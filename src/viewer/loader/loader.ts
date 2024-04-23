import * as THREE from "three";
import parseJSON from "./utils/parse-json";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import { groupBy } from "@/utils";
import axios from "axios";


import * as RX from "rxjs";
import { EndPointControls } from "./gql-controls";
import Viewer from "../viewer";
import GqlObject from "@/src/viewer/loader/objects/gql-object";
import RestObject from "@/src/viewer/loader/objects/rest-object";
import { ProjectModel } from "@/src/objects/project-model";
import { ProjectObject } from "@/src/objects/entities/project-object";
import { UserdataEntry } from "@/src/viewer/loader/objects/userdata-object";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type LoaderStatus = "loading" | "initObjects" | "idle";
export type StatusHistoryEntry = {
  status: LoaderStatus;
  service: string;
};

class Loader {
  private gqlControl: EndPointControls;

  private _status: LoaderStatus = "idle";
  private _statusSubject = new RX.Subject<LoaderStatus>();

  constructor(private _viewer: Viewer) {
    this.gqlControl = new EndPointControls();

    this._statusSubject.next(this._status);
  }

  public get status(): LoaderStatus {
    return this._status;
  }

  public get $status(): RX.Observable<LoaderStatus> {
    return this._statusSubject;
  }

  public async testLoad() {

    const endpoint = 'https://storage.yandexcloud.net/lahta.contextmachine.online/files/pretty_celling.json'

    const response = await axios.get(endpoint);

    console.log(response)


  }

  public async loadModel(apiObject: GqlObject | RestObject) {
    const object3d: THREE.Object3D | undefined = await this.loadGqlItem(
      apiObject
    );

    this.setStatus("initObjects");

    if (object3d) {
      const model = new ProjectModel(this._viewer, object3d, apiObject);
      this._viewer.entityControl.addModel(model);
      apiObject.projectModel = model;

      this._viewer.controls.fitToScene();
    }

    this.setStatus("idle");
  }

  public async reloadModel(model: ProjectModel) {
    const object3d = await this.loadGqlItem(model.apiObject);

    this.setStatus("initObjects");

    this._viewer.entityControl.removeModel(model);

    if (object3d) {
      model.updateProjectModel(object3d);
      this._viewer.entityControl.addModel(model);
    } else {
      model.apiObject.status = "error";
    }

    this.setStatus("idle");
  }

  public updateParametricObject(output: { data: any; endpoint: string }) {
    const { data, endpoint } = output;

    return axios({
      method: "post",
      url: endpoint,
      data: JSON.parse(data), // this will be passed in the request body
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async updateProps(
    projectObjects: ProjectObject[],
    newProps: Map<string, any>
  ) {
    const groupedByModel = groupBy(projectObjects, (x) => x.model);

    for (const data of [...groupedByModel.entries()]) {
      const [model, objects] = data;

      const body = {
        uuids: objects.map((x) => x.id),
        props: Object.fromEntries(newProps),
      };

      let endpointEntry: UserdataEntry | undefined;

      if (objects.length === 1) {
        const [object] = objects;
        endpointEntry = object.userdata?.getEntry("update_props");

        console.log("endpointEntry", endpointEntry);
      }

      if (!endpointEntry)
        endpointEntry = model.projectObject.userdata?.getEntry("update_props");

      if (!endpointEntry) throw Error("endpoint not found");

      const endpoint = endpointEntry.endpoint;
      const url = endpoint.url;

      try {
        await axios.post(url, body, {
          headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "mysecretkey",
          },
        });

        await this.reloadModel(model);
      } catch (error) {
        console.log(`failed to update props for ${endpoint}`);
        console.log(error);
      }
    }
  }

  private async loadGqlItem(
    apiObject: GqlObject | RestObject
  ): Promise<THREE.Object3D | undefined> {
    this.setStatus("loading");

    // Добавляет JSON сцены в gqlObject
    await this.gqlControl.processGql(apiObject);

    // Создает объект сцены Three.js на основе JSON сцены
    try {
      const parsedObject3d: THREE.Object3D = await parseJSON(
        apiObject.sceneJSON
      );

      return parsedObject3d;
    } catch (error) {
      apiObject.status = "error";

      return undefined;
    }
  }

  private setStatus(e: LoaderStatus) {
    this._status = e;
    this._statusSubject.next(e);
  }

  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader