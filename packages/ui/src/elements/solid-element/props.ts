/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 3 -- per-prop definitions:  `{ value, attribute, property, type, converter, reflect }`.
 * - Replaces `component-register`'s `normalizePropDefs` / `parseAttributeValue` / `reflect`, which
 *   - JSON-parsed every non-string prop, so a bare boolean attribute (`""`) became `undefined` (false)
 *     and a numeric id string (`"210246661446959104"`) lost precision (issue #8)
 *   - reflected `true` as `"true"`
 *   - replaced only the FIRST underscore in attribute names (issue #40)
 * - Default boolean rule, as HTML has it:  present (any text, `""` included) ~== true, removed ~== false.
 * - A removed attribute falls back to the prop's DEFAULT (issue #20), never to "whatever was there".
 */

import type {
  AnyPropsDefinition,
  NormalizedProp,
  NormalizedProps,
  PropConverter,
  PropDefinition,
  PropType
} from "./solid-element.types"

/** Resolve a props definition (bare defaults, new-style or `component-register`-style entries). */
export function normalizeProps(input: AnyPropsDefinition = {}): NormalizedProps {
  const list: NormalizedProp[] = []
  const byKey = new Map<string, NormalizedProp>()
  const byAttribute = new Map<string, NormalizedProp>()
  for (const key of Object.keys(input)) {
    const prop = normalizeProp(key, input[key])
    list.push(prop)
    byKey.set(key, prop)
    if (prop.attribute) byAttribute.set(prop.attribute, prop)
  }
  return { list, byKey, byAttribute }
}

/** One entry => `NormalizedProp`, converters bound. */
export function normalizeProp(key: string, entry: unknown): NormalizedProp {
  const definition: PropDefinition = isDefinition(entry) ? entry : { value: entry }
  const type = definition.type ?? inferType(definition)
  const converter: Exclude<PropConverter, Function> =
    typeof definition.converter === "function" ? { fromAttribute: definition.converter } : (definition.converter ?? {})
  const prop: NormalizedProp = {
    key,
    property: definition.property ?? key,
    attribute: definition.attribute === false ? undefined : (definition.attribute ?? toAttribute(key)),
    type,
    value: definition.value,
    reflect: !!definition.reflect && definition.attribute !== false,
    renamed: definition.property !== undefined,
    fromAttribute: converter.fromAttribute
      ? (text) => converter.fromAttribute!(text, prop)
      : (text) => fromAttribute(text, prop),
    fromProperty: converter.fromProperty ? (value) => converter.fromProperty!(value, prop) : (value) => value,
    toAttribute: converter.toAttribute ? (value) => converter.toAttribute!(value, prop) : (value) => toText(value, type)
  }
  return prop
}

/** Default value for one element:  objects and arrays cloned (shallow), as `component-register` did. */
export function initialValue(prop: NormalizedProp): unknown {
  const { value } = prop
  if (Array.isArray(value)) return value.slice()
  if (value && typeof value === "object") return { ...value }
  return value
}

/**
 * Property / key name => attribute name:  `someProp` => `some-prop`, `this_is_a_prop` => `this-is-a-prop`.
 * - `component-register`'s version replaced only the first `_` (issue #40).
 */
export function toAttribute(name: string): string {
  return name
    .replace(/\.?([A-Z]+)/g, (_match, upper: string) => "-" + upper.toLowerCase())
    .replace(/_/g, "-")
    .replace(/^-/, "")
}

////////////////
// ## Conversion
////////////////

/**
 * Attribute text => value per `prop.type`.
 * - `null` (removed):  `false` for booleans, else the default
 * - `Object` / `Array`:  `JSON.parse`, the default when the text isn't JSON
 * - loose (`parse: true`, no type):  `JSON.parse`, else the text itself -- `""` stays `""`
 */
export function fromAttribute(text: string | null, prop: NormalizedProp): unknown {
  const { type } = prop
  if (type === Boolean) return text !== null
  if (text === null) return initialValue(prop)
  if (type === String) return text
  if (type === Number) return Number(text)
  try {
    return JSON.parse(text)
  } catch {
    return type ? initialValue(prop) : text
  }
}

/**
 * Value => attribute text per `type`;  `null` removes the attribute.
 * - `true` => `""`, `false` / `null` / `undefined` => removed, for every type
 * - `Object` / `Array`, non-strings in loose mode, and any object value => JSON (never `[object Object]`)
 */
export function toText(value: unknown, type: PropType | undefined): string | null {
  if (value == null || value === false) return null
  if (value === true) return ""
  if (typeof value === "string" && type !== Object && type !== Array) return value
  if (typeof value === "object" || type === Object || type === Array || !type) return JSON.stringify(value)
  return String(value as number | bigint | symbol | ((...args: unknown[]) => unknown))
}

////////////////
// ## Helpers
////////////////

/**
 * Is `entry` a definition object rather than a bare default?
 * - `component-register` looked for `value` only;  a new-style `{ type: Boolean }` has no `value`.
 */
function isDefinition(entry: unknown): entry is PropDefinition {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false
  return "value" in entry || typeof (entry as PropDefinition).type === "function" || "converter" in entry
}

/**
 * `type` from the default value, honouring `component-register`'s `parse`.
 * - `parse: false` ~== `String`;  `parse: true` without a typed default ~== loose JSON (`undefined`)
 * - no default ~== `String`:  JSON parsing is opt-in (`type: Object | Array`)
 */
function inferType({ value, parse }: PropDefinition): PropType | undefined {
  if (parse === false) return String
  const type =
    typeof value === "boolean"
      ? Boolean
      : typeof value === "number"
        ? Number
        : Array.isArray(value)
          ? Array
          : value && typeof value === "object"
            ? Object
            : undefined
  if (type) return type
  return parse ? undefined : String
}
