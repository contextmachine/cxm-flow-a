import React, { useState } from "react";
import { Box, Button, Modal, Paper } from "@mui/material";
import AllProducts from "./blocks/all-products/all-products";
import Nav, { NavSectionValue } from "./blocks/nav/nav";
import RoleProducts from "./blocks/role-products/role-products";
import Output from "./blocks/output/output";

const ProductsSetupPanel = () => {
  const [section, setSection] = useState<NavSectionValue>("all");

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            overflow: "scroll",
          }}
        >
          <Nav section={section} setSection={setSection} />
        </Box>
        <Box
          sx={{ overflowY: "scroll", overflowX: "hidden", maxHeight: "400px" }}
        >
          {section === "all" && <AllProducts />}
          {section === "workspace" && <AllProducts workspace />}
          {section === "role" && <RoleProducts />}
          {section === "output" && <Output />}
        </Box>
      </Box>
    </>
  );
};

export default ProductsSetupPanel;
