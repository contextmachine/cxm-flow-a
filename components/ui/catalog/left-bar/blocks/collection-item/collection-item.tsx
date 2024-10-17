import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { IconBullet } from "../../left-bar";
import React, { useState } from "react";
import stc from "string-to-color";
import WorkspaceService from "@/components/services/workspace-service/workspace-service";
import { CollectionDto } from "@/components/services/workspace-service/workspace-service.types";
import styled from "styled-components";

const CollectionItem: React.FC<{
  collection: CollectionDto;
  workspaceService: WorkspaceService;
}> = ({ collection, workspaceService }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    workspaceService.deleteCollection(collection.id);
    handleClose();
  };

  const handleRenameClick = () => {
    setNewCollectionName(collection.name);
    setRenameDialogOpen(true);
    handleClose();
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
  };

  const handleRenameSave = () => {
    workspaceService.renameCollection(collection.id, newCollectionName);
    setRenameDialogOpen(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? `actions-w-${collection.id}` : undefined;

  const isTrash = collection.tmp_type === "Trash";

  return (
    <>
      <BoxWrapper
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <IconBullet color={stc(collection.name)} />
          <Typography>{collection.name}</Typography>
        </Box>

        {!isTrash && (
          <Box
            sx={{
              display: "flex",
              gap: "4px",
            }}
            data-type="actions"
          >
            <Button
              onClick={() => workspaceService.addWorkspace(collection.id)}
              variant="contained"
              color="primary"
              size="small"
              sx={{
                minWidth: "24px",
                minHeight: "24px",
                borderRadius: "50%",
                padding: "0",
                fontSize: "12px",
              }}
            >
              +
            </Button>

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
              }}
            >
              ...
            </Button>
          </Box>
        )}
      </BoxWrapper>

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
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Popover>

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
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
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
    </>
  );
};

const BoxWrapper = styled(Box)`
  & [data-type="actions"] {
    display: none;
  }

  &:hover {
    & [data-type="actions"] {
      display: flex;
    }
  }
`;

export default CollectionItem;
