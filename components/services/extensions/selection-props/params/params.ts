

export const ParamTypesArr = [
    'boolean',
    'string',
    'number',
    'range',
    'enum',
] as const


export type ParamType = typeof ParamTypesArr[number]

export interface Param {
    id: string,
    name: string,
    type: ParamType
}


export interface NumberParam extends Param {
    id: string
    name: string
    type: 'number'
    precision: number | undefined
}

export interface StringParam extends Param {
    id: string
    name: string
    type: 'string'
}

export interface BooleanParam extends Param {
    id: string
    name: string
    type: 'boolean'
}

export interface RangeParam extends Param {
    id: string
    name: string
    type: 'range'
    precision: number | undefined
}

export interface EnumParam extends Param {
    id: string
    name: string
    type: 'enum',
    options: string[]
}



