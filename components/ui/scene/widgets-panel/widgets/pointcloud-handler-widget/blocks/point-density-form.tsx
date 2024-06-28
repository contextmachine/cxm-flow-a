import PointCloudExtension from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension";
import {
  PointCloudFieldHandler,
  PointCloudFieldShape,
} from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import { Box, Button, MenuItem, Select, Slider } from "@mui/material";
import styled from "styled-components";

const PointDensityForm: React.FC<{
  point: PointCloudFieldHandler;
  extension: PointCloudExtension | null;
  disabled: boolean;
}> = ({ point, extension, disabled }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <ParamItem>
        <Box>Shape</Box>
        <Box>
          <Select
            disabled={disabled}
            sx={{ width: "144px" }}
            data-type="select"
            value={point.shape}
            onChange={(e, value) => {
              value = e.target.value as PointCloudFieldShape;

              extension?.updatePoint(point.id, {
                shape: value as PointCloudFieldShape,
              });
            }}
          >
            <MenuItem value={"rectangle"}>Rectangle</MenuItem>
            <MenuItem value={"ellipse"}>Circle</MenuItem>
          </Select>
        </Box>
      </ParamItem>

      {point.shape === "rectangle" && (
        <>
          <ParamItem>
            <Box>Width</Box>
            <Box>
              <Slider
                disabled={disabled}
                data-type="params"
                value={point.size[0]}
                step={0.1}
                min={0.1}
                max={15}
                size="small"
                valueLabelDisplay="auto"
                onChange={(e, value) => {
                  value = value as number;

                  extension?.updatePoint(point.id, {
                    size: [value, point.size[1]],
                  });
                }}
              />
            </Box>
          </ParamItem>

          <ParamItem>
            <Box>Height</Box>
            <Box>
              <Slider
                disabled={disabled}
                data-type="params"
                value={point.size[1]}
                step={0.1}
                min={0.1}
                max={15}
                size="small"
                valueLabelDisplay="auto"
                onChange={(e, value) => {
                  value = value as number;

                  extension?.updatePoint(point.id, {
                    size: [point.size[0], value],
                  });
                }}
              />
            </Box>
          </ParamItem>
        </>
      )}

      {point.shape === "ellipse" && (
        <ParamItem>
          <Box>Radius</Box>
          <Box>
            <Slider
              disabled={disabled}
              data-type="params"
              value={point.size[0]}
              step={0.1}
              min={0.1}
              max={15}
              size="small"
              valueLabelDisplay="auto"
              onChange={(e, value) => {
                value = value as number;

                extension?.updatePoint(point.id, {
                  size: [value, value],
                });
              }}
            />
          </Box>
        </ParamItem>
      )}

      <Button
        disabled={disabled}
        sx={{ marginTop: "6px !important" }}
        variant="contained"
        color="secondary"
        onClick={() =>
          extension?.updatePoint(point.id, { active: !point.active })
        }
      >
        <span style={{ color: "var(--main-text-color)" }}>
          {point.active ? "Disable" : "Enable"}
        </span>
      </Button>
    </Box>
  );
};

const ParamItem = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;

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

export default PointDensityForm;
