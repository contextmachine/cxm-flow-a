import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { WorkspaceUserDto } from "@/components/services/workspace-service/workspace-service.types";
import { Box, Button, IconButton, Paper } from "@mui/material";
import { Title } from "../../scene/bar/bar.styled";
import MarkedIcon from "../../icons/marked-icon";
import { Ava, WidgetHeader } from "../styles/styles";
import stc from "string-to-color";
import { useAuth } from "@/components/services/auth-service/auth-provider";

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
                <Box
                  sx={{
                    padding: "2px 8px",
                    background: "lightgrey",
                    borderRadius: "4px",
                  }}
                >
                  {workspaceUser.role.name}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </>
  );
};

export default RightBar;
