import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import {
  RoleTypes,
  WorkspaceUserDto,
} from "@/components/services/workspace-service/workspace-service.types";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { Title } from "../../scene/bar/bar.styled";
import MarkedIcon from "../../icons/marked-icon";
import { Ava, WidgetHeader } from "../styles/styles";
import stc from "string-to-color";
import { useAuth } from "@/components/services/auth-service/auth-provider";
import React, { useMemo } from "react";

const RightBar = () => {
  const { workspaceService, activeWorkspaceUsers, activeWorkspace } =
    useWorkspace();
  const { userMetadata } = useAuth();

  const currentUserRole = useMemo(
    () =>
      activeWorkspaceUsers.find((u) => u.user.id === userMetadata?.id)?.role
        ?.id,
    [activeWorkspaceUsers, userMetadata]
  );

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "9px",
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ backgroundColor: "2C2C2C" }}
        >
          Import
        </Button>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={workspaceService.addScene}
        >
          New project
        </Button>
      </Box>

      <Paper
        sx={{
          backgroundColor: "2c2c2c",
          padding: "18px !important",
          flexDirection: "column",
        }}
      >
        <b>Important notice</b>

        <Box sx={{ color: "#999999" }}>
          And Im still living in the shit, have you even managed to live a day
          at the bottom? So dont talk to me about spiritual values, give me a
          way out of poverty. But not like everyone else, I dont give a shit
          what my friends think, yeah. And you ask me why Im battlin, its either
          battlin rap or a noose round my neck.
        </Box>
      </Paper>

      <Paper
        sx={{
          flexDirection: "column",
        }}
      >
        <WidgetHeader>
          <IconButton>
            <MarkedIcon />
          </IconButton>

          <Title style={{ fontWeight: "500" }}>Workspace Users</Title>
        </WidgetHeader>

        <Box sx={{ color: "#999999" }}>
          {activeWorkspaceUsers.map((workspaceUser: WorkspaceUserDto, i) => {
            const isSelf = userMetadata?.id === workspaceUser.user.id;

            return (
              <Box
                sx={{
                  height: "33px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0px 5px",
                }}
                key={i}
              >
                <Box sx={{ display: "flex", gap: "9px", alignItems: "center" }}>
                  <Ava
                    color={stc(workspaceUser.user.username)}
                    data-userid={workspaceUser.user.id}
                    key={i}
                  />

                  <Box>
                    {workspaceUser.user.username} {isSelf && <b>(You)</b>}
                  </Box>
                </Box>{" "}
                <UserRole
                  isSelf={isSelf}
                  isDisabled={() => {
                    if (isSelf) {
                      // Check if there's only one admin in the workspace
                      const adminCount = activeWorkspaceUsers.filter(
                        (u) => u.role.id === RoleTypes.ADMIN
                      ).length;

                      const isCurrentUserTheOnlyAdmin =
                        adminCount === 1 &&
                        workspaceUser.role.id === RoleTypes.ADMIN;

                      // Disallow role change if the current user is not an admin
                      if (currentUserRole !== RoleTypes.ADMIN) return false;

                      // Disallow role change if the current user is the only admin
                      if (isCurrentUserTheOnlyAdmin) return true;
                    } else {
                      // Disallow role change if the current user is not an admin
                      if (currentUserRole !== RoleTypes.ADMIN) return true;
                    }

                    return false;
                  }}
                  value={workspaceUser.role.id}
                  onChange={(role_id: number) =>
                    workspaceService.updateUserRole(
                      workspaceUser.user.id,
                      role_id
                    )
                  }
                  onLeave={() =>
                    workspaceService.removeUserFromWorkspace(
                      workspaceUser.user.id
                    )
                  }
                />
              </Box>
            );
          })}
        </Box>

        {currentUserRole !== RoleTypes.VIEWER && (
          <Box>
            <InviteForm />
          </Box>
        )}
      </Paper>

      <Button
        sx={{ backgroundColor: "2C2C2C" }}
        variant="contained"
        color="secondary"
        size="large"

        onClick={workspaceService.deleteWorkspace}
      >
        <span style={{ color: "#ffffff" }}>Delete Workspace</span>
      </Button>
    </>
  );
};

const UserRole: React.FC<{
  value: number;
  onChange: (role_id: number) => void;
  onLeave: () => void;
  isDisabled: () => boolean;
  isSelf: boolean;
}> = ({ value, onChange, onLeave, isDisabled, isSelf }) => {
  const roles: any = {
    1: "Admin",
    2: "Editor",
    3: "Viewer",
  };

  if (isDisabled())
    return (
      <Box
        sx={{
          padding: "0 24px",
          border: "1px solid rgba(0,0,0,0)",
          borderRadius: "100px",
        }}
      >
        {roles[value]}
      </Box>
    );

  return (
    <Select
      disabled={isDisabled()}
      value={value}
      data-type="role-badge"
      label="Age"
      variant="standard"
      onChange={(e) => {
        if (e.target.value === "leave") {
          onLeave();
          return;
        }

        const role_id = e.target.value as number;

        onChange(role_id);
      }}
    >
      {Object.keys(roles)
        .filter((key) => {
          if (!isSelf) return true;

          if (isSelf) {
            return parseInt(key) === value;
          }
        })
        .map((key) => {
          return (
            <MenuItem key={key} value={key}>
              {roles[key]}
            </MenuItem>
          );
        })}
      <Divider />
      <MenuItem value={"leave"}>
        <span style={{ color: "#ffffff" }}>Leave</span>
      </MenuItem>
    </Select>
  );
};

const InviteForm = () => {
  const [isOpened, setIsOpened] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState("");

  const { workspaceService } = useWorkspace();

  const handleInviteUser = async () => {
    if (username) {
      try {
        await workspaceService.addUserToWorkspace(username);
        setError("");
      } catch (error: any) {
        setError(error.message);
      }
    } else {
      setError("Please enter a username");
    }

    setUsername("");
    setIsOpened(false);
  };

  return (
    <>
      {isOpened ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          <TextField
            value={username}
            placeholder="Enter email"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ width: "100%" }}
            onClick={handleInviteUser}
          >
            Invite
          </Button>
          {error && <Box>{error}</Box>}
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ width: "100%" }}
          onClick={() => setIsOpened(true)}
        >
          Invite user
        </Button>
      )}
    </>
  );
};

export default RightBar;
