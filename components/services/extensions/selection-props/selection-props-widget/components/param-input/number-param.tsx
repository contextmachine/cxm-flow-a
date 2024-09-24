import { FC } from "react";
import { ParamWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import ParamLabel from "../param-label";

export interface NumberInputProps extends ParamInputProps {
  precision?: number;
}

const NumberInput: FC<NumberInputProps> = (props: NumberInputProps) => {
  // const { property, onChange, precision, param, index } = props;
  const { property, onChange, onRevert, index, onDelete, param } = props;

  return (
    <>
      <ParamWrapper>
        <ParamLabel
          onDelete={onDelete}
          property={property}
          param={param}
          type="number"
          index={index}
        />
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
      </ParamWrapper>
    </>
  );
};

export default NumberInput;
