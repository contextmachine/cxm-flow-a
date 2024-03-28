import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { WorkspaceUserDto } from "@/components/services/workspace-service/workspace-service.types";
import {
  Box,
  Button,
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
import React from "react";

const RightBar = () => {
  const { workspaceService, activeWorkspaceUsers } = useWorkspace();
  const { userMetadata } = useAuth();

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
          sx={{ backgroundColor: "white !important" }}
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
          backgroundColor: "#EEEEEE",
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
                    {workspaceUser.user.username}{" "}
                    {userMetadata?.id === workspaceUser.user.id && <b>(You)</b>}
                  </Box>
                </Box>{" "}
                {false && (
                  <>
                    <Box
                      sx={{
                        padding: "2px 8px",
                        background: "lightgrey",
                        borderRadius: "4px",
                      }}
                    >
                      {workspaceUser.role.name}
                    </Box>
                  </>
                )}
                <UserRole
                  value={workspaceUser.role.id}
                  onChange={(role_id: number) =>
                    workspaceService.updateUserRole(
                      workspaceUser.user.id,
                      role_id
                    )
                  }
                />
              </Box>
            );
          })}
        </Box>

        <Box>
          <InviteForm />
        </Box>
      </Paper>

      <Button
        sx={{ backgroundColor: "white !important" }}
        variant="contained"
        color="secondary"
        size="large"
        onClick={workspaceService.deleteWorkspace}
      >
        Delete Workspace
      </Button>
    </>
  );
};

const UserRole: React.FC<{
  value: number;
  onChange: (role_id: number) => void;
}> = ({ value, onChange }) => {
  return (
    <Select
      value={value}
      data-type="role-badge"
      label="Age"
      variant="standard"
      onChange={(e) => {
        const role_id = e.target.value as number;

        onChange(role_id);
      }}
    >
      <MenuItem value={1}>Admin</MenuItem>
      <MenuItem value={2}>Editor</MenuItem>
      <MenuItem value={3}>Viewer</MenuItem>
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
