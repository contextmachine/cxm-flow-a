import SelectWithSearch from "@/components/ui/shared/select-with-search";
import { useEntities } from "@/src/hooks";
import { Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ViewFilterExtension, { FilterItem } from "../view-filter-extension";
import { Entity } from "@/src/objects/entities/entity";

interface FilterSettingsProps {
  extension: ViewFilterExtension;
  filter: FilterItem;
}

const FilterSettings: React.FC<FilterSettingsProps> = (
  props: FilterSettingsProps
) => {
  const { filter, extension } = props;

  const [filterInput, setFilterInput] = useState(
    filter.condition.length > 0 ? filter.condition[0].value.toString() : ""
  );

  const entities = useEntities();

  const possibleValues = useMemo(() => {
    return getPropertyValues([...entities.values()], filter.key);
  }, [entities]);

  useEffect(() => {
    if (filterInput !== "") {
      filter.condition = [{ value: filterInput, operator: "EQUAL" }];
      extension.updateFilter(filter);
    } else {
      filter.condition = [];
      extension.updateFilter(filter);
    }
  }, [filterInput]);

  return (
    <ConditionWrapper>
      <Prefix> = </Prefix>
      <InputWrapper>
        <SelectWithSearch
          options={possibleValues.map((x) => ({ value: x }))}
          filterInput={filterInput}
          onSelect={(option) => {
            setFilterInput(option.value);
          }}
          setFilterInput={setFilterInput}
        />
      </InputWrapper>
    </ConditionWrapper>
  );
};

export default FilterSettings;

const ConditionWrapper = styled.div`
  display: flex;
  flex-direction: raw;
  width: 100%;
`;

const InputWrapper = styled.div`
  width: 100%;
`;

const Prefix = styled.div`
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: gray;
`;

const getPropertyValues = (entities: Entity[], propertyName: string) => {
  const values = new Set<string>();

  entities.forEach((x) => {
    const value = x.props?.get(propertyName);

    if (value && typeof value === "string") {
      values.add(value as string);
    }
  });

  return [...values];
};
