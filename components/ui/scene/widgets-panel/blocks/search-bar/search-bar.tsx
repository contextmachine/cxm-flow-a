import { Box, Button, InputBase, Paper } from "@mui/material";

const SearchBar: React.FC<{
  buttonLabel?: string;
}> = ({ buttonLabel }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        component="form"
        sx={{
          display: "flex",
          alignItems: "center",
          p: "0px !important",
        }}
      >
        <InputBase
          sx={{
            flex: 1,
            border: "1px solid #e0e0e0",
            borderRadius: "9px",
            height: "27px",
            fontSize: "12px",
            padding: "0 10px",
          }}
          placeholder=""
          inputProps={{ "aria-label": "search google maps" }}
        />

        <Button color="primary" variant="contained" size="medium">
          {buttonLabel || "Search"}
        </Button>
      </Paper>
    </Box>
  );
};

export default SearchBar;
