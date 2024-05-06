import SceneService from "../../scene-service/scene-service";

export interface ExtensionEntityInterface {
  id: string;
  name: string;

  load(): void;
  unload(): void;

  sceneService: SceneService | null;

  [key: string]: any;
}
