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
import {
  OverallPointCloudField,
  PCUserData,
  PointCloudFieldHandler,
  PointCloudFieldSize,
  PointCloudPointSvg,
} from "./point-cloud-extension.types";
import { initializeSVGOverlay } from "./blocks/init-svg-overlay";
import { addPrimitive } from "./blocks/add-primitive";
import {
  createBlurredCircle,
  createBlurredRectangle,
  createDashedCircle,
  createDashedRectangle,
  createPoint,
} from "./blocks/create-2d-elements";
import { update2dElement } from "./blocks/update-2d-elements";
import { BehaviorSubject } from "rxjs";
import Viewer from "@/src/viewer/viewer";
import { ControlsViewState } from "@/src/viewer/camera-control.types";
import PointCloudExtensionDB from "./point-cloud-extension.db";
import { debounce } from "lodash";
import { ProductsDto } from "@/components/services/product-service/products.types";

class PointCloudExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: number;
  public name: string;

  private _topViewEnabled = false;

  private _cameraSubscription: Map<string, any> = new Map();

  private _points: Map<string, PointCloudFieldHandler> = new Map();
  private _overall: OverallPointCloudField | null = null;

  private _pointMeshes = new Map<string, THREE.Mesh>();
  private _pointSvgs = new Map<string, PointCloudPointSvg>();

  private _svgCanvas: SVGElement | null = null;
  private _divCanvas: HTMLDivElement | null = null;

  private _wireframeDisabled = true;

  private _selectedPointId: string | null = null;
  private _hoveredPointId: string | null = null;

  private _points$ = new BehaviorSubject<Map<string, PointCloudFieldHandler>>(
    new Map()
  );
  private _overall$ = new BehaviorSubject<OverallPointCloudField | null>(null);

  private _hasUpdated$ = new BehaviorSubject<boolean>(false);
  private _pendingRequest$ = new BehaviorSubject<boolean>(false);
  private _pendingResponse$ = new BehaviorSubject<boolean>(false);
  private _requestStatus$ = new BehaviorSubject<"success" | "error" | null>(
    null
  );

  private _pointCloudExtentionDB: PointCloudExtensionDB;

  private _statistics: PCUserData | null = null;
  private _statistics$ = new BehaviorSubject<PCUserData | null>(null);

  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);

    this.id = productData.id;
    this.name = "pointcloud-handler";

    this._pointCloudExtentionDB = new PointCloudExtensionDB(this._viewer);

    this._drawCylinders = this._drawCylinders.bind(this);
  }

  private async _addPoints() {
    const primitives =
      await this._pointCloudExtentionDB.getPointCloudPrimitive();

    primitives
      .filter(
        (primitive: any) =>
          primitive?.shape === "rectangle" || primitive?.shape === "circle"
      )
      .forEach((primitive: any) => {
        const itemData = this._translateDtoToHandler(primitive);
        this._points.set(itemData.id, itemData);
      });

    primitives
      .filter((primitive: any) => primitive?.shape === "overall")
      .forEach((primitive: any) => {
        try {
          const overall: any = {};

          const min_step = primitive.configs?.min_step;
          const max_step = primitive.configs?.max_step;
          const blur = primitive.configs?.blur;
          const min = primitive.configs?.min;

          overall["min_step"] = { ...min_step };
          overall["max_step"] = { ...max_step };
          overall["blur"] = { ...blur };

          this._overall = overall as OverallPointCloudField;
        } catch (error) {
          console.error("Error:", error);
        }
      });

    this._overall$.next(this._overall);
    this._points$.next(this._points);
  }

  private _translateDtoToHandler(dto: any): PointCloudFieldHandler {
    const shape = dto.shape === "rectangle" ? "rectangle" : "ellipse";
    let size: PointCloudFieldSize = [1, 1];

    const configs = dto.configs;

    if (
      typeof configs?.width === "number" &&
      typeof configs?.height === "number"
    ) {
      size = [configs.width, configs.height];
    }

    if (typeof configs?.radius === "number") {
      size = [configs.radius, configs.radius];
    }

    return {
      id: `${dto.id}`,
      position: [...dto.position, 20] as [number, number, number],
      height: 10,
      name: dto.name,
      size,
      shape: shape,
      active: dto.active,
    };
  }

  private _drawCylinders() {
    const camera = this._viewer.controls.camera!;
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
        const shape = this._points.get(key)!.shape;

        // TODO: Rewrite logic with center
        center = [centerX, centerY];

        if (!this._pointSvgs.has(key)) {
          const shape = this._points.get(key)!.shape;

          const pointSvg = {
            blurred:
              shape === "rectangle"
                ? createBlurredRectangle(svgElement)
                : createBlurredCircle(svgElement),
            dashed:
              shape === "rectangle"
                ? createDashedRectangle(svgElement)
                : createDashedCircle(svgElement),
            point: createPoint(divElement, this._points.get(key)!.name),
            shape,
          };

          pointSvg.blurred.style.opacity = "0";
          pointSvg.dashed.style.opacity = "0";
          pointSvg.point.style.opacity = "0";

          this._pointSvgs.set(key, pointSvg);
        }

        const pointSvg = this._pointSvgs.get(key)!;
        update2dElement(
          pointSvg,
          centerX,
          centerY,
          width,
          height,
          center,
          shape
        );
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
    } else if (data.shape) {
      this._clearSVGShapes();
      this._drawCylinders();

      // TODO: Update SVG shapes
      if (this._selectedPointId === id) {
        this.selectPoint(id);
      }

      if (this._hoveredPointId === id) {
        this.hoverPoint(id);
      }
    }

    this._points$.next(this._points);
    this._hasUpdated$.next(true);
  }

  public updateOverall(
    attribute: "min_step" | "max_step" | "blur",
    value: number
  ) {
    const overall = this._overall;

    if (!overall) return;

    overall[attribute].value = value;

    this._overall$.next({ ...overall });
    this._hasUpdated$.next(true);
  }

  public saveUpdates() {
    this._statistics = null;
    this._statistics$.next(null);

    this._requestStatus$.next(null);

    this._pendingRequest$.next(true);
    this._pendingResponse$.next(false);
    this._debouncedUpdate();
  }

  private _debouncedUpdate = debounce(async () => {
    try {
      // Assuming you have a method to prepare the payload for the post request
      const payload = this._prepareUpdatePayload();

      this._pendingRequest$.next(false);
      this._pendingResponse$.next(true);

      const result = await axios.post(
        "https://sbm.dev.contextmachine.cloud/initial_params",
        payload
      );

      const data = result.data;
      this._updateModel(data);
    } catch (error) {
      this._requestStatus$.next("error");
      console.error("Error posting update:", error);
    }

    this._pendingResponse$.next(false);
    this._pendingRequest$.next(false);
    this._hasUpdated$.next(false);
  }, 1500); // Adjust the debounce delay as needed

  private _prepareUpdatePayload() {
    const overall = this._overall;
    const points = Array.from(this._points.values());

    const payload = {
      min_step: overall?.min_step.value,
      max_step: overall?.max_step.value,
      blur: overall?.blur.value,
      shapes: points.map((point) => ({
        point: [point.position[0], point.position[1]],
        active: point.active,
        ...(point.shape === "rectangle"
          ? { width: point.size[0], height: point.size[1] }
          : {
              radius: point.size[0],
            }),
      })),
    };

    return payload;
  }

  private _updateModel(data: any = {}) {
    const viewer = this._viewer;
    const loader = viewer.loader;

    const queries = loader.queries;

    // Find the query that matches the current extension
    const query = Array.from(queries).find((query) =>
      query.endpoint.startsWith("http://storage.yandexcloud.net/")
    );

    if (query) {
      loader.loadApiObject(query, {
        useData: data,
      });
    }

    const object = data?.object;
    const userData = object?.userData;

    this._statistics = userData as PCUserData;
    this._statistics$.next(this._statistics);
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

    Array.from(points).forEach(([i, point]) => {
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

  public getCameraState(): ControlsViewState {
    return this._viewer.controls.getState();
  }

  public restoreCameraState(state: ControlsViewState) {
    this._viewer.controls.restoreState(state);

    this._topViewEnabled = false;
  }

  public enableTopView() {
    if (this._topViewEnabled) return;

    this._topViewEnabled = !this._topViewEnabled;

    const viewer = this._viewer;
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

    const camera = controls.camera;

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

    const distance = 800;
    controls.setPosition(center.x, center.y, center.z + distance);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 1;
      camera.updateProjectionMatrix();

      camera.near = 0.1;
      camera.far = 10000;
    }

    cameraControl.fitToScene();

    viewer?.updateViewer();
  }

  public async load() {
    await this._addPoints();

    this._initializeSVGOverlay();
    this._createPrimitives();
    this._addCameraSubscription();

    this.saveUpdates();

    try {
      const response = await axios.post(
        "https://sbm.dev.contextmachine.cloud/sbm_lamp/stats",
        data
      );
    } catch (error) {
      console.error("Error making post request:", error);
    }

    console.log("PointCloudExtension loaded");
  }

  /// render the camera views pins within the scene
  private _addCameraSubscription() {
    const cameraControls = this._viewer!.controls.controls;

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
        this._viewer.controls.controls.removeEventListener(key, value);
      } else {
        window.removeEventListener("resize", value);
      }
    });

    this._cameraSubscription.clear();
  }

  public selectPoint(id: string | null) {
    if (this._selectedPointId) {
      this.highlightPoint(this._selectedPointId, true);
    }

    if (id) {
      this.highlightPoint(id);
    }

    this._selectedPointId = id;
  }

  public hoverPoint(id: string | null) {
    if (this._hoveredPointId) {
      if (this._hoveredPointId !== this._selectedPointId) {
        this.highlightPoint(this._hoveredPointId, true);
      }
      this._hoveredPointId = null;
    }

    if (id) {
      this.highlightPoint(id);
      this._hoveredPointId = id;
    } else {
      this._hoveredPointId = null;
    }
  }

  private highlightPoint(id: string, hide: boolean = false) {
    const point = this._points.get(id);

    if (!point) return;

    const pointSvg = this._pointSvgs.get(id);

    if (!pointSvg) return;

    pointSvg.blurred.style.opacity = hide ? "0" : "1";
    pointSvg.dashed.style.opacity = hide ? "0" : "1";
    pointSvg.point.style.opacity = hide ? "0" : "1";
  }

  private _clearSVGShapes() {
    this._pointSvgs.forEach((pointSvg) => {
      pointSvg.point.remove();
      pointSvg.blurred.remove();
      pointSvg.dashed.remove();
    });
    this._pointSvgs.clear();
  }

  public unload() {
    this._clearSVGShapes();

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

  public get overall$() {
    return this._overall$.asObservable();
  }

  public get pendingRequest$() {
    return this._pendingRequest$.asObservable();
  }

  public get pendingResponse$() {
    return this._pendingResponse$.asObservable();
  }

  public get hasUpdated() {
    return this._hasUpdated$.asObservable();
  }

  public get requestStatus$() {
    return this._requestStatus$.asObservable();
  }

  public get statistics$() {
    return this._statistics$.asObservable();
  }
}

export default PointCloudExtension;
