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

class PointCloudExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: string;
  public name: string;

  private _cameraSubscription: Map<string, any> = new Map();

  private _points: Map<string, PointCloudFieldHandler> = new Map();

  private _pointMeshes = new Map<string, THREE.Mesh>();
  private _pointSvgs = new Map<string, PointCloudPointSvg>();

  private _svgCanvas: SVGElement | null = null;
  private _divCanvas: HTMLDivElement | null = null;

  private _paramsWindow: PointCloudFloarParamWindow | null = null;

  private _wireframeDisabled = true;

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
  }

  private _drawCylinders() {
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

          pointSvg.point.onclick = () => this._showParamWindow(mesh, key);

          this._pointSvgs.set(key, pointSvg);
        }

        const pointSvg = this._pointSvgs.get(key)!;
        update2dElement(pointSvg, centerX, centerY, width, height);
      } catch (error) {
        console.error("Error:", error);
      }
    });

    // Update the param window position
    if (this._paramsWindow) {
      const id = this._paramsWindow.id;
      const point = this._pointSvgs.get(id)?.point;

      if (point) {
        const rect = point.getBoundingClientRect();
        this._paramsWindow.div.style.left = rect.right + "px";
        this._paramsWindow.div.style.top = rect.top + "px";
      }
    }
  }

  private _modifyCylinderSize(id: string, size: PointCloudFieldSize) {
    const point = this._points.get(id);
    if (!point) return;

    point.size = size;

    const mesh = this._pointMeshes.get(id);
    if (!mesh) return;

    mesh.scale.set(size[0], size[1], 1);
    mesh.updateMatrix();
    mesh.updateMatrixWorld(true);
  }

  private _showParamWindow(mesh: THREE.Mesh, id: string) {
    this._hideParamWindow();

    const point = this._points.get(id);
    const size = point?.size || [1, 1];

    const div = document.createElement("div");
    div.style.position = "absolute";

    div.style.width = "200px";
    div.style.height = "200px";
    div.style.backgroundColor = "white";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.classList.add(
      "MuiPaper-root",
      "MuiPaper-elevation",
      "MuiPaper-rounded"
    );
    div.style.pointerEvents = "all";

    // Add input type range
    const rangeInput1 = document.createElement("input");
    rangeInput1.type = "range";
    rangeInput1.min = "0,1";
    rangeInput1.max = "4";
    rangeInput1.value = `${size[0]}`;
    rangeInput1.style.width = "100%";

    console.log("size", size);

    const rangeInput2 = document.createElement("input");
    rangeInput2.type = "range";
    rangeInput2.min = "0.1";
    rangeInput2.max = "4";
    rangeInput2.value = `${size[1]}`;
    rangeInput2.style.width = "100%";

    div.appendChild(rangeInput1);
    div.appendChild(rangeInput2);

    this._divCanvas?.appendChild(div);

    const position = mesh.position;
    const paramWindow: PointCloudFloarParamWindow = {
      position: position,
      id: id,
      div: div,
    };

    this._paramsWindow = paramWindow;

    this._drawCylinders();
  }

  private _hideParamWindow() {
    if (this._paramsWindow) {
      this._paramsWindow.div.remove();
      this._paramsWindow = null;
    }
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

  private _enableTopView() {
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

    const optionPanel = document.getElementById("footer-options-panel");
    if (optionPanel) {
      const button = document.createElement("button");
      button.innerText = "Top View";
      button.onclick = () => {
        this._enableTopView();
      };

      optionPanel.appendChild(button);
    }

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
  }

  private _removeCameraSubscription() {
    if (!this._cameraSubscription) return;

    this._cameraSubscription.forEach((value, key: any) => {
      this._sceneService!.viewer!.controls.controls.removeEventListener(
        key,
        value
      );
    });

    this._cameraSubscription.clear();
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
}

export default PointCloudExtension;
