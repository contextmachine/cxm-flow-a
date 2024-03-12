import styled, { css } from "styled-components";
import { Box, Button, Paper } from "@mui/material";
import BarTools from "./bar-tools/bar-tools";

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
          <Title>Default title</Title>
        </TitleWrapper>
      </Box>

      <BarTools />
    </Paper>
  );
};

const TitleWrapper = styled.div`
  border: 1px solid transparent;
  display: flex;
  overflow: hidden;

  &:hover {
    border-color: #333333;
  }
`;

const AvatarCss = css`
  min-width: 36px;
  width: 36px;
  height: 100%;
  position: relative;
  margin-left: -4.5px;

  &&::before {
    content: "";
    display: block;
    position: absolute;
    width: 36px;
    height: 36px;
    transform: translateY(-4.5px);
    border-radius: 13.5px;
    background-color: #333333;
  }
`;

export const Title = styled.div<{
  size?: "small" | "medium" | "large";
}>`
  font-size: 12px;
  font-weight: 500;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ size }) => {
    if (size === "small") {
      return `
        font-size: 10px;
      `;
    }
    if (size === "medium") {
      return `
        font-size: 12px;
      `;
    }
    if (size === "large") {
      return `
        font-size: 15px;
      `;
    }
  }}
`;

const CompanyAvatar = styled.div`
  ${AvatarCss}
`;

export default Bar;
