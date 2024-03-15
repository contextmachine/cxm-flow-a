import { Box, Button, MenuItem } from "@mui/material";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import { Select } from "@mui/material";

interface MappingWidgetProps {
  isPreview?: boolean;
}

const MappingWidget: React.FC<MappingWidgetProps> = ({ isPreview }) => {
  return (
    <WidgetPaper isPreview={isPreview} title={"Change in values"}>
      <div style={{ display: "flex", columnGap: "5px", width: "100%", alignItems: 'center' }}>
        <Select
          sx={{ width: "100%" }}
          data-type="select"
          defaultValue={20}
          onChange={() => true}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>

        <Box
          sx={{
            minWidth: "18px",
            maxWidth: "18px",
            minHeight: "18px",
            maxHeight: "18px",
            backgroundImage: "url(/icons/arrow-right.svg)",
          }}
        />

        <Select
          sx={{ width: "100%" }}
          data-type="select"
          defaultValue={10}
          onChange={() => true}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </div>

      <Button
        color="primary"
        variant="contained"
        size="medium"
        sx={{ width: "100%", marginTop: "10px" }}
      >
        Add
      </Button>
    </WidgetPaper>
  );
};

export default MappingWidget;
