import client from "@/components/graphql/client/client";
import SceneService from "@/components/services/scene-service/scene-service";
import Viewer from "@/src/viewer/viewer";
import { gql } from "@apollo/client";

class PointCloudExtensionDB {
  private _sceneService: SceneService;

  constructor(private _viewer: Viewer) {
    this._sceneService = _viewer.sceneService;
  }

  public async getPointCloudPrimitive(): Promise<any> {
    const query = gql`
      query GetPointCloudPrimitives($scene_id: Int!) {
        extensionsv3_pointcloud_primitives(
          where: { scene_id: { _eq: $scene_id } }
        ) {
          active
          configs
          id
          name
          position
          scene_id
          shape
        }
      }
    `;

    try {
      const response = await client.query({
        query,
        variables: {
          scene_id: this._sceneService.sceneId,
        },
      });

      return response.data.extensionsv3_pointcloud_primitives;
    } catch (error) {
      console.error(error);
    }
  }
}

export default PointCloudExtensionDB;
