import React, { useState, useRef, useEffect } from "react";
import { TextField, Typography, Box } from "@mui/material";
import styled from "styled-components";
import { Title, TitleWrapper } from "../../bar/bar.styled";

const EditableTitle: React.FC<{
  title: string;
  setTitle: (title: string) => void;
}> = ({ title, setTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [isEditing]);

  const handleTitleClick = () => {
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
        <Box>
          <TextField
            fullWidth
            variant="outlined"
            inputRef={inputRef}
            value={tempTitle || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyPress}
            autoComplete="off"
          />
        </Box>
      ) : (
        <TitleWrapper onClick={!isEditing ? handleTitleClick : undefined}>
          <Title size="large">{title}</Title>
        </TitleWrapper>
      )}
    </>
  );
};

export default EditableTitle;
