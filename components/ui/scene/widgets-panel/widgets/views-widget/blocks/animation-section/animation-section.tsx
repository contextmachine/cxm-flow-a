import { Box, Button } from "@mui/material";
import { useViewsWidget } from "../../views-widget";
import { useEffect, useState } from "react";
import { ViewStateItem } from "@/components/services/extensions/camera-views-extension/camera-views-extension.db";
import { useDragAndDrop } from "@formkit/drag-and-drop/react/index.cjs";
import ViewItem from "../view-item/view-item";
import NoViews from "../no-views/no-views";
import TransferSection from "../transfer-section/transfer-section";

const AnimationSection: React.FC = () => {
  const {
    extension,
    updateTitle,
    restoreState,
    deleteView,
    animationViews,
    playing,
    playingViewIndex,
  } = useViewsWidget();

  const [viewGridRef, views, setViews] = useDragAndDrop<
    HTMLUListElement,
    ViewStateItem
  >([], {
    handleEnd: (e) => extension?.updateViewsOrder(views, "animation"),
  });

  useEffect(() => {
    setViews(animationViews);
  }, [animationViews]);

  const [isEditSection, setIsEditSection] = useState(false);

  useEffect(() => {
    if (playing) {
      setIsEditSection(false);
    }
  }, [playing]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {!isEditSection && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              width: "100%",
              gap: "4px",
            }}
            ref={viewGridRef}
          >
            {views.map((view, i) => (
              <ViewItem
                key={view.id}
                view={view}
                updateTitle={updateTitle}
                restoreState={restoreState}
                deleteView={deleteView}
                deleteDisabled
                isPlaying={i === playingViewIndex}
              />
            ))}
          </Box>

          {views.length === 0 && <NoViews />}

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "12px",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{ border: "1px solid rgba(0,0,0,0.1)" }}
              size="medium"
              disabled={playing}
              onClick={() => setIsEditSection(true)}
            >
              Transfer Views
            </Button>
          </Box>
        </>
      )}

      {isEditSection && (
        <TransferSection onClose={() => setIsEditSection(false)} />
      )}
    </Box>
  );
};

export default AnimationSection;
