import { Chart } from "@antv/g2";
import { useEffect, useMemo, useRef } from "react";
import stc from "string-to-color";
import chroma from "chroma-js";
import { Box } from "@mui/material";
import styled from "styled-components";

const PieChart: React.FC<{
  items: { name: string; value: number }[];
  activeItems?: string[];
  options?: {
    legend?: {
      maxItems?: number;
    };
    onLegendClick?: (name: string) => void;
    maxHeight?: string;
  };
  type?: "pie" | "bar";
  content?: string | number;
}> = ({ items, activeItems, options, type, content }) => {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const coordinate: any = useMemo(() => {
    if (type === "bar") {
      return { transform: [{ type: "transpose" }] };
    }

    return {
      type: "theta",
      innerRadius: 0.7,
    };
  }, [type]);

  const encode: any = useMemo(() => {
    if (type === "bar") {
      return { x: "name", y: "value", color: "name" };
    }

    return { y: "value", color: "name" };
  }, [type]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy(); // Destroy the previous chart instance
    }

    const chart = new Chart({
      container: containerRef.current!,
      autoFit: true,
    });

    // Generate color palette
    const colorPalette = items.map((item) => {
      const color = stc(item.name);
      return chroma(color).hex(); // Convert to hex format
    });

    chart.options({
      type: "view",
      padding: 0,
      inset: 0,
      height: 240,
      coordinate,
      children: [
        {
          type: "interval",
          data: items,
          encode,
          transform: [{ type: "stackY" }],
          scale: {
            color: {
              palette: colorPalette as any,
            },
          },
          interaction: {
            legendFilter: false,
          },
        },
      ],
    });

    chart.render();
    chartRef.current = chart; // Keep a reference to the current chart instance

    return () => {
      chart.destroy(); // Cleanup the chart instance when the component unmounts or items change
    };
  }, [items, type]);

  const maxHeight = options?.maxHeight || "400px";
  const legendMaxItems = options?.legend?.maxItems;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        maxHeight: `${maxHeight}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxHeight: maxHeight,
          minHeight: 240,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: maxHeight,
            maxHeight: maxHeight,
            position: "absolute",
            pointerEvents: "none",
          }}
          ref={containerRef}
        />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {content}
          </Box>
          <Box>Total</Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          rowGap: "3px",
          columnGap: "5px",
          flexWrap: "wrap",
          marginTop: "30px",
          marginBottom: "20px",
        }}
      >
        {items
          .filter((_, i) => !legendMaxItems || i < legendMaxItems)
          .map((item, index) => (
            <LegendItemWrapper
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              data-active={activeItems?.includes(item.name)}
              onClick={() => options?.onLegendClick?.(item.name)}
            >
              <Box
                sx={{
                  minWidth: "8px",
                  maxWidth: "8px",
                  minHeight: "8px",
                  maxHeight: "8px",
                  background: stc(item.name),
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.3)",
                }}
              />

              <Box sx={{}}>{item.name}</Box>
              <Box sx={{ opacity: 0.5 }}>•</Box>
              <Box sx={{ opacity: 0.5 }}>{item.value}</Box>
            </LegendItemWrapper>
          ))}

        {legendMaxItems && items.length > legendMaxItems && (
          <Box sx={{ color: "#666" }}>and more...</Box>
        )}
      </Box>
    </Box>
  );
};

const LegendItemWrapper = styled(Box)`
  border-radius: 5px;
  padding: 2px 5px;

  &:hover {
    background: var(--button-secondary-hover-color);
    cursor: pointer;
  }

  &[data-active="true"] {
    background: var(--button-secondary-hover-color);
  }
`;

export default PieChart;
