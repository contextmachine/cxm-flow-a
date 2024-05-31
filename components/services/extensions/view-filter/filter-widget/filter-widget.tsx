import styled from "styled-components";
import { ChangeEvent, useState } from "react";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import WidgetPaper from "@/components/ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import ViewFilterExtension from "../view-filter-extension";
import { useSubscribe } from "@/src/hooks";

import { IconButton, InputAdornment, InputBase } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

import FilterItemComponent from "./filtering-item";
import SelectWithSearch from "@/components/ui/shared/select-with-search";

interface ViewFilterWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const ViewFilterWidget: React.FC<ViewFilterWidgetProps> = ({
  isPreview,
  extension: ext,
}) => {
  const extension = ext as ViewFilterExtension;

  const properties = useSubscribe(extension.$properties, extension.properties);
  const filters = useSubscribe(extension.$filters, [
    ...extension.filters.values(),
  ]);

  const [options, setOptions] = useState(
    [...properties.keys()].map((x) => ({ value: x }))
  );

  const [filterInput, setFilterInput] = useState<string>("");

  const onSelectFilter = (option: { value: string }) => {
    extension.addFilter(option.value);
    setFilterInput("");
  };

  return (
    <WidgetPaper isPreview={isPreview} title={"View Filter"}>
      <FilterList>
        {filters.map((filter) => (
          <FilterItemComponent filter={filter} extension={extension} />
        ))}
      </FilterList>
      <SelectWithSearch
        options={options}
        filterInput={filterInput}
        onSelect={onSelectFilter}
        setFilterInput={setFilterInput}
      />
    </WidgetPaper>
  );
};

export default ViewFilterWidget;

const FilterList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
