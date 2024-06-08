import { PCBufferValue } from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import styled from "styled-components";

const PieChart: React.FC<{
  data: PCBufferValue[];
}> = ({ data }) => {
  const chartContainerRef = useRef<any>(null);

  useEffect(() => {
    if (!data) return;
    if (!chartContainerRef.current) return;

    const loadChart = async () => {
      const { Chart } = require("@antv/g2");

      const chart = new Chart({
        container: chartContainerRef.current,
        autoFit: true,
        width: 220,
        height: 220,
      });

      const rgbToHex = (r: number, g: number, b: number) => {
        const componentToHex = (c: number) => {
          const hex = Math.round(c * 255).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
      };

      chart.options({
        type: "view",
        width: 220,
        height: 220,
        padding: 0,
        inset: 0,
        coordinate: { type: "theta", innerRadius: 0.9 },
        children: [
          {
            type: "interval",
            data: data.map((d, i) => ({
              name: `${i}`,
              value: d[1],
              color: rgbToHex(d[2][0], d[2][1], d[2][2]),
            })),
            encode: { y: "value", color: "name" },
            transform: [{ type: "stackY" }],
            scale: {
              color: {
                palette: data.map((d) => rgbToHex(d[2][0], d[2][1], d[2][2])),
              },
            },
            legend: false,
          },
        ],
      });

      chart.render();
    };

    loadChart();

    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = "";
      }
    };
  }, [data]);

  return (
    <Wrapper>
      <div ref={chartContainerRef}></div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  height: 220px;
`;

export default PieChart;
