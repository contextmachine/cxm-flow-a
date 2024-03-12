import styled from "styled-components";
import CursorIcon from "../../icons/cursor-icon";
import BrushIcon from "../../icons/brush-icon";
import MeasureIcon from "../../icons/measure-icon";
import { Paper } from "@mui/material";

const ToolsPanel = () => {
  return (
    <Paper>
      <CursorIcon />

      <BrushIcon />

      <MeasureIcon />
    </Paper>
  );
};

export default ToolsPanel;
