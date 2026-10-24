// the types-only leaf:  `spell-ui` would bring its elements (and Solid's JSX) into spaces' type check
import type * as VT from "spell/element/vocabulary.types"

/****************
 * ### `TypeSchemas`
 * A spell type's properties, as what `<ui-property-editor>` reads (a `PropertySchema`),
 * from its project's compiled DECLARATIONS file, `<project>.declarations.json5` (epic `property-editor` P6, Q18).
 *
 * - What it reads:  each `{ "property": ..., "of": <type> }` statement:
 *   - its name, as javascript has it (`short_suit`):  what a form binds
 *   - its label, from how it was written (`asWritten`, `short suit` => `Short suit`)
 *   - `enumeration`:  a choice of those values
 *     - and a value kind's, for a property holding one:  `- its "suit" is a suit` is a choice of the suits
 *       (`Suit`'s statement holds them, epic `spanish` P11)
 *   - `datatype`, as a form edits it:
 *     - `text`, `number`, `date` as they are
 *     - `choice`:  a yes or no
 *     - `list of texts`:  a list of text
 *     - `list of <things>`:  a list of nested things
 *     - a type's name:  a nested thing
 *   - `constants` (a value worked out from others, `color`):  left out, a person can't set it
 * - Why the declarations:  every compiled project has them,
 *   and the spell editor and `spell lint` have no running program.
 *   - A running program's class says more (the app's `ClassSchemas`):  use it when there is one.
 * - NOTE: the declarations don't say which other properties are worked out (`name`, `short suit`):
 *   they're listed as any other.
 *   Remove them from a page by hand;  the running class leaves them out.
 * - Pure data:  safe in a browser and in node.
 * - STATIC and instance-free:  it keeps nothing between calls.
 ****************/
export class TypeSchemas {
  /** Type `type`'s properties in `declarations`, as a property schema;  `undefined` if it declares no such type. */
  static fromDeclarations(declarations: Declarations, type: string): VT.PropertySchema | undefined {
    const statements = declarations.statements ?? []
    if (!statements.some((statement) => statement.type === type)) return undefined
    const attributes: VT.AttributeSpec[] = []
    for (const statement of statements) {
      if (statement.of !== type || !statement.property || statement.constants) continue
      attributes.push(TypeSchemas.attributeOf(TypeSchemas.withValueKind(statement, statements)))
    }
    return { name: type, attributes }
  }

  /** The types `declarations` declares, in order. */
  static typesIn(declarations: Declarations): string[] {
    return (declarations.statements ?? []).flatMap((statement) => (statement.type ? [statement.type] : []))
  }

  /**
   * `statement`, with the values of the value kind it holds, if it holds one:
   * `{ property: "suit", datatype: "Suit" }` takes `Suit`'s `enumeration`, clubs ... spades.
   */
  private static withValueKind(
    statement: DeclarationStatement,
    statements: readonly DeclarationStatement[]
  ): DeclarationStatement {
    if (statement.enumeration || !statement.datatype) return statement
    const kind = statements.find((it) => it.type === statement.datatype && it.enumeration)
    return kind ? { ...statement, enumeration: kind.enumeration } : statement
  }

  /** One property statement, as an attribute. */
  private static attributeOf(statement: DeclarationStatement): VT.AttributeSpec {
    const name = statement.property!
    const label = statement.asWritten ? TypeSchemas.sentence(statement.asWritten) : undefined
    // what its value must be, as the type says in spell (epic `property-editor` P9)
    const rules = statement.rules?.length ? statement.rules : undefined
    if (statement.enumeration) {
      return {
        name,
        kind: "enum",
        type: "choice",
        values: statement.enumeration.map(String),
        description: "",
        ...(label && { label }),
        ...(rules && { rules })
      }
    }
    const { type, of } = TypeSchemas.typeOf(statement.datatype)
    return {
      name,
      kind: KIND_FOR_TYPE[type],
      type,
      ...(of && { of }),
      description: "",
      ...(label && { label }),
      ...(rules && { rules })
    }
  }

  /** A `datatype`, as a form edits it:  `list of texts` is a list `of` text. */
  private static typeOf(datatype: string | undefined): { type: VT.ValueType; of?: VT.ValueType } {
    if (!datatype) return { type: "data" }
    const list = /^list of (.+?)s?$/.exec(datatype)
    if (list) return { type: "list", of: TypeSchemas.typeOf(list[1]).type }
    return { type: VALUE_TYPES[datatype] ?? "thing" }
  }

  /** `short suit` => `Short suit`. */
  private static sentence(words: string): string {
    const spaced = words.replaceAll("-", " ")
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
  }
}

/** A compiled project's declarations file, the parts `TypeSchemas` reads. */
export type Declarations = {
  statements?: readonly DeclarationStatement[]
}

/** One statement of a declarations file:  a type, or a property of one (the parts read here). */
export type DeclarationStatement = {
  /** A type's name, `Card`, for a type's statement. */
  type?: string
  /** A property's name, as javascript has it, `short_suit`. */
  property?: string
  /** How the property was written, `short suit`. */
  asWritten?: string
  /** The type the property is of. */
  of?: string
  /** Its values, when it's one of a set. */
  enumeration?: readonly unknown[]
  /** Its values, when it's worked out from others. */
  constants?: readonly unknown[]
  /** Its type, `text`, `number`, `choice`, `date`, `list of texts`, a type's name. */
  datatype?: string
  /** What its value must be, `[{ type: "empty" }]`, as the type says in spell (epic `property-editor` P9). */
  rules?: readonly VT.RuleSpec[]
}

/** Spell's value types, as a form edits them:  spell's `choice` is a yes or no. */
const VALUE_TYPES: Record<string, VT.ValueType> = {
  text: "text",
  number: "number",
  choice: "boolean",
  date: "date"
}

/** The kind an attribute read from declarations gets, by its value's type:  property-only, never a CSS class word. */
const KIND_FOR_TYPE: Record<VT.ValueType, VT.AttributeKind> = {
  text: "string",
  number: "number",
  boolean: "boolean",
  date: "string",
  choice: "enum",
  list: "json",
  thing: "json",
  data: "json"
}
