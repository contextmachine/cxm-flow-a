import SelectWithSearch from "@/components/ui/shared/select-with-search";
import { useEntities } from "@/src/hooks";
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

  const typeAndValues = useMemo(() => {
    return getPropertyValues([...entities.values()], filter.key);
  }, [entities]);

  useEffect(() => {
    if (filterInput !== "") {
      const value = parseValue(filterInput, typeAndValues.type);
      filter.condition = [{ value, operator: "EQUAL" }];
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
          options={typeAndValues.values.map((x) => ({ value: x }))}
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

type PropertyType = "string" | "number" | "boolean";
const allowedTypes = ["string", "number", "boolean"];

const getPropertyValues = (
  entities: Entity[],
  propertyName: string
): { type: PropertyType; values: string[] } => {
  const values = entities
    .filter((x) => x.props?.has(propertyName))
    .map((x) => x.props!.get(propertyName));

  console.log(values);

  const types = values.map((x) => typeof x);
  let valueList: string[] = [];

  let valueType: PropertyType = "string";

  if (values.length > 0) {
    const firstType = types[0];
    if (allowedTypes.includes(firstType)) {
      let allowedType = firstType as PropertyType;

      if (types.every((x) => types[0] === x)) {
        valueType = allowedType;
      }
    } else {
      valueType = "string";
    }
  }

  if (valueType === "string") {
    valueList = [...new Set(values.map((x) => x.toString()))];
  }

  return { type: valueType, values: valueList };
};

const parseValue = (input: string, type: PropertyType) => {
  switch (type) {
    case "string":
      return input;
    case "number":
      return parseFloat(input);
    case "boolean":
      const x = input.toLowerCase();
      return x === "true" ? true : x === "false" ? false : input;
  }
};
