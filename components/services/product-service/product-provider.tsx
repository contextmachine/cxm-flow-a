import { createContext, useContext, useEffect, useState } from "react";
import ProductService from "./product-service";
import { useScene } from "../scene-service/scene-provider";
import { ProductsDto, RoleProductDto } from "./products.types";

interface ProductProviderProps {
  productService: ProductService;
  products: ProductsDto[];
  workspaceProducts: ProductsDto[];
  roleProducts: RoleProductDto[];
}

const ProductContext = createContext<ProductProviderProps | null>(null);

export function ProductProvider({ children }: any) {
  const { sceneService } = useScene();

  const [productService] = useState(() => sceneService.productService);

  const [products, setProducts] = useState<ProductsDto[]>([]);
  const [workspaceProducts, setWorkspaceProducts] = useState<ProductsDto[]>([]);
  const [roleProducts, setRoleProducts] = useState<RoleProductDto[]>([]);

  useEffect(() => {
    productService.provideStates({
      setProducts,
      setWorkspaceProducts,
      setRoleProducts,
    });
  }, []);

  return (
    <ProductContext.Provider
      value={{
        productService,
        products,
        workspaceProducts,
        roleProducts,
      }}
    >
      {children}
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
