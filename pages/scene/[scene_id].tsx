import { StateProvider } from "@/components/services/state-service/state-provider";
import { NextPage } from "next";
import Viewer from "@/components/ui/scene/viewer/viewer";
import { Box } from "@mui/material";
import SceneGrid from "@/components/ui/scene/scene-grid";

const ScenePage: NextPage = () => {
  return (
    <>
      {/* Global State Service */}
      <StateProvider>
        {/* Layout */}
        <Box sx={{ width: "100vw", height: "100vh" }}>
          {/* UI interface of panels */}
          <SceneGrid />

          {/* Viewer 3D */}
          <Viewer />
        </Box>
      </StateProvider>
    </>
  );
};

export default ScenePage;
