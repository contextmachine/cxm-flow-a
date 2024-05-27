import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import { OverallPointCloudField } from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import { Box, Slider } from "@mui/material";
import styled from "styled-components";

const OverallForm: React.FC<{
  extension: PointCloudExtension | null;
  data: OverallPointCloudField;
  disabled: boolean;
}> = ({ extension, data, disabled }) => {
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
        <Box>Min step</Box>
        <Box>
          <Slider
            disabled={disabled}
            data-type="params"
            value={data.min_step.value}
            step={data.min_step.step}
            min={data.min_step.min}
            max={data.min_step.max}
            onChange={(e, value) => {
              extension?.updateOverall("min_step", value as number);
            }}
            size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      </ParamItem>

      <ParamItem data-type="overall">
        <Box>Max step</Box>
        <Box>
          <Slider
            disabled={disabled}
            data-type="params"
            value={data.max_step.value}
            step={data.max_step.step}
            min={data.max_step.min}
            max={data.max_step.max}
            onChange={(e, value) => {
              extension?.updateOverall("max_step", value as number);
            }}
            size="small"
            valueLabelDisplay="auto"
          />
        </Box>
      </ParamItem>

      <ParamItem data-type="overall">
        <Box>Blur</Box>
        <Box>
          <Slider
            disabled={disabled}
            data-type="params"
            value={data.blur.value}
            step={data.blur.step}
            min={data.blur.min}
            max={data.blur.max}
            onChange={(e, value) => {
              extension?.updateOverall("blur", value as number);
            }}
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
