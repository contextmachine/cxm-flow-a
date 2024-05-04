import { Box } from "@mui/material";
import ViewItem from "../view-item/view-item";
import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";
import { useEffect, useMemo, useState } from "react";
import { useViewsWidget } from "../../views-widget";

const AllViewsSection: React.FC = () => {
  const { extension, updateTitle, restoreState, deleteView } = useViewsWidget();
  const [allViews, setAllViews] = useState<ViewStateItem[]>([]);

  const [viewGridRef, views, setViews] = useDragAndDrop<
    HTMLUListElement,
    ViewStateItem
  >([], {
    handleEnd: (e) => extension?.updateViewsOrder(views),
  });

  useEffect(() => {
    setViews(allViews);
  }, [allViews]);

  useEffect(() => {
    if (!extension) return;

    const allViewsSub = extension?.allViews$?.subscribe(
      (views: ViewStateItem[]) => setAllViews(views)
    );

    return () => {
      allViewsSub?.unsubscribe();
    };
  }, [extension]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        width: "100%",
        gap: "4px",
      }}
      ref={viewGridRef}
    >
      {views.map((view) => (
        <ViewItem
          key={view.id}
          view={view}
          updateTitle={updateTitle}
          restoreState={restoreState}
          deleteView={deleteView}
        />
      ))}
    </Box>
  );
};

export default AllViewsSection;
