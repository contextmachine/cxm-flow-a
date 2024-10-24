import { useClickOutside } from "@/src/hooks";
import { SearchOutlined } from "@mui/icons-material";
import { InputAdornment, InputBase } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface Option {
  value: string;
}

interface SelectWithFilterProps {
  options: Option[];
  placeholder: string;
  filterInput: string;
  onSelect: (option: Option) => void;
  setFilterInput: (e: string) => void;
}

const SelectWithSearch: React.FC<SelectWithFilterProps> = (
  props: SelectWithFilterProps
) => {
  const { options, onSelect, setFilterInput, filterInput } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  const dropDownRef = useRef(null);
  useClickOutside(dropDownRef, () => setIsOpen(false));

  const filterOption = (input: string, option: string | undefined) =>
    (option ?? "").toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    setFilteredOptions(
      options.filter((x) => filterOption(filterInput, x.value))
    );
  }, [filterInput, options]);

  const handleOptionClick = (option: any) => {
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <SelectWithSearchWrapper>
      <DropdownContainer ref={dropDownRef}>
        <InputBase
          className="input-field"
          onClick={() => setIsOpen(!isOpen)}
          value={filterInput}
          placeholder={props.placeholder}
          onChange={(e) => setFilterInput(e.target.value)}
          endAdornment={
            <InputAdornment className="end-icon" position="end">
              <SearchOutlined sx={{ fontSize: 16 }} />
            </InputAdornment>
          }
        />
        {isOpen && filteredOptions.length > 0 && (
          <DropdownList>
            {filteredOptions.map((option, index) => (
              <DropdownItem
                key={index}
                onClick={() => handleOptionClick(option)}
              >
                {option.value}
              </DropdownItem>
            ))}
          </DropdownList>
        )}
      </DropdownContainer>
    </SelectWithSearchWrapper>
  );
};

export default SelectWithSearch;

const SelectWithSearchWrapper = styled.div`
  width: 100%;
  font-size: 12px;

  .input-field {
    width: 100%;
    height: 27px;
    border: 1px solid var(--box-border-color);
    border-radius: 9px;
    padding: 0 10px;
    background-color: var(--select-bg-color);

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

const DropdownItem = styled.li`
  padding: 10px;
  margin: 2px;
  border-radius: 7px;

  cursor: pointer;

  &:hover {
    background-color: var(--icon-button-hover-color);
  }
`;
