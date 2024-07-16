import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Popover,
  TextField,
} from "@mui/material";
import { IconBullet } from "../../left-bar";
import stc from "string-to-color";
import {
  CollectionDto,
  MinifiedWorkspaceDto,
} from "@/components/services/workspace-service/workspace-service.types";
import WorkspaceService from "@/components/services/workspace-service/workspace-service";
import { useState } from "react";
import styled from "styled-components";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const WorkspaceItem: React.FC<{
  item: MinifiedWorkspaceDto;
  activeWorkspace: MinifiedWorkspaceDto | null;
  workspaceService: WorkspaceService;
  collections: CollectionDto[];
  parentCollection?: CollectionDto;
}> = ({
  item,
  activeWorkspace,
  workspaceService,
  collections,
  parentCollection,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMoveAnchorEl(null);
  };

  const handleMoveClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    setMoveAnchorEl(event.currentTarget);
  };

  const handleMove = (collectionId: number) => {
    workspaceService.moveWorkspaceToCollection(item!.id, collectionId);
    handleClose();
  };

  const handleDelete = () => {
    const isTrash = parentCollection?.tmp_type === "Trash";

    if (isTrash) {
      setConfirmDialogOpen(true);
    } else {
      workspaceService.moveWorkspaceToTrash(item.id);
      handleClose();
    }
  };

  const handleConfirmDelete = async () => {
    await workspaceService.deleteWorkspace(item.id);
    setConfirmDialogOpen(false);
    handleClose();
  };

  const handleRenameClick = () => {
    setNewWorkspaceName(item.name);
    setRenameDialogOpen(true);
    handleClose();
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
  };

  const handleRenameSave = () => {
    workspaceService.renameWorkspace(item.id, newWorkspaceName);
    setRenameDialogOpen(false);
  };

  const open = Boolean(anchorEl);
  const moveOpen = Boolean(moveAnchorEl);
  const id = open ? `actions-ws-${item.id}` : undefined;

  return (
    <>
      <Button
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          textTransform: "none",
          paddingRight: "0px !important",
        }}
        variant="contained"
        color="secondary"
        size="large"
        data-active={item.id === activeWorkspace?.id}
        onClick={() => workspaceService.setActiveWorkspace(item.id)}
        startIcon={<IconBullet color={stc(`${item.id}`)} />}
      >
        <BoxWrapper>
          <Box>{item?.name}</Box>

          <Box
            sx={{
              display: "flex",
              gap: "4px",
            }}
            data-type="actions"
          >
            <Button
              onClick={handleClick}
              variant="contained"
              color="primary"
              size="small"
              sx={{
                minWidth: "24px",
                minHeight: "24px",
                borderRadius: "50%",
                padding: "0",
                fontSize: "12px",
                color: "white !important",
              }}
            >
              ...
            </Button>
          </Box>
        </BoxWrapper>
      </Button>

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

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this workspace? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BoxWrapper = styled(Box)`
  & [data-type="actions"] {
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    & [data-type="actions"] {
      display: flex;
      opacity: 1;
      pointer-events: all;
    }
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
`;

export default WorkspaceItem;
