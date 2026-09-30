/** Narrow a dynamic `match.value` to `string`, throwing if the rule matched something else. */
export function assertString(value: unknown): string {
  if (typeof value !== "string") throw new TypeError(`Expected a string value, got ${typeof value}`)
  return value
}

/** Narrow a dynamic `match.value` to `number`, throwing if the rule matched something else. */
export function assertNumber(value: unknown): number {
  if (typeof value !== "number") throw new TypeError(`Expected a number value, got ${typeof value}`)
  return value
}

/** Narrow a dynamic `match.value` to `boolean`, throwing if the rule matched something else. */
export function assertBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new TypeError(`Expected a boolean value, got ${typeof value}`)
  return value
}

/** Grouped access to the `assertX` narrowing helpers above, e.g. `assert.string(value)`. */
export const assert = {
  string: assertString,
  number: assertNumber,
  boolean: assertBoolean
}
