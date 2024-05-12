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

const PointCloudHandlerWidget: React.FC<{
  isPreview?: boolean;
}> = ({ isPreview }) => {
  const { sceneService } = useScene();
  const [extension, setExtension] = useState<PointCloudExtension | null>(null);
  const [points, setPoints] = useState<PointCloudFieldHandler[]>([]);

  useEffect(() => {
    const extension = sceneService.extensions.get(
      "PointCloudExtension"
    ) as PointCloudExtension;
    setExtension(extension);
  }, [sceneService]);

  useEffect(() => {
    if (extension) {
      extension.points$.subscribe((points) => {
        setPoints(Array.from(points.values()));
      });
    }
  }, [extension]);

  return (
    <WidgetPaper isPreview={isPreview} title={"Point Cloud Handler"}>
      <Wrapper>
        {points.map((point) => (
          <Accordion
            key={point.id}
            sx={{ display: "flex", flexDirection: "column" }}
            onMouseEnter={() => {
              extension?.hoverPoint(point.id);
            }}
            onMouseLeave={() => {
              extension?.hoverPoint(null);
            }}
          >
            <AccordionSummary
              expandIcon={
                <Button
                  color="secondary"
                  variant="contained"
                  size="medium"
                  sx={{
                    width: "100%",
                    marginTop: "10px",
                    border: "1px solid grey",
                  }}
                  onClick={() => {
                    extension?.enableTopView();
                  }}
                >
                  Edit
                </Button>
              }
            >
              <Typography>{point.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography gutterBottom>Width:</Typography>
              <Slider
                defaultValue={point.size[0]}
                step={0.1}
                min={0.1}
                max={5}
                size="small"
                valueLabelDisplay="auto"
                onChange={(e, value) => {
                  value = value as number;

                  extension?.updatePoint(point.id, {
                    size: [value, point.size[1]],
                  });
                }}
              />
              <Typography gutterBottom>Height:</Typography>
              <Slider
                defaultValue={point.size[1]}
                step={0.1}
                min={0.1}
                max={5}
                size="small"
                valueLabelDisplay="auto"
                onChange={(e, value) => {
                  value = value as number;

                  extension?.updatePoint(point.id, {
                    size: [point.size[0], value],
                  });
                }}
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

  && .MuiAccordion-root {
    &::before {
      display: none;
    }

    &.Mui-expanded {
      margin: 0;
    }

    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px !important;
  }

  & .Mui-expanded {
    transform: none !important;
  }
`;

export default PointCloudHandlerWidget;
