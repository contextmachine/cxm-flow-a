import { Box, Button, InputBase, Paper } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EnhancedTreeItem from "./blocks/enhanced-tree-item";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import styled from "styled-components";
import SearchBar from "../../blocks/search-bar/search-bar";
import Badge from "../../../primitives/badge";
import { useRef } from "react";

const TreeView = RichTreeView;

interface QueryWidgetProps {
  isPreview?: boolean;
}

const QueryWidget: React.FC<QueryWidgetProps> = ({ isPreview }) => {
  const treeViewRef = useRef<any>(null);
  const apiRef = useRef<any>(null);

  /* const renderTree = (nodes: any) => {
    const iconPath = nodes.isObject
      ? "/icons/box.svg"
      : nodes.isList
      ? "/icons/stack.svg"
      : "/icons/folder.svg"; */

  return (
    <WidgetPaper isPreview={isPreview} title={"Queries"}>
      <SearchBar buttonLabel="Find query" />

      <TreeWrapper>
        <TreeView
          ref={treeViewRef}
          slots={{
            item: EnhancedTreeItem,
          }}
          apiRef={apiRef}
          multiSelect
          items={treeData}
          expandedItems={[]}
          onExpandedItemsChange={(event, ids) => true}
          onSelectedItemsChange={(event, ids) => true}
        />
      </TreeWrapper>
    </WidgetPaper>
  );

  /* return (
      <TreeItem
        key={nodes.id}
        // @ts-ignore
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
  }; */

  /* return (
    <WidgetPaper isPreview={isPreview} title={"Queries"}>
      <SearchBar buttonLabel="Find query" />

      <TreeWrapper>
        <Box sx={{ flexGrow: 1, width: "100%" }}>
          <TreeView
            // @ts-ignore
            defaultCollapseIcon={
              // @ts-ignore
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
  ); */
};

const treeData = [
  {
    id: "1",
    label: "GraphQl",
    isMain: true,
    children: Array.from({ length: 15 }, (_, i) => ({
      id: `1-${i}`,
      label: `Query #${i}`,
    })),
  },
  {
    id: "2",
    label: "REST",
    isMain: true,
    children: Array.from({ length: 12 }, (_, i) => ({
      id: `2-${i}`,
      label: `Query #${i}`,
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
