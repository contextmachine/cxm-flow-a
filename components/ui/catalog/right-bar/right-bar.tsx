import { Box, Button, Paper } from "@mui/material";

const RightBar = () => {
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "9px",
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ backgroundColor: "white !important" }}
        >
          Import
        </Button>

        <Button variant="contained" color="primary" size="large">
          New project
        </Button>
      </Box>

      <Paper
        sx={{
          backgroundColor: "#EEEEEE",
          padding: "18px !important",
          flexDirection: "column",
        }}
      >
        <b>Important notice</b>

        <Box sx={{ color: "#999999" }}>
          And Im still living in the shit, have you even managed to live a day
          at the bottom? So dont talk to me about spiritual values, give me a
          way out of poverty. But not like everyone else, I dont give a shit
          what my friends think, yeah. And you ask me why Im battlin, its either
          battlin rap or a noose round my neck.
        </Box>
      </Paper>
    </>
  );
};

export default RightBar;
