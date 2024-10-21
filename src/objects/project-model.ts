import * as THREE from "three";
import Viewer from "@/viewer/viewer";
import ApiObject from "../viewer/loader/objects/api-object";
import UnionMesh from "./entities/utility/union-mesh";
import { Entity, initEntity } from "./entities/entity";
import { Group } from "./entities/group";
import { Mesh } from "./entities/mesh";
import { DefaultObject } from "./entities/default-object";
import { Points } from "./entities/points";
import CollisionMesh from "./entities/utility/collision-mesh";
import { MeshBVHHelper } from "three-mesh-bvh";

function isGroupMeshOnly(grp: THREE.Group): boolean {
  let result = true;
  let i = 0;
  while (i < grp.children.length) {
    if (grp.children[i].type != "Mesh") {
      result = false;
      break;
    }
  }
  return result;
}
// сущность проекта, загружаемая с сервера за один импорт
export class ProjectModel {
  protected _id: string;

  private _entity: Entity;
  private _unionMesh: UnionMesh | undefined;
  private _objects: THREE.Object3D[] = [];

  private _collisionMeshes: CollisionMesh[] = [];

  private _viewer: Viewer;

  constructor(
    viewer: Viewer,
    object3d: THREE.Object3D,
    private _queryEntity: ApiObject
  ) {
    this._viewer = viewer;
    this._id = object3d.uuid;

    object3d.traverse((x) => x.updateMatrixWorld());

    this._entity = this.initModel(object3d);
    this._queryEntity.setModel(this);
  }

  public updateProjectModel(object: THREE.Object3D) {
    this._entity = this.initModel(object);
  }

  public get objects(): THREE.Object3D[] {
    return this._objects;
  }

  public get collisionMeshes(): CollisionMesh[] {
    return this._collisionMeshes;
  }

  public get viewer(): Viewer {
    return this._viewer;
  }

  public get id(): string {
    return this._id;
  }

  public get unionMesh(): UnionMesh | undefined {
    return this._unionMesh;
  }

  public get entity(): Entity {
    return this._entity;
  }

  public get queryId(): number {
    return this._queryEntity.id;
  }

  public get endPoint(): ApiObject {
    return this._queryEntity;
  }

  public initModel(object: THREE.Object3D): Entity {
    const modelObjects: THREE.Object3D[] = [];
    let entity: Entity;

    try {
      const unionMesh = new UnionMesh(object, this);
      unionMesh.objects.forEach((x) => modelObjects.push(x));

      this._unionMesh = unionMesh;

      if (unionMesh.collisionMesh) {
        this._collisionMeshes.push(unionMesh.collisionMesh);
      }
    } catch (e) {}

    if (object instanceof THREE.Group) {
      entity = new Group(object, this, undefined);
    } else if (object instanceof THREE.Mesh) {
      entity = new Mesh(object, this, undefined);
    } else if (object instanceof THREE.Points) {
      entity = new Points(object, this, undefined);

      // console.log("here");

      // const meshIdMap = new Map<number, string>();

      // meshIdMap.set(0, object.uuid);

      // const indices = [];
      // const bvhGeometry = object.geometry.clone();

      // bvhGeometry.applyMatrix4(object.matrixWorld);

      // let verticesLength = bvhGeometry.attributes.position.count;
      // for (let i = 0, l = verticesLength; i < l; i++) {
      //   indices.push(i, i, i);
      // }

      // bvhGeometry.setIndex(indices);
      // const bvhMesh = new THREE.Mesh(bvhGeometry);

      // bvhMesh.geometry.computeBoundsTree();

      // const collisionMesh = new CollisionMesh(bvhMesh, meshIdMap);

      // const helper = new MeshBVHHelper(bvhMesh, 3);
      // helper.name = "bvh-helper";

      // console.log("----> helper", helper);
      // this._viewer.addToScene(helper);

      // this._collisionMeshes.push(collisionMesh);
    } else {
      entity = new DefaultObject(object, this, undefined);
    }

    const notUnionOubjects = getNotUnionObjects(entity, this.unionMesh);
    notUnionOubjects.forEach((x) => modelObjects.push(x));

    this._objects = modelObjects;
    return entity;
  }
}

const getNotUnionObjects = (
  entity: Entity,
  unionMesh: UnionMesh | undefined
) => {
  const objects: THREE.Object3D[] = [];

  const traverseObject = (entity: Entity) => {
    const objectPartOfUnion =
      unionMesh && unionMesh.entitiesScope.has(entity.id);

    if (!objectPartOfUnion && entity.objects) {
      entity.objects.forEach((x) => objects.push(x));
    }
    if (entity.children) {
      entity.children.forEach((x) => traverseObject(x));
    }
  };

  traverseObject(entity);

  return objects;
};
