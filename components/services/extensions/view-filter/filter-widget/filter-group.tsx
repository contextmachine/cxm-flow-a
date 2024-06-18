import React, { useEffect, useState } from "react";
import ViewFilterExtension, { FilterGroup } from "../view-filter-extension";
import styled from "styled-components";
import { IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import SelectWithSearch from "@/components/ui/shared/select-with-search";
import { useEntities, useSubscribe } from "@/src/hooks";
import FilterItemComponent from "./filter-item-component";
import ClearIcon from "@mui/icons-material/Clear";
import { getPropertyValues } from "./filter-condition";

interface FilterGroupProps {
  extension: ViewFilterExtension;
  filterItem: FilterGroup;
  parentGroup: FilterGroup | undefined;
}

const FilterGroupComponent: React.FC<FilterGroupProps> = (
  props: FilterGroupProps
) => {
  const { extension, filterItem, parentGroup } = props;

  const [groupType, setGroupType] = useState(filterItem.groupType);

  useEffect(() => {
    filterItem.groupType = groupType;
    extension.updateFilterGroup(parentGroup, filterItem);
  }, [groupType]);

  const properties = useSubscribe(extension.$properties, extension.properties);

  const [options, setOptions] = useState(
    [...properties.keys()].map((x) => ({ value: x }))
  );

  const [filterInput, setFilterInput] = useState<string>("");

  const entities = useEntities();
  const onSelectFilter = (option: { value: string }) => {
    const { type } = getPropertyValues([...entities.values()], option.value);

    extension.addCondition(filterItem, option.value, type);
    setFilterInput("");
  };

  return (
    <FilterGroupWrapper>
      <div className="header">
        <ToggleButtonGroup
          className="group-type"
          color="primary"
          size="small"
          value={groupType}
          exclusive
          onChange={(_, value) => setGroupType(value)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="any">Any</ToggleButton>
        </ToggleButtonGroup>
        {parentGroup === undefined && (
          <AddGroupButton>
            <button
              className="add-group-button"
              onClick={() => extension.addGroup(filterItem)}
            >
              + Add Group
            </button>
          </AddGroupButton>
        )}
        {parentGroup && (
          <RemoveGroupButton>
            <button
              className="remove-group-button"
              onClick={() =>
                extension.removeFilterItem(parentGroup, filterItem.id)
              }
            >
              <ClearIcon />
            </button>
          </RemoveGroupButton>
        )}
      </div>
      {[...filterItem.conditions.values()]
        .sort((a, b) => sortValue(a.type) - sortValue(b.type))
        .map((condition, i) => (
          <div key={condition.id}>
            <FilterItemComponent
              parentGroup={filterItem}
              filterItem={condition}
              extension={extension}
              index={i}
            />
          </div>
        ))}

      <SelectWithSearch
        options={options}
        placeholder="Add new condition"
        filterInput={filterInput}
        onSelect={onSelectFilter}
        setFilterInput={setFilterInput}
      />
    </FilterGroupWrapper>
  );
};

export default FilterGroupComponent;

const sortValue = (type: string) => {
  return type === "group" ? 0 : 1;
};

const r1 = 9;

const FilterGroupWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  padding: 3px;

  .header {
    display: flex;
    justify-content: space-between;
  }

  & > * {
    margin-bottom: 3px;
  }

  :last-child {
    margin-bottom: 0px;
  }

  .group-type {
    height: 20px;
    margin-bottom: 10px;

    :first-child {
      border-radius: ${r1}px 0px 0px ${r1}px;
    }

    :last-child {
      border-radius: 0px ${r1}px ${r1}px 0px;
    }
    & button {
      text-transform: capitalize;
    }
  }
`;

const AddGroupButton = styled.div`
  .add-group-button {
    height: 20px;
    background-color: #f3f3f3;
    border: 0px;
    padding: 0px 10px;
    border-radius: ${r1}px;
    cursor: pointer;
    &:hover {
      background-color: #dbdbdb;
    }
  }
`;

const RemoveGroupButton = styled.div`
  display: flex;
  .remove-group-button {
    height: 20px;
    width: 20px;
    background-color: #f3f3f3;
    border: none;
    border-radius: ${r1}px;
    display: flex;
    justify-content: center;
    justify-items: center;
    cursor: pointer;
    &:hover {
      background-color: #dbdbdb;
    }
    & > svg {
      align-self: center;
      width: 14px;
      height: 14px;
    }
  }
`;
