import * as THREE from "three";
import Viewer from "@/viewer/viewer";
import ApiObject from "../viewer/loader/objects/api-object";
import UnionMesh from "./entities/utility/union-mesh";
import { Entity, initEntity } from "./entities/entity";
import { Group } from "./entities/group";
import { Mesh } from "./entities/mesh";
import { DefaultObject } from "./entities/default-object";

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

  public get collisionMesh() {
    return this._unionMesh?.collisionMesh;
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

  public initModel(object: THREE.Object3D): Entity {
    const modelObjects: THREE.Object3D[] = [];
    let entity: Entity;

    // const bufferGeometries = new Map();

    // object.traverse((x) => {
    //   if (x instanceof THREE.Mesh) {
    //     if (x.geometry) {
    //       console.log("mesh with geom");

    //       const buffer = x.geometry;
    //       bufferGeometries.set(buffer.uuid, buffer);
    //     }
    //   }
    // });

    // console.log("geometries", bufferGeometries);

    const timerLabel = `init union mesh ${object.name}}`;

    console.time(timerLabel);

    try {
      const unionMesh = new UnionMesh(object, this);
      unionMesh.objects.forEach((x) => modelObjects.push(x));

      this._unionMesh = unionMesh;
    } catch (e) {}

    console.timeLog(timerLabel);

    if (object instanceof THREE.Group) {
      entity = new Group(object, this, undefined);
    } else if (object instanceof THREE.Mesh) {
      entity = new Mesh(object, this, undefined);
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
