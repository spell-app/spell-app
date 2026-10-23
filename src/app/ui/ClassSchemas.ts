import { schemaOf, type PropInfo } from "spell/util"
import type { V } from "spell-ui/api"

/****************
 * ### `ClassSchemas`
 * A spell class, as what `<ui-property-editor>` reads (a `PropertySchema`):  one attribute per declared property.
 *
 * - It's the app's, not Spell UI's:  Spell UI never imports spell's packages, and the app may import both.
 *   - That's epic `property-editor` Q16, "for now".
 *   - Its todo T6 weighs going through the class's JSON Schema instead.
 * - What it reads is what the compiled class declares of each property (`schemaOf()`):
 *   its type, its legal values, its default, a list's item type.
 *   - A superclass's properties come first;  a subclass's declaration of the same name wins.
 *   - Each type, as a form edits it:
 *     - `text`, `number`, `date` as they are
 *     - spell's `choice` (a yes or no) as `boolean`
 *     - legal values as a `choice`
 *     - a list as a `list` of its item's type
 *     - a class name as a nested `thing`
 * - No labels yet:  a form makes them from the names (`listsStartAt` => `Lists start at`).
 * - STATIC and instance-free:  it keeps nothing between calls.
 ****************/
export class ClassSchemas {
  /** `Class`'s declared properties, as a property schema named for it. */
  static fromClass(Class: Function): V.PropertySchema {
    return { name: Class.name, attributes: ClassSchemas.attributesOf(Class) }
  }

  /** One attribute per property `Class` declares, inherited ones first. */
  private static attributesOf(Class: Function): V.AttributeSpec[] {
    const attributes: V.AttributeSpec[] = []
    for (const [name, info] of ClassSchemas.declaredProps(Class)) attributes.push(ClassSchemas.attributeOf(name, info))
    return attributes
  }

  /** One declared property, as an attribute. */
  private static attributeOf(name: string, info: PropInfo): V.AttributeSpec {
    const values = ClassSchemas.legalValues(info)
    const type: V.ValueType = values ? "choice" : ClassSchemas.typeOf(info.type)
    const spec: Writable<V.AttributeSpec> = { name, kind: KIND_FOR_TYPE[type], type, description: "" }
    if (values) spec.values = values.map(String)
    if (isPlainDefault(info.default)) spec.default = info.default
    if (type === "list" && info.itemType) spec.of = ClassSchemas.typeOf(info.itemType)
    // what its value must be, as the type says in spell (epic `property-editor` P9)
    if (info.rules?.length) spec.rules = info.rules
    return spec
  }

  /** A spell type's name, as a form edits it:  a capitalised name is a class, a nested `thing`. */
  private static typeOf(spellType: string | undefined): V.ValueType {
    if (!spellType) return "data"
    if (spellType in VALUE_TYPES) return VALUE_TYPES[spellType]!
    return /^[A-Z]/.test(spellType) ? "thing" : "data"
  }

  /** `info`'s legal values, when they're all plain values (text, numbers, yes or no):  else `undefined`. */
  private static legalValues(info: PropInfo): readonly unknown[] | undefined {
    const values = typeof info.oneOf === "function" ? info.oneOf() : info.oneOf
    if (!values?.length || !values.every((value) => value === null || typeof value !== "object")) return undefined
    return values.filter((value) => value !== null)
  }

  /** Every property `Class` declares, inherited and its own, by name:  a superclass's first. */
  private static declaredProps(Class: Function): Map<string, PropInfo> {
    const chain: ReturnType<typeof schemaOf>[] = []
    for (let schema: ReturnType<typeof schemaOf> | undefined = schemaOf(Class); schema; schema = schema.parent)
      chain.unshift(schema)
    const props = new Map<string, PropInfo>()
    for (const schema of chain) for (const [name, info] of schema.declared) props.set(name, info)
    return props
  }
}

/** An `AttributeSpec` being built:  its fields writable. */
type Writable<T> = { -readonly [K in keyof T]: T[K] }

/** Spell's value types, as a form edits them:  spell's `choice` is a yes or no. */
const VALUE_TYPES: Record<string, V.ValueType> = {
  text: "text",
  number: "number",
  choice: "boolean",
  date: "date",
  list: "list"
}

/** The kind an attribute read from a class gets, by its value's type:  property-only, never a CSS class word. */
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

/** A default an attribute can hold as it is:  text, a number, yes / no. */
function isPlainDefault(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
}
