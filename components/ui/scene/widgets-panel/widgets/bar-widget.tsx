import { Button, ButtonGroup, IconButton, Paper } from "@mui/material";
import { ToolsGroup } from "../widget-panel.styled";
import MarkedIcon from "@/components/ui/icons/marked-icon";
import { useStates } from "@/components/services/state-service/state-provider";

interface BarChartWidgetProps {
  isPreview?: boolean;
  extension: any;
}

const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const { stateService, sectionType } = useStates();

  return (
    <Paper
      id="bar-widget"
      data-type="widget"
      sx={{ justifyContent: "space-between", minHeight: "max-content" }}
    >
      <ButtonGroup>
        <Button
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
        </Button>
      </ButtonGroup>

      <ToolsGroup>
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
      </ToolsGroup>
    </Paper>
  );
};

export default BarChartWidget;
