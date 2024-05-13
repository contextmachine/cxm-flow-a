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
  const { outputProducts, widgetProducts } = useProduct();

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
    toolsetService.fetchUserToolsets();
  }, [userMetadata, sceneMetadata]);

  useEffect(() => {
    const ts_sub = toolsetService.toolsets$.subscribe((toolsets) => {
      console.log("Subscription was init");
      setToolsets(toolsets);
    });
    const at_sub = toolsetService.activeToolset$.subscribe((toolset) => {
      setActiveToolset(toolset);
    });
    const ap_sub = toolsetService.activeProducts$.subscribe((products) =>
      setActiveProducts(products)
    );
    const rp_sub = toolsetService.restProducts$.subscribe((products) =>
      setRestProducts(products)
    );
    const aplog_sub = toolsetService.activePLogId$.subscribe((id) =>
      setActivePLogId(id)
    );
    const err_sub = toolsetService.error$.subscribe((error) => setError(error));

    return () => {
      ts_sub.unsubscribe();
      at_sub.unsubscribe();
      ap_sub.unsubscribe();
      rp_sub.unsubscribe();
      aplog_sub.unsubscribe();
      err_sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    toolsetService.updateActiveToolsetProducts(widgetProducts);
  }, [widgetProducts, activeToolset]);

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

export function useToolsetSubscriptions() {
  const { sceneService } = useScene();

  const toolsetService = sceneService.toolsetService;
  const [toolset, setToolsets] = useState<ToolsetDto[]>([]);

  useEffect(() => {
    const sub = toolsetService.toolsets$.subscribe((toolsets) => {
      console.log("toolsetSubscription was init");
      setToolsets(toolsets);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return {
    toolset,
  };
}

export function useToolset() {
  const service = useContext(ToolsetContext);

  if (service === null) {
    throw new Error("useToolset must be used within a ToolsetProvider");
  }

  return service;
}
