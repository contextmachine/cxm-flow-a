import { StateProvider } from "@/components/services/state-service/state-provider";
import { NextPage } from "next";
import Viewer from "@/components/ui/scene/viewer/viewer";
import SceneGrid from "@/components/ui/scene/scene-grid";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { SceneProvider } from "@/components/services/scene-service/scene-provider";
import { ProductProvider } from "@/components/services/product-service/product-provider";
import { ToolsetProvider } from "@/components/services/toolset-service/toolset-provider";

const ScenePage: NextPage = () => {
  const { authService } = useAuth();

  return (
    <SceneProvider>
      <ProductProvider>
        <ToolsetProvider>
          {/* Global State Service */}
          <StateProvider>
            {/* Layout */}
            {/* UI interface of panels */}
            <SceneGrid />

            {/* Viewer 3D */}
            {/* <Viewer /> */}
          </StateProvider>
        </ToolsetProvider>
      </ProductProvider>
    </SceneProvider>
  );
};

export default ScenePage;
