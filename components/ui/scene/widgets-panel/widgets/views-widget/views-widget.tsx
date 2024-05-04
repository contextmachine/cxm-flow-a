import { createContext, useContext, useEffect, useRef, useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import { useScene } from "@/components/services/scene-service/scene-provider";
import CameraViewsExtensions from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension";
import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";
import { Box, Button, ButtonGroup, CircularProgress } from "@mui/material";
import { ViewState } from "@/src/viewer/camera-control.types";
import ViewItem from "./blocks/view-item/view-item";
import dynamic from "next/dynamic";

const AllViewsSection = dynamic(
  () => import("./blocks/all-views-section/all-views-section"),
  {
    ssr: false,
  }
);

const ViewsWidget: React.FC<{
  isPreview?: boolean;
}> = ({ isPreview }) => {
  const { sceneService } = useScene();

  const [sectionType, setSectionType] = useState<"all" | "animation">("all");

  const [animationViews, setAnimationViews] = useState<ViewStateItem[]>([]);
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);

  const extensionRef = useRef<CameraViewsExtensions | null>(null);
  const [extension, setExtension] = useState<CameraViewsExtensions | null>(
    null
  );

  useEffect(() => {
    const extension = sceneService.addExtension(
      new CameraViewsExtensions()
    ) as CameraViewsExtensions;
    extensionRef.current = extension;
    setExtension(extension);

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

    extension.restoreState(state, false);
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
    <ViewsWidgetContext.Provider
      value={{
        animationViews,
        extension,
        updateTitle,
        restoreState,
        deleteView,
        pending,
        adding,
      }}
    >
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

        {sectionType === "all" && <AllViewsSection />}

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
    </ViewsWidgetContext.Provider>
  );
};

const ViewsWidgetContext = createContext<any | null>(null);

export const useViewsWidget = () => {
  const context = useContext(ViewsWidgetContext);
  if (!context) {
    throw new Error("useViewsWidget must be used within a ViewsWidgetContext");
  }
  return context;
};

export default ViewsWidget;
