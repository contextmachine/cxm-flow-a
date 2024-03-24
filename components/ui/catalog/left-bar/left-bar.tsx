import { Box, Button, IconButton, Paper } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { Title } from "../../scene/bar/bar.styled";
import styled from "styled-components";
import MarkedIcon from "../../icons/marked-icon";
import UserProfile from "./blocks/user-profile";

const LeftBar = () => {
  const menuItems = ["Personal", "Favourites", "Shared", "Recent", "Trash"];
  const workspaceIcons = [
    "Context Machine Projects",
    "Test Projects",
    "Other tests",
    "Generative workspace",
    "API Examples",
  ];

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
          {workspaceIcons.map((item, i) => (
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

        <Button variant="contained" color="primary" size="large">
          + New workspace
        </Button>
      </Paper>
    </>
  );
};

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
