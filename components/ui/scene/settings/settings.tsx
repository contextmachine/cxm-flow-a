// ModalComponent.tsx
import React, { useState } from "react";
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
} from "@mui/material";
import styled from "styled-components";
import TabPanel from "./blocks/tab-panel";
import OpenFolderIcon from "../../icons/open-folder-icon";
import { ParamItem } from "../widgets-panel/widgets/pointcloud-handler-widget/blocks/overall-form copy";

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [value, setValue] = useState(0);
  const [cameraAngle, setCameraAngle] = useState<number>(75);
  const [zoom, setZoom] = useState<number>(1);
  const [distance, setDistance] = useState<number>(100);
  const [size, setSize] = useState<number[]>([100, 900]);
  const [mean, setMean] = useState<number>(100);
  const [deviation, setDeviation] = useState<number>(100);
  const [backgroundColor, setBackgroundColor] = useState<string>("#EEEEEE");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
        <ModalBox>
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
                <Tab
                  label={
                    <Box
                      data-type="tab-content"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box>Camera</Box>
                      <Box>View and angles</Box>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box
                      data-type="tab-content"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box>Widgets</Box>
                      <Box>Available tools</Box>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box
                      data-type="tab-content"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box>Access</Box>
                      <Box>Access Settings</Box>
                    </Box>
                  }
                />
              </Tabs>
            </TabsBox>

            <Divider orientation="vertical" flexItem />

            <TabPanel value={value} index={0}>
              <AccordionBox>
                <AccordionWrapper title={"Scene properties"}>
                  <ParamItem data-type="overall">
                    <Box>Background</Box>
                    <Box>
                      <TextField
                        fullWidth
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                    </Box>
                  </ParamItem>
                </AccordionWrapper>

                <AccordionWrapper title={"Camera properties"}>
                  <ParamItem data-type="overall">
                    <Box>Camera angle</Box>
                    <Box>
                      <TextField
                        fullWidth
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                    </Box>
                  </ParamItem>

                  <ParamItem data-type="overall">
                    <Box>Zoom</Box>
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                      />
                    </Box>
                  </ParamItem>

                  <ParamItem data-type="overall">
                    <Box>Distance</Box>
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                      />
                    </Box>
                  </ParamItem>
                </AccordionWrapper>

                <AccordionWrapper title={"Label properties"}>
                  <ParamItem data-type="overall">
                    <Box>Size</Box>
                    <Box>
                      <Slider
                        data-type="params"
                        value={2}
                        step={1}
                        min={1}
                        max={8}
                        onChange={(e, value) => {}}
                        size="small"
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </ParamItem>

                  <ParamItem data-type="overall">
                    <Box>Average</Box>
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={cameraAngle}
                        onChange={(e) => setCameraAngle(Number(e.target.value))}
                      />
                    </Box>
                  </ParamItem>

                  <ParamItem data-type="overall">
                    <Box>Deviation</Box>
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={cameraAngle}
                        onChange={(e) => setCameraAngle(Number(e.target.value))}
                      />
                    </Box>
                  </ParamItem>
                </AccordionWrapper>

                <Button
                  sx={{
                    margin: "10px",
                  }}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </AccordionBox>
            </TabPanel>
          </Box>
        </ModalBox>
      </Box>
    </Modal>
  );
};

const AccordionWrapper: React.FC<{
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

const TabsBox = styled(Box)`
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

const AccordionBox = styled(Box)`
  background-color: var(--paper-bg-color);

  min-width: 300px;

  display: flex;
  flex-direction: column;
  border-radius: 18px;

  & .MuiAccordion-root {
    margin: 0 !important;
  }
`;

const ModalBox = styled(Box)`
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
