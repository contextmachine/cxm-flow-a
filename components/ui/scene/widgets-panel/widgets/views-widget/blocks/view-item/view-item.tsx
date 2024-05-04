import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";
import { useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditableTitle from "@/components/ui/scene/primitives/dynamic-title/dynamic-title";
import styled from "styled-components";
import { useViewsWidget } from "../../views-widget";

const ViewItem: React.FC<{
  view: ViewStateItem;
  updateTitle: any;
  restoreState: any;
  deleteView: any;
}> = ({ view, updateTitle, restoreState, deleteView }) => {
  const [deleting, setDeleting] = useState(false);

  const { adding, pending } = useViewsWidget();

  return (
    <Wrapper
      onClick={() => {
        restoreState(view.state);
      }}
    >
      <Box
        sx={{
          width: "100%",
          paddingTop: "75%",
          background: view.thumb ? `url("${view.thumb}")` : "lightgrey",
          backgroundPosition: "center",
          backgroundSize: "cover",
          borderRadius: "4px",
          position: "relative",
          gap: "4px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            position: "absolute",
            top: "4px",
            right: "4px",
          }}
        >
          {!deleting && (
            <IconButton
              disabled={adding || pending}
              sx={{
                backgroundColor: adding || pending ? "lightgrey" : "white",
                padding: "5px !important",
              }}
              onClick={(e: any) => {
                e.stopPropagation();

                setDeleting(true);
                deleteView(view.id);
              }}
            >
              <CloseIcon sx={{ fontSize: "14px !important" }} />
            </IconButton>
          )}

          {deleting && (
            <Box>
              <CircularProgress size={16} color="inherit" />
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px 0px 5px 0px",
        }}
      >
        <EditableTitle
          size={"medium"}
          title={view.name}
          setTitle={(name) => updateTitle(view.id, name)}
        />
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  border: 1px solid #f3f3f3;

  overflow: hidden;
  cursor: pointer;
  border-radius: 4px;

  padding: 5px 10px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export default ViewItem;
