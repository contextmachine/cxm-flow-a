import { Box } from "@mui/material";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import { Title } from "../../bar/bar.styled";
import styled from "styled-components";

interface StatisticsWidgetProps {
  isPreview?: boolean;
}

const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({ isPreview }) => {
  return (
    <WidgetPaper isPreview={isPreview} title={"Sample size"}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          columnGap: "9px",
          alignItems: "flex-end",
        }}
      >
        <Title size="large-number">245,932</Title>
        <Title size="large" style={{ paddingBottom: "2px" }}>
          Object selected
        </Title>
      </Box>

      <Line>
        <Box />
        <Box />
        <Box />
      </Line>
    </WidgetPaper>
  );
};

const Line = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 9px;
  height: 6px;
  marginbottom: 9px;
  overflow: hidden;

  display: flex;

  & > * {
    width: 100%;
    height: 100%;

    &:nth-child(1) {
      background-color: #91c8fa;
    }

    &:nth-child(2) {
      background-color: #50a764;
    }

    &:nth-child(3) {
      background-color: #c6baf9;
    }
  }
`;

export default StatisticsWidget;
