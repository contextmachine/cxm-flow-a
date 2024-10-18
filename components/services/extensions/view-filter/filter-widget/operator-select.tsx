import { useClickOutside } from "@/src/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import ViewFilterExtension, {
  ConditionOperator,
  FilterCondition,
} from "../view-filter-extension";
import { PropertyType } from "./filter-condition";

export interface Option {
  value: ConditionOperator;
  label: string;
}

interface OperatorSelectProps {
  filterItem: FilterCondition;
  onOperatorChange: (e: Option) => void;
  propertyType: PropertyType;
}

const defaultOptions: Option[] = [
  ["EQUAL", "="],
  ["NOT_EQUAL", "≠"],
  ["GREATER_THAN", ">"],
  ["LESS_THAN", "<"],
].map(([value, label]) => ({ value: value as ConditionOperator, label }));

const OperatorSelect: React.FC<OperatorSelectProps> = (
  props: OperatorSelectProps
) => {
  const { filterItem, propertyType, onOperatorChange } = props;
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo(() => {
    if (propertyType !== "number") {
      return defaultOptions.filter(
        (x) => !["GREATER_THAN", "LESS_THAN"].includes(x.value)
      );
    } else {
      return defaultOptions;
    }
  }, [propertyType]);

  const [operator, setOperator] = useState(
    defaultOptions.find((x) => x.value === filterItem.operator)!
  );

  useEffect(() => {
    setOperator(defaultOptions.find((x) => x.value === filterItem.operator)!);
  }, [filterItem.operator]);

  const dropDownRef = useRef(null);
  useClickOutside(dropDownRef, () => setIsOpen(false));

  const handleOptionClick = (option: any) => {
    setIsOpen(false);
    setOperator(option);
    onOperatorChange(option);
  };

  return (
    <SelectWithSearchWrapper>
      <DropdownContainer ref={dropDownRef}>
        <div className="input-field" onClick={() => setIsOpen(!isOpen)}>
          {operator.label}
        </div>
        {isOpen && (
          <DropdownList>
            {options.map((option, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </DropdownContainer>
    </SelectWithSearchWrapper>
  );
};

export default OperatorSelect;

const SelectWithSearchWrapper = styled.div`
  font-size: 12px;
  width: 30px;
  margin-right: 6px;
  cursor: pointer;

  &:hover .input-field {
    background-color: var(--icon-button-hover-color);
  }

  .input-field {
    width: 100%;
    height: 25px;
    border-radius: 9px;
    justify-content: center;

    display: flex;
    align-items: center;

    .operator {
      width: 100%;
      justify-content: center;
      display: flex;
    }

    svg {
      visibility: hidden;
      fill: #b7b7b7;
    }
  }
`;

const DropdownContainer = styled.div`
  width: 100%;
  position: relative;
  display: inline-block;
`;

const DropdownList = styled.ul`
  z-index: 9999;
  position: absolute;
  top: 110%;
  left: 0;
  width: 150%;
  border-radius: 9px;
  background-color: var(--paper-bg-color);
  border: 1px solid var(--box-border-color);
  list-style-type: none;
  padding: 0;
  max-height: 200px;
  overflow: auto;
`;

const DropdownItem = styled.li`
  padding: 10px;
  margin: 2px;
  border-radius: 7px;

  cursor: pointer;

  &:hover {
    background-color: var(--icon-button-hover-color);
  }
`;
