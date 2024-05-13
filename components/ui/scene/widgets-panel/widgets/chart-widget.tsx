import WidgetPaper from "../blocks/widget-paper/widget-paper";
import React, { lazy } from "react";
import { Select, MenuItem, Box } from "@mui/material";
import styled from "styled-components";
//import { ResponsivePie } from "@nivo/pie";

const ResponsivePie: any = lazy(() =>
  import("@nivo/pie").then((a) => ({
    default: a.ResponsivePie,
  }))
);

interface ChartWidgetProps {
  isPreview?: boolean;
  extension: any;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ isPreview, extension }) => {
  return (
    <WidgetPaper isPreview={isPreview} title={"Data Visualisation"}>
      <Select
        sx={{ width: "144px" }}
        data-type="select"
        value={10}
        onChange={() => true}
      >
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>

      {!isPreview && (
        <Box
          sx={{
            width: "100%",
            minHeight: "250px",
            maxHeight: "250px",
            borderRadius: "9px",
          }}
        >
          <React.Suspense fallback={<div>Loading...</div>}>
            <ResponsivePie
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              defs={[
                {
                  id: "dots",
                  type: "patternDots",
                  background: "inherit",
                  color: "rgba(255, 255, 255, 0.3)",
                  size: 4,
                  padding: 1,
                  stagger: true,
                },
                {
                  id: "lines",
                  type: "patternLines",
                  background: "inherit",
                  color: "rgba(255, 255, 255, 0.3)",
                  rotation: -45,
                  lineWidth: 6,
                  spacing: 10,
                },
              ]}
              fill={[
                {
                  match: {
                    id: "ruby",
                  },
                  id: "dots",
                },
                {
                  match: {
                    id: "c",
                  },
                  id: "dots",
                },
                {
                  match: {
                    id: "go",
                  },
                  id: "dots",
                },
                {
                  match: {
                    id: "python",
                  },
                  id: "dots",
                },
                {
                  match: {
                    id: "scala",
                  },
                  id: "lines",
                },
                {
                  match: {
                    id: "lisp",
                  },
                  id: "lines",
                },
                {
                  match: {
                    id: "elixir",
                  },
                  id: "lines",
                },
                {
                  match: {
                    id: "javascript",
                  },
                  id: "lines",
                },
              ]}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: "#999",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#000",
                      },
                    },
                  ],
                },
              ]}
            />
          </React.Suspense>
        </Box>
      )}

      {
        // Preview
        isPreview && <PreviewThumb />
      }
    </WidgetPaper>
  );
};

const PreviewThumb = styled.div`
  width: 100%;
  padding-bottom: 56.5%;
  background-image: url("/icons/chart-preview.svg");
  background-size: cover;
`;

const data = [
  {
    id: "scala",
    label: "scala",
    value: 209,
    color: "hsl(50, 70%, 50%)",
  },
  {
    id: "go",
    label: "go",
    value: 528,
    color: "hsl(101, 70%, 50%)",
  },
  {
    id: "python",
    label: "python",
    value: 273,
    color: "hsl(119, 70%, 50%)",
  },
  {
    id: "hack",
    label: "hack",
    value: 128,
    color: "hsl(10, 70%, 50%)",
  },
  {
    id: "erlang",
    label: "erlang",
    value: 60,
    color: "hsl(254, 70%, 50%)",
  },
];

export default ChartWidget;
