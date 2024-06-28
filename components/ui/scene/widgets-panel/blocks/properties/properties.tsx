import { Box, MenuItem, Paper, Select } from "@mui/material";
import { Title } from "../../../bar/bar.styled";
import { useStates } from "@/components/services/state-service/state-provider";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useToolset } from "@/components/services/toolset-service/toolset-provider";
import Sidebar from "../../sidebars/sidebar";

const Properties = () => {
  const { activeProducts, toolsetService } = useToolset();

  const productNames: string[] = useMemo(
    () => activeProducts.map((product) => product.name),
    [activeProducts]
  );

  return (
    <Box
      data-type="properties-panel"
      sx={{
        display: "flex",
        flexDirection: "column",
        pointerEvents: "none !important",
        gap: "7px",
      }}
    >
      {productNames.map((product) => (
        <Sidebar type={product as any} key={product} />
      ))}
    </Box>
  );
};

export default Properties;
