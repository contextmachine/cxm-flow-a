import { Box, Button, Paper } from "@mui/material";
import { CompanyAvatar, Title, TitleWrapper } from "../bar/bar.styled";

const BarUser = () => {
  return (
    <Paper sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Box
        sx={{
          display: "flex",
          columnGap: "9px",
          height: "100%",
          alignItems: "center",
        }}
      >
        <CompanyAvatar />

        <TitleWrapper>
          <Title>Slon Pomidorov</Title>
        </TitleWrapper>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          return;
        }}
      >
        Share
      </Button>
    </Paper>
  );
};

export default BarUser;
