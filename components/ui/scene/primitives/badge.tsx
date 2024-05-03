import { Box } from "@mui/material";
import React from "react";

const Badge: React.FC<{
  children: React.ReactNode;
  [key: string]: any;
}> = ({ children, ...rest }) => {
  return (
    <Box
      {...rest}
      sx={{
        display: "flex",
        columnGap: "3px",
        alignItems: "center",
        height: "21px",
        backgroundColor: "#F3F3F3",
        borderRadius: "9px",
        padding: "0 6px",
      }}
    >
      {children}
    </Box>
  );
};

export default Badge;
