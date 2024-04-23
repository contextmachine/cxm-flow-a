import * as THREE from "three";
import { ProjectModel } from "../project-model"
import { ProjectMesh } from "./project-mesh";
import UserdataObject from "../../viewer/loader/objects/userdata-object";

export type ProjectObjectProps = Map<string, any>;

export type ViewerObjectType =
    | 'projectMesh'
    | 'meshFragment'
    | 'meshGroup'
    | 'meshFragmentGroup'


export interface ProjectObject {
    id: string
    type: ViewerObjectType
    name: string
    model: ProjectModel

    isProjectObject: boolean

    children: ProjectObject[]
    bbox: THREE.Box3Helper

    visibility: boolean
    isSelectable: boolean

    props: ProjectObjectProps | undefined
    userdata: UserdataObject | undefined


    center: THREE.Vector3

    setSelectable: (enabled: boolean) => void
    initBoundingBox: () => void
    setVisibility: (visible: boolean) => void
    showLineEdges: (show: boolean) => void
    setBboxVisibilty: (show: boolean) => void
    select: () => void
    deselect: () => void
}


export const isProjectObject = (obj: any): obj is ProjectObject => {
    return obj.isProjectObject
}

export const isProjectMesh = (obj: any): obj is ProjectMesh => {
    return isProjectObject(obj) && obj.type === 'projectMesh'
}
