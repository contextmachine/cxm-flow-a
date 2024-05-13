import { Box, MenuItem, Paper, Select } from "@mui/material";
import { useStates } from "@/components/services/state-service/state-provider";
import { Title } from "../bar/bar.styled";
import React from "react";

import dynamic from "next/dynamic";
import Properties from "./blocks/properties/properties";
import Widget from "./widgets/widget";
import OutlinerWidget from "./widgets/outliner-widget";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import { useScene } from "@/components/services/scene-service/scene-provider";

const InUseGrid = dynamic(() => import("./blocks/in-use-grid/in-use-grid"), {
  ssr: false,
});
const EditGrid = dynamic(() => import("./blocks/edit-grid/edit-grid"), {
  ssr: false,
});

const WidgetPanelGrid = () => {
  const { toolsetService } = useToolset();
  const { isEditWidgetsOpen, stateService } = useStates();
  const { isWidgetsOpen } = useStates();
  const { sectionType } = useStates();

  const { activeToolset, activePLogId } = useToolset();

  return (
    <>
      {isEditWidgetsOpen && (
        <Box
          sx={{
            position: "fixed",
            background: "rgba(205, 205, 205, .3)",
            backdropFilter: "blur(4px)",
            pointerEvents: "all !important",
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            left: "-0px",
            top: "-0px",
          }}
          onClick={() => {
            toolsetService.saveToolsetProducts();

            stateService.toogleEditWidgets(false);
          }}
        ></Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: "48px",
          justifyContent: isWidgetsOpen ? "space-between" : "flex-end",
          zIndex: 20,
        }}
      >
        {isWidgetsOpen && (
          <>
            {/* Stable Panel */}
            <Box
              data-type="widgets-panel"
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: "9px",
                overflowY: "scroll",
                overflowX: "hidden",
                borderRadius: "18px",
                border: isEditWidgetsOpen
                  ? "1px dashed #000"
                  : "1px solid transparent",
              }}
            >
              <Widget type="bar-widget" />
              <Widget type="toolset-widget" />

              {sectionType === "widgets" && <InUseGrid key={activePLogId} />}

              {sectionType === "outliner" && (
                <OutlinerWidget key={activePLogId} />
              )}
            </Box>

            {/* Edit Panel */}
            {isEditWidgetsOpen && <EditGrid key={activePLogId} />}
          </>
        )}
        <Properties />
      </Box>
    </>
  );
};

export default WidgetPanelGrid;
