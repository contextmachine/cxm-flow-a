import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import { OverallPointCloudField } from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import { Box, Slider } from "@mui/material";
import styled from "styled-components";

const valueMap = {
  1: 0.9,
  2: 0.7,
  3: 0.55,
  4: 0.45,
  5: 0.4,
  7: 0.35,
  9: 0.3,
  11: 0.275,
  14: 0.25,
  17: 0.23,
  23: 0.2,
  30: 0.175,
  40: 0.15,
  60: 0.125,
  90: 0.1,
  175: 0.075,
  400: 0.05,
};

const valueKeys = Object.keys(valueMap).map(Number);

const getClosestValue = (value: number) => {
  return (valueMap as any)[value as any];
};

const OverallForm: React.FC<{
  extension: PointCloudExtension | null;
  data: OverallPointCloudField;
  disabled: boolean;
}> = ({ extension, data, disabled }) => {
  const handleSliderChange = (
    param: "min_step" | "max_step",
    value: number
  ) => {
    // const closestValue = getClosestValue(valueKeys[value]);

    const _value = valueKeys[value];
    extension?.updateOverall(param, value);
  };

  console.log("valueMap", valueMap);
  console.log(
    "valueKeys.indexOf(data.min_step.value)",
    valueKeys.indexOf(data.min_step.value)
  );
  console.log("data.min_step.value", data.min_step.value);

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
            value={valueKeys.indexOf(data.min_step.value)}
            step={1}
            min={0}
            max={valueKeys.length - 1}
            onChange={(e, value) =>
              handleSliderChange("min_step", value as number)
            }
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => (valueMap as any)[valueKeys[value]]}
          />
        </Box>
      </ParamItem>

      <ParamItem data-type="overall">
        <Box>Max step</Box>
        <Box>
          <Slider
            disabled={disabled}
            data-type="params"
            value={valueKeys.indexOf(data.max_step.value)}
            step={1}
            min={0}
            max={valueKeys.length - 1}
            onChange={(e, value) =>
              handleSliderChange("max_step", value as number)
            }
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => (valueMap as any)[valueKeys[value]]}
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
