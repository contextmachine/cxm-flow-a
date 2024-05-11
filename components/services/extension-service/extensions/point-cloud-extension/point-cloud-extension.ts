import ExtensionEntity from "../../entity/extension-entity";
import { ExtensionEntityInterface } from "../../entity/extension-entity.types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import data from "./data/data.json";

class PointCloudExtension
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: string;
  public name: string;

  constructor() {
    super();

    this.id = uuidv4();
    this.name = "PointCloudExtension";
  }

  public async load() {
    try {
      const response = await axios.post(
        "https://sbm.dev.contextmachine.cloud/sbm_lamp/stats",
        data
      );
      console.log("Post request successful:", response.data);
    } catch (error) {
      console.error("Error making post request:", error);
    }

    console.log("PointCloudExtension loaded");
  }

  public unload() {
    console.log("PointCloudExtension unloaded");
  }
}

export default PointCloudExtension;
