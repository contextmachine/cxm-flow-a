import * as THREE from "three";


export interface TransformInstanceMeta {
    name: string;
    type: "GUI";
}

export interface TransformInstance {
    parent: THREE.Object3D | null;
    meta: TransformInstanceMeta;
}

export interface UserData {
    gui?: GuiControls[];
    entries?: any;
    properties: any;
    transformInstance?: TransformInstance;
}

export interface GuiControls {
    type: "controls";
    data: GuiData;
    post: GuiPost;
}

export interface GuiData {
    points?: Points;
    path?: Path;
    [key: string]: any;
}

export interface Path {
    [key: string]: any;
    points?: Points;
}

export type Points = { [key: string]: Point };

export interface Point {
    x: number;
    y: number;
    z: number;
}

export interface GuiPost {
    endpoint: string;
}

export interface SceneJSON {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    geometries: Array<any>; // You can replace "any" with more specific types if needed
    materials: Array<any>; // Same as above
    object: {
        uuid: string;
        type: string;
        name: string;
        matrix: Array<number>;
        children: Array<any>;
    };
}