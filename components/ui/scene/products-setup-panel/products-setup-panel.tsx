import React, { useState } from "react";
import { Box, Button, Modal, Paper } from "@mui/material";
import AllProducts from "./blocks/all-products/all-products";
import Nav, { NavSectionValue } from "./blocks/nav/nav";
import RoleProducts from "./blocks/role-products/role-products";
import Output from "./blocks/output/output";

const ProductsSetupPanel = () => {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<NavSectionValue>("all");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        sx={{ border: "1px solid rgba(0,0,0,0.1)" }}
        onClick={handleOpen}
      >
        Widgets
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: "400px",
              maxWidth: "800px",
              margin: "80px",
              display: "grid !important",
              gridTemplateColumns: "200px 1fr",
            }}
          >
            <Box>
              <Nav section={section} setSection={setSection} />
            </Box>
            <Box sx={{ overflowY: "scroll", overflowX: "hidden" }}>
              {section === "all" && <AllProducts />}
              {section === "workspace" && <AllProducts workspace />}
              {section === "role" && <RoleProducts />}
              {section === "output" && <Output />}
            </Box>
          </Paper>
        </Box>
      </Modal>
    </>
  );
};

export default ProductsSetupPanel;
