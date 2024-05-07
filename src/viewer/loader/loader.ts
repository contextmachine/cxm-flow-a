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
import { gql } from "@apollo/client";
import client from "@/components/graphql/client/client";
import { apiObjectFromDto } from "@/src/dto/fromDto";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type LoaderStatus = "loading" | "initObjects" | "idle";
export type StatusHistoryEntry = {
  status: LoaderStatus;
  service: string;
};

class Loader {

  private _subscriptions: RX.Unsubscribable[] = []

  private _status: LoaderStatus = "idle";
  private _statusSubject = new RX.Subject<LoaderStatus>();

  private _queries: ApiObject[] = []

  constructor(private _viewer: Viewer) {

    this._statusSubject.next(this._status);

    this._subscriptions.push(this._viewer.sceneService.$sceneMetadata
      .pipe(RX.first())
      .subscribe((e) => {
        this.initialLoad(e.id)
      }))

  }

  private async initialLoad(sceneId: number) {

    const queries = await this.getQueries(sceneId)
    const apiObjects = queries.map(x => new ApiObject(x.id, x.endpoint))
    this._queries = apiObjects
    for (let i = 0; i < apiObjects.length; i++) {
      await this.loadFromApiObject(apiObjects[i])
    }

    this._viewer.controls.fitToScene();

  }

  public get status(): LoaderStatus {
    return this._status;
  }

  public get $status(): RX.Observable<LoaderStatus> {
    return this._statusSubject;
  }

  public async loadFromApiObject(apiObject: ApiObject) {

    // const endpoint = 'https://storage.yandexcloud.net/lahta.contextmachine.online/files/pretty_celling.json'
    // const endpoint = 'https://storage.yandexcloud.net/lahta.contextmachine.online/files/sbm_lengths1.json'

    const response = await axios.get(apiObject.entry);
    const jsonObject = findThreeJSJSON(response.data)
    const object3d = await parseJSON(jsonObject)

    const model = new ProjectModel(this._viewer, object3d, apiObject)
    this._viewer.entityControl.addModel(model);

    return model

  }


  private async getQueries(sceneId: number) {

    const query = gql`
    query GetScene($sceneId: Int!) {
      appv3_scene_by_pk(id: $sceneId) {
          queries {
            id
            endpoint
          }
        }
      }
    `;

    try {
      const variables = {
        sceneId: sceneId,
      };

      const response = await client.query({
        query,
        variables,
        fetchPolicy: "network-only",
      });
      const queries = response.data.appv3_scene_by_pk.queries as any[];

      const x = queries.map(x => apiObjectFromDto(x))
      return x

    } catch {
      throw new Error('get Queries Error')
    }
  }








  public dispose() {
    console.log("dispose loader");
    return;
  }
}

export default Loader