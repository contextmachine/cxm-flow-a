import { ParamType } from "../params/params";

const simpleTypes = ["string", "boolean", "number"];

const getArrayType = (arr: any[]) => {
  if (arr.length > 0) {
    let valueType: string | undefined = typeof arr[0];

    arr.forEach((x) => {
      if (valueType !== typeof x) {
        valueType = undefined;
        return;
      }
    });

    return valueType;
  }
};

export const defineParamType = (value: any): ParamType | undefined => {
  const valueType = typeof value;

  if (simpleTypes.includes(valueType)) {
    return valueType as ParamType;
  } else if (valueType === "object") {
    if (Array.isArray(value)) {
      const arrType = getArrayType(value);

      if (value.length === 2 && arrType === "number") {
        return "range";
      } else {
        return undefined;
      }
    }
  }
};
