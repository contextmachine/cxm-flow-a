import { Box, Button, Paper } from "@mui/material";
import { CompanyAvatar, Title, TitleWrapper } from "../bar/bar.styled";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import stc from "string-to-color";
import ProductsSetupPanel from "../products-setup-panel/products-setup-panel";

const BarUser = () => {
  const { authService, userMetadata } = useAuth();

  return (
    <Paper sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Box
        sx={{
          display: "flex",
          columnGap: "9px",
          height: "100%",
          alignItems: "center",
        }}
      >
        <CompanyAvatar color={stc(userMetadata?.username)} />

        <TitleWrapper>
          <Title>{userMetadata?.username}</Title>
        </TitleWrapper>
      </Box>

      <Box sx={{ display: "flex", gap: "9px" }}>
        <ProductsSetupPanel />

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            return;
          }}
        >
          Share
        </Button>
      </Box>
    </Paper>
  );
};

export default BarUser;
