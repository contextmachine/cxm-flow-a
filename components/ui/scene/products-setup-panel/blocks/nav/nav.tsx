import { IconBullet } from "@/components/ui/catalog/left-bar/left-bar";
import { Box, Button } from "@mui/material";
import React, { useMemo } from "react";
import stc from "string-to-color";

const Nav: React.FC<{
  section: NavSectionValue;
  setSection: (section: NavSectionValue) => void;
}> = ({ section: currentSection, setSection }) => {
  const navSections = useMemo(
    () => [
      { value: "all", label: "All products" },
      { value: "role", label: "Role products" },
      { value: "workspace", label: "Workspace products" },
      { value: "output", label: "Final output" },
    ],
    []
  );

  return (
    <Box
      sx={{
        display: "flex",
        minWidth: "max-content",
      }}
    >
      {navSections.map(
        (section: { value: string; label: string }, i: number) => (
          <Box sx={{ width: "100%" }} key={i}>
            <Button
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                textTransform: "none",
                minWidth: "max-content",
              }}
              variant="contained"
              color="secondary"
              size="large"
              data-active={section.value === currentSection}
              onClick={() => setSection(section.value as NavSectionValue)}
              startIcon={<IconBullet color={stc(`${section.value}`)} />}
            >
              {section.label}
            </Button>
          </Box>
        )
      )}
    </Box>
  );
};

export type NavSectionValue = "all" | "workspace" | "role" | "output";

export default Nav;
