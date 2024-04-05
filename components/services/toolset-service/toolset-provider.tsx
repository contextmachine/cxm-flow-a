import { createContext, useContext, useEffect, useState } from "react";
import ToolsetService from "./toolset-service";
import { useScene } from "../scene-service/scene-provider";
import { useAuth } from "../auth-service/auth-provider";
import { ToolsetDto } from "./toolset-service.types";
import { useProduct } from "../product-service/product-provider";
import { ProductsDto } from "../product-service/products.types";
import { v4 as uuidv4 } from "uuid";
import { Snackbar } from "@mui/material";

interface ToolsetProviderProps {
  toolsetService: ToolsetService;
  toolsets: ToolsetDto[];
  activeToolset: ToolsetDto | null;
  activeProducts: ProductsDto[];
  restProducts: ProductsDto[];
  needsSave: boolean;
  setNeedsSave: any;
  activePLogId: string;
}

const ToolsetContext = createContext<ToolsetProviderProps | null>(null);

export function ToolsetProvider({ children }: any) {
  const { userMetadata } = useAuth();
  const { sceneService, sceneMetadata } = useScene();
  const { outputProducts } = useProduct();

  const toolsetService = sceneService.toolsetService;

  const [toolsets, setToolsets] = useState<ToolsetDto[]>([]);
  const [activeToolset, setActiveToolset] = useState<null | ToolsetDto>(null);

  const [activeProducts, setActiveProducts] = useState<ProductsDto[]>([]);
  const [activePLogId, setActivePLogId] = useState<string>(uuidv4());

  const [restProducts, setRestProducts] = useState<ProductsDto[]>([]);

  const [needsSave, setNeedsSave] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userMetadata) return;

    toolsetService.provideStates({
      setToolsets,
      setActiveToolset,
      setRestProducts,
      setActiveProducts,
      setActivePLogId,
      setError,
    });

    toolsetService.fetchUserToolsets();
  }, [userMetadata, sceneMetadata]);

  useEffect(() => {
    toolsetService.updateActiveToolsetProducts(outputProducts);
  }, [outputProducts, activeToolset]);

  return (
    <ToolsetContext.Provider
      value={{
        toolsetService,
        toolsets,
        activeToolset,
        activeProducts,
        restProducts,
        needsSave,
        setNeedsSave,
        activePLogId,
      }}
    >
      {children}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
    </ToolsetContext.Provider>
  );
}

export function useToolset() {
  const service = useContext(ToolsetContext);

  if (service === null) {
    throw new Error("useToolset must be used within a ToolsetProvider");
  }

  return service;
}
