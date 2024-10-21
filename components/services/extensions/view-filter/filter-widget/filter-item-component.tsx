import React from "react";
import ViewFilterExtension, {
  FilterGroup,
  FilterItem,
} from "../view-filter-extension";
import styled from "styled-components";
import FilterGroupComponent from "./filter-group";
import FilterConditionComponent from "./filter-condition";

interface FilterItemComponentProps {
  extension: ViewFilterExtension;
  filterItem: FilterItem;
  index: number;
  parentGroup: FilterGroup | undefined;
}

const FilterItemComponent: React.FC<FilterItemComponentProps> = (
  props: FilterItemComponentProps
) => {
  const { filterItem, parentGroup } = props;

  return (
    <FilterItemWrapper>
      {filterItem.type === "group" && (
        <FilterGroupComponent
          extension={props.extension}
          filterItem={filterItem}
          parentGroup={parentGroup}
        ></FilterGroupComponent>
      )}

      {filterItem.type === "condition" && (
        <FilterConditionComponent
          index={props.index}
          extension={props.extension}
          filterItem={filterItem}
          parentGroup={parentGroup!}
        ></FilterConditionComponent>
      )}
    </FilterItemWrapper>
  );
};

export default FilterItemComponent;

const FilterItemWrapper = styled.div`
  width: 100%;
  display: flex;
`;
