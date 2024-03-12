import MarkedIcon from "@/components/ui/icons/marked-icon";
import { IconButton, Paper } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../../bar/bar";

interface WidgetProps {
  children: React.ReactNode;
  title: string;
}

const WidgetPaper: React.FC<WidgetProps> = ({ children, title }) => {
  return (
    <Paper
      data-type="widget"
      style={{ flexDirection: "column", alignItems: "flex-start" }}
    >
      <WidgetHeader>
        <IconButton>
          <MarkedIcon />
        </IconButton>

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
