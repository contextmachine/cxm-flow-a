import GqlObject from "@/src/viewer/loader/objects/gql-object";
import RestObject from "@/src/viewer/loader/objects/rest-object";
import { SceneJSON } from "@/src/viewer/loader/objects/user-data.types";
import axios from "axios";

export class EndPointControls {
  constructor() { }

  async fetchThreeData(
    apiObject: GqlObject | RestObject
  ): Promise<SceneJSON | undefined> {
    try {
      let sceneJson: SceneJSON | undefined;

      if (apiObject instanceof GqlObject) {
        // GraphQl запрос
        const endpoint: string = apiObject.endpoint;
        const query: string = apiObject.query;
        const header: Record<string, any> = apiObject.header;

        const response = await axios.post(
          endpoint,
          {
            query: query,
          },
          {
            headers: header,
          }
        );

        sceneJson = findThreeJSJSON(response.data);
      } else if (apiObject instanceof RestObject) {
        // Rest запрос
        const endpoint = apiObject.endpoint;

        const response = await axios.get(endpoint);

        sceneJson = findThreeJSJSON(response.data);
      } else {
        throw new Error("Unknown apiObject type");
      }

      // console.log("sceneJson", sceneJson);

      if (sceneJson) return sceneJson;
    } catch (error: any) {
      throw new Error(error && error.message ? error.message : "Unknown error");
    }
  }

  async processGql(
    apiObject: GqlObject | RestObject
  ): Promise<GqlObject | RestObject> {
    try {
      // Получение данных сцены Three.js на основе gqlEntry.endpoint и gqlEntry.query
      const sceneJSON = await this.fetchThreeData(apiObject);

      if (!sceneJSON) {
        throw new Error("Error fetching data");
      }

      // Добавить json сцену в объект gqlObject
      apiObject.sceneJSON = sceneJSON;

      apiObject.status = "loading";
    } catch (error: any) {
      apiObject.status = "error";

      // Обнуляем json сцены
      apiObject.sceneJSON = undefined;
    }

    return apiObject;
  }
}

const findThreeJSJSON = (data: any): any | null => {
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
