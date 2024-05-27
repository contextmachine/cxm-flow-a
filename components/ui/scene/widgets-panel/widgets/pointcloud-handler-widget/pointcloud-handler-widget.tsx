import { useEffect, useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import { Box, Button } from "@mui/material";
import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import { useScene } from "@/components/services/scene-service/scene-provider";
import {
  OverallPointCloudField,
  PointCloudFieldHandler,
} from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";

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
import CircularProgress from "@mui/material/CircularProgress";

const PointCloudHandlerWidget: React.FC<{
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}> = ({ isPreview, extension: ext }) => {
  const extension = ext as PointCloudExtension;

  const [overall, setOverall] = useState<OverallPointCloudField | null>(null);
  const [points, setPoints] = useState<PointCloudFieldHandler[]>([]);

  const [expanded, setExpanded] = useState<string | false>(false);

  const [pendingRequest, setPendingRequest] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);

  useEffect(() => {
    if (extension) {
      const ps = extension.points$.subscribe(
        (points: Map<string, PointCloudFieldHandler>) => {
          setPoints(Array.from(points.values()));
        }
      );

      const os = extension.overall$.subscribe(
        (overall: OverallPointCloudField | null) => {
          setOverall(overall);
        }
      );

      const pr = extension.pendingRequest$.subscribe((pending: boolean) =>
        setPendingRequest(pending)
      );
      const prs = extension.pendingResponse$.subscribe((pending: boolean) =>
        setPendingResponse(pending)
      );

      const hus = extension.hasUpdated.subscribe((hasUpdated: boolean) =>
        setHasUpdated(hasUpdated)
      );

      return () => {
        ps.unsubscribe();
        os.unsubscribe();
        pr.unsubscribe();
        prs.unsubscribe();
        hus.unsubscribe();
      };
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
    <WidgetPaper
      isPreview={isPreview}
      actionPanel={
        <Box>
          <Button
            disabled={!hasUpdated || pendingRequest || pendingResponse}
            variant="contained"
            color="primary"
            onClick={() => extension.saveUpdates()}
          >
            {pendingRequest || pendingResponse ? (
              <CircularProgress size={16} />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      }
      title={"Point density"}
    >
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
            {overall && (
              <OverallForm
                disabled={pendingRequest || pendingResponse}
                extension={extension}
                data={overall}
              />
            )}
          </AccordionDetails>
        </Accordion>

        {points.map((point: PointCloudFieldHandler) => (
          <Accordion
            key={point.id}
            sx={{ display: "flex", flexDirection: "column" }}
            expanded={expanded === point.id}
            onChange={handleChange(point.id)}
            onMouseEnter={() => {
              if (expanded && expanded !== point.id) {
                extension.hoverPoint(point.id);
              }
            }}
            onMouseLeave={() => {
              if (expanded && expanded !== point.id) {
                extension.hoverPoint(null);
              }
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
                <Typography
                  sx={{
                    opacity: point.active ? 1 : 0.5,
                  }}
                >
                  {point.name}
                </Typography>

                {!point.active && (
                  <Box
                    sx={{
                      border: "1px solid var(--main-text-color)",
                      padding: "2px 5px",
                      borderRadius: "5px",
                      fontSize: "10px !important",
                      opacity: 0.5,
                    }}
                  >
                    Disabled
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <PointDensityForm
                disabled={pendingRequest || pendingResponse}
                point={point}
                extension={extension}
              />
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
