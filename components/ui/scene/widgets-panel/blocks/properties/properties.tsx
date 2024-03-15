import { Box, MenuItem, Paper, Select } from "@mui/material";
import { Title } from "../../../bar/bar.styled";
import { useStates } from "@/components/services/state-service/state-provider";
import React, { useEffect, useRef, useState } from "react";

const Properties = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const propertiesPanelRef = useRef(null);

  const properties = [
    "Material",
    "Installation date",
    "Status",
    "Category",
    "Zone",
    "Name",
    "Group",
  ];

  const { isPropertiesOpen, isEditWidgetsOpen, stateService } = useStates();

  useClickOutside(propertiesPanelRef, () => {
    if (!isDropdownOpen) {
      stateService.toogleProperties(false);
    }
  });

  if (!isPropertiesOpen || isEditWidgetsOpen) return null;

  return (
    <Box
      data-type="properties-panel"
      sx={{ display: "flex", flexDirection: "column" }}
      ref={propertiesPanelRef}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxHeight: "max-content",
          padding: "18px !important",
        }}
      >
        <Title>Selected object properties</Title>

        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            columnGap: "9px",
            rowGap: "4px",
            marginTop: "9px",
          }}
        >
          {properties.map((property, i) => (
            <React.Fragment key={i}>
              <Box>{property}</Box>

              <Box sx={{ display: "flex" }}>
                <Select
                  onOpen={() => setIsDropdownOpen(true)}
                  onClose={() => setIsDropdownOpen(false)}
                  sx={{ width: "100%" }}
                  data-type="select"
                  value={10}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

function useClickOutside(ref: any, callback: any) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

export default Properties;
