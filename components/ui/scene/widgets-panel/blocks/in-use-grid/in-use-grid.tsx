import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";
import { Box } from "@mui/material";
import { WidgetType } from "../../widgets/widget.types";
import Widget from "../../widgets/widget";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const InUseGrid = () => {
  const { activeProducts, toolsetService } = useToolset();

  const todoItems: string[] = useMemo(
    () => activeProducts.map((product) => product.name),
    [activeProducts]
  );

  const [uuid, setUuid] = useState<string>(uuidv4());

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
      handleEnd: (result: any) => {
        setUuid(uuidv4());
      },
    }
  );

  const prevTodos = useRef<string[]>([]);

  useEffect(() => {
    toolsetService.updateTemporaryTodos(todos);
  }, [uuid]);

  useEffect(() => {
    if (prevTodos.current.length === 0) {
      prevTodos.current = todos;
    } else {
      if (prevTodos.current.length !== todos.length) {
        prevTodos.current = todos;
        setUuid(uuidv4());
      }
    }
  }, [todos]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: "9px",
        minHeight: "max-content",
        width: "100%",
        height: "100%",
        pointerEvents: "all",
        paddingBottom: "9px",
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
