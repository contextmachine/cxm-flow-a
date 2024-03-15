import { Box, Button, InputBase, Paper } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import styled from "styled-components";
import SearchBar from "../blocks/search-bar/search-bar";
import Badge from "../../primitives/badge";

interface QueryWidgetProps {
  isPreview?: boolean;
}

const QueryWidget: React.FC<QueryWidgetProps> = ({ isPreview }) => {
  const renderTree = (nodes: any) => {
    const iconPath = nodes.isObject
      ? "/icons/box.svg"
      : nodes.isList
      ? "/icons/stack.svg"
      : "/icons/folder.svg";

    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={
          <Box
            sx={{
              display: "flex",
              columnGap: "6px",
              justifyContent: "space-between",
            }}
          >
            {nodes.isMain && (
              <>
                <Box sx={{ display: "flex", columnGap: "6px" }}>
                  <Badge>
                    <Box
                      sx={{
                        width: "12px",
                        height: "12px",
                        minWidth: "12px",
                        minHeight: "12px",
                        backgroundImage: `url(${iconPath})`,
                      }}
                    />

                    <Box>{nodes.name}</Box>
                  </Badge>
                  <Box>queries</Box>
                </Box>

                <Badge>+ Add query</Badge>
              </>
            )}

            {!nodes.isMain && nodes.name}
          </Box>
        }
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node: any) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

  return (
    <WidgetPaper isPreview={isPreview} title={"Queries"}>
      <SearchBar buttonLabel="Find query" />

      <TreeWrapper>
        <Box sx={{ flexGrow: 1, width: "100%" }}>
          <TreeView
            defaultCollapseIcon={
              <ExpandMoreIcon sx={{ fontSize: "16px !important" }} />
            }
            defaultExpanded={["1"]}
            defaultExpandIcon={
              <ChevronRightIcon sx={{ fontSize: "16px !important" }} />
            }
          >
            {treeData.map((node) => renderTree(node))}
          </TreeView>
        </Box>
      </TreeWrapper>
    </WidgetPaper>
  );
};

const treeData = [
  {
    id: "1",
    name: "GraphQl",
    isMain: true,
    children: Array.from({ length: 15 }, (_, i) => ({
      id: `1-${i}`,
      name: `Query #${i}`,
    })),
  },
  {
    id: "2",
    name: "REST",
    isMain: true,
    children: Array.from({ length: 12 }, (_, i) => ({
      id: `2-${i}`,
      name: `Query #${i}`,
    })),
  },
];

const TreeWrapper = styled.div`
  & {
    display: flex;
    width: 100%;
  }

  &,
  & * {
    font-size: 12px !important;
  }
`;

export default QueryWidget;
