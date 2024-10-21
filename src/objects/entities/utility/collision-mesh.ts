import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

type CollisionType = "mesh" | "points";

class CollisionMesh {
  private _collisionMesh: THREE.Mesh;
  private _meshIdMap: Map<number, string>;

  private _type: CollisionType;

  constructor(
    collisionMesh: THREE.Mesh,
    meshIdMap: Map<number, string>,
    type: CollisionType
  ) {
    this._collisionMesh = collisionMesh;
    this._meshIdMap = meshIdMap;

    this._type = type;
  }

  public get type(): CollisionType {
    return this._type;
  }

  public get collisionMesh() {
    return this._collisionMesh;
  }

  public get meshIdMap() {
    return this._meshIdMap;
  }
}

export default CollisionMesh;
