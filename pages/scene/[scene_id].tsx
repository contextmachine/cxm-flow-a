import { StateProvider } from "@/components/services/state-service/state-provider";
import { NextPage } from "next";
import SceneGrid from "@/components/ui/scene/scene-grid";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { SceneProvider } from "@/components/services/scene-service/scene-provider";
import { ProductProvider } from "@/components/services/product-service/product-provider";
import { ToolsetProvider } from "@/components/services/toolset-service/toolset-provider";
import { Loading } from "@/components/services/loading";
import Message from "@/components/ui/scene/message/message";

const ScenePage: NextPage = () => {
  const { authService } = useAuth();

  return (
    <SceneProvider>
      <ProductProvider>
        <ToolsetProvider>
          {/* Global State Service */}
          <StateProvider>
            <Loading />

            {/* Layout */}
            {/* UI interface of panels */}
            <SceneGrid />
            <Message />
          </StateProvider>
        </ToolsetProvider>
      </ProductProvider>
    </SceneProvider>
  );
};

export default ScenePage;
