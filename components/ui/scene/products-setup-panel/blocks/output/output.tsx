import { useProduct } from "@/components/services/product-service/product-provider";
import { Box, Button, ButtonGroup } from "@mui/material";
import ProductItem from "../product-item/product-item";
import { useEffect, useState } from "react";

const Output = () => {
  const { roleProducts, products, workspaceProducts, productService } =
    useProduct();

  const [activeRole, setActiveRole] = useState<null | number>(null);
  useEffect(() => {
    setActiveRole((activeRole) => {
      if (!activeRole) return roleProducts[0].id;
      return activeRole;
    });
  }, [roleProducts]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <ButtonGroup>
        {roleProducts.map((role) => {
          return (
            <Button
              data-active={role.id === activeRole}
              color="secondary"
              variant="contained"
              size="medium"
              key={role.id}
              onClick={() => setActiveRole(role.id)}
            >
              {role.name}
            </Button>
          );
        })}
      </ButtonGroup>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "10px",
          minHeight: "max-content",
        }}
      >
        {products.map((product) => {
          const role = roleProducts.find((role) => role.id === activeRole);
          if (!role) return null;

          const roleProductsIds = role.product_roles.map((pr) => pr.product_id);

          const isActive = roleProductsIds.includes(product.id);
          const isWorkspaceProduct = workspaceProducts.some(
            (p) => p.id === product.id
          );

          return (
            <ProductItem
              editDisabled
              onChange={(isActive, productId: number) =>
                productService.updateRoleProductLink(
                  role.id,
                  productId,
                  isActive
                )
              }
              isActive={isActive && isWorkspaceProduct}
              key={product.id}
              data={product}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default Output;
