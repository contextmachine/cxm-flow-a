import { useClickOutside, useEnterEsc } from "@/src/hooks";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ViewFilterExtension, { FilterCondition } from "../view-filter-extension";
import { PropertyType } from "./filter-condition";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@/components/ui/icons/delete-icon";
import PlusIcon from "@/components/ui/icons/plus-icon";
import CheckedIcon from "@/components/ui/icons/checked-icon";

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

  const [operator, setOperator] = useState(filterItem.operator);
  useEffect(() => {
    setOperator(filterItem.operator);
  }, [filterItem.operator]);

  useEffect(() => {
    filterItem.value = values;
    filterItem.operator = operator;
    extension.updateFilterCondition(filterItem);
  }, [values, operator]);

  const [filterInput, setFilterInput] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(valueOptions);

  const onOptionClick = (option: string) => {
    setFilterInput("");
    if (values.includes(option)) {
      removeValueFromList(option);
    } else {
      addValueToValueList(option);
    }
  };

  const onOptionDoubleClick = (option: string) => {
    const clear = values.includes(option);
    if (clear) {
      if (operator === "NOT_EQUAL") {
        setOperator("EQUAL");
      } else {
        setOperator("NOT_EQUAL");
      }
    }

    addValueToValueList(option, clear);
  };

  const handleClose = () => {
    const value = parseValue(filterInput, type);
    addValueToValueList(value as string);

    setFilterInput("");
    if (isOpen) {
      setIsOpen(false);
    }
  };

  useClickOutside(dropDownRef, handleClose);
  useEnterEsc(handleClose);
  const onClick = useSingleAndDoubleClick(onOptionClick, onOptionDoubleClick);

  useEffect(() => {
    setFilteredOptions(
      valueOptions.filter((x) => filterOption(filterInput, x))
    );
  }, [filterInput, values]);

  const filterOption = (input: string, option: string | undefined) =>
    (option ?? "").toLowerCase().includes(input.toLowerCase());

  const removeTag = (index: number) => {
    const items = [...values];
    items.splice(index, 1);
    setValues(items);
  };

  const addValueToValueList = (value: string, clear?: boolean) => {
    if (value !== "") {
      const items = clear ? [] : [...values];
      items.push(value);
      setValues(items);
    }
  };

  const removeValueFromList = (value: string) => {
    if (value !== "") {
      const items = [...values];

      const i = values.findIndex((x) => x === value);
      items.splice(i, 1);
      setValues(items);
    }
  };

  return (
    <SelectWithSearchWrapper $isExclude={operator === "NOT_EQUAL"}>
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
            onClick={() => setIsOpen(!isOpen)}
            className="multiple-input"
            value={filterInput}
            placeholder="Value"
            onChange={(e) => setFilterInput(e.target.value)}
          />
        </div>
        {isOpen && filteredOptions.length > 0 && (
          <DropdownList>
            {filteredOptions.map((option, index) => (
              <DropdownItem
                key={index}
                onClick={() => onClick(option)}
                $isAdded={values.includes(option)}
                $isExclude={operator === "NOT_EQUAL"}
              >
                {values.includes(option) && operator === "NOT_EQUAL" && (
                  <DeleteIcon />
                )}
                {values.includes(option) && operator === "EQUAL" && (
                  <CheckedIcon />
                )}
                {!values.includes(option) && <PlusIcon />}
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

const SelectWithSearchWrapper = styled.div<{ $isExclude: boolean }>`
  width: 100%;
  font-size: 12px;
  display: flex;

  .input-field {
    min-height: 25px;
    display: flex;
    justify-content: start;
    background-color: var(--select-bg-color);
    border: 1px solid var(--box-border-color);
    width: 100%;

    border-radius: 9px;
    padding: 2px;
    flex-flow: row wrap;
    gap: 2px;

    .tag {
      display: flex;
      background-color: var(--main-bg-color);
      border-radius: 6px;
      padding: 2px;
      color: ${({ $isExclude }) =>
        $isExclude ? "var(--button-secondary-danger-text-color)" : "#2689FF"};

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
      min-width: 100px;
      max-width: 100%;
      border: 0px;
      background-color: var(--select-bg-color);
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
  background-color: var(--paper-bg-color);
  border: 1px solid var(--box-border-color);
  list-style-type: none;
  padding: 0;
  max-height: 200px;
  overflow: auto;
`;

const DropdownItem = styled.li<{ $isAdded: boolean; $isExclude: boolean }>`
  padding: 10px;
  margin: 2px;
  border-radius: 7px;
  display: flex;
  gap: 7px;
  align-items: center;
  color: ${({ $isAdded, $isExclude }) =>
    $isAdded
      ? $isExclude
        ? "var(--button-secondary-danger-text-color)"
        : "#2689FF"
      : "var(--main-text-color)"};

  cursor: pointer;

  &:hover {
    background-color: var(--icon-button-hover-color);
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

const DELAY = 250;

const useSingleAndDoubleClick = (
  doSingleClickThing: (option: string) => void,
  onDoubleClick: (option: string) => void
) => {
  const [clicks, setClicks] = useState(0);

  const [curOption, setCurOption] = useState("");

  useEffect(() => {
    let singleClickTimer: any;
    if (clicks === 1) {
      singleClickTimer = setTimeout(() => {
        doSingleClickThing(curOption);
        setClicks(0);
      }, DELAY);
    } else if (clicks === 2) {
      onDoubleClick(curOption);
      setClicks(0);
    }
    return () => clearTimeout(singleClickTimer);
  }, [clicks]);

  const onClick = (option: string) => {
    setCurOption(option);
    setClicks(clicks + 1);
  };

  return onClick;
};
