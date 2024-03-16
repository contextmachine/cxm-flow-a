import { Box, Button, IconButton, Paper } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { CompanyAvatar, Title, TitleWrapper } from "../../scene/bar/bar.styled";
import { WidgetHandleIcon } from "../../icons/handle-icon";
import styled from "styled-components";
import MarkedIcon from "../../icons/marked-icon";

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
      <Paper sx={{ backgroundColor: "transparent" }}>
        <Box sx={{ display: "flex", gap: "9px", alignItems: "center" }}>
          <AvatarCss style={{ cursor: "pointer" }} />

          <TitleWrapper>
            <Title size="large">Cucumber Pomidorov</Title>
          </TitleWrapper>
        </Box>
      </Paper>

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

export const AvatarCss = styled.div`
  min-width: 36px;
  width: 36px;
  height: 100%;
  position: relative;
  border-radius: 13.5px;
  background-color: #333333;
  height: 36px;
`;

export default LeftBar;
