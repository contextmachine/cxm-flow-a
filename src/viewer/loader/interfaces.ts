
export interface SceneJson {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    geometries: Array<{
        uuid: string;
        type: string;
        data: any;
    }>;
    materials: Array<{
        uuid: string;
        type: string;
        name?: string;
        [propName: string]: any;
    }>;
    textures?: Array<{
        uuid: string;
        name?: string;
        image: string;
    }>;
    images?: Array<{
        uuid: string;
        url: string;
    }>;
    object: {
        uuid: string;
        type: string;
        name?: string;
        children?: SceneJson["object"][];
        geometry?: string;
        material?: string;
        matrix?: number[];
    };
    animations?: Array<{
        name?: string;
        duration: number;
        tracks: Array<{
            type: string;
            name: string;
            times: number[];
            values: number[];
            [propName: string]: any; // Additional properties based on the track type
        }>;
    }>;
    [propName: string]: any;
}
