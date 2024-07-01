import styled from "styled-components";
import CatalogItem from "../catalog-item/catalog-item";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Popover,
  Select,
  TextField,
} from "@mui/material";
import { AvatarCss } from "../left-bar/blocks/user-profile";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import EditableTitle from "../../scene/primitives/dynamic-title/dynamic-title";
import { Title, TitleWrapper } from "../../scene/bar/bar.styled";
import { useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Content = () => {
  const { activeScenes, activeWorkspace, workspaceService } = useWorkspace();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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
          <Box
            sx={{ padding: "0 18px", display: "flex", alignItems: "center" }}
          >
            <Title size={"large"}>{activeWorkspace?.name || ""}</Title>

            <IconButton onClick={handleClick}>
              <ArrowDropDownIcon />
            </IconButton>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              sx={{
                maxWidth: "max-content !important",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "9px",
                  padding: "9px",
                  maxWidth: "max-content",
                }}
              >
                <MenuItem onClick={handleClose}>Rename</MenuItem>
                <MenuItem onClick={handleClose}>Move</MenuItem>
                <MenuItem onClick={handleClose}>Delete</MenuItem>
              </Box>
            </Popover>
            {/* <EditableTitle
              title={activeWorkspace?.name || ""}
              setTitle={workspaceService.updateTitle}
              size="large"
            /> */}
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
