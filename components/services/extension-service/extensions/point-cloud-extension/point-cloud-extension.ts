import ExtensionEntity from "../../entity/extension-entity";
import { ExtensionEntityInterface } from "../../entity/extension-entity.types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import data from "./data/data.json";
import CameraControls from "camera-controls";
import * as THREE from "three";
import { CameraControlsEventMap } from "camera-controls/dist/types";
import polygonClipping from "polygon-clipping";
import * as turf from "@turf/turf";
import itemData from "./data/points.json";
import {
  PointCloudFieldHandler,
  PointCloudFieldSize,
  PointCloudFloarParamWindow,
  PointCloudPointSvg,
} from "./point-cloud-extension.types";
import { initializeSVGOverlay } from "./blocks/init-svg-overlay";
import { addPrimitive } from "./blocks/add-primitive";
import {
  createBlurredCircle,
  createDashedCircle,
  createPoint,
} from "./blocks/create-2d-elements";
import { update2dElement } from "./blocks/update-2d-elements";
import { BehaviorSubject } from "rxjs";

class PointCloudExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: string;
  public name: string;

  private _topViewEnabled = false;

  private _cameraSubscription: Map<string, any> = new Map();

  private _points: Map<string, PointCloudFieldHandler> = new Map();

  private _pointMeshes = new Map<string, THREE.Mesh>();
  private _pointSvgs = new Map<string, PointCloudPointSvg>();

  private _svgCanvas: SVGElement | null = null;
  private _divCanvas: HTMLDivElement | null = null;

  private _wireframeDisabled = true;

  private _points$ = new BehaviorSubject<Map<string, PointCloudFieldHandler>>(
    new Map()
  );

  constructor() {
    super();

    this.id = uuidv4();
    this.name = "PointCloudExtension";

    this._addPoints();

    this._drawCylinders = this._drawCylinders.bind(this);
  }

  private _addPoints() {
    itemData.forEach((item) => {
      const itemData = item as PointCloudFieldHandler;
      this._points.set(itemData.id, itemData);
    });

    this._points$.next(this._points);
  }

  private _drawCylinders() {
    console.log("sre");

    const camera = this._sceneService?.viewer?.controls.camera!;
    camera.updateMatrixWorld(true);

    const svgElement = this._svgCanvas!;
    const divElement = this._divCanvas!;

    this._pointMeshes.forEach((mesh, key) => {
      const geometry = mesh.geometry as THREE.BufferGeometry;
      const positionAttribute = geometry.getAttribute("position");
      const indices = geometry.index?.array;
      const worldMatrix = mesh.matrixWorld;

      if (!indices) return;

      const polygons = [] as [number, number][][];
      let center: [number, number] = [0, 0];

      // Force update of camera matrices

      for (let i = 0; i < indices.length; i += 3) {
        const vertexIndices = [indices[i], indices[i + 1], indices[i + 2]];
        const points: [number, number][] = [];

        vertexIndices.forEach((index) => {
          const vertexPosition = new THREE.Vector3()
            .fromBufferAttribute(positionAttribute, index)
            .applyMatrix4(worldMatrix);
          vertexPosition.project(camera);

          // Convert projected coordinates to SVG space
          const x = (vertexPosition.x * 0.5 + 0.5) * svgElement.clientWidth;
          const y = (-vertexPosition.y * 0.5 + 0.5) * svgElement.clientHeight;
          points.push([x, y]);
        });

        polygons.push(points);
      }

      const centerPosition = new THREE.Vector3(center[0], center[1], 0);
      centerPosition.applyMatrix4(worldMatrix);
      centerPosition.project(camera);

      const x = (centerPosition.x * 0.5 + 0.5) * svgElement.clientWidth;
      const y = (-centerPosition.y * 0.5 + 0.5) * svgElement.clientHeight;

      center = [x, y];

      try {
        const b = polygons.map((points): any => [points]);
        const a = (polygonClipping as any).union(...b);

        const polygonGroup = a?.[0] || [];

        // Calculate bounding box using turf
        const turfPolygon = turf.polygon(polygonGroup);
        const bbox = turf.bbox(turfPolygon);

        // Calculate ellipse dimensions and position
        const [minX, minY, maxX, maxY] = bbox;
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        if (!this._pointSvgs.has(key)) {
          const pointSvg = {
            blurCircle: createBlurredCircle(svgElement),
            dashedCircle: createDashedCircle(svgElement),
            point: createPoint(divElement, this._points.get(key)!.name),
          };

          pointSvg.blurCircle.style.opacity = "0";
          pointSvg.dashedCircle.style.opacity = "0";
          pointSvg.point.style.opacity = "0";

          this._pointSvgs.set(key, pointSvg);
        }

        const pointSvg = this._pointSvgs.get(key)!;
        update2dElement(pointSvg, centerX, centerY, width, height, center);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }

  public updatePoint(id: string, data: Partial<PointCloudFieldHandler>) {
    const point = this._points.get(id);
    if (!point) return;

    const updatedPoint = { ...point, ...data };
    this._points.set(id, updatedPoint);

    if (data.size) {
      this._modifyCylinderSize(id, data.size);
    }

    this._points$.next(this._points);
  }

  private _modifyCylinderSize(id: string, size: PointCloudFieldSize) {
    const point = this._points.get(id);
    if (!point) return;

    point.size = size;

    const mesh = this._pointMeshes.get(id);
    if (!mesh) return;

    mesh.scale.set(size[0], 1, size[1]);
    mesh.updateMatrix();
    mesh.updateMatrixWorld(true);

    this._drawCylinders();
  }

  private _createPrimitives() {
    const points = this._points;

    points.forEach((point) => {
      const mesh = addPrimitive(point, !this._wireframeDisabled);

      this._viewer!.scene.add(mesh);
      this._pointMeshes.set(point.id, mesh); // Store in map with a unique ID
    });
  }

  private _initializeSVGOverlay() {
    const { svgCanvas, divCanvas } = initializeSVGOverlay()!;

    this._svgCanvas = svgCanvas;
    this._divCanvas = divCanvas;
  }

  public enableTopView() {
    if (this._topViewEnabled) return;

    this._topViewEnabled = !this._topViewEnabled;

    const viewer = this.sceneService?.viewer!;
    const cameraControl = viewer.controls;

    const controls: CameraControls = cameraControl.controls!;
    if (!controls) return;

    controls.mouseButtons.left = CameraControls.ACTION.NONE; // Disable rotation with mouse left button
    controls.touches.one = CameraControls.ACTION.NONE;

    const entityControl = viewer.entityControl;
    const entities = entityControl.entities;
    const center = new THREE.Vector3();
    let count = 0;
    entities.forEach((entity) => {
      const _center = entity.center;
      center.add(_center);
      count++;
    });

    if (count > 0) {
      center.divideScalar(count);
    }

    // increase size of point cloud
    entities.forEach((entity) => {
      console.log("entity:", entity);

      const model = entity.model;
      const objects = model.objects;

      objects.forEach((object) => {
        // check if they are point cloud
        const material = (object as any).material;
        if (material && material instanceof THREE.PointsMaterial) {
          material.size = 20;
          // update
        }
      });
    });

    console.log("Center:", center);

    const camera = controls.camera;

    // Set a small field of view to mimic orthographic projection
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 1;
      // set min near and max far to avoid clipping
      camera.near = 1;
      camera.far = 10000;
      camera.updateProjectionMatrix();
    }

    // Position the camera for top view
    const distance = 500; // Set this based on your scene size
    camera.position.set(center.x, center.y, center.z + distance);
    camera.lookAt(center);

    // Update CameraControls
    controls.setLookAt(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      center.x,
      center.y,
      center.z,
      true // true to enable damping or false to immediately apply changes
    );

    cameraControl.fitToScene();

    viewer?.updateViewer();
  }

  public async load() {
    this._initializeSVGOverlay();
    this._createPrimitives();
    this._addCameraSubscription();

    try {
      const response = await axios.post(
        "https://sbm.dev.contextmachine.cloud/sbm_lamp/stats",
        data
      );
      console.log("Post request successful aaa:", response.data);
    } catch (error) {
      console.error("Error making post request:", error);
    }

    console.log("PointCloudExtension loaded");
  }

  /// render the camera views pins within the scene
  private _addCameraSubscription() {
    const cameraControls = this._sceneService!.viewer!.controls.controls;

    this._cameraSubscription = new Map();

    const events: (keyof CameraControlsEventMap)[] = [
      "update",
      "sleep",
      "wake",
      "control",
    ];
    events.forEach((event) => {
      const subscription = cameraControls.addEventListener(
        event,
        this._drawCylinders
      );
      this._cameraSubscription.set(event, subscription);
    });

    const resizeSubscription = window.addEventListener(
      "resize",
      this._drawCylinders
    );
    this._cameraSubscription.set("resize", resizeSubscription);
  }

  private _removeCameraSubscription() {
    if (!this._cameraSubscription) return;

    this._cameraSubscription.forEach((value, key: any) => {
      if (key !== "resize") {
        this._sceneService!.viewer!.controls.controls.removeEventListener(
          key,
          value
        );
      } else {
        window.removeEventListener("resize", value);
      }
    });

    this._cameraSubscription.clear();
  }

  public hoverPoint(id: string | null) {
    const pointsSvg = this._pointSvgs;
    pointsSvg.forEach((pointSvg) => {
      pointSvg.blurCircle.style.opacity = "0";
      pointSvg.dashedCircle.style.opacity = "0";
      pointSvg.point.style.opacity = "0";
    });

    const point = this._points.get(id!);
    if (!point) return;

    const pointSvg = pointsSvg.get(id!);
    if (!pointSvg) return;

    pointSvg.blurCircle.style.opacity = "1";
    pointSvg.dashedCircle.style.opacity = "1";
    pointSvg.point.style.opacity = "1";
  }

  public unload() {
    this._pointSvgs.forEach((pointSvg) => {
      pointSvg.point.remove();
      pointSvg.blurCircle.remove();
      pointSvg.dashedCircle.remove();
    });
    this._pointSvgs.clear();

    this._pointMeshes.forEach((mesh) => {
      this._viewer!.scene.remove(mesh);
    });
    this._pointMeshes.clear();

    this._svgCanvas?.remove();
    this._divCanvas?.remove();

    this._removeCameraSubscription();
    console.log("PointCloudExtension unloaded");
  }

  public get points$() {
    return this._points$.asObservable();
  }
}

export default PointCloudExtension;