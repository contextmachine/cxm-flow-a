import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Paper } from "@mui/material";
import { Title, TitleWrapper } from "@/components/ui/scene/bar/bar.styled";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import styled from "styled-components";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import stc from "string-to-color";
import UserSettings from "./user-settings/user-settings";

const UserProfile = () => {
  const { authService, userMetadata } = useAuth();

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

  const [openSettings, setOpenSettings] = useState(false);

  if (!userMetadata) return null;

  return (
    <>
      <Paper
        sx={{
          backgroundColor: "transparent !important",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "9px",
            alignItems: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
          onClick={handleClick}
        >
          <AvatarCss color={stc(userMetadata.username)} />
          <TitleWrapper>
            <Title size="large">{userMetadata.username}</Title>
          </TitleWrapper>
          <ArrowIcon>
            <ArrowDropDownIcon sx={{ fontSize: 16 }} />
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
          <MenuItem
            sx={{ minWidth: "215px" }}
            onClick={() => setOpenSettings(true)}
          >
            Settings
          </MenuItem>

          <MenuItem sx={{ minWidth: "215px" }} onClick={handleSignOut}>
            Sign Out
          </MenuItem>
        </Menu>
      </Paper>

      <UserSettings
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    </>
  );
};

export const AvatarCss = styled.div<{
  color?: string;
}>`
  min-width: 36px;
  width: 36px;
  height: 100%;
  position: relative;
  border-radius: 13.5px;
  background-color: ${({ color }) => color || "#333"};
  height: 36px;
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
`;

export default UserProfile;
