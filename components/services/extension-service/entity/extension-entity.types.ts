import SceneService from "../../scene-service/scene-service";

export interface ExtensionEntityInterface {
  name: string;

  load(): void;
  unload(): void;

  sceneService: SceneService | null;

  [key: string]: any;
}
