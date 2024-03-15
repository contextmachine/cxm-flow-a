import { Box, Paper } from "@mui/material";
import BarTools from "./bar-tools/bar-tools";
import { CompanyAvatar, Title, TitleWrapper } from "./bar.styled";

const Bar = () => {
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
        <CompanyAvatar
          onClick={() => {
            window.location.href = "/";
          }}
        />

        <TitleWrapper>
          <Title size="large">Default title</Title>
        </TitleWrapper>
      </Box>

      <BarTools />
    </Paper>
  );
};

export default Bar;
