import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { Box, Button, IconButton, Paper } from "@mui/material";
import { Title } from "../../scene/bar/bar.styled";
import MarkedIcon from "../../icons/marked-icon";
import { WidgetHeader } from "../styles/styles";
import React from "react";
import TeamMembers from "../../scene/team-members/team-membets";

const RightBar = () => {
  const { workspaceService } = useWorkspace();

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "9px",
        }}
      >
        <Button variant="contained" color="secondary" size="large">
          Import
        </Button>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={workspaceService.addScene}
        >
          New scene
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

        <TeamMembers />
      </Paper>
    </>
  );
};

export default RightBar;
