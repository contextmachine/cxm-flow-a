import { assertDefined, exhaustiveCheck } from "@/utils";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import BooleanInput from "./boolean-input";
import NumberInput from "./number-param";
import StringInput from "./string-param";
import RangeInput from "./range-input";
import EnumInput from "./enum-input";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ParamEntity } from "@/src/services/project-settings/entities/params";
import UniversalInput from "./universal-input";
import {
  EnumParam,
  NumberParam,
  Param,
  RangeParam,
} from "../../../params/params";
import { PropertyValue } from "../../../selection-props-extension";

export const MixedWrapper = styled.div`
  display: flex;
  flex-direction: row;
  && {
    & *::placeholder {
      color: blue;
      opacity: 1;
    }
  }
`;

export const ParamWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;

  & .param-name {
    width: 50%;
  }

  & .param-value {
    width: 50%;
  }

  input {
    border: 1px solid black;
    height: 27px;
    border-radius: 9px;
    background-color: var(--select-bg-color);
  }
`;

export interface ParamInputProps {
  property: PropertyValue;
  onChange: (value: any, paramName: string) => void;
  onRevert: (paramName: string) => void;
  onDelete: (paramName: string) => void;
  param?: Param;
  index: number;
}

export default function ParamInput(props: ParamInputProps) {
  const { property, onChange } = props;

  const viewer = useViewer();
  const [paramLibrary, setParamLibrary] = useState(
    new Map<string, ParamEntity>()
  );

  // const { settings, params } = useProjectSettings();

  // useEffect(() => {
  //   if (params) {
  //     const paramId = settings?.param_namespace;
  //     const param = params.find((p) => p.id === paramId);

  //     if (param && param?.params) {
  //       const params = param.params;

  //       const paramsMap = new Map<string, any>();
  //       params.forEach((p) => {
  //         paramsMap.set(p.name, p);
  //       });

  //       setParamLibrary(paramsMap);
  //     }
  //   }
  // }, [settings, params]);

  if (paramLibrary.has(property.paramName)) {
    const param = assertDefined(paramLibrary.get(property.paramName));

    switch (param.type) {
      case "boolean":
        return <BooleanInput {...props} param={param} />;
      case "number":
        const numberParam = param as NumberParam;
        return (
          <NumberInput
            {...props}
            precision={numberParam.precision}
            param={param}
          />
        );
      case "range":
        const rangeParam = param as RangeParam;
        return (
          <RangeInput
            {...props}
            precision={rangeParam.precision}
            param={rangeParam}
          />
        );
      case "string":
        return <StringInput {...props} param={param} />;
      case "enum":
        const enumParam = param as EnumParam;
        return <EnumInput {...props} param={enumParam} />;
      default:
        // @ts-ignore
        exhaustiveCheck(param.type as any);
    }
  } else {
    switch (property.type) {
      case "string":
        return <UniversalInput {...props} />;
      // case "number":
      //   return <NumberInput {...props} />;
      // case "boolean":
      //   return <BooleanInput {...props} />;
      // case "range":
      //   return <RangeInput {...props} />;
      default:
        return <UniversalInput {...props} />;
    }
  }
}
