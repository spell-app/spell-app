import { P } from "$/parser"
// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"

/****************
 * ### `TSWriter`
 * Writes a spell tree as TypeScript:  the `ts/solid` target's writer.
 * - The `JSWriter`'s javascript, plus a type wherever TypeScript needs one and spell knows it:  parameters,
 *   reactive properties, new variables spell knows the datatype of -- from each node's `datatype`, in spell's words
 *   (`text`, `Card`), through `typeFor()`.
 * - A type spell DOESN'T know is written `UNKNOWN`, `any /* spell: type unknown *\/`, never a bare `any`:  so
 *   every gap shows, and can be counted (epic `output-targets`, Q16).  Where TypeScript works a type out by itself
 *   (a new variable set to `new Card()`), nothing is written.
 * - A class member patched on from outside its class (`Card.prototype.play = ...`) gets an `interface` merged with
 *   its class, so TypeScript knows the class has it.
 * - Checked by `tsc` against `@spell/core`'s types -- see `TSWriter.test.ts` in `$/spell`.
 ****************/
export class TSWriter extends JSWriter {
  /** The one `ts/solid` uses. */
  static readonly instance = new TSWriter()

  /** What a type spell doesn't know is written as:  `any`, marked. */
  static UNKNOWN = "any /* spell: type unknown */"

  /**
   * TypeScript for spell's built-in datatypes (`P.BUILT_IN_TYPES`).
   * - `list`:  `any`, marked -- `@spell/core`'s `List` doesn't say what it holds, and spell sets properties on lists
   *   (`the name of the cards`), which a `List` can't have.
   */
  static TYPES: Record<P.Datatype, string> = {
    text: "string",
    character: "string",
    number: "number",
    integer: "number",
    choice: "boolean",
    date: "Date",
    nothing: "undefined",
    thing: "Thing",
    app: "App",
    list: "any /* spell: list */"
  }

  /**
   * TypeScript for spell's `datatype`, e.g. `string` for `text`, `Card` for `Card`;  `undefined` if spell doesn't
   * know it, or it has no TypeScript.
   * - A type spell's project declares is in Type_Case, e.g. `Card`:  as is.
   * - `list of cards`:  as `list`.
   */
  typeFor(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
    if (typeof datatype !== "string" || !datatype) return undefined
    if (datatype.startsWith("list")) return TSWriter.TYPES.list
    if (Object.hasOwn(TSWriter.TYPES, datatype)) return TSWriter.TYPES[datatype]
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(datatype)) return datatype
    return undefined
  }

  ////////////////
  // ## Parameters
  ////////////////

  /** Each typed:  `(card: Card, message: string = "Really?")`;  `this` first when written outside its class. */
  params(method: P.ASTMethodDefinition, thisType?: string): string {
    const params = (method.args ?? []).map((arg) => this.param(arg))
    if (thisType) params.unshift(this.thisParam(thisType))
    return `(${params.join(", ")})`
  }

  /** `name: type`, or `name: type = default`. */
  param(arg: P.ASTVariableExpression): string {
    const type = this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ?? TSWriter.UNKNOWN
    const declared = `${arg.name}: ${type}`
    return arg.default ? `${declared} = ${this.write(arg.default)}` : declared
  }

  thisParam(thisType?: string): string {
    return thisType ? `this: ${thisType}` : ""
  }

  ////////////////
  // ## Reactive properties
  ////////////////

  /** `: type`, e.g. `: string`, `: (typeof Card.Suits)[number]`. */
  valueType(node: P.ASTReactiveProperty): string {
    return `: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
  }

  /** `getProp()` returns `unknown`:  `as` its type, when known. */
  getterBody(node: P.ASTReactiveProperty): string {
    const type = this.propertyType(node)
    if (!type) return super.getterBody(node)
    return `{ return this.getProp(${P.jsText.quoted(node.property.value)}) as ${type} }`
  }

  setterParams(node: P.ASTReactiveProperty, thisType?: string): string {
    const value = `value: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return thisType ? `${this.thisParam(thisType)}, ${value}` : value
  }

  /**
   * What `node` holds, in TypeScript, from its `check`:  `{ type: 'text' }` => `string`;  `{ oneOf: Card.Suits }` =>
   * `(typeof Card.Suits)[number]`, as for a list read when set, `{ oneOf: () => { return Deck.Suits } }`.  Else its
   * initializer's datatype.  `undefined` if unknown.
   */
  propertyType(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
      const key = property.property.value
      if (key === "type" && property.value instanceof P.ASTStringLiteral) return this.typeFor(property.value.value)
      if (key === "oneOf") return `(typeof ${this.write(TSWriter.listOf(property.value))})[number]`
    }
    return this.typeFor(node.initializer?.datatype)
  }

  /** The list a `oneOf` check names:  `value` itself, or what it returns when it's read when set, `() => Deck.Suits`. */
  static listOf(value: P.ASTExpression): P.ASTExpression {
    if (!(value instanceof P.ASTMethodDefinition)) return value
    const [returned] = value.body.statements ?? []
    return returned instanceof P.ASTReturnStatement && returned.value ? returned.value : value
  }

  /** From outside its class:  first an `interface` merged with its class, so TypeScript knows it's there. */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    const member = `${this.write(node.property)}: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return [this.mergedInterface(node.typeName, member), super.ASTReactiveProperty(node)].join(P.jsText.NEWLINE)
  }

  /** From outside its class:  first an `interface` merged with its class -- a getter `readonly`. */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition): string {
    const name = this.write(node.property)
    const member = node.get
      ? `readonly ${name}: ${this.typeFor(node.get.datatype) ?? TSWriter.UNKNOWN}`
      : `${name}${this.signatureParams(node.method!)}: ${this.typeFor(node.method!.datatype) ?? TSWriter.UNKNOWN}`
    return [this.mergedInterface(node.typeName, member), super.ASTPropertyDefinition(node)].join(P.jsText.NEWLINE)
  }

  /**
   * `export interface Card { member }`:  merges with `export class Card`, wherever it is in the file.
   * - NOTE: a class from ANOTHER project, imported, can't merge this way:  `tsc` reports it -- see the epic's caveats.
   */
  mergedInterface(typeName: string, member: string): string {
    return `export interface ${typeName} { ${member} }`
  }

  /** Parameters for a signature, which can't have defaults:  `(card: Card, message?: string)`. */
  signatureParams(method: P.ASTMethodDefinition): string {
    const params = (method.args ?? []).map((arg) => {
      const type = this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ?? TSWriter.UNKNOWN
      return `${arg.name}${arg.default ? "?" : ""}: ${type}`
    })
    return `(${params.join(", ")})`
  }

  ////////////////
  // ## Lists
  ////////////////

  /**
   * A list says what it holds:  `a deck is a list of cards` => `class Deck extends List<Card>`, from its
   * `static instanceType = Card`.  So `spellCore.getItemOf(deck, 1)` is a `Card | undefined`.
   */
  superTypeOf(node: P.ASTClassDeclaration): string {
    const name = super.superTypeOf(node)
    if (name !== "List") return name
    const itemType = node.members?.find(
      (member): member is P.ASTStaticDefinition =>
        member instanceof P.ASTStaticDefinition && member.name === "instanceType"
    )?.value
    return itemType instanceof P.ASTTypeExpression ? `List<${itemType.name}>` : name
  }

  /** A new list says what it holds too:  `a new list of piles` => `new List<Pile>({ instanceType: "Pile" })`. */
  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): string {
    const text = super.ASTNewInstanceExpression(node)
    if (node.type.name !== "List") return text
    const itemType = node.props?.properties.find(
      (property): property is P.ASTObjectLiteralProperty =>
        property instanceof P.ASTObjectLiteralProperty && property.property.value === "instanceType"
    )?.value
    if (!(itemType instanceof P.ASTStringLiteral) || !itemType.quote) return text
    return text.replace(/^new List/, `new List<${itemType.value}>`)
  }

  /**
   * A property of a `spellCore` call's result:  `!`, as spell reads it whatever it is, e.g.
   * `spellCore.getItemOf(deck, -1)!.name`.  Javascript does the same:  `!` changes no code, only the type.
   */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const text = super.ASTPropertyExpression(node)
    if (!isCoreCall(node.object)) return text
    const object = String(this.write(node.object))
    return `${object}!${text.slice(object.length)}`
  }

  /** A method called on a `spellCore` call's result:  `!`, as `ASTPropertyExpression()`. */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    const text = super.ASTScopedMethodInvocation(node)
    if (!isCoreCall(node.thing)) return text
    const thing = String(this.write(node.thing))
    return `${thing}!${text.slice(thing.length)}`
  }

  ////////////////
  // ## New variables
  ////////////////

  /**
   * A new variable, typed when spell knows its datatype:  `let count: number = 0`.
   * - Set from a `spellCore` call, which returns `unknown`:  `let pile = spellCore.randomItemOf(piles) as Pile`, or
   *   `UNKNOWN` when spell doesn't know either.
   * - Otherwise unknown:  as javascript, TypeScript works it out, e.g. `let game = new Game()`.
   */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    if (!node.isNewVariable) return super.ASTAssignmentStatement(node)
    const { thing, value } = node
    const variable = thing instanceof P.ASTVariableExpression ? thing.variable : undefined
    // `[]`, which TypeScript can't type by itself, is a list
    const isList = value instanceof P.ASTArrayLiteral || value instanceof P.ASTListExpression
    const type =
      this.typeFor(thing.datatype ?? variable?.datatype ?? value.datatype) ??
      (isList ? this.typeFor("list") : undefined)
    const fromCore = isCoreCall(value)
    if (!type && !fromCore) return super.ASTAssignmentStatement(node)
    const export_ = this.isExported(node) ? "export " : ""
    const declared = `${export_}let ${this.write(thing)}`
    if (!type) return `${declared}: ${TSWriter.UNKNOWN} = ${this.write(value)}`
    if (fromCore) return `${declared} = ${this.write(value)} as ${type}`
    return `${declared}: ${type} = ${this.write(value)}`
  }
}

/** Is `node` a `spellCore` method's result, maybe in parens?  `@spell/core` types those `unknown`. */
function isCoreCall(node: P.ASTNode): boolean {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node instanceof P.ASTScopedMethodInvocation && node.thing instanceof P.ASTSpellCoreExpression
}
