import { FC } from "react";
import ParamLabel from "./components/param-label";
import { InputWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import { isMixed } from "../../../../params/mixed";

export interface NumberInputProps extends ParamInputProps {
  precision?: number;
}

const NumberInput: FC<NumberInputProps> = (props: NumberInputProps) => {
  const { property, onChange, paramName, precision, param } = props;

  return (
    <>
      <InputWrapper>
        <ParamLabel paramName={paramName} param={param} type="number" />
        <MixedWrapper className="param-value">
          {/* <InputNumber
                    size='small'
                    value={isMixed(property.value) ? '' : property.value}
                    placeholder={isMixed(property.value) ? 'Mixed' : undefined}
                    onChange={(e) => {
                        let value = e
                        if (precision && typeof value === 'number') {
                            const x = value % precision
                            value = x * value
                        }
                        onChange(value, paramName)
                    }}
                    style={{ width: '100%' }}
                /> */}
        </MixedWrapper>
      </InputWrapper>
    </>
  );
};

export default NumberInput;
