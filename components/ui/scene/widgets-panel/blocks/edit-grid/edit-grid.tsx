import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";

import { WidgetType } from "../../widgets/widget.types";
import { Box, IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WidgetEditPaper from "../widget-edit-paper/widget-edit-paper";

const EditGrid = () => {
  const doneItems: WidgetType[] = ["mapping-widget", "query-widget"];

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

  return (
    <>
      <Box
        data-type="edit-widgets-panel"
        sx={{ display: "flex", width: "100%", overflowY: "scroll" }}
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
            border: "1px dashed #000",
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
          maxWidth: "180px",
          pointerEvents: "none ! important",
        }}
      >
        <Paper
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
        </Paper>
      </Box>
    </>
  );
};

export default EditGrid;
