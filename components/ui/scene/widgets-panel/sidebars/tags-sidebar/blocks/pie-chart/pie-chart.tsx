import { Chart } from "@antv/g2";
import { useEffect, useMemo, useRef } from "react";
import stc from "string-to-color";
import chroma from "chroma-js";
import { Box } from "@mui/material";

const PieChart: React.FC<{
  items: { name: string; value: number }[];
  options?: {
    legend?: {
      maxItems?: number;
    };
    maxHeight?: string;
  };
  type?: "pie" | "bar";
}> = ({ items, options, type }) => {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("type", type);

  const coordinate: any = useMemo(() => {
    if (type === "bar") {
      return { transform: [{ type: "transpose" }] };
    }

    return {
      type: "theta",
      innerRadius: 0.9,
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
      height: 300,
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
        maxHeight: maxHeight,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{ width: "100%", height: "100%", maxHeight: maxHeight }}
        ref={containerRef}
      />

      <Box
        sx={{
          display: "flex",
          rowGap: "7px",
          columnGap: "10px",
          flexWrap: "wrap",
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        {items
          .filter((_, i) => !legendMaxItems || i < legendMaxItems)
          .map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Box
                sx={{
                  minWidth: "25px",
                  maxWidth: "25px",
                  minHeight: "5px",
                  maxHeight: "5px",
                  background: stc(item.name),
                  borderRadius: "2px",
                }}
              />

              <Box sx={{}}>{item.name}</Box>
            </Box>
          ))}

        {legendMaxItems && items.length > legendMaxItems && (
          <Box sx={{ color: "#666" }}>and more...</Box>
        )}
      </Box>
    </Box>
  );
};

export default PieChart;
