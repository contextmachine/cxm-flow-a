import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";

interface LoaderProps {
  message?: string;
}

// React component
const Loader = (props: LoaderProps) => {
  const message = props.message;
  return (
    <StyledSpinnerWrapper>
      <CircularProgress />
      {message}
    </StyledSpinnerWrapper>
  );
};

// Define a styled div for centering the spinner
const StyledSpinnerWrapper = styled.div`
  position: fixed;
  z-index: 9999;

  display: flex;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`;

export default Loader;
