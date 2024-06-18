import { useClickOutside } from "@/src/hooks";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ViewFilterExtension, { FilterCondition } from "../view-filter-extension";
import { PropertyType } from "./filter-condition";

interface ValueInputProps {
  filterItem: FilterCondition;
  extension: ViewFilterExtension;
  type: PropertyType;
}

const ValueInput: React.FC<ValueInputProps> = (props: ValueInputProps) => {
  const { filterItem, extension, type } = props;
  const dropDownRef = useRef(null);

  const [filterInput, setFilterInput] = useState(
    filterItem.value ? filterItem.value.toString() : ""
  );

  useEffect(() => {
    const value = parseValue(filterInput, type);
    filterItem.value = value as any;
    extension.updateFilterCondition(filterItem);
  }, [filterInput]);

  return (
    <SelectWithSearchWrapper>
      <DropdownContainer ref={dropDownRef}>
        <div className="input-field">
          <input
            className="value-input"
            value={filterInput}
            placeholder="Value"
            onChange={(e) => setFilterInput(e.target.value)}
          />
        </div>
      </DropdownContainer>
    </SelectWithSearchWrapper>
  );
};

export default ValueInput;

const SelectWithSearchWrapper = styled.div`
  width: 150px;
  font-size: 12px;
  height: 100%;

  .input-field {
    width: 100%;
    height: 25px;
    display: flex;
    justify-content: center;

    border: 1px solid #e0e0e0;
    border-radius: 9px;
    padding: 0 10px;

    .value-input {
      border: 0px;
      background-color: white;
      &:focus-visible {
        outline: -webkit-focus-ring-color auto 0px;
      }
    }

    .end-icon {
      padding: 0px;

      svg {
        fill: #e0e0e0;
      }
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
  width: 100%;
  border-radius: 9px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
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
    background-color: #e0e0e0;
  }
`;

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
