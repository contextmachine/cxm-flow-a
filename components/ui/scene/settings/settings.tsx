// ModalComponent.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Switch,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
} from "@mui/material";
import styled from "styled-components";
import TabPanel from "./blocks/tab-panel";
import OpenFolderIcon from "../../icons/open-folder-icon";
import { ParamItem } from "../widgets-panel/widgets/pointcloud-handler-widget/blocks/overall-form copy";
import ProductsSetupPanel from "../products-setup-panel/products-setup-panel";
import TeamMembers from "../team-members/team-membets";
import { useClickOutside } from "@/src/hooks";
import useForm from "@/src/hooks/useForm";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import ProjectSettings from "./project-settings";

const SettingsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  sections?: ("Camera" | "Widgets" | "Access")[];
}> = (props) => {
  const { sections, open, onClose } = props;

  const [value, setValue] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<number>(75);
  const [zoom, setZoom] = useState<number>(1);
  const [distance, setDistance] = useState<number>(100);

  // const viewer = useViewer();

  // const formstate = useForm(viewer.projectSettingsService.settings);

  // const [size, setSize] = useState<number[]>([100, 900]);
  // const [mean, setMean] = useState<number>(100);
  // const [deviation, setDeviation] = useState<number>(100);
  const [backgroundColor, setBackgroundColor] = useState<string>("#EEEEEE");

  const onChangeSettings = () => {};

  const onModalClose = () => {
    if (isOpen) {
      onClose();
    }
  };

  const modalRef = useRef(null);
  useClickOutside(modalRef, onModalClose);

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabsConfigs = useMemo(() => {
    const tabKeys = sections || ["Camera", "Widgets", "Access"];

    const tabLabels = {
      Camera: {
        label: "Camera",
        description: "View and angles",
      },
      Widgets: {
        label: "Widgets",
        description: "Available tools",
      },
      Access: {
        label: "Access",
        description: "Access Settings",
      },
    };

    const indexesMap = tabKeys.reduce((acc, key, index) => {
      acc[key] = index;
      return acc;
    }, {} as Record<"Camera" | "Widgets" | "Access", number>);

    return {
      tabKeys,
      tabLabels,
      indexesMap,
    };
  }, [sections]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <ModalBox ref={modalRef}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              minHeight: 400,
              height: "max-content",
              gap: "10px",
            }}
          >
            <TabsBox>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: "divider" }}
              >
                {" "}
                {tabsConfigs.tabKeys.map((tabKey) => {
                  const label = tabsConfigs.tabLabels[tabKey];
                  console.log("label", label);

                  return (
                    <Tab
                      key={tabKey}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignContent: "center",
                            gap: "10px",
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: "27px",
                              minHeight: "27px",
                              borderRadius: "9px",
                              backgroundColor: "#2689FF",
                            }}
                          />

                          <Box
                            data-type="tab-content"
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Box>{tabsConfigs.tabLabels[tabKey].label}</Box>
                            <Box>
                              {tabsConfigs.tabLabels[tabKey].description}
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </TabsBox>

            <Divider orientation="vertical" flexItem />

            {tabsConfigs.tabKeys.includes("Camera") && (
              <TabPanel value={value} index={tabsConfigs.indexesMap["Camera"]}>
                <Paper
                  data-type="sec"
                  sx={{
                    minWidth: "500px",
                  }}
                >
                  <ProjectSettings />
                </Paper>
              </TabPanel>
            )}

            {tabsConfigs.tabKeys.includes("Widgets") && (
              <TabPanel value={value} index={tabsConfigs.indexesMap["Widgets"]}>
                <Paper
                  data-type="sec"
                  sx={{
                    minWidth: "500px",
                  }}
                >
                  <ProductsSetupPanel />
                </Paper>
              </TabPanel>
            )}

            {tabsConfigs.tabKeys.includes("Access") && (
              <TabPanel value={value} index={tabsConfigs.indexesMap["Access"]}>
                <Paper
                  data-type="sec"
                  sx={{
                    minWidth: "500px",
                  }}
                >
                  <TeamMembers />
                </Paper>
              </TabPanel>
            )}
          </Box>
        </ModalBox>
      </Box>
    </Modal>
  );
};

export const AccordionWrapper: React.FC<{
  children: React.ReactNode;
  title: string;
}> = ({ children, title }) => {
  return (
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
          <Typography>{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const TabsBox = styled(Box)`
  && {
    & .MuiTabs-root {
      min-width: 180px;
    }

    & .MuiTab-root {
      border-radius: 18px;
      display: flex;
      justify-content: flex-start;
      flex-direction: row;

      & *[data-type="tab-content"] {
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: flex-start;

        & > *:first-child {
          font-size: 12px;
          font-weight: 400;
          text-transform: none;
        }

        & > *:last-child {
          font-size: 9px;
          font-weight: 300;
          opacity: 0.5;
          text-transform: none;
        }
      }
    }

    & .MuiTab-root.Mui-selected {
      background-color: var(--paper-bg-color);
    }

    & .MuiTabs-indicator {
      display: none;
    }
  }
`;

export const AccordionBox = styled(Box)`
  background-color: var(--paper-bg-color);

  min-width: 400px;
  width: 100%;

  display: flex;
  flex-direction: column;
  border-radius: 18px;

  & .MuiAccordion-root {
    margin: 0 !important;
  }
`;

export const ModalBox = styled(Box)`
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--paper-bg-color);
    opacity: 0.5;
  }

  position: relative;
  backdrop-filter: blur(10px);

  padding: 9px;
  border-radius: 27px;
  overflow: hidden;
  margin: auto;

  display: flex;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Label = styled(Typography)`
  margin-bottom: 10px;
`;

export default SettingsModal;
