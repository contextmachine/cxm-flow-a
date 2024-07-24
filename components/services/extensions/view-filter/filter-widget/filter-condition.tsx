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
import { PlusIcon } from "@radix-ui/react-icons";
import ParamsIcon from "@/components/ui/icons/params-icon";
import CheckedIcon from "@/components/ui/icons/checked-icon";

interface FilterConditionProps {
  index: number;
  extension: ViewFilterExtension;
  filterItem: FilterCondition;
  parentGroup: FilterGroup;
}

const FilterConditionComponent: React.FC<FilterConditionProps> = (
  props: FilterConditionProps
) => {
  const { filterItem, extension, index, parentGroup } = props;
  const entities = useEntities();
  const [paramsOpen, setParamsOpen] = useState(false);

  const { type, values } = useMemo(() => {
    return getPropertyValues([...entities.values()], filterItem.key);
  }, [entities]);

  const onDelete = (id: string) => {
    extension.removeFilterItem(parentGroup, id);
  };

  const onEnable = () => {
    filterItem.enabled = !filterItem.enabled;
    extension.updateFilterCondition(filterItem);
  };

  return (
    <FilterConditionWrapper
      $color={pallete[index % pallete.length]}
      $paramsEnabled={true}
      $paramsOpen={paramsOpen}
    >
      <div className="first-line">
        <div className="label">
          <div className="marker">
            <span className="marker-tag" />
            <DeleteButton
              className="delete-button"
              onClick={() => onDelete(filterItem.id)}
            >
              <ClearIcon className="delete-icon" />
            </DeleteButton>
          </div>
          {filterItem.key}
        </div>
        <div className="button-block">
          <button
            className="params-button"
            onClick={() => setParamsOpen(!paramsOpen)}
          >
            <ParamsIcon />
          </button>
          <EnableButton $enabled={filterItem.enabled}>
            <button className="enable-button" onClick={() => onEnable()}>
              {!filterItem.enabled && <PlusIcon />}
              {filterItem.enabled && <CheckedIcon />}
            </button>
          </EnableButton>
        </div>
      </div>
      <div className="second-line">
        <div className="operator">
          <OperatorSelect
            filterItem={filterItem}
            extension={extension}
            propertyType={type}
          />
        </div>
        {type !== "string" && (
          <ValueInput
            filterItem={filterItem}
            extension={extension}
            type={type}
          />
        )}
        {type === "string" && (
          <MultipleValueInput
            valueOptions={values}
            filterItem={filterItem}
            extension={extension}
            type={type}
          />
        )}
      </div>
    </FilterConditionWrapper>
  );
};

export default FilterConditionComponent;

const EnableButton = styled.div<{ $enabled: boolean }>`
  button {
    border: 0px;
    display: flex;
    justify-content: center;
    width: 75px;
    color: ${({ $enabled }) =>
      $enabled ? "#FFFFFF" : "var(--main-text-color)"};
    background-color: ${({ $enabled }) =>
      $enabled
        ? "var(--button-primary-color)"
        : "var(--button-secondary-active-bg-color)"};
    height: 27px;
    border-radius: 9px;
    padding: 5px;
    align-items: center;
    gap: 5px;

    &:after {
      content: ${({ $enabled }) => ($enabled ? `"Enabled"` : `"Enable"`)};
    }
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: 0px;
`;

const FilterConditionWrapper = styled.div<{
  $color: string;
  $paramsEnabled: boolean;
  $paramsOpen: boolean;
}>`
  display: flex;
  justify-content: start;
  width: 100%;
  flex-direction: column;
  gap: 5px;
  border-radius: 9px;
  padding: 3px;
  background-color: ${({ $paramsOpen }) =>
    $paramsOpen ? "var(--main-bg-color)" : "transparent"};

  button {
    cursor: pointer;
  }

  &:hover .delete-button {
    display: flex;
  }

  .delete-button {
    display: none;
    height: 27px;
  }

  .first-line {
    height: 27px;
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .label {
      width: 100px;
      display: flex;
      flex-direction: row;
      align-items: center;

      .marker {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25px;
        margin-right: 2px;

        .marker-tag {
          background: ${({ $color }) => $color};
          border-radius: 3px;
          height: 6px;
          width: 6px;
        }
      }
    }
  }

  .second-line {
    display: ${({ $paramsOpen }) => ($paramsOpen ? "flex" : "none")};
    flex-direction: row;
  }

  .button-block {
    gap: 5px;
    display: flex;
    flex-direction: row;
  }

  .params-button {
    border: 0px;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    svg path {
      stroke: ${({ $paramsEnabled }) =>
        $paramsEnabled ? "#2689FF" : "#333333"};
    }
  }

  .delete-icon {
    width: 14px;
    height: 14px;
    justify-self: center;
    align-self: center;
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
