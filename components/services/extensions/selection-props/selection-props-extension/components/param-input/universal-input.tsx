import { useClickOutside, useEnterEsc, useEntities } from "@/src/hooks";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Entity } from "@/src/objects/entities/entity";
import { isMixed } from "@/components/services/extensions/selection-props/params/mixed";
import { ParamWrapper, ParamInputProps } from "./param-input";
import ParamLabel from "../param-label";
import { IconButton } from "@mui/material";
import UTurnRightIcon from "@mui/icons-material/UTurnRight";

const UniversalInput: React.FC<ParamInputProps> = (props: ParamInputProps) => {
  const { property, onChange, onRevert, index, onDelete } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropDownRef = useRef(null);

  const entities = useEntities();

  const valueOptions = getPropertyValues(
    [...entities.values()],
    property.paramName
  ).values;

  const onInputChange = (e: any) => {
    onChange(e, property.paramName);
  };

  // const [value, setValue] = useState(property.value);
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
    <ParamWrapper>
      <ParamLabel
        onDelete={onDelete}
        property={property}
        param={undefined}
        type="string"
        index={index}
      />
      <InputWrapper>
        <DropdownContainer ref={dropDownRef}>
          <InputField>
            <input
              className="input-field"
              onClick={() => setIsOpen(!isOpen)}
              onChange={(e) => onInputChange(e.target.value)}
              value={
                property.value === undefined || isMixed(property.value)
                  ? ""
                  : property.value
              }
              placeholder={isMixed(property.value) ? "Mixed" : undefined}
            />
            {property.beenChanged && (
              <div className="edit-block">
                <span className="edit-tag" />
                <IconButton
                  className="revert-button"
                  onClick={() => {
                    onRevert(property.paramName);
                  }}
                >
                  <UTurnRightIcon />
                </IconButton>
              </div>
            )}
          </InputField>
          {isOpen && filteredOptions.length > 0 && (
            <DropdownList>
              {filteredOptions.map((option, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => {
                    handleClose();
                    onInputChange(option);
                  }}
                >
                  {option}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
      </InputWrapper>
    </ParamWrapper>
  );
};

export default UniversalInput;

const InputField = styled.div`
  height: 25px;
  display: flex;
  justify-content: space-between;
  background-color: var(--select-bg-color);
  border: 1px solid var(--box-border-color);
  align-items: center;
  width: 100%;
  border-radius: 9px;
  flex-flow: row wrap;
  gap: 2px;
  .input-field {
    border: 0px;
    background-color: var(--select-bg-color);
    margin-left: 10px;
    height: 20px;
    &:focus-visible {
      outline: -webkit-focus-ring-color auto 0px;
    }
  }
  &:hover .edit-tag {
    display: none;
  }
  .revert-button {
    transform: rotate(90deg);
    display: none;
    width: 12px;
    height: 12px;
    * {
      width: 12px;
    }
  }
  &:hover .revert-button {
    display: flex;
  }
  .edit-tag {
    display: flex;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    margin-right: 4px;
    background-color: var(--button-secondary-active-text-color);
  }
  /* .end-icon {
    padding: 0px;
    svg {
      fill: #e0e0e0;
    }
  } */
`;

const InputWrapper = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;
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
