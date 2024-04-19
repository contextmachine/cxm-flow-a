import { ParamBoolean } from "./param-boolean";
import { ParamEnum } from "./param-enum";
import { ParamNumber } from "./param-number";
import { ParamRange } from "./param-range";
import { ParamString } from "./param-string";


export type ParamEntity =
    | ParamEnum
    | ParamBoolean
    | ParamNumber
    | ParamRange
    | ParamString;