import { Box, Button, InputBase, Paper } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import styled from "styled-components";
import SearchBar from "../blocks/search-bar/search-bar";

interface QueryWidgetProps {
  isPreview?: boolean;
}

const QueryWidget: React.FC<QueryWidgetProps> = ({ isPreview }) => {
  return (
    <WidgetPaper isPreview={isPreview} title={"Queries"}>
      <SearchBar buttonLabel="Find query"/>

      <TreeWrapper>
        <Box sx={{ flexGrow: 1, width: "100%" }}>
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            <TreeItem
              nodeId="1"
              label={
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      columnGap: "4px",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        height: "21px",
                        backgroundColor: "#F3F3F3",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "9px",
                        padding: "0 9px",
                      }}
                    >
                      GraphQL
                    </Box>
                    <Box>queries</Box>
                  </Box>

                  <Box
                    sx={{
                      height: "21px",
                      backgroundColor: "#F3F3F3",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "9px",
                      padding: "0 9px",
                    }}
                  >
                    + Add query
                  </Box>
                </Box>
              }
            >
              <TreeItem nodeId="2" label="Calendar" />
            </TreeItem>
            <TreeItem
              nodeId="5"
              label={
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "4px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      columnGap: "4px",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        height: "21px",
                        backgroundColor: "#F3F3F3",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "9px",
                        padding: "0 9px",
                      }}
                    >
                      REST
                    </Box>
                    <Box>queries</Box>
                  </Box>

                  <Box
                    sx={{
                      height: "21px",
                      backgroundColor: "#F3F3F3",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "9px",
                      padding: "0 9px",
                    }}
                  >
                    + Add query
                  </Box>
                </Box>
              }
            >
              <TreeItem nodeId="10" label="OSS" />
              <TreeItem nodeId="6" label="MUI">
                <TreeItem nodeId="8" label="index.js" />
              </TreeItem>
            </TreeItem>
          </TreeView>
        </Box>
      </TreeWrapper>
    </WidgetPaper>
  );
};

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
