import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import {
  PointCloudFieldHandler,
  PointCloudFieldShape,
} from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import { Box, Button, MenuItem, Select, Slider } from "@mui/material";
import styled from "styled-components";

const OverallForm: React.FC<{
  extension: PointCloudExtension | null;
}> = ({ extension }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <ParamItem data-type="overall">
        <Box>Step between chains, mm</Box>
        <Box>
          <Slider
            data-type="params"
            value={3}
            step={0.1}
            min={0.1}
            max={5}
            size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      </ParamItem>

      <ParamItem data-type="overall">
        <Box>Step between pixels, mm</Box>
        <Box>
          <Slider
            data-type="params"
            value={3}
            step={0.1}
            min={0.1}
            max={5}
            size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      </ParamItem>

      <ParamItem data-type="overall">
        <Box>Transition Density</Box>
        <Box>
          <Slider
            data-type="params"
            value={2}
            step={0.1}
            min={0.1}
            max={5}
            size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      </ParamItem>
    </Box>
  );
};

const ParamItem = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;

  &[data-type="overall"] > div:first-child {
    width: 100%;
    max-width: 200px;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  & > div:first-child {
    width: 100%;
    max-width: 100px;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  & > div:last-child {
    width: 100%;
    display: flex;

    & > * {
      width: 100%;
    }
  }
`;

export default OverallForm;
