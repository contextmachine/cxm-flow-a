import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Paper } from "@mui/material";
import { Title, TitleWrapper } from "@/components/ui/scene/bar/bar.styled";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styled from "styled-components";
import { useAuth } from "@/components/services/auth-service/auth-provider";

const UserProfile = () => {
  const { authService } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    authService.signOut();
  };

  return (
    <Paper sx={{ backgroundColor: "transparent" }}>
      <Box
        sx={{
          display: "flex",
          gap: "9px",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        <AvatarCss />
        <TitleWrapper>
          <Title size="large">Cucumber Pomidorov</Title>
        </TitleWrapper>
        <ArrowIcon>
          <ArrowDropDownIcon />
        </ArrowIcon>
      </Box>
      <Menu
        id="user-profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem sx={{ minWidth: "225px" }} onClick={handleSignOut}>
          Sign Out
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export const AvatarCss = styled.div`
  min-width: 36px;
  width: 36px;
  height: 100%;
  position: relative;
  border-radius: 13.5px;
  background-color: #333333;
  height: 36px;
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
`;

export default UserProfile;
