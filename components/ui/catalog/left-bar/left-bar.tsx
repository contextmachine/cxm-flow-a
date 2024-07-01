import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { Title } from "../../scene/bar/bar.styled";
import styled from "styled-components";
import MarkedIcon from "../../icons/marked-icon";
import UserProfile from "./blocks/user-profile";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import stc from "string-to-color";

import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import WorkspacesList from "./blocks/workspaces-list/workspaces-list";
import OpenFolderIcon from "../../icons/open-folder-icon";
import { CollectionDto } from "@/components/services/workspace-service/workspace-service.types";
import { useEffect, useState } from "react";

const LeftBar = () => {
  const menuItems = ["Personal", "Favourites", "Shared", "Trash"];

  const { workspaces, activeWorkspace, workspaceService } = useWorkspace();

  const [collections, setCollections] = useState<CollectionDto[]>([]);
  useEffect(() => {
    const co = workspaceService.collections$.subscribe((collections) => {
      setCollections(collections);
    });

    return () => {
      co.unsubscribe();
    };
  }, []);

  return (
    <>
      <UserProfile />

      {/* <Paper
        title="Workspaces"
        sx={{ flexDirection: "column", gap: "3px !important" }}
      >
        <MenuWrapper>
          {menuItems.map((item, i) => (
            <Box sx={{ width: "100%" }} key={i}>
              <Button
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  textTransform: "none",
                }}
                startIcon={<MailIcon />}
              >
                {item}
              </Button>
            </Box>
          ))}
        </MenuWrapper>
      </Paper> */}

      <Paper title="Workspaces" sx={{ flexDirection: "column" }}>
        <WidgetHeader>
          <IconButton>
            <MarkedIcon />
          </IconButton>

          <Title style={{ fontWeight: "500" }}>Workspaces</Title>
        </WidgetHeader>

        <Box
          sx={{
            minHeight: "max-content",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            {collections.map((collection, i) => (
              <AccordionBox key={i}>
                <Accordion
                  sx={{ display: "flex", flexDirection: "column" }}
                  expanded={true}
                >
                  <AccordionSummary>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <IconBullet color={stc(collection.name)} />
                        <Typography>{collection.name}</Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <Button
                          onClick={() => true}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            minWidth: "24px",
                            minHeight: "24px",
                            borderRadius: "50%",
                            padding: "0",
                            fontSize: "12px",
                          }}
                        >
                          ...
                        </Button>

                        <Button
                          onClick={() =>
                            workspaceService.addWorkspace(collection.id)
                          }
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            minWidth: "24px",
                            minHeight: "24px",
                            borderRadius: "50%",
                            padding: "0",
                            fontSize: "12px",
                          }}
                        >
                          +
                        </Button>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <WorkspacesList
                      workspaces={collection.collection_workspaces.map(
                        ({ workspace }) => workspace
                      )}
                    />
                  </AccordionDetails>
                </Accordion>
              </AccordionBox>
            ))}
          </Box>
        </Box>

        {/* <AccordionBox>
          <Accordion
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={true}
          >
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(68, 68, 68, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <OpenFolderIcon />
                </Box>
                <Typography>Personal</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <WorkspacesList />
            </AccordionDetails>
          </Accordion>
        </AccordionBox>

        <AccordionBox>
          <Accordion
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={true}
          >
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(68, 68, 68, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <OpenFolderIcon />
                </Box>
                <Typography>Favourites</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <WorkspacesList fake={true} />
            </AccordionDetails>
          </Accordion>
        </AccordionBox>

        <AccordionBox>
          <Accordion
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={false}
          >
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(68, 68, 68, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <OpenFolderIcon />
                </Box>
                <Typography>Shared</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <WorkspacesList />
            </AccordionDetails>
          </Accordion>
        </AccordionBox>

        <AccordionBox>
          <Accordion
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={false}
          >
            <AccordionSummary>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(68, 68, 68, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <OpenFolderIcon />
                </Box>
                <Typography>Trash</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <WorkspacesList />
            </AccordionDetails>
          </Accordion>
        </AccordionBox> */}

        {/*  <Button
          onClick={workspaceService.addWorkspace}
          variant="contained"
          color="primary"
          size="large"
        >
          + New workspace
        </Button> */}
      </Paper>
    </>
  );
};

const AccordionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 3px;

  & .MuiAccordion-root {
    padding: 0;

    & .MuiAccordionSummary-root {
      padding: 0;
      height: 33px;
      border-radius: 18px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }

    & .MuiAccordionDetails-root {
      padding: 0;
    }
  }
`;

export const IconBullet = styled.div<{
  color: string;
}>`
  width: 6px;
  height: 6px;
  min-width: 6px;
  min-height: 6px;
  max-width: 6px;
  max-height: 6px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

export const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 3px;

  &&&&& {
    &,
    & * {
      font-size: 12px;
      color: var(--main-text-color);
    }
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

export default LeftBar;
