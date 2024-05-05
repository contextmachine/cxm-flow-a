import { Box, Button, IconButton, Paper } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { Title } from "../../scene/bar/bar.styled";
import styled from "styled-components";
import MarkedIcon from "../../icons/marked-icon";
import UserProfile from "./blocks/user-profile";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import stc from "string-to-color";

import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import WorkspacesList from "./blocks/workspaces-list/workspaces-list";

const LeftBar = () => {
  const menuItems = ["Personal", "Favourites", "Shared", "Trash"];

  const { workspaces, activeWorkspace, workspaceService } = useWorkspace();

  return (
    <>
      <UserProfile />

      <Paper
        title="Workspaces"
        sx={{ flexDirection: "column", gap: "3px !important" }}
      >
        <MenuWrapper>
          {menuItems.map((item, i) => (
            <Box sx={{ width: "100%" }} key={i}>
              <Button
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
                startIcon={<MailIcon />}
              >
                {item}
              </Button>
            </Box>
          ))}
        </MenuWrapper>
      </Paper>

      <Paper
        title="Workspaces"
        sx={{ flexDirection: "column", maxHeight: "100%" }}
      >
        <WidgetHeader>
          <IconButton>
            <MarkedIcon />
          </IconButton>

          <Title style={{ fontWeight: "500" }}>Workspaces</Title>
        </WidgetHeader>

        <WorkspacesList />

        <Button
          onClick={workspaceService.addWorkspace}
          variant="contained"
          color="primary"
          size="large"
        >
          + New workspace
        </Button>
      </Paper>
    </>
  );
};

export const IconBullet = styled.div<{
  color: string;
}>`
  width: 6px;
  height: 6px;
  min-width: 6px;
  min-height: 6px;
  max-width: 6px;
  max-height: 6px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

export const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 3px;

  &&&&& {
    &,
    & * {
      font-size: 12px;
      color: #ffffff;
    }
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

export default LeftBar;
