import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Box, MenuItem, Paper, Select, Typography } from "@mui/material";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import styled from "styled-components";
import { PCUserData } from "@/components/services/extension-service/extensions/point-cloud-extension/point-cloud-extension.types";
import PieChart, { rgbToHex } from "./blocks/pie-chart/pie-chart";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { DefaultObject } from "@/src/objects/entities/default-object";
import * as THREE from "three";
import useLegend from "./hooks/use-legend";
import { Checkbox, FormControlLabel } from "@mui/material";

const PointCloudHandlerSidebar: React.FC<{
  extension: ExtensionEntityInterface;
}> = ({ extension }) => {
  const [section, setSection] = useState<string>("");
  const viewer = useViewer();

  const [statistics, setStatistics] = useState<PCUserData | null>(null);
  const [isVisualizationEnabled, setIsVisualizationEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    const ps = extension.statistics$.subscribe((data: PCUserData | null) => {
      setStatistics(data);
    });

    return () => {
      ps.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (statistics) {
      setSection(Object.keys(statistics.bufferProperties)[0] || "");
    }
  }, [statistics]);

  const defaultColorMap = useRef<any>(new Map());

  useEffect(() => {
    if (!viewer || !statistics) return;

    defaultColorMap.current.clear();

    const entityControl = viewer.entityControl;
    const entities = Array.from(entityControl.entities.values());

    entities.forEach((entity) => {
      if (entity instanceof DefaultObject) {
        const objects = entity.objects;
        objects.forEach((object) => {
          if (object instanceof THREE.Points) {
            // Save default color map
            defaultColorMap.current.set(
              object.id,
              object.geometry.attributes.color
            );
          }
        });
      }
    });
  }, [viewer, statistics]);

  useEffect(() => {
    if (!viewer || !section.length || !statistics) return;

    const entityControl = viewer.entityControl;
    const entities = Array.from(entityControl.entities.values());

    entities.forEach((entity) => {
      if (entity instanceof DefaultObject) {
        const objects = entity.objects;
        objects.forEach((object) => {
          if (object instanceof THREE.Points) {
            const geometry = object.geometry as THREE.BufferGeometry;

            if (!isVisualizationEnabled) {
              geometry.attributes.color = defaultColorMap.current.get(
                object.id
              );
              geometry.attributes.color.needsUpdate = true; // Indicate that the color attribute needs an update
              return;
            } else {
              geometry.attributes.color = geometry.attributes[section];
              geometry.attributes.color.needsUpdate = true; // Indicate that the color attribute needs an update
            }
          }
        });
      }
    });

    viewer.updateViewer();
  }, [viewer, section, statistics, isVisualizationEnabled]);

  const legend = useLegend(section, statistics);

  if (!statistics) return null;

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
                value: statistics.properties.total_cost,
                suffix: "cost, RUB",
              },
              {
                value: statistics.properties.total_power,
                suffix: "consumption, kW",
              },
              {
                value: statistics.properties.total_count,
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
            onChange={(e) => setSection(e.target.value as string)}
          >
            {Object.keys(statistics.bufferProperties).map((toolset, i) => (
              <MenuItem value={toolset} key={i}>
                {toolset}
              </MenuItem>
            ))}
          </Select>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isVisualizationEnabled}
                onChange={(e) => setIsVisualizationEnabled(e.target.checked)}
              />
            }
            label="Enable"
          />

          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <ChartContainer>
              <PieChart
                data={statistics.bufferProperties[section]}
                key={section}
              />

              <Legend>
                {legend &&
                  legend.map((item: any, index) => {
                    const { valueRange, shareRange, colorRange } = item;

                    const colorStart = rgbToHex(
                      colorRange[0][0],
                      colorRange[0][1],
                      colorRange[0][2]
                    );

                    return (
                      <LegendItem key={index}>
                        <ColorBox color={colorStart} />
                        <Box sx={{ fontSize: "9px" }}>{valueRange}</Box>
                      </LegendItem>
                    );
                  })}
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
