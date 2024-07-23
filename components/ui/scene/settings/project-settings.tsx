// ModalComponent.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import OpenFolderIcon from "../../icons/open-folder-icon";
import { ParamItem } from "../widgets-panel/widgets/pointcloud-handler-widget/blocks/overall-form copy";
import { AccordionBox } from "./settings";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import useForm from "@/src/hooks/useForm";

const ProjectSettings: React.FC<{}> = (props) => {
  const viewer = useViewer();

  const { formState, updateField, updatedField } = useForm(
    viewer.projectSettingsService.settings
  );

  useEffect(() => {
    viewer.projectSettingsService.updateProjectSettings(formState);
  }, [formState, updatedField]);

  return (
    <>
      <AccordionBox>
        <AccordionWrapper title={"Scene properties"}>
          <ParamItem data-type="overall">
            <Box>Background</Box>
            <Box>
              <TextField
                fullWidth
                value={formState.background_color}
                onChange={(e) =>
                  updateField("background_color", e.target.value)
                }
              />
            </Box>
          </ParamItem>
        </AccordionWrapper>

        <AccordionWrapper title={"Camera properties"}>
          <ParamItem data-type="overall">
            <Box>Camera angle</Box>
            <Box>
              <Slider
                data-type="params"
                value={formState.camera_fov}
                step={1}
                min={1}
                max={180}
                onChange={(e, value) => {
                  updateField("camera_fov", value);
                }}
                size="small"
                valueLabelDisplay="auto"
              />
            </Box>
          </ParamItem>

          <ParamItem data-type="overall">
            <Box>Camera Near</Box>
            <Box>
              <TextField
                fullWidth
                type="number"
                value={formState.camera_near}
                onChange={(e) =>
                  updateField("camera_near", parseFloat(e.target.value))
                }
              />
            </Box>
          </ParamItem>

          <ParamItem data-type="overall">
            <Box>Camera Far</Box>
            <Box>
              <TextField
                fullWidth
                type="number"
                value={formState.camera_far}
                onChange={(e) =>
                  updateField("camera_far", parseFloat(e.target.value))
                }
              />
            </Box>
          </ParamItem>
        </AccordionWrapper>

        {/* <AccordionWrapper title={"Label properties"}>
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
                            onChange={(e) =>
                              setCameraAngle(Number(e.target.value))
                            }
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
                            onChange={(e) =>
                              setCameraAngle(Number(e.target.value))
                            }
                          />
                        </Box>
                      </ParamItem>
                    </AccordionWrapper> */}
      </AccordionBox>
    </>
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

export default ProjectSettings;
