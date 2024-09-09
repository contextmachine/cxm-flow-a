import { FC } from "react";
import ParamLabel from "./components/param-label";
import { InputWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import { Input } from "@mui/material";
import { isMixed } from "../../../../params/mixed";
import styled from "styled-components";

const StringInput: FC<ParamInputProps> = (props: ParamInputProps) => {
  const { property, onChange, paramName, param } = props;

  return (
    <>
      <InputWrapper>
        <ParamLabel paramName={paramName} param={param} type="string" />
        <MixedWrapper className="param-value">
          <Input
            size="small"
            value={isMixed(property.value) ? "" : property.value}
            placeholder={isMixed(property.value) ? "Mixed" : undefined}
            onChange={(e) => onChange(e.target.value, paramName)}
          />
        </MixedWrapper>
      </InputWrapper>
    </>
  );
};

export default StringInput;

// const InputWrapper = styled.div`
//   .input {
//     border: 1px;
//   }
// `;
