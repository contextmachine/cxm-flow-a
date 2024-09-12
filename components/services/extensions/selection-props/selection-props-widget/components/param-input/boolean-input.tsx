import { FC } from "react";
import { ParamWrapper, ParamInputProps } from "./param-input";
import { Checkbox } from "@mui/material";
import ParamLabel from "../param-label";
import { isMixed } from "../../../params/mixed";

const BooleanInput: FC<ParamInputProps> = (props: ParamInputProps) => {
  const { property, onChange, paramName, param, index } = props;

  return (
    <>
      <ParamWrapper>
        <ParamLabel
          paramName={paramName}
          param={param}
          type="boolean"
          index={index}
        />
        <Checkbox
          //   className="param-value"
          indeterminate={isMixed(property.value)}
          onChange={(e) => onChange(e.target.checked, paramName)}
          checked={isMixed(property.value) ? false : property.value}
        />
      </ParamWrapper>
    </>
  );
};

export default BooleanInput;
