import MarkedIcon from "@/components/ui/icons/marked-icon";
import { Box, CircularProgress, IconButton, Paper } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../../bar/bar.styled";
import { useStates } from "@/components/services/state-service/state-provider";
import { WidgetHandleIcon } from "@/components/ui/icons/handle-icon";

interface WidgetProps {
  children: React.ReactNode;
  title: string;
  isPreview?: boolean;
  isLoading?: boolean;
  actionPanel?: React.ReactNode;
}

const WidgetPaper: React.FC<WidgetProps> = ({
  children,
  title,
  isPreview,
  isLoading,
  actionPanel,
}) => {
  const { isEditWidgetsOpen } = useStates();

  return (
    <Paper
      data-type="widget"
      style={{ flexDirection: "column", alignItems: "flex-start" }}
    >
      <WidgetHeader>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            columnGap: "10px",
          }}
        >
          {isEditWidgetsOpen && !isPreview ? (
            <IconButton>
              <WidgetHandleIcon />
            </IconButton>
          ) : (
            <IconButton>
              <MarkedIcon />
            </IconButton>
          )}

          <Title style={{ fontWeight: "500" }}>{title}</Title>
        </Box>

        {isLoading && <CircularProgress data-type="spinner" size={"small"} />}

        {actionPanel}
      </WidgetHeader>

      {children}
    </Paper>
  );
};

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  column-gap: 10px;

  justify-content: space-between;

  && *[data-type="spinner"] {
    width: 18px !important;
    height: 18px !important;

    &,
    & * {
      font-size: 12px !important;
    }
  }
`;

export default WidgetPaper;
