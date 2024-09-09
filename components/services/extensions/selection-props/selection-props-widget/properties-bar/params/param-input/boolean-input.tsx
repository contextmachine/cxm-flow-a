import { FC } from "react";
import ParamLabel from "./components/param-label";
import { InputWrapper, ParamInputProps } from "./param-input";
import { isMixed } from "../../../../params/mixed";
import { Checkbox } from "@mui/material";

const BooleanInput: FC<ParamInputProps> = (props: ParamInputProps) => {
  const { property, onChange, paramName, param } = props;

  return (
    <>
      <InputWrapper>
        <ParamLabel paramName={paramName} param={param} type="boolean" />
        <Checkbox
          //   className="param-value"
          indeterminate={isMixed(property.value)}
          onChange={(e) => onChange(e.target.checked, paramName)}
          checked={isMixed(property.value) ? false : property.value}
        />
      </InputWrapper>
    </>
  );
};

export default BooleanInput;
