import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";
import { Box } from "@mui/material";
import { WidgetType } from "../../widgets/widget.types";
import Widget from "../../widgets/widget";

const InUseGrid = () => {
  const todoItems: WidgetType[] = [
    "chart-widget",
    "statistics-widget",
    "mapping-widget",
    "query-widget",
  ];

  const [todoList, todos] = useDragAndDrop<HTMLUListElement, string>(
    todoItems,
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: "9px",
        minHeight: "max-content",
        width: "100%",
        pointerEvents: "all",
        paddingBottom: "40px",
      }}
      ref={todoList}
    >
      {todos.map((todo) => (
        <Widget type={todo as WidgetType} key={todo} />
      ))}
    </Box>
  );
};

export default InUseGrid;
