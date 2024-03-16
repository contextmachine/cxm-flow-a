import styled from "styled-components";
import CursorIcon from "../../icons/cursor-icon";
import BrushIcon from "../../icons/brush-icon";
import MeasureIcon from "../../icons/measure-icon";
import { IconButton, Paper } from "@mui/material";

const ToolsPanel = () => {
  return (
    <Paper sx={{ pointerEvents: "all" }}>
      <IconButton>
        <CursorIcon />
      </IconButton>

      <IconButton>
        <BrushIcon />
      </IconButton>

      <IconButton>
        <MeasureIcon />
      </IconButton>
    </Paper>
  );
};

export default ToolsPanel;
