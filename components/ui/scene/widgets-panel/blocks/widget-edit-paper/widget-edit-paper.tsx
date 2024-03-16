import MarkedIcon from "@/components/ui/icons/marked-icon";
import { Box, IconButton, Paper } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../../bar/bar.styled";
import { WidgetType } from "../../widgets/widget.types";
import Widget from "../../widgets/widget";
import { WidgetHandleIcon } from "@/components/ui/icons/handle-icon";

interface WidgetProps {
  type: WidgetType;
}

const WidgetEditPaper: React.FC<WidgetProps> = ({ type }) => {
  const title = Description[type].title;
  const description = Description[type].description;

  return (
    <Paper
      data-type="widget"
      style={{
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        padding: "18px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <WidgetHandleIcon />
        <Title size="large">{title}</Title>
      </Box>
      <Box sx={{ paddingRight: "18px" }}>{description}</Box>

      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Box
          sx={{
            transform: "scale(0.85)",
            position: "relative",
            top: "0px",
          }}
        >
          <Widget type={type} isPreview />
        </Box>
      </Box>
    </Paper>
  );
};

interface DescriptionProps {
  [key: string]: {
    title: string;
    description: string;
  };
}

const Description: DescriptionProps = {
  "mapping-widget": {
    title: "Mapping",
    description:
      "Allows you to visualise statistics on one or another attribute for a selected group of objects",
  },
  "query-widget": {
    title: "Query",
    description:
      "Allows you to visualise statistics on one or another attribute for a selected group of objects",
  },
  "chart-widget": {
    title: "Chart",
    description:
      "Allows you to visualise statistics on one or another attribute for a selected group of objects",
  },
  "statistics-widget": {
    title: "Statistics",
    description:
      "Allows you to visualise statistics on one or another attribute for a selected group of objects",
  },
};

export default WidgetEditPaper;
