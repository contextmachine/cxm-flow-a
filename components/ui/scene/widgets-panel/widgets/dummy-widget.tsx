import { Box, Button, MenuItem } from "@mui/material";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import { Select } from "@mui/material";

interface DummyWidgetProps {
  isPreview?: boolean;
  index?: number;
}

const DummyWidget: React.FC<DummyWidgetProps> = ({ isPreview, index }) => {
  return (
    <WidgetPaper isPreview={isPreview} title={`Product ${index}`}>
      <h1>Dummy Widget #{index}</h1>
    </WidgetPaper>
  );
};

export default DummyWidget;
