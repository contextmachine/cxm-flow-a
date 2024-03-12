import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import WidgetPaper from "../blocks/widget-paper/widget-paper";
import React from "react";

const ChartWidget = () => {
  return (
    <WidgetPaper title={"Data Visualisation"}>
      <div
        style={{
          width: "100%",
          minHeight: "100px",
          marginTop: "10px",
          backgroundColor: "lightgrey",
          borderRadius: "9px",
        }}
      ></div>
    </WidgetPaper>
  );
};

const SelectDemo = () => (
  <Select.Root value="">
    <Select.Trigger className="SelectTrigger" aria-label="Food">
      <Select.Value placeholder="Select a fruit…" />
      <Select.Icon className="SelectIcon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="SelectContent">
        <Select.ScrollUpButton className="SelectScrollButton">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="SelectViewport">
          <Select.Group>
            <Select.Label className="SelectLabel">Fruits</Select.Label>
          </Select.Group>

          <Select.Separator className="SelectSeparator" />

          <Select.Group>
            <Select.Label className="SelectLabel">Vegetables</Select.Label>
          </Select.Group>

          <Select.Separator className="SelectSeparator" />

          <Select.Group>
            <Select.Label className="SelectLabel">Meat</Select.Label>
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className="SelectScrollButton">
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export default ChartWidget;
