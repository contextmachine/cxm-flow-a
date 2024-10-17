import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";

import { WidgetType } from "../../widgets/widget.types";
import { Box, Button, IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WidgetEditPaper from "../widget-edit-paper/widget-edit-paper";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import { useMemo } from "react";
import ToolsetItem from "../toolset-item/toolset-item";
import { ToolsetDto } from "@/components/services/toolset-service/toolset-service.types";

const EditGrid = () => {
  const { restProducts } = useToolset();

  const doneItems: string[] = useMemo(() => {
    return restProducts.map((product) => product.name);
  }, [restProducts]);

  const [doneList, dones] = useDragAndDrop<HTMLUListElement, string>(
    doneItems,
    {
      group: "todoList",
      plugins: [animations()],
      threshold: {
        horizontal: 0.8,
        vertical: 0.8,
      },
      dragHandle: ".kanban-handle",
    }
  );

  const { toolsets, activeToolset, toolsetService } = useToolset();
  const handleToolsetClick = (toolset: ToolsetDto) => {
    toolsetService.setActiveToolset(toolset.id);
  };

  return (
    <>
      <Box
        data-type="edit-widgets-panel"
        sx={{
          display: "flex",
          width: "100%",
          overflowY: "scroll",
          border: "1px dashed #000",
          borderRadius: "18px",
        }}
      >
        <Box
          data-type="edit-widgets-grid"
          sx={{
            display: "grid",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            gridTemplateColumns: "1fr 1fr",
            gridAutoRows: "320px",
            // dashed border
            //border: "1px dashed #000",
            borderRadius: "18px",
          }}
          ref={doneList}
        >
          {dones.map((done) => (
            <WidgetEditPaper type={done as WidgetType} key={done} />
          ))}
        </Box>
      </Box>

      {/* Search Panel */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "240px",
          pointerEvents: "none ! important",
          gap: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            height: "27px",
            pointerEvents: "all",
          }}
        >
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: "16px" }} />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, height: "27px", fontSize: "12px" }}
            placeholder="Search"
            inputProps={{ "aria-label": "search google maps" }}
          />
        </Paper> */}

        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            pointerEvents: "all",
          }}
        >
          {toolsets.map((_, i) => (
            <ToolsetItem
              toolset={_}
              active={activeToolset?.id === _.id}
              key={i}
              onClick={handleToolsetClick}
            />
          ))}

          <Button
            sx={{}}
            color="primary"
            variant="contained"
            onClick={() => toolsetService.addToolset()}
          >
            + Add toolset
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default EditGrid;
