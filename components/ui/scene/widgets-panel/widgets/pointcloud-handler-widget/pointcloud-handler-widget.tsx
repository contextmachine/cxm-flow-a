import { useEffect, useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import { Box, Button } from "@mui/material";
import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import { useScene } from "@/components/services/scene-service/scene-provider";
import { PointCloudFieldHandler } from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from "styled-components";
import PointDensityForm from "./blocks/point-density-form";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import OverallForm from "./blocks/overall-form copy";
import { ControlsViewState } from "@/src/viewer/camera-control.types";

const PointCloudHandlerWidget: React.FC<{
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}> = ({ isPreview, extension: ext }) => {
  const extension = ext as PointCloudExtension;

  const [points, setPoints] = useState<PointCloudFieldHandler[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    if (extension) {
      extension.points$.subscribe(
        (points: Map<string, PointCloudFieldHandler>) => {
          setPoints(Array.from(points.values()));
        }
      );
    }
  }, [extension]);

  const [cameraState, setCameraState] = useState<ControlsViewState | null>(
    null
  );

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (isExpanded) {
        if (cameraState === null) setCameraState(extension.getCameraState());

        setExpanded(panel);
        extension.enableTopView();
        extension.selectPoint(panel);
      } else {
        setExpanded(false);
        extension.selectPoint(null);
        extension.restoreCameraState(cameraState!);

        setCameraState(null);
      }
    };

  return (
    <WidgetPaper isPreview={isPreview} title={"Point density"}>
      <Wrapper>
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
                }}
              ></Box>
              <Typography>Basic values</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <OverallForm extension={extension} />
          </AccordionDetails>
        </Accordion>

        {points.map((point: PointCloudFieldHandler) => (
          <Accordion
            key={point.id}
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={expanded === point.id}
            onChange={handleChange(point.id)}
            onMouseEnter={() => {
              if (expanded && expanded !== point.id)
                extension.hoverPoint(point.id);
            }}
            onMouseLeave={() => {
              extension?.hoverPoint(null);
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box
                  sx={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(68, 68, 68, 1)",
                  }}
                ></Box>
                <Typography>{point.name}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <PointDensityForm point={point} extension={extension} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Wrapper>
    </WidgetPaper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;

  & > * {
    border-top: 1px solid var(--box-border-color);
  }

  && .MuiAccordion-root {
    &::before {
      display: none;
    }

    & {
      padding: 0 !important;
      border-radius: 0 !important;
    }

    & .MuiAccordionSummary-root {
      padding: 6px 0px;
    }

    & .MuiAccordionDetails-root {
      padding: 6px 0px;
    }

    &.Mui-expanded {
      margin: 0;
    }
  }
`;

export default PointCloudHandlerWidget;
