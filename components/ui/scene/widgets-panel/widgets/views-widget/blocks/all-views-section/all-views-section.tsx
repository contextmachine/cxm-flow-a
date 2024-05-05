import { Box } from "@mui/material";
import ViewItem from "../view-item/view-item";
import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { useEffect } from "react";
import { useViewsWidget } from "../../views-widget";
import NoViews from "../no-views/no-views";

const AllViewsSection: React.FC = () => {
  const { extension, updateTitle, restoreState, deleteView, allViews } =
    useViewsWidget();

  const [viewGridRef, views, setViews] = useDragAndDrop<
    HTMLUListElement,
    ViewStateItem
  >([], {
    handleEnd: (e) => extension?.updateViewsOrder(views, "all"),
  });

  useEffect(() => {
    setViews(allViews);
  }, [allViews]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          width: "100%",
          gap: "0px",
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

      {views.length === 0 && <NoViews />}
    </Box>
  );
};

export default AllViewsSection;
