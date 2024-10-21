import { ReactNode, useEffect, useMemo, useState } from "react";
import { ParamWrapper, MixedWrapper, ParamInputProps } from "./param-input";
import { EnumParam } from "../../../params/params";
import ParamLabel from "../param-label";

export interface EnumInputProps extends ParamInputProps {}

export default function EnumInput(props: EnumInputProps) {
  const { property, onChange, paramName, param, index } = props;

  const options = useMemo(() => {
    if (param) {
      const enumParam = param as EnumParam;
      const options = enumParam.options.map((x, i) => ({ label: x, value: i }));
      return options;
    } else {
      return [];
    }
  }, []);

  if (param) {
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
              {/* <Select
                onChange={(e) => onChange(e, paramName)}
                value={property.value}
                size="small"
                options={options}
                style={{ width: "100%" }}
                dropdownStyle={{
                  zIndex: 9999,
                }}
              /> */}
            </MixedWrapper>
          </div>
        </ParamWrapper>
      </>
    );
  } else {
    return <></>;
  }
}
