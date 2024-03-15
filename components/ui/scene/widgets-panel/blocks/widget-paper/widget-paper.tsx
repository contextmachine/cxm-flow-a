import MarkedIcon from "@/components/ui/icons/marked-icon";
import { IconButton, Paper } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../../bar/bar.styled";
import { useStates } from "@/components/services/state-service/state-provider";
import { WidgetHandleIcon } from "@/components/ui/icons/handle-icon";

interface WidgetProps {
  children: React.ReactNode;
  title: string;
  isPreview?: boolean;
}

const WidgetPaper: React.FC<WidgetProps> = ({ children, title, isPreview }) => {
  const { isEditWidgetsOpen } = useStates();

  return (
    <Paper
      data-type="widget"
      style={{ flexDirection: "column", alignItems: "flex-start" }}
    >
      <WidgetHeader>
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
      </WidgetHeader>

      {children}
    </Paper>
  );
};

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

export default WidgetPaper;
