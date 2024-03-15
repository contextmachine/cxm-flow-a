import { Box, MenuItem, Paper, Select } from "@mui/material";
import { useStates } from "@/components/services/state-service/state-provider";
import { Title } from "../bar/bar.styled";
import React from "react";

import dynamic from "next/dynamic";
import Properties from "./blocks/properties/properties";
import Widget from "./widgets/widget";
import OutlinerWidget from "./widgets/outliner-widget";

const InUseGrid = dynamic(() => import("./blocks/in-use-grid/in-use-grid"), {
  ssr: false,
});
const EditGrid = dynamic(() => import("./blocks/edit-grid/edit-grid"), {
  ssr: false,
});

const WidgetPanelGrid = () => {
  const { isEditWidgetsOpen, stateService } = useStates();
  const { isWidgetsOpen } = useStates();
  const { sectionType } = useStates();

  return (
    <>
      {isEditWidgetsOpen && (
        <Box
          sx={{
            position: "fixed",
            background: "rgba(205, 205, 205, .3)",
            backdropFilter: "blur(4px)",
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            left: "-0px",
            top: "-0px",
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
              }}
            >
              <Widget type="bar-widget" />

              {sectionType === "widgets" && <InUseGrid />}
              {sectionType === "outliner" && <OutlinerWidget />}
            </Box>

            {/* Edit Panel */}
            {isEditWidgetsOpen && <EditGrid />}
          </>
        )}

        <Properties />
      </Box>
    </>
  );
};

export default WidgetPanelGrid;
