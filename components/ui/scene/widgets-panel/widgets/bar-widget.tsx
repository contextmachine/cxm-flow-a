import { Box, Button, ButtonGroup, IconButton, Paper } from "@mui/material";
import { ToolsGroup } from "../widget-panel.styled";
import MarkedIcon from "@/components/ui/icons/marked-icon";
import { useStates } from "@/components/services/state-service/state-provider";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import ConfigsIcon from "@/components/ui/icons/configs-icon";
import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import { useScene } from "@/components/services/scene-service/scene-provider";

interface BarChartWidgetProps {
  isPreview?: boolean;
  extension: any;
}

const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const { stateService, sectionType } = useStates();

  const { toolsets, activeToolset, toolsetService } = useToolset();

  const toolsetRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const { userMetadata } = useAuth();
  const { sceneMetadata } = useScene();

  // Load the toolset from cookies or session storage on component mount
  useEffect(() => {
    if (!sceneMetadata || !userMetadata) return;

    const sceneId = sceneMetadata.id;
    const userId = userMetadata.id;

    const savedToolsetId = Cookies.get(`selectedToolset_${sceneId}_${userId}`);
    if (savedToolsetId) {
      const savedToolset = toolsets.find(
        (toolset) => `${toolset.id}` === savedToolsetId
      );
      if (savedToolset) {
        toolsetService.setActiveToolset(savedToolset.id);
      } else {
      }
    }
  }, [sceneMetadata, userMetadata, toolsets, toolsetService]);

  useEffect(() => {
    if (activeToolset && toolsetRefs.current[activeToolset.id]) {
      const timeout = setTimeout(() => {
        toolsetRefs.current[activeToolset.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [activeToolset]);

  return (
    <Paper
      id="bar-widget"
      data-type="widget"
      sx={{ justifyContent: "space-between", minHeight: "max-content" }}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: "scroll",
        }}
      >
        <ButtonGroup
          sx={{
            minWidth: "max-content",
          }}
        >
          {/* <Button
            data-active={sectionType === "widgets" ? "true" : "false"}
            color="secondary"
            variant="contained"
            size="medium"
            onClick={() => stateService.openSection("widgets")}
          >
            Toolbox
          </Button>
          <Button
            data-active={sectionType === "outliner" ? "true" : "false"}
            color="secondary"
            variant="contained"
            size="medium"
            onClick={() => stateService.openSection("outliner")}
          >
            Outliner
          </Button> */}

          {toolsets.map((toolset) => (
            <Button
              ref={(el: any) => (toolsetRefs.current[toolset.id] = el)}
              data-active={activeToolset?.id === toolset.id ? "true" : "false"}
              color="secondary"
              variant="contained"
              size="medium"
              key={toolset.id}
              onClick={() => {
                const sceneId = sceneMetadata?.id;
                const userId = userMetadata?.id;

                const toolsetId = `${toolset.id}`;

                toolsetService.setActiveToolset(toolset.id);
                Cookies.set(`selectedToolset_${sceneId}_${userId}`, toolsetId, {
                  expires: 7,
                });
              }}
            >
              {toolset.name}
            </Button>
          ))}
        </ButtonGroup>

        {/* <ToolsGroup>
          <IconButton>
            <MarkedIcon />
          </IconButton>

          <Button
            color="primary"
            style={{
              maxWidth: "27px",
              minWidth: "27px",
              borderRadius: "50%",
              padding: "0px",
            }}
            variant="contained"
            size="medium"
            onClick={() => stateService.toogleEditWidgets()}
          >
            +
          </Button>
        </ToolsGroup> */}
      </Box>

      <Box>
        <IconButton onClick={() => stateService.toogleEditWidgets()}>
          <ConfigsIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default BarChartWidget;
