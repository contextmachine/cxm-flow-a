import * as THREE from "three";
import { ProjectModel } from "../project-model"
import { Mesh } from "./mesh";
import { Group } from "./group";
import { DefaultObject } from "./default-object";

export type ProjectObjectProps = Map<string, any>;

export type ViewerObjectType =
    | 'default'
    | 'group'
    | 'mesh'


export interface Entity {
    id: string
    type: ViewerObjectType
    name: string
    model: ProjectModel

    bbox: THREE.Box3Helper
    center: THREE.Vector3

    parent: Entity | undefined
    children: Entity[] | undefined

    visibility: boolean
    isSelectable: boolean

    props: ProjectObjectProps | undefined

    initBoundingBox: () => void
    setVisibility: (visible: boolean) => void
    showLineEdges: (show: boolean) => void
    setBboxVisibilty: (show: boolean) => void

    onSelect: () => void
    onDeselect: () => void
    onParentSelect: () => void
    onParentDeselect: () => void
    onDisable: () => void
    onEnable: () => void
}


export const isProjectObject = (obj: any): obj is Entity => {
    return obj.isProjectObject
}

export const isProjectMesh = (obj: any): obj is Mesh => {
    return isProjectObject(obj) && obj.type === 'mesh'
}

export const isGroup = (obj: any): obj is Group => {
    return isProjectObject(obj) && obj.type === 'group'
}


export const initEntity = (object: THREE.Object3D, model: ProjectModel, parent?: Group): Entity => {
    if (object instanceof THREE.Group) {
        return new Group(object, model, parent)
    } else if (object instanceof THREE.Mesh) {
        return new Mesh(object, model, parent)
    } else {
        return new DefaultObject(object, model, parent)
    }
}