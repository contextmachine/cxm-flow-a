import { Box } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../scene/bar/bar.styled";
import Link from "next/link";

const CatalogItem = () => {
  const handleNavigate = (e: any) => {
    e.preventDefault(); // Prevent default link behavior
    window.location.href = "/scene/1"; // Navigate with a full page reload
  };

  return (
    <Wrapper onClick={handleNavigate}>
      <Thumb />

      <Box
        sx={{
          display: "flex",
          columnGap: "18px",
          justifyContent: "space-between",
          width: "100%",
          padding: "0px 18px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Title size="large">sdfsdfsd</Title>
          <Title>Modified 12 hours ago</Title>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Ava color={"#91C8FA"} />
          <Ava color={"#C6BAF9"} />
          <Ava color={"#FBFD78"} />
          <Ava color={"#50A764"} />
        </Box>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 9px;
  position: relative;
  height: max-content;

  cursor: pointer;
`;

const Thumb = styled.div`
  width: 100%;
  padding-bottom: 50%;
  border-radius: 18px;
  background: white;
  position: relative;
`;

const Ava = styled.div<{
  color: string;
}>`
  min-width: 27px;
  max-width: 27px;
  min-height: 27px;
  max-height: 27px;

  border-radius: 50%;

  background-color: ${({ color }) => color};
  margin-left: -8px;
`;

export default CatalogItem;
