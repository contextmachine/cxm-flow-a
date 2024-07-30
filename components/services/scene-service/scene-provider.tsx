import { createContext, useContext, useEffect, useRef, useState } from "react";
import SceneService from "./scene-service";
import { useAuth } from "../auth-service/auth-provider";
import { useRouter } from "next/router";
import { useWorkspace } from "../workspace-service/workspace-provider";
import styled from "styled-components";
import { Box } from "@mui/material";

interface SceneProviderProps {
  sceneService: SceneService;
  sceneMetadata: any;
}

const SceneContext = createContext<SceneProviderProps | null>(null);

const CanvasWrapper = styled.div`
  canvas:focus {
    border: 0px;
    border-top: 1px solid rgb(0, 153, 255);
  }

  canvas {
    border: 0px;
    border-top: 1px solid transparent;
  }

  width: 100%;
  height: 100vh;
  position: relative;
`;

export function SceneProvider({ children }: any) {
  const { authService } = useAuth();
  const { workspaceService } = useWorkspace();
  const [sceneService] = useState(() => new SceneService(authService));

  const [sceneMetadata, setSceneMetadata] = useState<any>(null);

  const router = useRouter();
  const { query } = router;
  const { scene_id } = query;
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvas !== null) {
      sceneService.initViewer(canvas.current as HTMLDivElement);
    }
  }, [canvas]);

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
    <div>
      <SceneContext.Provider
        value={{
          sceneService,
          sceneMetadata,
        }}
      >
        <Box sx={{ width: "100vw", height: "100vh" }}>
          <CanvasWrapper ref={canvas} id="three-canvas">
            {children}
          </CanvasWrapper>
        </Box>
      </SceneContext.Provider>
    </div>
  );
}

export function useScene() {
  const service = useContext(SceneContext);

  if (service === null) {
    throw new Error("useScene must be used within a StatesProvider");
  }

  return service;
}

export function useViewer() {
  const { sceneService } = useScene();
  const viewer = sceneService.viewer;

  if (viewer) {
    return viewer;
  } else {
    throw new Error("useViewer must be used within a SceneContext");
  }
}

export function useViewerSoft() {
  const { sceneService } = useScene();
  const viewer = sceneService.viewer;

  return viewer;
}
