import { useClickOutside } from "@/src/hooks";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ViewFilterExtension, { FilterCondition } from "../view-filter-extension";
import { PropertyType } from "./filter-condition";
import ClearIcon from "@mui/icons-material/Clear";

interface MultipleValueInputProps {
  filterItem: FilterCondition;
  extension: ViewFilterExtension;
  valueOptions: string[];
  type: PropertyType;
}

const MultipleValueInput: React.FC<MultipleValueInputProps> = (
  props: MultipleValueInputProps
) => {
  const { filterItem, extension, valueOptions, type } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef(null);

  const [values, setValues] = useState(
    filterItem.valueType === "string" ? (filterItem.value as string[]) : []
  );

  const [filterInput, setFilterInput] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(valueOptions);

  const handleClose = () => {
    const value = parseValue(filterInput, type);
    console.log("value: ", value);
    addValueToValueList(value as string);

    setFilterInput("");
    if (isOpen) {
      setIsOpen(false);
    }
  };
  useClickOutside(dropDownRef, () => handleClose());

  useEffect(() => {
    filterItem.value = values;
    extension.updateFilterCondition(filterItem);
  }, [values]);

  useEffect(() => {
    const onKeyPressed = (e: KeyboardEvent): void => {
      if (e.key === "Enter" || e.key === "Esc") {
        handleClose();
      }
    };

    document.addEventListener("keydown", onKeyPressed);
    return () => {
      document.removeEventListener("keydown", onKeyPressed);
    };
  });

  useEffect(() => {
    setFilteredOptions(
      valueOptions
        .filter((x) => !values.includes(x))
        .filter((x) => filterOption(filterInput, x))
    );
  }, [filterInput, values]);

  const filterOption = (input: string, option: string | undefined) =>
    (option ?? "").toLowerCase().includes(input.toLowerCase());

  const handleOptionClick = (option: any) => {
    handleClose();
    setFilterInput("");
    addValueToValueList(option as string);
  };

  const removeTag = (index: number) => {
    const items = [...values];
    items.splice(index, 1);
    setValues(items);
  };

  const addValueToValueList = (value: string) => {
    if (value !== "") {
      const items = [...values];
      items.push(value);
      setValues(items);
    }
  };

  return (
    <SelectWithSearchWrapper>
      <DropdownContainer ref={dropDownRef}>
        <div className="input-field">
          {values.map((x, i) => (
            <div key={i} className="tag">
              {x}
              <button
                className="delete-tag-button"
                onClick={() => removeTag(i)}
              >
                <ClearIcon className="tag-delete" />
              </button>
            </div>
          ))}
          <input
            className="multiple-input"
            value={filterInput}
            onClick={() => setIsOpen(!isOpen)}
            placeholder="Value"
            onChange={(e) => setFilterInput(e.target.value)}
          />
        </div>
        {isOpen && filteredOptions.length > 0 && (
          <DropdownList>
            {filteredOptions.map((option, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </DropdownContainer>
    </SelectWithSearchWrapper>
  );
};

export default MultipleValueInput;

const SelectWithSearchWrapper = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;

  .input-field {
    min-height: 25px;
    display: flex;
    justify-content: start;
    width: auto;

    border: 1px solid #e0e0e0;
    border-radius: 9px;
    padding: 2px;
    flex-flow: row wrap;
    gap: 2px;

    .tag {
      display: flex;
      background-color: #e0e0e0;
      border-radius: 6px;
      padding: 2px;

      .delete-tag-button {
        border: 0px;
        background-color: transparent;
        display: flex;
        align-items: center;
      }

      .tag-delete {
        justify-self: center;
        align-self: center;
        width: 10px;
        height: 10px;
        cursor: pointer;

        &:hover {
          fill: #e0e0e0;
        }
      }
    }

    .multiple-input {
      border: 0px;
      background-color: white;
      margin-left: 10px;
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
