import { FC } from "react";
import { ParamWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import { Input } from "@mui/material";
import ParamLabel from "../param-label";
import { isMixed } from "../../../params/mixed";

const StringInput: FC<ParamInputProps> = (props: ParamInputProps) => {
  const { property, onChange, paramName, param, index } = props;

  return (
    <>
      <ParamWrapper>
        <ParamLabel
          paramName={paramName}
          param={param}
          type="string"
          index={index}
        />
        <MixedWrapper className="param-value">
          <Input
            size="small"
            value={isMixed(property.value) ? "" : property.value}
            placeholder={isMixed(property.value) ? "Mixed" : undefined}
            onChange={(e) => onChange(e.target.value, paramName)}
          />
        </MixedWrapper>
      </ParamWrapper>
    </>
  );
};

export default StringInput;
