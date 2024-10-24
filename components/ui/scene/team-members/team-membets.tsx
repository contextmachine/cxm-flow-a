import { useAuth } from "@/components/services/auth-service/auth-provider";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import {
  RoleTypes,
  WorkspaceUserDto,
} from "@/components/services/workspace-service/workspace-service.types";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useMemo } from "react";
import { Ava } from "../../catalog/styles/styles";
import stc from "string-to-color";
import ShareIcon from "@mui/icons-material/Share";
import CopyIcon from "@mui/icons-material/FileCopy";

const TeamMembers: React.FC<{
  mini?: boolean;
}> = ({ mini }) => {
  const { workspaceService, activeWorkspaceUsers } = useWorkspace();
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
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {!mini && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<ShareIcon />}
              onClick={() => {}}
            >
              Share workspace
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<CopyIcon />}
              data-active="true"
              onClick={() => {}}
            >
              Copy link
            </Button>
          </Box>
        )}

        {currentUserRole !== RoleTypes.VIEWER && !mini && (
          <Box
            sx={{
              marginBottom: "20px",
            }}
          >
            <InviteForm />
          </Box>
        )}

        {!mini && (
          <Box
            sx={{
              marginBottom: "10px",
            }}
          >
            Access settings
          </Box>
        )}

        <Box sx={{ color: "#999999" }}>
          {activeWorkspaceUsers.map(
            (workspaceUser: WorkspaceUserDto, i: number) => {
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
                  <Box
                    sx={{ display: "flex", gap: "9px", alignItems: "center" }}
                  >
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
                      if (mini) return true;

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
            }
          )}
        </Box>
      </Box>
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
        <span style={{ color: "#AA1A1A" }}>Leave</span>
      </MenuItem>
    </Select>
  );
};

const InviteForm = () => {
  const [isOpened, setIsOpened] = React.useState(true);
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
  };

  return (
    <>
      {isOpened ? (
        <Box sx={{ display: "flex", gap: "9px" }}>
          <TextField
            fullWidth
            sx={{ width: "100%" }}
            value={username}
            placeholder="Enter email"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ width: "100%", maxWidth: "max-content" }}
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

export default TeamMembers;
