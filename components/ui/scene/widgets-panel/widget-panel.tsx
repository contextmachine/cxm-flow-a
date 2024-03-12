import styled from "styled-components";
import { Title } from "../bar/bar";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import MarkedIcon from "../../icons/marked-icon";
import { useState } from "react";
import { useStates } from "@/components/services/state-service/state-provider";
import WidgetPaper from "./blocks/widget-paper/widget-paper";
import ChartWidget from "./widgets/chart-widget";
import MappingWidget from "./widgets/mapping-widget";
import QueryWidget from "./widgets/query-widget";

const WidgetPanel = () => {
  const { isWidgetsOpen } = useStates();

  if (!isWidgetsOpen) return null;

  return (
    <Box sx={{ display: "flex", overflowY: "scroll" }}>
      <Wrapper>
        <Paper data-type="widget" sx={{ justifyContent: "space-between" }}>
          <ButtonGroup>
            <Button
              data-active="true"
              color="secondary"
              variant="contained"
              size="medium"
            >
              Toolbox
            </Button>
            <Button color="secondary" variant="contained" size="medium">
              Outliner
            </Button>
          </ButtonGroup>

          <ToolsGroup>
            <IconButton>
              <MarkedIcon />
            </IconButton>

            <Button
              color="primary"
              style={{
                maxWidth: "27px",
                minWidth: "27px",
                borderRadius: "50%",
                padding: "0px",
              }}
              variant="contained"
              size="medium"
            >
              +
            </Button>
          </ToolsGroup>
        </Paper>

        <ChartWidget />
        <MappingWidget />
        <QueryWidget />
      </Wrapper>
    </Box>
  );
};

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

const ToolsGroup = styled.div`
  display: flex;
  column-gap: 0px;
  align-items: center;
  height: 100%;

  column-gap: 5px;
`;

const Wrapper = styled.div`
  width: max-content;
  min-height: max-content;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  width: 100%;
`;

export default WidgetPanel;
