import styled from "styled-components";
import { useState } from "react";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import WidgetPaper from "@/components/ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import ViewFilterExtension from "../view-filter-extension";
import { useSubscribe } from "@/src/hooks";

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

  const currentScopeCount = useSubscribe(
    extension.$currentScopeCount,
    undefined
  );
  const childrenCount = useSubscribe(extension.$childrenCount, undefined);

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
      {currentScopeCount !== undefined && (
        <FilteredCountWrapper>
          <div>Available on current level:</div>
          <div>{currentScopeCount}</div>
        </FilteredCountWrapper>
      )}
      {childrenCount !== 0 ||
        (childrenCount !== undefined && (
          <ChildrenCountWrapper>
            <div>Children which fits condition:</div>
            <div>{childrenCount}</div>
          </ChildrenCountWrapper>
        ))}
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

const FilteredCountWrapper = styled.div`
  padding: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const ChildrenCountWrapper = styled.div`
  padding: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  div {
    color: #ff9a27 !important;
  }
`;
