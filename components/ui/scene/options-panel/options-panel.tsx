import { useScene } from "@/components/services/scene-service/scene-provider";
import { DetailedViewState } from "@/src/viewer/camera-control.types";
import { useViewer } from "@/src/viewer/viewer-component";
import { Box, Button } from "@mui/material";
import { useState } from "react";

const OptionsPanel = () => {
  const { sceneService } = useScene();

  const [cameraViews, setCameraViews] = useState<DetailedViewState[]>([]);

  /* const viewer = useViewer();
  const cameraControls = viewer.controls; */

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        pointerEvents: "all",
      }}
    >
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: "40px" }}
      >
        {cameraViews.map((view, index) => {
          return (
            <Box
              key={index}
              sx={{
                width: "40px",
                height: "40px",
                backgroundColor: "red",
                borderRadius: "50%",
                border: "1px solid black",
              }}
              onClick={() => {
                if (!sceneService.viewer) return;

                const viewer = sceneService.viewer;
                const cameraControls = viewer.controls;

                cameraControls.restoreState(view, false);
              }}
            ></Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex" }}>
        {Array(6)
          .fill(0)
          .map((_, index) => {
            return (
              <Box
                key={index}
                sx={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  border: "1px solid black",
                }}
              ></Box>
            );
          })}
      </Box>

      <Button
        onClick={() => {
          if (!sceneService.viewer) return;

          const viewer = sceneService.viewer;
          const cameraControls = viewer.controls;
          const viewState = cameraControls.getState();

          const detailedViewState: DetailedViewState = {
            ...viewState,
            id: `${cameraViews.length + 1}`,
            name: `View ${cameraViews.length + 1}`,
          };

          setCameraViews([...cameraViews, detailedViewState]);
        }}
      >
        Add state
      </Button>
    </Box>
  );
};

const cameraViews: DetailedViewState[] = [];

export default OptionsPanel;
