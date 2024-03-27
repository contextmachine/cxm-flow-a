import { Box, Button, IconButton, Paper } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { Title } from "../../scene/bar/bar.styled";
import styled from "styled-components";
import MarkedIcon from "../../icons/marked-icon";
import UserProfile from "./blocks/user-profile";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import stc from "string-to-color";

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

      <Paper title="Workspaces" sx={{ flexDirection: "column" }}>
        <WidgetHeader>
          <IconButton>
            <MarkedIcon />
          </IconButton>

          <Title style={{ fontWeight: "500" }}>Workspaces</Title>
        </WidgetHeader>

        <MenuWrapper>
          {workspaces.map((item, i) => (
            <Box sx={{ width: "100%" }} key={i}>
              <Button
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
                variant="contained"
                color="secondary"
                size="large"
                data-active={item.id === activeWorkspace?.id}
                onClick={() => workspaceService.setActiveWorkspace(item.id)}
                startIcon={<IconBullet color={stc(`${item.id}`)} />}
              >
                {item?.name}
              </Button>
            </Box>
          ))}
        </MenuWrapper>

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

const IconBullet = styled.div<{
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

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 3px;

  &&&&& {
    &,
    & * {
      font-size: 12px;
      color: #333333;
    }
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

export default LeftBar;
