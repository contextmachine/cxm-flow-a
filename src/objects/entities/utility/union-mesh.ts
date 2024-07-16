import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import {
  meshDefaultMaterial,
  lineDefaultMaterial,
} from "../../materials/object-materials";
import { ProjectModel } from "../../project-model";
import { Time } from "@antv/g2/lib/scale";
import { timeInterval } from "rxjs";

class UnionMesh {
  private _model: ProjectModel;
  private _unionMesh: THREE.Mesh;
  private _meshLines: THREE.LineSegments;

  private _collisionMesh: THREE.Mesh | undefined;
  private _meshIdMap = new Map<number, string>();

  private _indiciesMap: Map<string, number>;

  constructor(object: THREE.Object3D, model: ProjectModel) {
    this._model = model;

    const { singleMesh, lineSegments, indiciesMap } =
      this.initUnionMesh2(object);

    this._unionMesh = singleMesh;
    this._meshLines = lineSegments;
    this._indiciesMap = indiciesMap;
  }

  public get objects(): THREE.Object3D[] {
    return [this._unionMesh, this._meshLines];
  }

  public get entitiesScope(): Set<string> {
    return new Set([...this._indiciesMap.keys()]);
  }

  public get collisionMesh() {
    return this._collisionMesh;
  }

  public get meshIdMap() {
    return this._meshIdMap;
  }

  public initMaterials() {}

  public setMeshMaterialToFragment(
    entityId: string,
    meshMaterial: THREE.Material
  ) {
    const index = this._indiciesMap.get(entityId);

    if (index !== undefined) {
      (this._unionMesh.material as THREE.Material[])[index] = meshMaterial;
    }
    this._model.viewer.updateViewer();
  }

  public setLineMaterialToFragment(
    entityId: string,
    lineMaterial: THREE.Material
  ) {
    const index = this._indiciesMap.get(entityId);

    if (index !== undefined) {
      (this._meshLines.material as THREE.Material[])[index] = lineMaterial;
    }
  }

  public initUnionMesh(object3d: THREE.Object3D) {
    const indiciesMap = new Map<string, number>();

    let meshBuffers: THREE.BufferGeometry[] = [];
    let meshGroups: { start: number; count: number; materialIndex: number }[] =
      [];
    let meshMaterials: THREE.Material[] = [];

    let edgesGeometry: THREE.BufferGeometry[] = [];
    let lineGroups: { start: number; count: number; materialIndex: number }[] =
      [];
    let lineMaterials: THREE.Material[] = [];

    let meshCoutner = 0;
    let linesCounter = 0;
    let i = 0;

    normalizeAttribute(object3d);

    // let timeLabel = "collect buffer geo";
    // console.time(timeLabel);

    // const linecreating = "line creating";
    // console.time(linecreating);

    // let time = 0;
    // let meshCount = 0;
    // const times: number[] = [];

    object3d.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // meshCount++;

        const mesh = child as THREE.Mesh;

        const buffer = mesh.geometry
          .clone()
          .toNonIndexed()
          .applyMatrix4(mesh.matrixWorld);

        const meshLen = buffer.getAttribute("position").count;
        const meshGroup = {
          start: meshCoutner,
          count: meshLen,
          materialIndex: i,
        };

        // const time1 = new Date();

        const linesBuffer = new THREE.EdgesGeometry(buffer.clone(), 50);

        // const time2 = new Date();

        // const delta = time2.valueOf() - time1.valueOf();
        // times.push(delta);

        // time += delta;

        const linesLen = linesBuffer.getAttribute("position").count;
        const lineGroup = {
          start: linesCounter,
          count: linesLen,
          materialIndex: i,
        };

        meshBuffers.push(buffer);
        meshMaterials.push(meshDefaultMaterial);
        meshGroups.push(meshGroup);

        edgesGeometry.push(linesBuffer);
        lineMaterials.push(lineDefaultMaterial);
        lineGroups.push(lineGroup);

        indiciesMap.set(child.uuid, i);

        meshCoutner = meshCoutner += meshLen;
        linesCounter = linesCounter += linesLen;
        i += 1;
      }
    });

    // const sorted = times.sort((a, b) => a - b);

    // console.log("time for line edging", time);
    // console.log("mesh count", meshCount);
    // console.log("delta list", sorted);
    // console.log(
    //   "avegage time",
    //   times.reduce((a, c) => a + c, 0) / times.length
    // );

    // // const max = times[times.length - 1];
    // // const min = times[0];
    // const min = 3;
    // const max = 20;

    // console.log("min, max", min, max);

    // console.timeLog(timeLabel);

    // const minColor = new THREE.Color("lightblue");
    // const maxColor = new THREE.Color("red");

    // times.forEach((time, i) => {
    //   const color = minColor.lerp(maxColor, (time - min) / (max - min));

    //   this._testMaterials.push(new THREE.MeshBasicMaterial({ color: color }));
    // });

    if (meshBuffers.length > 0) {
      // timeLabel = "merge mesh buffer geometries";
      // console.time(timeLabel);

      const union = BufferGeometryUtils.mergeGeometries(meshBuffers);

      // console.timeLog(timeLabel);

      meshGroups.forEach((x) =>
        union.addGroup(x.start, x.count, x.materialIndex)
      );
      const singleMesh = new THREE.Mesh(union, meshMaterials);

      // timeLabel = "merge line buffer geometies";
      // console.time(timeLabel);

      const linesUnion = BufferGeometryUtils.mergeGeometries(edgesGeometry);
      lineGroups.forEach((x) =>
        linesUnion.addGroup(x.start, x.count, x.materialIndex)
      );

      // console.timeLog(timeLabel);

      const lineSegments = new THREE.LineSegments(linesUnion, lineMaterials);
      lineSegments.renderOrder = 100;

      // timeLabel = "compute bvh";
      // console.time(timeLabel);

      this.computeBVH(object3d);

      // console.timeLog(timeLabel);

      singleMesh.geometry.computeVertexNormals();

      return {
        singleMesh,
        lineSegments,
        indiciesMap,
      };
    } else {
      throw new Error("error while generating UnionMesh for model");
    }
  }

  public initUnionMesh2(object3d: THREE.Object3D) {
    const indiciesMap = new Map<string, number>();

    let meshBuffers: THREE.BufferGeometry[] = [];
    let meshGroups: { start: number; count: number; materialIndex: number }[] =
      [];
    let meshMaterials: THREE.Material[] = [];

    let edgesGeometry: THREE.BufferGeometry[] = [];
    let lineGroups: { start: number; count: number; materialIndex: number }[] =
      [];
    let lineMaterials: THREE.Material[] = [];

    let meshCoutner = 0;
    let linesCounter = 0;
    let i = 0;

    const uniqueBuffers = new Map<
      string,
      { meshBuffer: THREE.BufferGeometry; lineBuffer: THREE.BufferGeometry }
    >();

    normalizeAttribute(object3d);

    // let timeLabel = "collect buffer geo";
    // console.time(timeLabel);

    // const linecreating = "line creating";
    // console.time(linecreating);

    // let time = 0;
    // let meshCount = 0;
    // const times: number[] = [];

    object3d.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // meshCount++;

        const mesh = child as THREE.Mesh;

        let uniqueBuffer;

        if (!uniqueBuffers.has(mesh.geometry.uuid)) {
          const meshBuffer = mesh.geometry.clone().toNonIndexed();
          const lineBuffer = new THREE.EdgesGeometry(meshBuffer, 50);
          uniqueBuffers.set(mesh.geometry.uuid, { meshBuffer, lineBuffer });
        }
        const buffers = uniqueBuffers.get(mesh.geometry.uuid)!;

        const buffer = buffers.meshBuffer
          .clone()
          .applyMatrix4(mesh.matrixWorld);

        const meshLen = buffer.getAttribute("position").count;
        const meshGroup = {
          start: meshCoutner,
          count: meshLen,
          materialIndex: i,
        };

        // const time1 = new Date();

        const linesBuffer = buffers.lineBuffer
          .clone()
          .applyMatrix4(mesh.matrixWorld);

        // const time2 = new Date();

        // const delta = time2.valueOf() - time1.valueOf();
        // times.push(delta);

        // time += delta;

        const linesLen = linesBuffer.getAttribute("position").count;
        const lineGroup = {
          start: linesCounter,
          count: linesLen,
          materialIndex: i,
        };

        meshBuffers.push(buffer);
        meshMaterials.push(meshDefaultMaterial);
        meshGroups.push(meshGroup);

        edgesGeometry.push(linesBuffer);
        lineMaterials.push(lineDefaultMaterial);
        lineGroups.push(lineGroup);

        indiciesMap.set(child.uuid, i);

        meshCoutner = meshCoutner += meshLen;
        linesCounter = linesCounter += linesLen;
        i += 1;
      }
    });

    // const sorted = times.sort((a, b) => a - b);

    // console.log("time for line edging", time);
    // console.log("mesh count", meshCount);
    // console.log("delta list", sorted);
    // console.log(
    //   "avegage time",
    //   times.reduce((a, c) => a + c, 0) / times.length
    // );

    // // const max = times[times.length - 1];
    // // const min = times[0];
    // const min = 3;
    // const max = 20;

    // console.log("min, max", min, max);

    // console.timeLog(timeLabel);

    // const minColor = new THREE.Color("lightblue");
    // const maxColor = new THREE.Color("red");

    // times.forEach((time, i) => {
    //   const color = minColor.lerp(maxColor, (time - min) / (max - min));

    //   this._testMaterials.push(new THREE.MeshBasicMaterial({ color: color }));
    // });

    if (meshBuffers.length > 0) {
      // timeLabel = "merge mesh buffer geometries";
      // console.time(timeLabel);

      const union = BufferGeometryUtils.mergeGeometries(meshBuffers);

      // console.timeLog(timeLabel);

      meshGroups.forEach((x) =>
        union.addGroup(x.start, x.count, x.materialIndex)
      );
      const singleMesh = new THREE.Mesh(union, meshMaterials);

      // timeLabel = "merge line buffer geometies";
      // console.time(timeLabel);

      const linesUnion = BufferGeometryUtils.mergeGeometries(edgesGeometry);
      lineGroups.forEach((x) =>
        linesUnion.addGroup(x.start, x.count, x.materialIndex)
      );

      // console.timeLog(timeLabel);

      const lineSegments = new THREE.LineSegments(linesUnion, lineMaterials);
      lineSegments.renderOrder = 100;

      // timeLabel = "compute bvh";
      // console.time(timeLabel);

      this.computeBVH(object3d);

      // console.timeLog(timeLabel);

      singleMesh.geometry.computeVertexNormals();

      return {
        singleMesh,
        lineSegments,
        indiciesMap,
      };
    } else {
      throw new Error("error while generating UnionMesh for model");
    }
  }

  private computeBVH(object: THREE.Object3D) {
    if (this._collisionMesh) {
      this._collisionMesh.geometry.disposeBoundsTree();
    }
    this._meshIdMap = new Map();

    const meshes: THREE.Mesh[] = [];

    object.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        meshes.push(o);
      }
    });

    let buffers = meshes.map((o, i) => {
      const id = i;
      const mesh = o.clone() as THREE.Mesh;
      const pointCount =
        (mesh.geometry.getAttribute("position") as THREE.BufferAttribute).array
          .length / 3;

      const objIndex = new Array<number>(pointCount).fill(id);
      this._meshIdMap.set(id, o.uuid);

      const geo = mesh.geometry
        .clone()
        .deleteAttribute("uv")
        .deleteAttribute("normal")
        .setAttribute("meshId", new THREE.Int32BufferAttribute(objIndex, 1))
        .applyMatrix4(mesh.matrixWorld);

      return geo;
    });

    if (buffers.length) {
      const geometry = BufferGeometryUtils.mergeGeometries(buffers);
      const unionMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: "#00FFFF",
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );

      geometry.computeBoundsTree();
      geometry.computeBoundingBox();

      this._collisionMesh = unionMesh;
      buffers.forEach((x) => x.dispose());
    }
  }
}

const normalizeAttribute = (object: THREE.Object3D) => {
  const attributeDiff = new Set<string>();

  const uniqueAttSet = new Set<string>();
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      Object.keys(child.geometry.attributes).forEach((name) => {
        uniqueAttSet.add(name);
      });
    }
  });

  const uniqueAtt = [...uniqueAttSet];

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      Object.keys(child.geometry.attributes).forEach((name) => {
        const objAtt = Object.keys(child.geometry.attributes);
        const diff = uniqueAtt.filter((x) => !objAtt.includes(x));

        diff.forEach((x) => attributeDiff.add(x));
      });
    }
  });

  if (attributeDiff.size > 0) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        attributeDiff.forEach((x) => {
          child.geometry.deleteAttribute(x);
        });
      }
    });
  }
};

export default UnionMesh;
