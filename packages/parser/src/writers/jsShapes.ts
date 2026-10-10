import { P } from "$/parser"

/**
 * What the javascript writers (`P.JSWriter`, `P.TSWriter`) read off a spell tree:  pure helpers, nothing written.
 * - What a node is (`isCoreCall()`, `isTight()` ...)
 * - What a datatype is, as `JSWriter.kindOf()` says it
 * - The `spellCore` helpers both writers say their own way
 * - How an element's attribute is named on the page (`attributeName()`)
 * - Not in the barrel:  the writers' own.
 */

/** `node` without the parentheses around it. */
export function unwrapped(node: P.ASTExpression): P.ASTExpression {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node
}

/** Does `node` bind at least as tightly as `.`, so nothing needs parentheses around it?  A name, a read, a call ... */
export function isTight(node: P.ASTExpression): boolean {
  return !(
    node instanceof P.ASTInfixExpression ||
    node instanceof P.ASTTernaryExpression ||
    node instanceof P.ASTNotExpression ||
    node instanceof P.ASTAwaitExpression ||
    node instanceof P.ASTMethodDefinition ||
    node instanceof P.ASTNewInstanceExpression ||
    node instanceof P.ASTJSXElement
  )
}

/** Is `node` a `spellCore` method's result, maybe in parens?  `@spell/core` types those `unknown`. */
export function isCoreCall(node: P.ASTNode): boolean {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node instanceof P.ASTScopedMethodInvocation && node.thing instanceof P.ASTSpellCoreExpression
}

/** Is `node` the number `value` written out, e.g. `-1`? */
export function isNumber(node: P.ASTExpression | undefined, value: number): boolean {
  const inner = node && unwrapped(node)
  return inner instanceof P.ASTNumericLiteral && Number(inner.value) === value
}

/** Is `value` member `name` read off something, e.g. `the name of the pile` for `name`? */
export function readsMember(value: P.ASTExpression, name: string): boolean {
  const inner = unwrapped(value)
  return inner instanceof P.ASTPropertyExpression && inner.property.value === name
}

/** The one kind in `kinds`, e.g. `"text"` -- `undefined` if there's more than one, or one can't be told. */
export function alike(kinds: Set<string | undefined>): string | undefined {
  const [kind] = kinds
  return kinds.size === 1 ? kind : undefined
}

/**
 * What a new list says it holds:  `a new list of piles` => `new List({ instanceType: "Pile" })` => `"Pile"`.
 * - `undefined` for a list that doesn't say, or anything else made.
 */
export function newListItemName(node: P.ASTNewInstanceExpression): string | undefined {
  if (node.type.name !== "List") return undefined
  const itemType = node.props?.properties.find(
    (property): property is P.ASTObjectLiteralProperty =>
      property instanceof P.ASTObjectLiteralProperty && property.property.value === "instanceType"
  )?.value
  return itemType instanceof P.ASTStringLiteral && itemType.quote ? itemType.value : undefined
}

////////////////
// ## Kinds of value
////////////////

/**
 * What a value of spell's `datatype` is, as `JSWriter.kindOf()` says it, e.g. a variable's, a method's.
 * - `undefined` for a list:  it may be a `List` or an array.
 */
export function kindFromDatatype(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
  if (typeof datatype !== "string" || !datatype || datatype.startsWith("list")) return undefined
  if (datatype === "text" || datatype === "character") return "text"
  if (datatype === "number" || datatype === "integer") return "number"
  if (datatype === "choice") return "choice"
  return /^[A-Z]/.test(datatype) ? datatype : undefined
}

/**
 * What a PROPERTY declared as spell's `datatype` holds, as `JSWriter.kindOf()` says it:
 * as `kindFromDatatype()`, plus the class spell's own `thing`, `app` and `date` are (`Thing`, `App`, `Date`).
 * - `undefined` for nothing, a list, or a name that isn't a class's.
 */
export function kindOfType(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
  if (typeof datatype !== "string" || !datatype || datatype.startsWith("list")) return undefined
  if (Object.hasOwn(BUILT_IN_KINDS, datatype)) return BUILT_IN_KINDS[datatype as P.Datatype]
  return /^[A-Z]\w*$/.test(datatype) ? datatype : undefined
}

/** Is `datatype` one spell knows:  built in, a list, or a type in Type_Case?  See `kindOfType()`. */
export function isKnownType(datatype: P.Datatype | RegExpConstructor | undefined): boolean {
  if (typeof datatype !== "string" || !datatype) return false
  return datatype.startsWith("list") || Object.hasOwn(BUILT_IN_KINDS, datatype) || /^[A-Z][\w$]*$/.test(datatype)
}

/** What each of spell's built-in datatypes holds, as `kindOfType()` says it. */
const BUILT_IN_KINDS: Record<P.Datatype, string | undefined> = {
  text: "text",
  character: "text",
  number: "number",
  integer: "number",
  choice: "choice",
  date: "Date",
  nothing: undefined,
  thing: "Thing",
  app: "App",
  list: undefined
}

////////////////
// ## `spellCore` helpers
////////////////

/** A `spellCore` helper written with an operator, which needs parentheses as an operand:  see `JSWriter.tight()`. */
export const LOOSE_CORE_CALL = /^!|^typeof |\s(?:===|!==|instanceof)\s/

/** Spell's events, through `@spell/core`'s own `on()`, `trigger()` ... -- see `JSWriter.eventCall()`. */
export const EVENTS = new Set(["on", "off", "once", "trigger"])

/** `spellCore` helpers worth importing by name, e.g. `positionOf(Card.Ranks, this.rank)`. */
export const IMPORTED_HELPERS = new Set(["positionOf"])

////////////////
// ## Drawing
////////////////

/**
 * The page's name for attribute `name` of element `tag`, as both writers write it.
 * - `changes`:  is its value one that can change, or an object?
 * - `className` => `class`, `htmlFor` => `for`
 * - a camelCase attribute of an HTML tag, lowercased:  `colSpan` => `colspan`
 * - on a tag with a dash (`<ui-form>`), a value that can change, or an object, is a PROPERTY, `prop:value`:
 *   an attribute holds only text.
 *   A handler (`onClick`), a dashed name (`aria-label`) and `ATTRIBUTES_ONLY` stay attributes.
 * - Decided when it compiles.
 *   Before epic `output-targets` P20, compiled javascript drew with `@spell/core`'s `element()` (now deprecated),
 *   which decided it as it drew.
 */
export function attributeName(tag: string, name: string, changes: boolean): string {
  if (name === "className") return "class"
  if (name === "htmlFor") return "for"
  if (tag.includes("-")) {
    const isProperty = !name.startsWith("on") && !name.includes("-") && !ATTRIBUTES_ONLY.has(name)
    return isProperty && changes ? `prop:${name}` : name
  }
  if (!name.startsWith("on") && /[a-z][A-Z]/.test(name)) return name.toLowerCase()
  return name
}

/** What stays an attribute on a tag with a dash, whatever its value:  see `attributeName()`. */
export const ATTRIBUTES_ONLY = new Set(["class", "className", "style", "id", "slot", "part"])

////////////////
// ## Modules
////////////////

/** An import from another project:  `import { Card, play_it as play } from "@spell/project/..."`. */
export const PROJECT_IMPORT = /^import \{ ([^}]*) \} from "(@spell\/project\/[^"]*)"$/gm

/** The import from `@spell/core`:  `import { spellCore, Thing, List, App, h } from "@spell/core"`. */
export const CORE_IMPORT = /^import \{ ([^}]*) \} from "@spell\/core"$/m

/**
 * Each class `code` imports from another project, by its name here => [its module, its name there],
 * e.g. `Card` => `["@spell/project/@system:library:cards", "Card"]`.
 */
export function importedClasses(code: string): Map<string, [string, string]> {
  const imported = new Map<string, [string, string]>()
  for (const [, names, from] of code.matchAll(PROJECT_IMPORT)) {
    for (const name of names!.split(/,\s*/)) {
      const [there, here = there] = name.split(/\s+as\s+/) as [string, string?]
      if (/^[A-Z]/.test(there)) imported.set(here, [from!, there])
    }
  }
  return imported
}
