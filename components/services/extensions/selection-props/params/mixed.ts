export type MixedType = typeof MixedValue;
export type Mixed<T> = T | MixedType;

export const isMixed = <T>(value: Mixed<T>): value is MixedType =>
  value instanceof MixedValue;

export class MixedValue {
  constructor() {}
}
