export const findThreeJSJSON = (data: any): any | null => {
    try {
        if (typeof data === "object" && data !== null) {
            if (
                data.metadata &&
                typeof data.metadata === "object" &&
                data.metadata.type === "Object" &&
                data.metadata.version &&
                typeof data.metadata.version === "number" &&
                data.metadata.generator &&
                typeof data.metadata.generator === "string" &&
                data.geometries &&
                Array.isArray(data.geometries) &&
                data.materials &&
                Array.isArray(data.materials)
            ) {
                // We've found the Three.js JSON object
                return data;
            } else {
                // Traverse the object recursively to search for the JSON object
                for (const key in data) {
                    const result: any = findThreeJSJSON(data[key]);
                    if (result) {
                        return result;
                    }
                }
            }
        }
        // The JSON object was not found in this object or any of its children
        return null;
    } catch (e) {
        console.error("We could not find JSON Object data");
    }

    return null;
};