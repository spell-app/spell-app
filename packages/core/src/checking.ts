/**
 * Checking a saved entry against its CLASS, and the JSON Schema VS Code checks the same file with
 * (epic `people-and-orgs` P5, decision Q43).
 *
 * ```ts
 * checkEntry({ "$type": "Person", "id": "owen", "name": 3 }, { classNamed })
 * // => [{ property: "name", message: "name is text, not a number" }]
 *
 * jsonSchemaFor(Person)
 * // => { "title": "Person", "type": "object", "properties": { "name": { "type": "string" }, ... } }
 * ```
 *
 * - The spell declaration is the one description of a type:  both read what the compiled class says of each
 *   property (`schemaOf()`:  its type, a list's item type, its legal values) through ONE function, `kindOf()`,
 *   so they can't disagree.
 * - The app, the people store and the `spell` command check with `checkEntry()`:  no JSON Schema library.
 * - JSON Schema is only MADE, for VS Code's own JSON checking, completion and hover text:  never committed, never
 *   written by hand.
 * - Keys starting with `$` are the file's own (`$type`, `$schema`, `$version`, `$ref` ...), never a property.
 * - A property holding a thing takes a reference to it, `{ "$ref": "Person#matt" }`, or the thing written whole,
 *   inside (`"$type"` first).
 */
import { ITEMS_KEY, schemaOf, TYPE_KEY, type PropInfo } from "$/util"

import { REF_KEY } from "./saving"

/** A problem `checkEntry()` found:  the property it's in (`""` for the entry itself), and what's wrong, in words. */
export type EntryProblem = { property: string; message: string }

/** What `checkEntry()` needs:  the class an entry's `"$type"` names. */
export type CheckOptions = {
  /** The class named `name`, e.g. `Person`;  `undefined` if there's none. */
  classNamed: (name: string) => Function | undefined
}

/**
 * What a property holds, as the checker and the schema writer both read it from its declaration.
 * - `text`, `number`, `choice`, `date`:  a value of that kind
 * - `thing`:  a thing of `className` (or a kind of it), by reference or written whole
 * - `list`:  an array, each item of `item`'s kind
 * - `any`:  declared with no kind the checker knows:  anything goes
 * - `oneOf`:  its legal values, when they're plain values
 */
export type Kind =
  | { kind: "text" | "number" | "choice" | "date" | "any"; oneOf?: readonly unknown[] }
  | { kind: "thing"; className: string }
  | { kind: "list"; item: Kind }

/** The kinds spell's runtime names that aren't classes, by name. */
const VALUE_KINDS = new Set(["text", "number", "choice", "date"])

/**
 * What a property declared as `info` holds -- see `Kind`.
 * - A declared `itemType` makes it a list;  a capitalised `type` is a class.
 */
export function kindOf(info: PropInfo | undefined): Kind {
  if (!info) return { kind: "any" }
  if (info.itemType) return { kind: "list", item: kindOf({ type: info.itemType }) }
  const type = info.type ?? ""
  const oneOf = legalValues(info)
  if (VALUE_KINDS.has(type)) return { kind: type as "text", ...(oneOf && { oneOf }) }
  if (/^[A-Z]/.test(type)) return { kind: "thing", className: type }
  return { kind: "any", ...(oneOf && { oneOf }) }
}

////////////////
// ## Checking
////////////////

/**
 * What's wrong with saved `entry`, against the class its `"$type"` names:  `[]` if nothing.
 * - Each property it holds:  declared by the class, and of its kind (`kindOf()`).
 * - A thing written whole inside it is checked the same way, against its own class.
 * - A list type's `"$items"` aren't checked:  a list holds what it's given.
 * - Never throws:  a missing or unknown `"$type"` is a problem like any other.
 */
export function checkEntry(entry: Record<string, unknown>, options: CheckOptions): EntryProblem[] {
  const problems: EntryProblem[] = []
  checkThing(entry, "", options, problems)
  return problems
}

/** Check thing `json`, found at `path` (`""` for the entry), into `problems`. */
function checkThing(json: Record<string, unknown>, path: string, options: CheckOptions, problems: EntryProblem[]) {
  const type = json[TYPE_KEY]
  const Class = typeof type === "string" ? options.classNamed(type) : undefined
  if (typeof type !== "string") return void problems.push({ property: path, message: `it says no "${TYPE_KEY}"` })
  if (!Class) return void problems.push({ property: path, message: `no type is named ${type}` })
  const schema = schemaOf(Class)
  for (const [key, value] of Object.entries(json)) {
    if (key.startsWith("$") || key === ITEMS_KEY) continue
    const property = path ? `${path}.${key}` : key
    const info = schema.info(key)
    if (!info) problems.push({ property, message: `a ${type} has no ${key}` })
    else checkValue(value, kindOf(info), property, options, problems)
  }
}

/** Check `value` against `kind`, found at `property`, into `problems`. */
function checkValue(value: unknown, kind: Kind, property: string, options: CheckOptions, problems: EntryProblem[]) {
  // nothing is always allowed:  an unset property
  if (value === null || value === undefined) return
  const wrong = (what: string) =>
    problems.push({ property, message: `${property.split(".").pop()} is ${what}, not ${describe(value)}` })
  switch (kind.kind) {
    case "any":
      break
    case "text":
      if (typeof value !== "string") return wrong("text")
      break
    case "number":
      if (typeof value !== "number") return wrong("a number")
      break
    case "choice":
      if (typeof value !== "boolean") return wrong("yes or no (true or false)")
      break
    case "date":
      if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) return wrong("a date")
      break
    case "list":
      if (!Array.isArray(value)) return wrong("a list")
      value.forEach((item, at) => checkValue(item, kind.item, `${property}[${at}]`, options, problems))
      return
    case "thing":
      return checkThingValue(value, kind.className, property, options, problems)
  }
  if ("oneOf" in kind && kind.oneOf && !kind.oneOf.includes(value)) {
    problems.push({
      property,
      message: `${property} is one of ${kind.oneOf.map((it) => JSON.stringify(it)).join(", ")}`
    })
  }
}

/** Check `value`, which should be a `className` by reference or written whole, into `problems`. */
function checkThingValue(
  value: unknown,
  className: string,
  property: string,
  options: CheckOptions,
  problems: EntryProblem[]
) {
  const name = property.split(".").pop()
  if (!isObject(value))
    return void problems.push({ property, message: `${name} is a ${className}, not ${describe(value)}` })
  const ref = value[REF_KEY]
  if (typeof ref === "string") {
    const type = ref.slice(0, ref.indexOf("#"))
    if (!ref.includes("#") || !isKindOf(type, className, options))
      problems.push({ property, message: `${name} is a ${className}:  "${ref}" isn't one` })
    return
  }
  const type = value[TYPE_KEY]
  if (typeof type === "string" && !isKindOf(type, className, options))
    return void problems.push({ property, message: `${name} is a ${className}, not a ${type}` })
  checkThing({ [TYPE_KEY]: className, ...value }, property, options, problems)
}

/** Is `type` the class named `className`, or a kind of it? */
function isKindOf(type: string, className: string, options: CheckOptions): boolean {
  if (type === className) return true
  const Class = options.classNamed(type)
  const Wanted = options.classNamed(className)
  return !!Class && !!Wanted && Class.prototype instanceof Wanted
}

////////////////
// ## JSON Schema, for VS Code
////////////////

/** The JSON Schema draft VS Code's JSON support reads best. */
const JSON_SCHEMA_DRAFT = "http://json-schema.org/draft-07/schema#"

/**
 * The JSON Schema VS Code checks a saved `Class` with:  one per version of a type, made, never written by hand.
 * - Its properties are the class's declared ones, each of its kind (`kindOf()`), plus the file's own `$` keys.
 * - A property holding a thing takes a reference, `{ "$ref": "Person#matt" }`, or the thing written whole.
 *   - NOTE: `$ref` here is a PROPERTY's name, never JSON Schema's keyword;  so no sample reference goes in an
 *     example or a default:  some tools follow every `$ref` they find (decision J3).
 * - `additionalProperties: false`:  VS Code underlines a property the class doesn't declare, as `checkEntry()` refuses it.
 */
export function jsonSchemaFor(Class: Function): Record<string, unknown> {
  return {
    $schema: JSON_SCHEMA_DRAFT,
    title: Class.name,
    ...thingSchema(Class),
    definitions: { Reference: REFERENCE_SCHEMA }
  }
}

/** A thing of `Class`, as JSON Schema:  its declared properties, and the file's own keys. */
function thingSchema(Class: Function): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    $schema: { type: "string", description: "The address of this file's type" },
    $version: { type: "integer", minimum: 1, description: "The version of its type it was saved as" },
    [TYPE_KEY]: { const: Class.name }
  }
  for (const [name, info] of declaredProps(Class)) properties[name] = kindSchema(kindOf(info))
  return { type: "object", properties, additionalProperties: false }
}

/** `kind` as JSON Schema. */
function kindSchema(kind: Kind): Record<string, unknown> {
  const nothing = { type: "null" }
  switch (kind.kind) {
    case "any":
      return kind.oneOf ? { enum: [...kind.oneOf] } : {}
    case "text":
    case "number":
    case "choice": {
      const type = { text: "string", number: "number", choice: "boolean" }[kind.kind]
      return kind.oneOf ? { enum: [...kind.oneOf, null] } : { type: [type, "null"] }
    }
    case "date":
      return { anyOf: [{ type: "string", format: "date-time" }, nothing] }
    case "list":
      return { type: "array", items: kindSchema(kind.item) }
    case "thing":
      return {
        anyOf: [
          { $ref: "#/definitions/Reference" },
          { type: "object", properties: { [TYPE_KEY]: { type: "string" } }, required: [] },
          nothing
        ]
      }
  }
}

/** A saved reference, `{ "$ref": "Person#matt" }`, as JSON Schema. */
const REFERENCE_SCHEMA = {
  type: "object",
  properties: { [REF_KEY]: { type: "string", pattern: "^[A-Z][\\w-]*#[^@]+(@.+)?$" } },
  required: [REF_KEY],
  additionalProperties: false
}

/**
 * Every property `Class` declares, inherited and its own, by name:  a superclass's first (`id`), a subclass's
 * declaration winning.
 */
function declaredProps(Class: Function): Map<string, PropInfo> {
  const chain: ReturnType<typeof schemaOf>[] = []
  for (let schema: ReturnType<typeof schemaOf> | undefined = schemaOf(Class); schema; schema = schema.parent)
    chain.unshift(schema)
  const props = new Map<string, PropInfo>()
  for (const schema of chain) for (const [name, info] of schema.declared) props.set(name, info)
  return props
}

////////////////
// ## Helpers
////////////////

/** `info`'s legal values, when they're all plain values (text, numbers, yes or no):  else `undefined`. */
function legalValues(info: PropInfo): readonly unknown[] | undefined {
  const values = typeof info.oneOf === "function" ? info.oneOf() : info.oneOf
  if (!values?.length || !values.every((it) => it === null || typeof it !== "object")) return undefined
  return values
}

/** Is `value` a plain object? */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** `value`, as a problem's message names it:  `a number`, `text`, `a list` ... */
function describe(value: unknown): string {
  if (Array.isArray(value)) return "a list"
  if (typeof value === "string") return "text"
  if (typeof value === "number") return "a number"
  if (typeof value === "boolean") return "yes or no"
  return "an object"
}
