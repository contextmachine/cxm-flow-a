import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";

// React component
const Loader = () => {
  return (
    <StyledSpinnerWrapper>
      <CircularProgress />
    </StyledSpinnerWrapper>
  );
};

// Define a styled div for centering the spinner
const StyledSpinnerWrapper = styled.div`
  position: fixed;
  z-index: 9999;

  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

export default Loader;
