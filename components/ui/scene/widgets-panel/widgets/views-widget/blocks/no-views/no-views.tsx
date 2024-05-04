import { Box } from "@mui/material";

const NoViews = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100px",
          border: "1px dashed rgba(0,0,0,0.1)",
          borderRadius: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: "grey" }}>No views found</span>
      </Box>
    </Box>
  );
};

export default NoViews;
