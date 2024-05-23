import { createContext, useContext, useEffect, useRef, useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import { useScene } from "@/components/services/scene-service/scene-provider";

import { Box, Button, ButtonGroup, CircularProgress } from "@mui/material";
import { ViewState } from "@/src/viewer/camera-control.types";
import dynamic from "next/dynamic";
import { ViewStateItem } from "@/components/services/extensions/camera-views-extension/camera-views-extension.db";
import CameraViewsExtensions from "@/components/services/extensions/camera-views-extension/camera-views-extension";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";

const AllViewsSection = dynamic(
  () => import("./blocks/all-views-section/all-views-section"),
  {
    ssr: false,
  }
);

const AnimationSection = dynamic(
  () => import("./blocks/animation-section/animation-section"),
  {
    ssr: false,
  }
);

const ViewsWidget: React.FC<{
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}> = ({ isPreview, extension }) => {
  extension = extension as CameraViewsExtensions;

  const [sectionType, setSectionType] = useState<"all" | "animation">("all");

  const [animationViews, setAnimationViews] = useState<ViewStateItem[]>([]);
  const [allViews, setAllViews] = useState<ViewStateItem[]>([]);
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playingViewIndex, setPlayingViewIndex] = useState<number | null>(null);

  useEffect(() => {
    const animationViewsSub = extension?.animationViews$?.subscribe(
      (views: ViewStateItem[]) => setAnimationViews(views)
    );
    const allViewsSub = extension?.allViews$?.subscribe(
      (views: ViewStateItem[]) => setAllViews(views)
    );

    const pendingSub = extension.dbService.pending$.subscribe(
      (pending: boolean) => setPending(pending)
    );
    const addingSub = extension.dbService.adding$.subscribe((adding: boolean) =>
      setAdding(adding)
    );

    const playSub = extension.isPlaying$.subscribe((playing: boolean) =>
      setPlaying(playing)
    );
    const playViewIndexSub = extension?.playingViewIndex$.subscribe(
      (index: number) => setPlayingViewIndex(index)
    );

    return () => {
      animationViewsSub?.unsubscribe();
      allViewsSub?.unsubscribe();
      pendingSub?.unsubscribe();
      addingSub?.unsubscribe();
      playSub?.unsubscribe();
      playViewIndexSub?.unsubscribe();
    };
  }, []);

  const updateTitle = (id: number, name: string) => {
    extension.updateTitle(id, name);
  };

  const restoreState = (state: ViewState) => {
    extension.restoreState(state, false);
  };

  const addView = () => {
    extension.addView();
  };

  const deleteView = (id: number) => {
    extension.deleteView(id);
  };

  return (
    <ViewsWidgetContext.Provider
      value={{
        extension,
        updateTitle,
        restoreState,
        deleteView,
        pending,
        adding,
        playing,
        playingViewIndex,
        animationViews,
        allViews,
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
          <ButtonGroup disabled={playing}>
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

          {sectionType === "all" && (
            <Box>
              <Button
                data-active={"false"}
                color="primary"
                variant="contained"
                size="medium"
                onClick={() => {
                  addView();
                }}
                startIcon={
                  adding ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <></>
                  )
                }
              >
                + Add view fuck you
              </Button>
            </Box>
          )}

          {sectionType === "animation" && (
            <Button
              color="secondary"
              sx={{ border: "1px solid rgba(0,0,0,0.6)" }}
              variant="contained"
              size="medium"
              onClick={() => extension?.playForward()}
              disabled={playing}
              startIcon={
                adding ? <CircularProgress size={16} color="inherit" /> : <></>
              }
            >
              Play
            </Button>
          )}
        </Box>

        {sectionType === "all" && <AllViewsSection />}

        {sectionType === "animation" && <AnimationSection />}

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
