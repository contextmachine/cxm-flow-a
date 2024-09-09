import { useClickOutside, useEnterEsc, useEntities } from "@/src/hooks";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Entity } from "@/src/objects/entities/entity";
import { InputWrapper, ParamInputProps } from "../param-input";
import ParamLabel from "../components/param-label";
import { isMixed } from "@/components/services/extensions/selection-props/params/mixed";

const UniversalInput: React.FC<ParamInputProps> = (props: ParamInputProps) => {
  const { paramName, property } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef(null);

  const entities = useEntities();

  const valueOptions = getPropertyValues(
    [...entities.values()],
    paramName
  ).values;

  const [value, setValue] = useState(property.value);
  const [filteredOptions, setFilteredOptions] = useState(valueOptions);

  const handleClose = () => {
    // const value = parseValue(value, type);

    if (isOpen) {
      setIsOpen(false);
    }
  };

  useClickOutside(dropDownRef, handleClose);
  useEnterEsc(handleClose);

  // useEffect(() => {
  //   setFilteredOptions(valueOptions.filter((x) => filterOption(value, x)));
  // }, [value]);

  // const filterOption = (input: string, option: string | undefined) =>
  //   (option ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <InputWrapper>
      <ParamLabel paramName={paramName} param={undefined} type="string" />
      <SelectWithSearchWrapper>
        <DropdownContainer ref={dropDownRef}>
          <div className="input-field">
            <input
              onClick={() => setIsOpen(!isOpen)}
              className="multiple-input"
              onChange={(e) => setValue(e.target.value)}
              value={isMixed(property.value) ? "" : property.value}
              placeholder={isMixed(property.value) ? "Mixed" : undefined}
            />
          </div>
          {isOpen && filteredOptions.length > 0 && (
            <DropdownList>
              {filteredOptions.map((option, index) => (
                <DropdownItem key={index} onClick={() => setValue(option)}>
                  {option}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
      </SelectWithSearchWrapper>
    </InputWrapper>
  );
};

export default UniversalInput;

const SelectWithSearchWrapper = styled.div`
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

    .multiple-input {
      min-width: 100px;
      max-width: 100%;
      border: 0px;
      background-color: var(--select-bg-color);
      margin-left: 10px;
      height: 20px;
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

const DropdownItem = styled.li`
  padding: 10px;
  margin: 2px;
  border-radius: 7px;
  display: flex;
  gap: 7px;
  align-items: center;
  color: var(--main-text-color);

  cursor: pointer;

  &:hover {
    background-color: var(--icon-button-hover-color);
  }
`;

type PropertyType = "string" | "number" | "boolean";
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
