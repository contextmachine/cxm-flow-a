import React, { useMemo, useState } from "react";
import ViewFilterExtension, {
  FilterCondition,
  FilterGroup,
} from "../view-filter-extension";
import styled from "styled-components";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import OperatorSelect from "@/components/services/extensions/view-filter/filter-widget/operator-select";
import ValueInput from "./value-input";
import { Entity } from "@/src/objects/entities/entity";
import { useEntities } from "@/src/hooks";
import MultipleValueInput from "./multiple-value-input";

interface FilterConditionProps {
  index: number;
  extension: ViewFilterExtension;
  filterItem: FilterCondition;
  parentGroup: FilterGroup;
}

const pallete = [
  "#f44336",
  "#2196f3",
  "#8bc34a",
  "#ff5722",
  "#e81e63",
  "#03a9f4",
  "#cddc39",
  "#795548",
  "#9c27b0",
  "#00bcd4",
  "#ffeb3b",
  "#9e9e9e",
  "#673ab7",
  "#009688",
  "#ffc107",
  "#607d8b",
  "#3f51b5",
  "#4caf50",
  "#ff9800",
  "#000000",
];
const FilterConditionComponent: React.FC<FilterConditionProps> = (
  props: FilterConditionProps
) => {
  const { filterItem, extension, index, parentGroup } = props;

  const onDelete = (id: string) => {
    extension.removeFilterItem(parentGroup, id);
  };

  const entities = useEntities();

  const { type, values } = useMemo(() => {
    return getPropertyValues([...entities.values()], filterItem.key);
  }, [entities]);

  return (
    <FilterConditionWrapper color={pallete[index % pallete.length]}>
      <div className="marker">
        <span className="marker-tag" />
        <IconButton
          className="delete-button"
          onClick={() => onDelete(filterItem.id)}
        >
          <ClearIcon className="delete-icon" />
        </IconButton>
      </div>
      <div className="label">{filterItem.key}</div>
      <div className="operator">
        <OperatorSelect
          filterItem={filterItem}
          extension={extension}
          propertyType={type}
        />
      </div>
      {type !== "string" && (
        <ValueInput filterItem={filterItem} extension={extension} type={type} />
      )}
      {type === "string" && (
        <MultipleValueInput
          valueOptions={values}
          filterItem={filterItem}
          extension={extension}
          type={type}
        />
      )}
    </FilterConditionWrapper>
  );
};

export default FilterConditionComponent;

const FilterConditionWrapper = styled.div<{ color: string }>`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  flex-direction: row;

  & .label {
    width: 100px;
  }

  & .marker {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    margin-right: 2px;

    & .marker-tag {
      background: ${({ color }) => color};
      border-radius: 3px;
      height: 6px;
      width: 6px;
    }

    & .delete-button {
      display: none;
      height: 20px;
    }

    & .delete-icon {
      width: 14px;
    }
  }

  &:hover .delete-button {
    display: block;
  }

  &:hover .marker-tag {
    display: none;
  }
`;

export type PropertyType = "string" | "number" | "boolean";
const allowedTypes = ["string", "number", "boolean"];

export const getPropertyValues = (
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
