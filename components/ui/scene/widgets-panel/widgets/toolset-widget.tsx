import {
  Box,
  Button,
  ButtonGroup,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import { ToolsetDto } from "@/components/services/toolset-service/toolset-service.types";

interface ToolsetWidgetProps {
  isPreview?: boolean;
  extension: any;
}

const ToolsetWidget: React.FC<ToolsetWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const { toolsets, activeToolset, toolsetService } = useToolset();

  return (
    <Paper
      id="toolset-widget"
      data-type="widget"
      sx={{ justifyContent: "space-between", minHeight: "max-content" }}
    >
      <Box sx={{ display: "flex", overflowX: "scroll" }}>
        <Box sx={{ minWidth: "max-content" }}>
          {activeToolset && (
            <Select
              sx={{ width: "100%" }}
              data-type="select"
              value={activeToolset.id}
              onChange={(e) =>
                toolsetService.setActiveToolset(parseInt(`${e.target.value}`))
              }
            >
              {toolsets.map((toolset: ToolsetDto, i: number) => (
                <MenuItem value={toolset.id} key={i}>
                  {toolset.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Box>

      <ButtonGroup sx={{ minWidth: "max-content" }}>
        <Button
          data-active={"false"}
          color="primary"
          variant="contained"
          size="medium"
          onClick={() => toolsetService.addToolset()}
        >
          + Add toolset
        </Button>
      </ButtonGroup>
    </Paper>
  );
};

export default ToolsetWidget;
