import { Box, CircularProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { TreeObject } from "../query-widget.types";

const TreeItemLabel: React.FC<{
  handleVisibilityClick: (e: React.MouseEvent) => void;
  item: TreeObject;
}> = ({ handleVisibilityClick, item }) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", gap: "8px", overflow: "hidden" }}>
        <Box
          data-type="tree-item-label"
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            //color: item.isSelected ? '#4e92d7 !important' : 'inherit',
          }}
        >
          {item.label}
        </Box>
      </Box>

      {/* Edit/Status Panel */}
      <Box>
        {!item.isMain && (
          <Box
            data-visible={`true`}
            sx={{ minWidth: "max-content" }}
            data-type="edit-panel"
            onClick={handleVisibilityClick}
          >
            <VisibilityOffIcon style={{ fontSize: "18px" }} />
          </Box>
        )}

        {item.isMain && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CircularProgress size={14} color={"primary"} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TreeItemLabel;
