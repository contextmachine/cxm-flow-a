import { StateProvider } from "@/components/services/state-service/state-provider";
import { NextPage } from "next";
import Viewer from "@/components/ui/scene/viewer/viewer";
import { Box } from "@mui/material";
import SceneGrid from "@/components/ui/scene/scene-grid";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { SceneProvider } from "@/components/services/scene-service/scene-provider";

const ScenePage: NextPage = () => {
  const { authService } = useAuth();

  return (
    <SceneProvider>
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
    </SceneProvider>
  );
};

export default ScenePage;
