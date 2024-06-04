import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Box, MenuItem, Paper, Select, Typography } from "@mui/material";
import React, { useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import styled from "styled-components";

const PointCloudHandlerSidebar: React.FC<{
  extension: ExtensionEntityInterface;
}> = () => {
  const [section, setSection] = useState<
    "density" | "cost" | "weight" | "capacity"
  >("density");

  const chartData = [
    { value: 0.5, color: "#b8f2e6", percentage: 45 },
    { value: 0.42, color: "#5f9ea0", percentage: 15 },
    { value: 0.37, color: "#20b2aa", percentage: 15 },
    { value: 0.3, color: "#008080", percentage: 25 },
  ];

  const total = chartData.reduce((sum, data) => sum + data.value, 0);
  let cumulativeValue = 0;

  return (
    <>
      <Box
        data-type="properties-panel"
        sx={{
          display: "flex",
          flexDirection: "column",
          pointerEvents: "all !important",
        }}
      >
        <WidgetPaper isPreview={false} title={"Key figures"}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
            }}
          >
            {[
              {
                value: 1933233178,
                suffix: "",
              },
              {
                value: 502,
                suffix: "consumption, kW",
              },
              {
                value: 697720,
                suffix: "number of pixels",
              },
            ].map((item, index) => (
              <KeyFigure key={index}>
                <Box
                  sx={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "flex-end",
                  }}
                >
                  <Box>{addCommasToNumber(item.value)}</Box>
                  <Box>{item.suffix}</Box>
                </Box>
              </KeyFigure>
            ))}
          </Box>
        </WidgetPaper>
      </Box>

      <Box
        data-type="properties-panel"
        sx={{
          display: "flex",
          flexDirection: "column",
          pointerEvents: "all !important",
        }}
      >
        <WidgetPaper isPreview={false} title={"Statistics visualization"}>
          <Select
            sx={{ width: "100%" }}
            data-type="select"
            value={section}
            onChange={(e) =>
              setSection(
                e.target.value as "density" | "cost" | "weight" | "capacity"
              )
            }
          >
            {[
              { id: "density", name: "Density" },
              { id: "cost", name: "Cost" },
              { id: "weight", name: "Weight" },
              { id: "capacity", name: "Capacity" },
            ].map((toolset, i) => (
              <MenuItem value={toolset.id} key={i}>
                {toolset.name}
              </MenuItem>
            ))}
          </Select>

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <ChartContainer>
              <svg
                width="100"
                height="100"
                viewBox="0 0 36 36"
                style={{ transform: "rotate(-90deg)" }}
              >
                {chartData.map((data, index) => {
                  const value = (data.value / total) * 100;
                  const startAngle = (cumulativeValue / total) * 100;
                  cumulativeValue += data.value;

                  return (
                    <circle
                      key={index}
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="transparent"
                      stroke={data.color}
                      strokeWidth="3"
                      strokeDasharray={`${value} ${100 - value}`}
                      strokeDashoffset={-startAngle}
                    />
                  );
                })}
              </svg>
              <Legend>
                {chartData.map((data, index) => (
                  <LegendItem key={index}>
                    <ColorBox color={data.color} />
                    <Box>{data.value} м</Box>
                    <Box sx={{ marginLeft: "auto" }}>{data.percentage}%</Box>
                  </LegendItem>
                ))}
              </Legend>
            </ChartContainer>
          </Box>
        </WidgetPaper>
      </Box>
    </>
  );
};

const addCommasToNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const KeyFigure = styled.div`
  display: flex;
  height: 38px;
  align-items: center;
  padding: 4.5px 9px;

  background-color: var(--select-bg-color);
  border-radius: 9px;

  display: flex;
  gap: 9px;

  & > div > div:first-child {
    font-size: 24px;
    line-height: 0.9;
  }
`;

const ChartContainer = styled(Box)`
  background-color: rgba(255, 255, 255, 0.02);
  padding: 16px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  color: white;
  width: 100%;
`;

const Legend = styled(Box)`
  margin-left: 16px;
`;

const LegendItem = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ColorBox = styled(Box)`
  width: 16px;
  height: 9px;
  background-color: ${({ color }: any) => color};
  margin-right: 8px;
`;

export default PointCloudHandlerSidebar;