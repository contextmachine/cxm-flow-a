import { createContext, useContext, useEffect, useState } from "react";
import SceneService from "./scene-service";
import { useAuth } from "../auth-service/auth-provider";
import { useRouter } from "next/router";
import { useWorkspace } from "../workspace-service/workspace-provider";

interface SceneProviderProps {
  sceneService: SceneService;
  sceneMetadata: any;
}

const SceneContext = createContext<SceneProviderProps | null>(null);

export function SceneProvider({ children }: any) {
  const { authService } = useAuth();
  const { workspaceService } = useWorkspace();
  const [sceneService] = useState(() => new SceneService(authService));

  const [sceneMetadata, setSceneMetadata] = useState<any>(null);

  const router = useRouter();
  const { query } = router;
  const { scene_id } = query;

  useEffect(() => {
    if (typeof scene_id !== "string") return;

    sceneService.setScene(scene_id);
    sceneService.provideStates({
      setSceneMetadata,
    });

    return () => {
      sceneService.dispose();
    };
  }, [scene_id]);

  return (
    <SceneContext.Provider
      value={{
        sceneService,
        sceneMetadata,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const service = useContext(SceneContext);

  if (service === null) {
    throw new Error("useScene must be used within a StatesProvider");
  }

  return service;
}
