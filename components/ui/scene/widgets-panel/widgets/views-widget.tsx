import { use, useEffect, useRef, useState } from "react";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import { useScene } from "@/components/services/scene-service/scene-provider";
import CameraViewsExtensions from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension";
import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
} from "@mui/material";
import styled from "styled-components";
import EditableTitle from "../../primitives/dynamic-title/dynamic-title";
import { ViewState } from "@/src/viewer/camera-control.types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Badge from "../../primitives/badge";

const ViewsWidget: React.FC<{
  isPreview?: boolean;
}> = ({ isPreview }) => {
  const { sceneService } = useScene();

  const [sectionType, setSectionType] = useState<"all" | "animation">("all");

  const [allViews, setAllViews] = useState<ViewStateItem[]>([]);
  const [animationViews, setAnimationViews] = useState<ViewStateItem[]>([]);
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);

  const extensionRef = useRef<CameraViewsExtensions | null>(null);

  useEffect(() => {
    const extension = sceneService.addExtension(
      new CameraViewsExtensions()
    ) as CameraViewsExtensions;
    extensionRef.current = extension;

    const allViewsSub = extension.allViews$!.subscribe((views) =>
      setAllViews(views)
    );
    const animationViewsSub = extension.animationViews$!.subscribe((views) =>
      setAnimationViews(views)
    );

    const pendingSub = extension.dbService.pending$.subscribe((pending) =>
      setPending(pending)
    );
    const addingSub = extension.dbService.adding$.subscribe((adding) =>
      setAdding(adding)
    );

    return () => {
      allViewsSub.unsubscribe();
      animationViewsSub.unsubscribe();

      pendingSub.unsubscribe();
      addingSub.unsubscribe();

      sceneService.removeExtension(extension.name);
    };
  }, []);

  const updateTitle = (id: number, name: string) => {
    const extension = extensionRef.current;
    if (!extension) return;

    extension.updateTitle(id, name);
  };

  const restoreState = (state: ViewState) => {
    const extension = extensionRef.current;
    if (!extension) return;

    extension.restoreState(state);
  };

  const addView = () => {
    const extension = extensionRef.current;
    if (!extension) return;

    extension.addView();
  };

  const deleteView = (id: number) => {
    const extension = extensionRef.current;
    if (!extension) return;

    extension.deleteView(id);
  };

  return (
    <WidgetPaper isPreview={isPreview} title={"Views"}>
      <Box
        sx={{
          display: "flex",
          columnGap: "5px",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ButtonGroup>
          <Button
            data-active={sectionType === "all" ? "true" : "false"}
            color="secondary"
            variant="contained"
            size="medium"
            onClick={() => setSectionType("all")}
          >
            All
          </Button>
          <Button
            data-active={sectionType === "animation" ? "true" : "false"}
            color="secondary"
            variant="contained"
            size="medium"
            onClick={() => setSectionType("animation")}
          >
            Animation
          </Button>
        </ButtonGroup>

        <Box>
          <Button
            data-active={"false"}
            color="primary"
            variant="contained"
            size="medium"
            onClick={() => addView()}
            startIcon={
              adding ? <CircularProgress size={16} color="inherit" /> : <></>
            }
          >
            + Add view
          </Button>
        </Box>
      </Box>

      {sectionType === "all" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "4px",
          }}
        >
          {allViews.map((view) => (
            <ViewItem
              key={view.id}
              view={view}
              updateTitle={updateTitle}
              restoreState={restoreState}
              deleteView={deleteView}
            />
          ))}
        </Box>
      )}

      {sectionType === "animation" && (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {animationViews.map((view) => (
            <ViewItem
              key={view.id}
              view={view}
              updateTitle={updateTitle}
              restoreState={restoreState}
              deleteView={deleteView}
            />
          ))}
        </Box>
      )}

      {pending && (
        <>
          <Box sx={{ display: "flex", gap: "4px" }}>
            <CircularProgress size={16} color="inherit" />
            <Box>Loading content...</Box>
          </Box>
        </>
      )}
    </WidgetPaper>
  );
};

const ViewItem: React.FC<{
  view: ViewStateItem;
  updateTitle: any;
  restoreState: any;
  deleteView: any;
}> = ({ view, updateTitle, restoreState, deleteView }) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <Wrapper
      onClick={() => {
        restoreState(view.state);
      }}
    >
      <Box
        sx={{
          minWidth: "60px",
          height: "35px",
          background: view.thumb ? `url("${view.thumb}")` : "lightgrey",
          backgroundPosition: "center",
          backgroundSize: "cover",
          borderRadius: "4px",
        }}
      ></Box>

      <Box
        sx={{
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          width: "100%",
        }}
      >
        <EditableTitle
          size={"medium"}
          title={view.name}
          setTitle={(name) => updateTitle(view.id, name)}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: "4px",
          alignItems: "center",
          height: "100%",
        }}
      >
        {!deleting && (
          <Badge
            onClick={(e: any) => {
              e.stopPropagation();

              setDeleting(true);
              deleteView(view.id);
            }}
          >
            Delete
          </Badge>
        )}

        {deleting && (
          <Box>
            <CircularProgress size={16} color="inherit" />
          </Box>
        )}
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  width: 100%;

  border: 1px solid #f3f3f3;

  overflow: hidden;
  cursor: pointer;
  border-radius: 4px;

  padding: 5px 10px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export default ViewsWidget;
