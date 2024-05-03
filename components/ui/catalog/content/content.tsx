import styled from "styled-components";
import CatalogItem from "../catalog-item/catalog-item";
import { Box, Button, InputBase, Paper, TextField } from "@mui/material";
import { AvatarCss } from "../left-bar/blocks/user-profile";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import EditableTitle from "../../scene/primitives/dynamic-title/dynamic-title";

const Content = () => {
  const { activeScenes, activeWorkspace, workspaceService } = useWorkspace();

  return (
    <Wrapper>
      <Paper sx={{ opacity: 0, pointerEvents: "none" }}>
        <Box sx={{ display: "flex", gap: "9px", alignItems: "center" }}>
          <AvatarCss style={{ cursor: "pointer" }} />
        </Box>
      </Paper>

      <Box
        sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}
      >
        <Paper
          sx={{
            alignItems: "center",
            height: "45px",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ padding: "0 18px" }}>
            <EditableTitle
              title={activeWorkspace?.name || ""}
              setTitle={workspaceService.updateTitle}
              size="large"
            />
          </Box>

          <TextField
            sx={{ minWidth: "250px", width: "100%", maxWidth: "250px" }}
            placeholder="Search..."
            onChange={(e) => true}
          />
        </Paper>
      </Box>

      <CatalogWrapper>
        {activeScenes.map((scene, i) => {
          return (
            <CatalogItem
              {...scene}
              {...{ user_workspaces: activeWorkspace!.user_workspaces }}
              key={i}
            />
          );
        })}
      </CatalogWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 18px;
`;

const CatalogWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 27px;
`;

export default Content;
