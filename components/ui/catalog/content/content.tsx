import styled from "styled-components";
import CatalogItem from "../catalog-item/catalog-item";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Menu,
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
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const Content = () => {
  const { activeScenes, activeWorkspace, workspaceService, collections } =
    useWorkspace();
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMoveAnchorEl(null);
  };

  const handleMoveClick = (event: any) => {
    setMoveAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const moveOpen = Boolean(moveAnchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleDelete = () => {
    workspaceService.deleteWorkspace(activeWorkspace!.id);
    handleClose();
  };

  const handleMove = (collectionId: number) => {
    workspaceService.moveWorkspaceToCollection(
      activeWorkspace!.id,
      collectionId
    );
    handleClose();
  };

  const handleRenameClick = () => {
    setNewWorkspaceName(activeWorkspace?.name || "");
    setRenameDialogOpen(true);
    handleClose();
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
  };

  const handleRenameSave = () => {
    workspaceService.renameWorkspace(activeWorkspace!.id!, newWorkspaceName);
    setRenameDialogOpen(false);
  };

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
                  gap: "0px",
                  maxWidth: "max-content",
                }}
              >
                <Button
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                  variant="contained"
                  data-active={false}
                  color="secondary"
                  size="large"
                  onClick={handleRenameClick}
                >
                  Rename
                </Button>
                <Button
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                  variant="contained"
                  data-active={false}
                  color="secondary"
                  size="large"
                  onClick={handleMoveClick}
                  endIcon={<ArrowRightIcon />}
                >
                  Move
                </Button>
                <Button
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                  variant="contained"
                  data-active={false}
                  color="secondary"
                  size="large"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Box>
            </Popover>

            <Menu
              anchorEl={moveAnchorEl}
              open={moveOpen}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {collections.map((collection) => (
                <MenuItem
                  key={collection.id}
                  onClick={() => handleMove(collection.id)}
                >
                  {collection.name}
                </MenuItem>
              ))}
            </Menu>
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

      <Dialog open={renameDialogOpen} onClose={handleRenameClose}>
        <Box sx={{ marginLeft: "10px", marginTop: "10px" }}>
          Rename Workspace
        </Box>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleRenameSave();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button onClick={handleRenameSave}>Save</Button>
        </DialogActions>
      </Dialog>
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
