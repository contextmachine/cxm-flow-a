import { useProduct } from "@/components/services/product-service/product-provider";
import { Box } from "@mui/material";
import ProductItem from "../product-item/product-item";

const AllProducts: React.FC<{
  workspace?: boolean;
}> = ({ workspace }) => {
  const { products, workspaceProducts, productService } = useProduct();

  const onActiveChange = (isActive: boolean, id: number) => {
    productService.updateWorkspaceProductLink(id, isActive);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "10px",
        minHeight: "max-content",
      }}
    >
      {products.map((product) => {
        const isActive = !workspace
          ? true
          : workspaceProducts.some((p) => p.id === product.id);

        return (
          <ProductItem
            onChange={onActiveChange}
            isActive={isActive}
            key={product.id}
            data={product}
          />
        );
      })}
    </Box>
  );
};

export default AllProducts;
