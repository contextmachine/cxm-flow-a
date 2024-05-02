import * as THREE from "three";
import * as RX from "rxjs";
import { getMeshUuidByPointIndex2, getPointer } from "./utils";
import SelectionControl from "./selection-tool";
import Viewer from "../viewer";
import { Entity, isGroup } from "@/src/objects/entities/entity";
import UnionMesh from "@/src/objects/entities/utility/union-mesh";
import { assertDefined } from "@/src/utils";
import EntityControl from "../entity-control";


class Picker {
  private _subscriptions: RX.Unsubscribable[] = [];
  private _domElement: HTMLCanvasElement;
  private _enabled = true;

  private _raycaster: THREE.Raycaster;
  private _camera: THREE.Camera;
  private _unionMeshes: UnionMesh[]

  constructor(
    private _viewer: Viewer,
    private _selectionControl: SelectionControl
  ) {
    this._domElement = this._viewer.canvas;
    this._camera = this._viewer.camera;
    this._raycaster = new THREE.Raycaster();

    this._raycaster.firstHitOnly = false;
    this._unionMeshes = [...this._viewer.entityControl.projectModels.values()]
      .flatMap(x => x.unions)
      .filter(x => x !== undefined) as UnionMesh[]

    this._subscriptions.push(
      RX.fromEvent<MouseEvent>(this._domElement, "mousedown")
        .pipe(RX.filter(() => this._enabled))
        .subscribe((e) => {
          this.mouseDown(e);
        })
    );
    this._subscriptions.push(
      RX.fromEvent<MouseEvent>(this._domElement, "dblclick")
        .pipe(RX.filter(() => this._enabled))
        .subscribe((e) => {
          this.doubleClick(e);
        })
    );
    this._subscriptions.push(
      this._viewer.entityControl.$projectModels.subscribe((e) => {
        this._unionMeshes = [...e.values()]
          .flatMap(x => x.unions)
          .filter(x => x !== undefined) as UnionMesh[]
      })
    );

  }

  public enable(e: boolean) {
    this._enabled = e;
  }

  private getObjectUnderMouse(event: MouseEvent): Entity | undefined {
    const raycaster = this._raycaster;

    const pointer = getPointer(event, this._domElement);
    this._camera.updateMatrixWorld()
    raycaster.setFromCamera(pointer, this._camera);

    const intersections: { uuid: string; distance: number }[] = [];

    this._unionMeshes.forEach((model) => {

      // рейкастим по всем unionMeshes в сцене

      const collisionMesh = model.collisionMesh!;
      const modelInt = raycaster.intersectObject(collisionMesh, true);

      modelInt.forEach(intersection => {
        // проходимся по всем пересечениям, и фильтурем по тем, которые доступны для выделения
        // отфильтрованные объекты попадают в массив intersections
        if (intersection.face) {
          const i = intersection.face.a;
          const meshUuid = getMeshUuidByPointIndex2(
            collisionMesh,
            i,
            model.meshIdMap
          );

          const po = this._viewer.entityControl.entities.get(meshUuid)

          if (po && po.visibility && po.isSelectable) {

            intersections.push({
              uuid: meshUuid,
              distance: modelInt[0].distance,
            });
          }
        }
      })
    });

    if (intersections.length > 0) {

      // сортируем пересечения по дистанции, и выбираем объект из тех, что находятся на текущем уровне
      intersections.sort((a, b) => a.distance - b.distance);
      const meshUuid = intersections[0].uuid;

      const entity = this.findObjectOnCurrentLevel(meshUuid, this._viewer.entityControl)

      return entity

    } else {

      return undefined

    }
  }

  private mouseDown(event: MouseEvent) {

    if (event.button === 0) {

      const entity = this.getObjectUnderMouse(event)

      if (entity) {
        const objectId = entity.id

        if (objectId) {
          if (!event.shiftKey && !event.ctrlKey) {
            this._selectionControl.clearSelection();
            this._selectionControl.addToSelection([objectId]);
          } else if (event.shiftKey) {
            this._selectionControl.addToSelection([objectId]);
          } else if (event.ctrlKey) {
            this._selectionControl.removeFromSelection([objectId]);
          }
        }

      } else {

        this._selectionControl.clearSelection()

      }
    }
  }

  private doubleClick(event: MouseEvent) {

    if (event.button === 0) {

      const entity = this.getObjectUnderMouse(event)

      if (entity && isGroup(entity)) {
        // если двойной клик по группе, переключаем группу на которую кликнули
        this._selectionControl.setCurrentGroup(entity)

      } else if (entity === undefined) {
        // если двойной клик по пустому месту, перекулючаемся на уровень выше
        const parent = this._selectionControl.currentGroup?.parent
        if (parent && isGroup(parent)) {
          this._selectionControl.setCurrentGroup(parent)
        } else {
          // если группы нет, то переключаемся на уровень сцены
          this._selectionControl.setCurrentGroup(undefined)
        }
      }
    }
  }

  public dispose() {
    this._subscriptions.forEach((x) => x.unsubscribe());
  }

  private findObjectOnCurrentLevel(id: string, entityControl: EntityControl): Entity | undefined {

    const objects = entityControl.objectsOnCurrentLevel
    const entity = objects.find(x => x.id === id)

    if (entity) {
      // объект найден на текущем уровне
      return entity
    } else {
      // объект не найдет на текущем уровне, переходим к родителю
      const parent = assertDefined(entityControl.entities.get(id)).parent
      if (parent) {
        const parentId = parent.id
        return this.findObjectOnCurrentLevel(parentId, entityControl)
      } else {
        // дошли до верхнего уровня, родителей нет
        return undefined
      }
    }
  }
}

export default Picker;


