import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import { ToolsetDto } from "@/components/services/toolset-service/toolset-service.types";
import { IconBullet } from "@/components/ui/catalog/left-bar/left-bar";
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
import { useState } from "react";
import stc from "string-to-color";
import styled from "styled-components";

const ToolsetItem: React.FC<{
  active: boolean;
  toolset: ToolsetDto;
  onClick: (id: ToolsetDto) => void;
}> = ({ toolset, active, onClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const { toolsetService } = useToolset();

  const handleClick = (event: any) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = (event: any) => {
    event.stopPropagation();

    setNewCollectionName(toolset.name);
    setRenameDialogOpen(true);

    handleClose();
  };

  const handleRenameSave = () => {
    toolsetService.renameToolset(toolset.id, newCollectionName);
    setRenameDialogOpen(false);
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
  };

  const handleDelete = () => {
    toolsetService.deleteToolset(toolset.id);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? `actions-w-${toolset.id}` : undefined;

  return (
    <>
      <Btn
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          pointerEvents: "all",
        }}
        data-active={active ? "true" : "false"}
        color="secondary"
        variant="contained"
        size="large"
        onClick={() => onClick(toolset)}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Box
            sx={{
              minWidth: "27px",
              minHeight: "27px",
              borderRadius: "9px",
              backgroundColor: "#2689FF",
            }}
          />

          <Box>{toolset.name}</Box>
        </Box>

        <Box data-type="actions">
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
      </Btn>

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
        <Box sx={{ marginLeft: "10px", marginTop: "10px" }}>Rename Toolset</Box>
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

const Btn = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  pointer-events: all;

  & > div[data-type="actions"] {
    opacity: 0;
    pointer-events: none;

    &,
    & * {
      color: white !important;
    }
  }

  &:hover > div[data-type="actions"] {
    opacity: 1;
    pointer-events: all;
  }
`;

export default ToolsetItem;
