import { Box, Paper } from "@mui/material";
import BarTools from "./bar-tools/bar-tools";
import { CompanyAvatar, Title, TitleWrapper } from "./bar.styled";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { useScene } from "@/components/services/scene-service/scene-provider";
import EditableTitle from "../primitives/dynamic-title/dynamic-title";

const Bar = () => {
  const { authService } = useAuth();
  const { sceneMetadata, sceneService } = useScene();

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

        <EditableTitle
          title={sceneMetadata?.name}
          setTitle={sceneService.updateTitle}
        />
      </Box>

      <BarTools />
    </Paper>
  );
};

export default Bar;
