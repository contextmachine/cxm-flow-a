import { Button, MenuItem, Select } from "@mui/material";
import WidgetPaper from "../blocks/widget-paper/widget-paper";

const MappingWidget = () => {
  return (
    <WidgetPaper title={"Change in values"}>
      <div style={{ display: "flex", columnGap: "5px", width: "100%" }}>
        <Select
          data-type="select"
          style={{ width: "100%" }}
          value={10}
          onChange={() => {}}
        >
          <MenuItem value={10}>Material</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>

        <Select
          data-type="select"
          style={{ width: "100%" }}
          value={10}
          onChange={() => {}}
        >
          <MenuItem value={10}>Wood</MenuItem>
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
