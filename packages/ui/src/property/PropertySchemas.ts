import { kebabCase } from "$/ui/util"
// the types-only leaf, as `V`:  `$/ui/api` would bring every element (and Solid's JSX) into a node tool's type check
import type * as V from "$/spell-solid/vocabulary.types"

/****************
 * ### `PropertySchemas`
 * Turns what a thing is described with into what `<ui-property-editor>` reads, a `V.PropertySchema`:
 * its name, and its attributes.
 * - Each attribute is an `AttributeSpec`:  a component vocabulary's own shape, grown for forms.
 *
 * - The sources:
 *   - a component's vocabulary:  it IS one already (`fromVocabulary()`)
 *   - a JSON block with a JSON Schema (`fromJSONSchema()`)
 *   - a JSON block with none:  guessed from the values it holds (`fromValues()`)
 *   - a spell class:  the app reads it (Spell UI never imports spell's packages;  epic `property-editor` Q16)
 * - And what a form asks of any attribute:  its value's type (`typeOf()`) and its label (`labelOf()`).
 * - Pure data, no DOM and no Solid:  node tools and tests use it as they are.
 * - STATIC and instance-free on purpose:  it keeps nothing between calls.
 ****************/
export class PropertySchemas {
  /** A component's vocabulary, as a property schema:  its tag is the name. */
  static fromVocabulary(vocabulary: V.ComponentVocabulary): V.PropertySchema {
    return { name: vocabulary.tag, description: vocabulary.description, attributes: vocabulary.attributes }
  }

  /**
   * A JSON Schema (an `object` schema), as a property schema named `name` (else its `title`).
   * - What each property reads:
   *   - its type, and `default`
   *   - `title` as the label, `description` as the tip
   *   - `minimum` / `maximum` / `multipleOf` / `pattern`
   *   - `enum` as choices
   * - A nested object is a `thing` with its own attributes;  an array, a `list` of its items' type.
   * - Keys starting with `$` are the file's own (`$type`, `$schema` ...):  never a property.
   * - throws a `TypeError` for a schema that isn't an object's
   */
  static fromJSONSchema(schema: JSONSchema, name?: string): V.PropertySchema {
    if (!isObjectSchema(schema)) {
      throw new TypeError("PropertySchemas.fromJSONSchema():  not an object's schema;  pass one with `properties`")
    }
    return {
      name: name ?? schema.title ?? "",
      description: schema.description,
      attributes: PropertySchemas.attributesOfJSONSchema(schema)
    }
  }

  /**
   * A JSON block's properties, guessed from the values it holds:  for a block with no schema.
   * - text, a number, yes / no
   * - an array is a `list` of its first item's type;  an object, a nested `thing`
   * - `null` (or an empty array) says nothing of its type:  `data`, edited as JSON text.
   */
  static fromValues(block: Record<string, unknown>, name = ""): V.PropertySchema {
    return { name, attributes: PropertySchemas.attributesOfValues(block) }
  }

  /**
   * What an attribute's value IS, as a form edits it:  its own `type`, else what its `kind` says.
   * - `boolean` / `keyOnly`:  `boolean`;  `number`:  `number`;  `json`:  `data`
   * - a kind with `values`:  `choice`;  any other:  `text`
   */
  static typeOf(spec: V.AttributeSpec): V.ValueType {
    if (spec.type) return spec.type
    switch (spec.kind) {
      case "boolean":
      case "keyOnly":
        return "boolean"
      case "number":
        return "number"
      case "json":
        return "data"
      default:
        return spec.values || spec.choicesFrom || CHOICE_KINDS.has(spec.kind) ? "choice" : "text"
    }
  }

  /** An attribute's label, for people:  its own, else made from its name (`listsStartAt` => `Lists start at`). */
  static labelOf(spec: V.AttributeSpec): string {
    if (spec.label) return spec.label
    const words = kebabCase(spec.name).replaceAll("-", " ")
    return words.charAt(0).toUpperCase() + words.slice(1)
  }

  ////////////////
  // ## JSON Schema
  ////////////////

  /** The attributes of an object's schema, in its own order. */
  private static attributesOfJSONSchema(schema: JSONSchema): V.AttributeSpec[] {
    const attributes: V.AttributeSpec[] = []
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      if (name.startsWith("$")) continue
      attributes.push(PropertySchemas.attributeOfJSONSchema(name, property))
    }
    return attributes
  }

  /** One property's schema, as an attribute. */
  private static attributeOfJSONSchema(name: string, _schema: JSONSchema): V.AttributeSpec {
    const schema = PropertySchemas.withoutNull(_schema)
    const type = PropertySchemas.typeOfJSONSchema(schema)
    const spec: Writable<V.AttributeSpec> = { name, kind: KIND_FOR_TYPE[type], type, description: "" }
    if (schema.title) spec.label = schema.title
    if (schema.description) spec.tip = schema.description
    if (schema.enum) spec.values = schema.enum.filter((value) => value !== null).map(String)
    if (schema.minimum !== undefined) spec.min = schema.minimum
    if (schema.maximum !== undefined) spec.max = schema.maximum
    if (schema.multipleOf !== undefined) spec.step = schema.multipleOf
    if (schema.pattern && !schema.patternErrorMessage) spec.pattern = schema.pattern
    const rules = PropertySchemas.rulesOfJSONSchema(schema)
    if (rules.length) spec.rules = rules
    if (isPlainDefault(schema.default)) spec.default = schema.default
    if (type === "list" && schema.items)
      spec.of = PropertySchemas.typeOfJSONSchema(PropertySchemas.withoutNull(schema.items))
    if (type === "thing") spec.attributesOf = PropertySchemas.attributesOfJSONSchema(schema)
    return spec
  }

  /**
   * A property's checks, as the form's rules.
   * - What a spell type's rules write into its JSON Schema (epic `property-editor` P9), read back.
   * - `minLength` / `maxLength`, `format: "email"` / `"uri"`
   * - a `pattern` with VS Code's `patternErrorMessage`:  the rule with those words (a bare `pattern` is `pattern`)
   */
  private static rulesOfJSONSchema(schema: JSONSchema): V.RuleSpec[] {
    const rules: V.RuleSpec[] = []
    if (schema.minLength)
      rules.push(schema.minLength === 1 ? { type: "empty" } : { type: "minLength", value: `${schema.minLength}` })
    if (schema.maxLength !== undefined) rules.push({ type: "maxLength", value: `${schema.maxLength}` })
    if (schema.format === "email") rules.push({ type: "email" })
    if (schema.format === "uri") rules.push({ type: "url" })
    if (schema.pattern && schema.patternErrorMessage)
      rules.push({ type: "regExp", value: `/${schema.pattern}/`, prompt: schema.patternErrorMessage })
    return rules
  }

  /** A schema's type, as a form edits it. */
  private static typeOfJSONSchema(schema: JSONSchema): V.ValueType {
    if (schema.enum) return "choice"
    const type = Array.isArray(schema.type) ? schema.type.find((each) => each !== "null") : schema.type
    switch (type) {
      case "string":
        return schema.format === "date" || schema.format === "date-time" ? "date" : "text"
      case "number":
      case "integer":
        return "number"
      case "boolean":
        return "boolean"
      case "array":
        return "list"
      case "object":
        return isObjectSchema(schema) ? "thing" : "data"
      default:
        return "data"
    }
  }

  /** `schema` without its "or nothing":  the first of an `anyOf` that isn't `null`, else itself. */
  private static withoutNull(schema: JSONSchema): JSONSchema {
    return schema.anyOf?.find((each) => each.type !== "null") ?? schema
  }

  ////////////////
  // ## Guessed from values
  ////////////////

  /** The attributes of a JSON block, one per key, guessed from its values. */
  private static attributesOfValues(block: Record<string, unknown>): V.AttributeSpec[] {
    const attributes: V.AttributeSpec[] = []
    for (const [name, value] of Object.entries(block)) {
      if (name.startsWith("$")) continue
      const type = PropertySchemas.typeOfValue(value)
      const spec: Writable<V.AttributeSpec> = { name, kind: KIND_FOR_TYPE[type], type, description: "" }
      if (type === "list") spec.of = PropertySchemas.typeOfValue((value as unknown[])[0])
      if (type === "thing") spec.attributesOf = PropertySchemas.attributesOfValues(value as Record<string, unknown>)
      attributes.push(spec)
    }
    return attributes
  }

  /** A value's type, as a form edits it. */
  private static typeOfValue(value: unknown): V.ValueType {
    if (typeof value === "string") return "text"
    if (typeof value === "number") return "number"
    if (typeof value === "boolean") return "boolean"
    if (Array.isArray(value)) return value.length ? "list" : "data"
    if (value && typeof value === "object") return "thing"
    return "data"
  }
}

////////////////
// ## Types and helpers
////////////////

/**
 * The parts of a JSON Schema `PropertySchemas` reads.
 * - Anything else in it is left alone.
 */
export type JSONSchema = {
  type?: string | readonly string[]
  title?: string
  description?: string
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  enum?: readonly unknown[]
  anyOf?: readonly JSONSchema[]
  format?: string
  minimum?: number
  maximum?: number
  multipleOf?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  /** VS Code's own:  what to say when `pattern` fails. */
  patternErrorMessage?: string
  default?: unknown
  /** A fixed value (`"$type": { "const": "Person" }`):  read by nothing here. */
  const?: unknown
}

/** An `AttributeSpec` being built:  its fields writable. */
type Writable<T> = { -readonly [K in keyof T]: T[K] }

/** Kinds that always take one of a set of values:  their own (`size`), or `values`. */
const CHOICE_KINDS = new Set<V.AttributeKind>(["enum", "valueOnly", "size", "color", "textAlign", "verticalAlign"])

/** The property-only kind an attribute read from JSON gets, by its value's type. */
const KIND_FOR_TYPE: Record<V.ValueType, V.AttributeKind> = {
  text: "string",
  number: "number",
  boolean: "boolean",
  date: "string",
  choice: "enum",
  list: "json",
  thing: "json",
  data: "json"
}

/** An object's schema:  `properties` to read. */
function isObjectSchema(schema: JSONSchema): boolean {
  return !!schema.properties
}

/** A default an attribute can hold as it is:  text, a number, yes / no. */
function isPlainDefault(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}
