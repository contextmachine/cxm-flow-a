import styled from "styled-components";
import CursorIcon from "../../icons/cursor-icon";
import BrushIcon from "../../icons/brush-icon";
import MeasureIcon from "../../icons/measure-icon";
import { IconButton, Paper } from "@mui/material";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  useViewer,
  useViewerSoft,
} from "@/components/services/scene-service/scene-provider";
import { useSelected } from "@/src/hooks";

const ToolsPanel = () => {
  const viewer = useViewerSoft();
  const zoomToFit = () => {
    if (viewer) {
      viewer.controls.fitObjects();
    }
  };

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
      <IconButton onClick={(e) => zoomToFit()} size="small">
        <LocationSearchingIcon sx={{ width: "27px", fontSize: "18px" }} />
      </IconButton>
    </Paper>
  );
};

export default ToolsPanel;
