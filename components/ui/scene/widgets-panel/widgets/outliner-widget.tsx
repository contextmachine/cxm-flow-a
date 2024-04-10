import { Box, Paper } from "@mui/material";
import SearchBar from "../blocks/search-bar/search-bar";
import React from "react";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Badge from "../../primitives/badge";

const OutlinerWidget = () => {
  const renderTree = (nodes: any) => {
    const iconPath = nodes.isObject
      ? "/icons/box.svg"
      : nodes.isList
      ? "/icons/stack.svg"
      : "/icons/folder.svg";

    return (
      <TreeItem
        key={nodes.id}
        // @ts-ignore
        nodeId={nodes.id}
        label={
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

              {Array.isArray(nodes.children) && (
                <Box>{nodes.isList ? nodes.name : nodes.children.length}</Box>
              )}
            </Badge>
            {!nodes.isList && nodes.name}
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
    <Paper
      id="bar-widget"
      data-type="widget"
      sx={{ justifyContent: "space-between", flexDirection: "column" }}
    >
      <SearchBar buttonLabel={"Find layer"} />

      <Box>
        <Box sx={{ minHeight: "max-content" }}>
          <TreeView
            // @ts-ignore
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
      </Box>
    </Paper>
  );
};

const treeData = [
  {
    id: "1",
    name: "sw_unique_items",
    isObject: true,
    children: Array.from({ length: 5 }, (_, i) => ({
      id: `1-${i}`,
      name: `${i * 100 + 1}-${(i + 1) * 100}`,
      isList: true,
      children: Array.from({ length: 100 }, (_, k) => ({
        id: `1-${i}-${k}`,
        name: `mfb_sw_panel_41_f${k + 1}`,
        isFolder: true,
      })),
    })),
  },
  {
    id: "2",
    name: "sn_unique_items",
    isObject: true,
    children: Array.from({ length: 5 }, (_, i) => ({
      id: `2-${i}`,
      name: `${i * 100 + 1}-${(i + 1) * 100}`,
      isList: true,
      children: Array.from({ length: 100 }, (_, k) => ({
        id: `2-${i}-${k}`,
        name: `mfb_sn_panel_41_f${k + 1}`,
        isFolder: true,
      })),
    })),
  },
  {
    id: "3",
    name: "se_unique_items",
    isObject: true,
    children: Array.from({ length: 5 }, (_, i) => ({
      id: `3-${i}`,
      name: `${i * 100 + 1}-${(i + 1) * 100}`,
      isList: true,
      children: Array.from({ length: 100 }, (_, k) => ({
        id: `3-${i}-${k}`,
        name: `mfb_se_panel_41_f${k + 1}`,
        isFolder: true,
      })),
    })),
  },
];

export default OutlinerWidget;
