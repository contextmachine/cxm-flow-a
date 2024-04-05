import { createContext, useContext, useEffect, useState } from "react";
import ProductService from "./product-service";
import { useScene } from "../scene-service/scene-provider";
import { ProductsDto, RoleProductDto } from "./products.types";
import { useWorkspace } from "../workspace-service/workspace-provider";
import { useAuth } from "../auth-service/auth-provider";
import { Snackbar } from "@mui/material";

interface ProductProviderProps {
  productService: ProductService;
  products: ProductsDto[];
  workspaceProducts: ProductsDto[];
  roleProducts: RoleProductDto[];
  outputProducts: ProductsDto[];
}

const ProductContext = createContext<ProductProviderProps | null>(null);

export function ProductProvider({ children }: any) {
  const { sceneService } = useScene();
  const { isDataFetched } = useWorkspace();
  const { userMetadata } = useAuth();
  const { sceneMetadata } = useScene();

  const [productService] = useState(() => sceneService.productService);

  const [products, setProducts] = useState<ProductsDto[]>([]);
  const [workspaceProducts, setWorkspaceProducts] = useState<ProductsDto[]>([]);
  const [roleProducts, setRoleProducts] = useState<RoleProductDto[]>([]);
  const [outputProducts, setOutputProducts] = useState<ProductsDto[]>([]);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    productService.provideStates({
      setProducts,
      setWorkspaceProducts,
      setRoleProducts,
      setOutputProducts,
      setError,
    });
  }, []);

  useEffect(() => {
    if (
      !isDataFetched ||
      !products ||
      !workspaceProducts ||
      !sceneMetadata ||
      !userMetadata ||
      !roleProducts
    )
      return;

    productService.updateOutputProducts();
  }, [
    isDataFetched,
    products,
    workspaceProducts,
    sceneMetadata,
    userMetadata,
    roleProducts,
  ]);

  return (
    <ProductContext.Provider
      value={{
        productService,
        products,
        workspaceProducts,
        roleProducts,
        outputProducts,
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
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const service = useContext(ProductContext);

  if (service === null) {
    throw new Error("useProduct must be used within a ProductProvider");
  }

  return service;
}
