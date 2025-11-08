// Spinner.js
import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframe animation for the spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled component for the spinner circle
const SpinnerWrapper = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 6px solid #f3f3f3; /* Light background color */
  border-top: 6px solid #3498db; /* Spinner color */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Functional Spinner component
const Spinner = () => {
  return <SpinnerWrapper />;
};

export default Spinner;
