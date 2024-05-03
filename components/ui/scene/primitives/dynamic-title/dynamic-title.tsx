import React, { useState, useRef, useEffect } from "react";
import { TextField, Typography, Box } from "@mui/material";
import styled from "styled-components";
import { Title, TitleWrapper } from "../../bar/bar.styled";

const EditableTitle: React.FC<{
  title: string;
  setTitle: (title: string) => void;
  size: "small" | "medium" | "large";
}> = ({ title, setTitle, size }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [isEditing]);

  const handleTitleClick = (e: any) => {
    e.stopPropagation();

    setIsEditing(true);
  };

  const handleInputChange = (e: any) => {
    setTempTitle(e.target.value);
  };

  const handleInputBlur = () => {
    setTitle(tempTitle);
    setIsEditing(false);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      setTitle(tempTitle);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef?.current?.focus();
    }
  }, [isEditing]);

  return (
    <>
      {isEditing ? (
        <Wrapper size={size}>
          <TextField
            variant="outlined"
            inputRef={inputRef}
            value={tempTitle || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyPress}
            autoComplete="off"
          />
        </Wrapper>
      ) : (
        <TitleWrapper onClick={!isEditing ? handleTitleClick : undefined}>
          <Title size={size || "large"}>{title}</Title>
        </TitleWrapper>
      )}
    </>
  );
};
const Wrapper = styled.div<{
  size?: "small" | "medium" | "large" | "large-number";
}>`
  && {
    & .MuiInputBase-input {
      height: max-content;
      max-width: max-content;

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
        if (size === "large-number") {
          return `
            font-size: 24px;
          `;
        }
      }}
`;

export default EditableTitle;
