import { Box, CircularProgress } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { TreeObject } from "../query-widget.types";
import {
  QueryEntityTreeItem,
  QuerySectionTreeItem,
} from "@/components/services/extensions/query-extension/query-extension.types";
import Badge from "@/components/ui/scene/primitives/badge";
import { useQueryWidget } from "../query-widget";

const TreeItemLabel: React.FC<{
  item: QuerySectionTreeItem | QueryEntityTreeItem;
}> = ({ item }) => {
  const { queryExtension } = useQueryWidget();

  const isQuerySection = (item as QuerySectionTreeItem).isQuerySection;

  const isLoading = (item as QueryEntityTreeItem).loading;
  const isLoaded = (item as QueryEntityTreeItem).modelLoaded;
  const isFailed = (item as QueryEntityTreeItem).failed;

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
      {isQuerySection ? (
        <Box sx={{ display: "flex", columnGap: "6px", alignItems: "center" }}>
          <Badge>
            <Box
              sx={{
                width: "12px",
                height: "12px",
                minWidth: "12px",
                minHeight: "12px",
                backgroundImage: `url("/icons/brackets-curly.svg")`,
              }}
            />

            <Box>{item.label}</Box>
          </Badge>
          <Box> queries</Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: "4px" }}>
          <Box
            sx={{
              width: "12px",
              height: "12px",
              minWidth: "12px",
              minHeight: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading && <CircularProgress size={12} />}
            {isLoaded && (
              <Box
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "green",
                  borderRadius: "50%",
                }}
              />
            )}
            {isFailed && (
              <Box
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "green",
                  borderRadius: "50%",
                }}
              />
            )}
          </Box>

          <Box
            data-type="tree-item-label"
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Box>
        </Box>
      )}

      {/* Edit/Status Panel */}
      <Box sx={{ display: "flex", gap: "4px" }}>
        {isQuerySection && (
          <Badge onClick={() => queryExtension?.openEditForm()}>
            + Add query
          </Badge>
        )}

        {!isQuerySection && (
          <>
            <Badge
              onClick={() => {
                queryExtension?.editQuery(
                  (item as QueryEntityTreeItem).queryId
                );
              }}
            >
              Edit
            </Badge>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TreeItemLabel;
