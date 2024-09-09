import { ReactNode, useEffect, useMemo, useState } from "react";
import ParamLabel from "./components/param-label";
import { InputWrapper, MixedWrapper, ParamInputProps } from "./param-input";

export interface RangeInputProps extends ParamInputProps {
  precision?: number;
}

export default function DomainSlider(props: RangeInputProps) {
  const { property, onChange, paramName, precision, param } = props;

  return (
    <>
      <InputWrapper>
        <ParamLabel paramName={paramName} param={param} type="number" />
        <div className="param-value">
          <MixedWrapper>
            {/* <InputNumber
                        size='small'
                        value={isMixed(property.value[0]) ? '' : property.value[0]}
                        placeholder={isMixed(property.value[0]) ? 'Mixed' : undefined}
                        onChange={(e) => {
                            let value = e
                            if (precision && typeof value === 'number') {
                                const x = value % precision
                                value = x * value
                            }
                            onChange(value, paramName)
                        }}
                        style={{ width: '100%' }}
                    />

                    <InputNumber
                        size='small'
                        value={isMixed(property.value[1]) ? '' : property.value[1]}
                        placeholder={isMixed(property.value[1]) ? 'Mixed' : undefined}
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
        </div>
      </InputWrapper>
    </>
  );
}
