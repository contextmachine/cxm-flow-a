import { Box, Paper } from "@mui/material";
import BarTools from "./bar-tools/bar-tools";
import { CompanyAvatar, Title, TitleWrapper } from "./bar.styled";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { useScene } from "@/components/services/scene-service/scene-provider";

const Bar = () => {
  const { authService } = useAuth();
  const { sceneMetadata } = useScene();

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
        <CompanyAvatar
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = "/";
          }}
        />

        <TitleWrapper>
          <Title size="large">{sceneMetadata?.name}</Title>
        </TitleWrapper>
      </Box>

      <BarTools />
    </Paper>
  );
};

export default Bar;
