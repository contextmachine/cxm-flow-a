import { ProductsDto } from "@/components/services/product-service/products.types";
import { Box, Checkbox } from "@mui/material";

interface ProductItemProps {
  data: ProductsDto;
  isActive?: boolean;
  onChange?: (isActive: boolean, id: number) => void; // Add onChange prop
  editDisabled?: boolean;
}

const ProductItem: React.FC<ProductItemProps> = ({
  data,
  isActive,
  onChange,
  editDisabled,
}) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.checked, data.id);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: isActive ? "white" : "#EEEEEE",
        display: "flex",
        padding: "10px",
        minHeight: "100px",
        flexDirection: "column",
        borderRadius: "18px",
        border: isActive ? "1px solid #2689FF" : "1px solid #EEEEEE",
      }}
    >
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        {!editDisabled && (
          <Checkbox
            size={"small"}
            checked={isActive}
            onChange={handleCheckboxChange}
          />
        )}
        {/* Add onChange event */}
      </Box>

      <Box>{data?.name}</Box>
    </Box>
  );
};

export default ProductItem;
