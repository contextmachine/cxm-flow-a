import { ReactNode, useEffect, useMemo, useState } from "react";
import { ParamWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import ParamLabel from "../param-label";

export interface RangeInputProps extends ParamInputProps {
  precision?: number;
}

export default function DomainSlider(props: RangeInputProps) {
  const { property, onChange, paramName, precision, param, index } = props;

  return (
    <>
      <ParamWrapper>
        <ParamLabel
          paramName={paramName}
          param={param}
          type="number"
          index={index}
        />
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
      </ParamWrapper>
    </>
  );
}
