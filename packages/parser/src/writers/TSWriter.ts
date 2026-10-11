import { drawableAttributeFor, elementTagFor } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"
import * as jsText from "./jsText"
import { attributeName, importedClasses, isCoreCall, isTight, newListItemName, unwrapped } from "./jsShapes"
import { forEachNode, listNamedBy, typeCaseOf, type TSUndeclared, type WriterProject } from "./WriterProject"

/****************
 * ### `TSWriter`
 * Writes a spell tree as TypeScript on Solid, as a person would write it by hand:
 * the `ts/solid` target's writer, for `<Project>.compiled.tsx`.
 * - It extends `P.JSWriter`, and says everything javascript says the way javascript says it:
 *   - names, every one camelCase:  `isASuit()`, `turnFaceUp()`, `allPiles`, `isSetUp`
 *   - a `List`'s own methods, `===`, loops, template text
 *   - its tidying:  `const` unless set again, no extra parentheses or braces, no unused parameters
 *   - one class body per type:  members written anywhere in the project go inside their class
 * - What's here is only TypeScript's own:  types, decorators, JSX, and `!` where `?.` can't go.
 * - Real JSX, which Solid's compiler builds:  `<span class="suit">{this.shortSuit}</span>`.
 * - A drawing in Solid's shapes, where it can be:
 *   - a computed local becomes an accessor, `const className = () => ...`
 *   - an `if ... return` chain becomes a `<Show>` / `<Switch>`
 *   - `draw cards in it` becomes a `<For>`
 *   - Any other `to draw` re-runs whole, in its error boundary.
 * - Decorators:
 *   - `@prop({ oneOf: RANKS }) accessor rank!: Rank`
 *   - `@derived get state()`
 *   - `@thing`
 *   - `@drawn` on `draw()`:  each drawn thing in its own error boundary,
 *     as `spellCore.drawThing()` does for compiled javascript
 * - Types where spell knows them:  parameters, properties, lists `as const`.
 *   - A type spell DOESN'T know is written `UNKNOWN`, `any /* spell: type unknown *\/`, never a bare `any`:
 *     so every gap shows, and can be counted (epic `output-targets`, Q16).
 * - Where the program never says a type, what it does says it (Q54):
 *   - a property's type, from the values it's given (`givenKind()`)
 *   - a method only sub-classes define, from what they return (`definitionsKind()`)
 *   - a method written outside its class, from what it returns:
 *     `play(): Promise<boolean | undefined>` (`returnType()`, epic `output-targets`, T24)
 *   - a value kind's parameter, from its values:  `static color(suit: (typeof SUITS)[number])` (`valueKindType()`)
 * - A drawable type's element class, after its class:  `class CardElement extends SpellElement<Card>`,
 *   handed to the page with `spellCore.useElement(Card, CardElement)` -- see `elementClassFor()`.
 * - Spell's own built-ins stay `spellCore` calls, so both targets print the same:
 *   `getItemAt(rank, 1)` counts from 1 (the core contract, `contract.test.ts` in `$/cli`).
 * - Sees the whole project first (`forProject()`, a `P.WriterProject`).
 *   `TSWriter.instance` alone knows nothing of it, e.g. writing one node in a test.
 * - Checked by `tsc` against `@spell/core`'s types:  see `typescript.test.ts` in `$/spell`.
 ****************/
export class TSWriter extends JSWriter {
  /** The one `ts/solid` starts from:  it knows no project -- see `forProject()`. */
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
   * While writing a drawing in Solid's shapes:  its locals that became accessors, by TypeScript name, e.g.
   * `className`:  each read is a call, `className()`.
   */
  private accessors = new Set<string>()
  /** While writing a drawing:  handlers it uses more than once, written once as a local, by their text => its name. */
  private sharedHandlers = new Map<string, string>()
  /** Destructurings typed by the parameter they read, e.g. an event's payload:  see `arrow()`. */
  private typedByParam = new WeakSet<P.ASTDestructuredAssignment>()
  /** While writing a getter:  what it returns early for nothing, e.g. `0` -- see `ASTReturnStatement()`. */
  private getterDefault: P.ASTExpression | undefined
  /** While writing a call of the program's own:  its arguments are passed as found -- see `argsOf()`. */
  private passedAsFound = false
  /** While writing a callback a list's own method takes:  its item is typed by the list -- see `callback()`. */
  private untypedItems = false
  /** Each drawable type's tag, e.g. `solitaire-card`, by its element class's name:  see `elementClassFor()`. */
  private elementTags = new Map<string, string>()

  /**
   * The finished module, as javascript's (`JSWriter.module()`), plus:
   * - its `@spell/core` import names the decorators `code` uses too,
   *   and Solid's control flow (`<Show>`, `<For>` ...) is imported from `solid-js` above it
   * - a member it adds to a class it imports is declared in that project's module,
   *   `declare module "..." { interface Card {...} }`:
   *   TypeScript refuses an `interface` merged with an import (`TS2440`)
   * - with a drawable type's element class:  `@spell/elements` imported below `@spell/core`,
   *   and each drawable type's tag declared for the JSX, last (`elementTagsDeclaration()`)
   */
  module(code: string): string {
    const solid = SOLID_COMPONENTS.filter((name) => new RegExp(`<${name}[\\s>]`).test(code))
    code = super.module(code)
    if (this.elementTags.size) {
      code = this.withElementsImport(code)
      code = `${code.replace(/\n*$/, "")}\n\n${this.elementTagsDeclaration()}`
    }
    // what this project gives a class it imports, for TypeScript only (Q25):  declared in that project's module
    for (const [type, undeclared] of this.project.undeclared) {
      if (!this.project.importedMembers.has(type)) continue
      const members = undeclared.map((it) => this.undeclaredMember(type, it))
      code = `${code.replace(/\n*$/, "")}\nexport interface ${this.typeNameOf(type)} {\n${indented(members.join("\n"))}\n}\n`
    }
    // each class imported from another project, by its name here => [its module, its name there]
    const imported = importedClasses(code)
    // one line (`mergedInterface()`), or a block
    const interfaces = /^export interface (\w+) (\{ .* \}|\{\n(?: {2}.*\n)*\})$/gm
    code = code.replace(interfaces, (line, name: string, members: string) => {
      const found = imported.get(name)
      if (!found) return line
      const [from, there] = found
      return `declare module "${from}" {\n${indented(`interface ${there} ${members}`)}\n}`
    })
    return solid.length ? `import { ${solid.join(", ")} } from "solid-js"\n${code}` : code
  }

  /** As javascript's, after the decorators `code` uses, e.g. `prop`, `drawn`. */
  coreImportNames(code: string): string[] {
    const decorators = DECORATORS.filter((name) => new RegExp(`^\\s*@${name}\\b`, "m").test(code))
    return [...decorators, ...super.coreImportNames(code)]
  }

  /**
   * TypeScript for spell's `datatype`, e.g. `string` for `text`, `Card` for `Card`;
   * `undefined` if spell doesn't know it, or it has no TypeScript.
   * - A type spell's project declares is in PascalCase, e.g. `Card`:  as we write a type's name (`typeNameOf()`).
   * - `list of cards`:  as `list`.
   */
  typeFor(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
    if (typeof datatype !== "string" || !datatype) return undefined
    if (datatype.startsWith("list")) return TSWriter.TYPES.list
    if (Object.hasOwn(TSWriter.TYPES, datatype)) return TSWriter.TYPES[datatype]
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(datatype)) return this.typeNameOf(datatype)
    return undefined
  }

  /**
   * TypeScript for what `kindOf()` says a value is, e.g. `string` for `"text"`, `Pile` for `"Pile"`.
   * - `undefined` for a list (it doesn't say what it holds), or for nothing known.
   */
  typeForKind(kind: string | undefined): string | undefined {
    return kind === "list" ? undefined : this.typeFor(kind)
  }

  ////////////////
  // ## Names
  ////////////////

  /** A variable, by TypeScript's name:  `allPiles`;  a drawing's accessor read as a call, `className()`. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    const name = this.variableName(node)
    if (node.default) return `${name} = ${this.bare(node.default)}`
    return this.accessors.has(name) ? `${name}()` : name
  }

  /**
   * As javascript's:  `?.` off what may be nothing, `startPile.lastItem?.state`.
   * - Being SET, it can't be `?.`:  `!` instead, `app.tasks.firstItem!.title = "New title"`.
   */
  memberDot(node: P.ASTPropertyExpression): string {
    if (!this.mayBeNothing(node.object)) return "."
    return this.isSetting(node) ? "!." : "?."
  }

  /**
   * A call's `(args)`, for a method or function of the program's own.
   * - An argument that may be nothing (an item read from a list) is passed as found, as spell passes it:
   *   `moveToPile(tableaus.getItem(column)!)`.  A typed parameter can't take it otherwise.
   * - `spellCore`'s helpers take anything:  see `ASTInvocationArgs()`.
   */
  argsOf(node: P.ASTMethodInvocation): string {
    const previous = this.passedAsFound
    this.passedAsFound = true
    try {
      return String(this.write(node.args))
    } finally {
      this.passedAsFound = previous
    }
  }

  /** `(args)`:  each one that may be nothing passed as found, `!`, where `argsOf()` asks -- see there. */
  ASTInvocationArgs(node: P.ASTInvocationArgs): string {
    if (!this.passedAsFound) return super.ASTInvocationArgs(node)
    this.passedAsFound = false
    const args = (node.args ?? []).map((arg) => (this.mayBeNothing(arg) ? `${this.tight(arg)}!` : this.bare(arg)))
    return args.length ? `(${args.join(", ")})` : "()"
  }

  /**
   * As javascript's:  `thing.name(args)`, by our name, `card.moveToPile(endPile)`;  `?.` off what may be nothing.
   * - The list holding an item, `the pile of a card`, is read as found:  `Pile.ownerOf(this)!`.
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    const call = super.ASTScopedMethodInvocation(node)
    const isOwnerRead = node.thing instanceof P.ASTTypeExpression && node.methodName === "ownerOf"
    return isOwnerRead ? `${call}!` : call
  }

  /** Does `node` bind at least as tightly as `.`?  Not an element:  JSX, `(<div />)`. */
  protected bindsTightly(node: P.ASTExpression): boolean {
    return isTight(node)
  }

  ////////////////
  // ## `spellCore`'s helpers, as TypeScript says them
  ////////////////

  /** As javascript's (`JSWriter.coreCall()`), plus drawing:  `card.draw()`, `<For>` -- see `drawThing()`, `drawItems()`. */
  coreCall(node: P.ASTScopedMethodInvocation): string | undefined {
    const [first] = node.args.args ?? []
    if (node.methodName === "drawThing") return this.drawThing(first)
    if (node.methodName === "drawItems") return first && this.drawItems(first)
    return super.coreCall(node)
  }

  /** `callback`, the function a list's own method takes:  its item typed by the list, so bare -- see `listCall()`. */
  callback(callback: P.ASTExpression | undefined): string {
    const previous = this.untypedItems
    this.untypedItems = true
    try {
      return super.callback(callback)
    } finally {
      this.untypedItems = previous
    }
  }

  /** A typed argument that may be nothing, passed as found, `pile.remove(card!)`:  see `argsOf()`. */
  foundArg(arg: P.ASTExpression): string {
    return this.mayBeNothing(arg) ? `${this.tight(arg)}!` : this.bare(arg)
  }

  /**
   * As javascript's, plus a handler that takes the payload apart (Q37):
   * `on<{ card: Card }>("card-click", ({ card }) => card.play())`.
   * - The payload's type is a type argument, and the handler's parameter takes it apart.
   */
  eventCall(name: string, args: P.ASTExpression[]): string {
    const [type, handler] = args
    const method = handler && unwrapped(handler)
    if (name !== "on" || !(method instanceof P.ASTMethodDefinition)) return super.eventCall(name, args)
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [first, ...rest] = statements
    const [event] = method.args ?? []
    const read = first instanceof P.ASTDestructuredAssignment ? unwrapped(first.thing) : undefined
    const shape = first instanceof P.ASTDestructuredAssignment ? this.shapeOf(first) : undefined
    const takesPayload = shape && event && read instanceof P.ASTVariableExpression && read.name === event.name
    if (!takesPayload) return super.eventCall(name, args)
    this.coreImports.add(name)
    const names = this.destructured(first as P.ASTDestructuredAssignment)
    const async = method.isAsync ? "async " : ""
    const [only] = rest
    const body =
      rest.length === 1 && (only instanceof P.ASTScopedMethodInvocation || only instanceof P.ASTMethodInvocation)
        ? String(this.write(only))
        : this.write(new P.ASTStatementBlock(method.body.match, { statements: rest, wrap: true }))
    return `on<${shape}>(${this.bare(type!)}, ${async}({ ${names.join(", ")} }) => ${body})`
  }

  /** `thing.draw()` -- `?.draw()` when it may be nothing, e.g. the last card of a pile. */
  drawThing(thing: P.ASTExpression | undefined): string {
    if (!thing) return "undefined"
    return `${this.tight(thing)}${this.mayBeNothing(thing) ? "?." : "."}draw()`
  }

  /**
   * `<For each={pile.items}>{(card) => card.draw()}</For>`:  each item in its own error boundary, kept by identity.
   * - Its item is named for the list's item type when it's ours, e.g. `card` in a `Tableau`, else `item`.
   */
  drawItems(list: P.ASTExpression): string {
    const self = unwrapped(list)
    const isSelf = self instanceof P.ASTSelfLiteral || (self instanceof P.ASTVariableExpression && self.name === "this")
    const itemType = isSelf && this.project.itemTypeOf(this.currentClass)
    const item = itemType ? itemType.charAt(0).toLowerCase() + itemType.slice(1) : "item"
    return `<For each={${this.memberObject(list)}.items}>{(${item}) => ${item}.draw()}</For>`
  }

  /**
   * As javascript's, plus a getter's type when spell knows it:  `get state(): string {...}`.
   * - Why:  TypeScript works a getter's type out from its body,
   *   and a body that loops over a list of the getter's own class goes round in a circle
   *   (`the state of a pile` reads each card, a card reads its pile).
   *   TypeScript gives up quietly, and the loop's item is `unknown`.
   */
  methodNamed(method: P.ASTMethodDefinition, name: string, thisType?: string): string {
    if (!name.startsWith("get ")) return this.methodNamedOf(method, name, thisType)
    const previous = this.getterDefault
    this.getterDefault = earlyReturnOf(method)
    try {
      return this.methodNamedOf(method, name, thisType)
    } finally {
      this.getterDefault = previous
    }
  }

  /** `methodNamed()`'s work. */
  private methodNamedOf(method: P.ASTMethodDefinition, name: string, thisType?: string): string {
    const datatype = name.startsWith("get ") ? method.datatype : undefined
    const type = typeof datatype === "string" && !datatype.startsWith("list") ? this.typeFor(datatype) : undefined
    if (!type) return super.methodNamed(method, name, thisType)
    const async = method.isAsync ? "async " : ""
    const error = method.error ? ` ${this.write(method.error)}` : ""
    return `${async}${name}${this.params(method, thisType)}: ${type} ${this.write(method.body)}${error}`
  }

  /** As javascript's, its item not typed by a list it's given to:  see `callback()`. */
  protected arrowBody(method: P.ASTMethodDefinition, statements: P.ASTNode[]): string {
    const previous = this.untypedItems
    this.untypedItems = false
    try {
      return super.arrowBody(method, statements)
    } finally {
      this.untypedItems = previous
    }
  }

  /**
   * An event's payload, destructured first:  its parameter says what it brings, `(event: { card: Card }) =>`.
   * - SIDE EFFECT:  that destructuring is written untyped -- see `typedByParam`.
   */
  protected payloadType(method: P.ASTMethodDefinition, statements: P.ASTNode[]): string | undefined {
    const [first] = statements
    if (!(first instanceof P.ASTDestructuredAssignment)) return undefined
    const payload = this.shapeOf(first)
    const read = unwrapped(first.thing)
    const [param] = method.args ?? []
    if (!payload || !(read instanceof P.ASTVariableExpression) || read.name !== param?.name) return undefined
    this.typedByParam.add(first)
    return payload
  }

  /**
   * What `node` destructures, as a type, when spell knows what any of it is:  `{ card: Card }` -- else `undefined`.
   * - A field spell doesn't know is `UNKNOWN`.
   */
  shapeOf(node: P.ASTDestructuredAssignment): string | undefined {
    if (!node.isNewVariable) return undefined
    const types = node.variables.map((variable) => this.typeFor(variable.datatype ?? variable.variable?.datatype))
    if (!types.some(Boolean)) return undefined
    const fields = node.variables.map(
      (variable, index) => `${this.nameOf(variable.name)}: ${types[index] ?? TSWriter.UNKNOWN}`
    )
    return `{ ${fields.join("; ")} }`
  }

  /**
   * An arrow's parameter:  typed when spell knows its type (`(card: Card) =>`), else bare, for TypeScript to type
   * from what it's passed to, e.g. `spellCore.map(spellCore.getRange(1, 7), (number) => ...)`:  a `number`.
   * - So no `UNKNOWN` marker:  unlike a method's own parameter,
   *   an arrow is always passed somewhere that says what it gets (a `spellCore` helper, a handler).
   */
  arrowParam(arg: P.ASTVariableExpression): string {
    const type = this.untypedItems
      ? undefined
      : this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype)
    const name = this.variableName(arg)
    const declared = type ? `${name}: ${type}` : name
    return arg.default ? `${declared} = ${this.bare(arg.default)}` : declared
  }

  /**
   * Typed when spell knows what any of them is, e.g. an event's payload, `on card-click with a card`:
   * `const { card }: { card: Card } = event`.
   */
  destructuredType(node: P.ASTDestructuredAssignment): string {
    const shape = this.typedByParam.has(node) ? undefined : this.shapeOf(node)
    return shape ? `: ${shape}` : ""
  }

  ////////////////
  // ## Statements
  ////////////////

  /**
   * A new variable:  `const` unless it's set again (`let`).
   * - Typed when spell knows its datatype, e.g. `let count: number = 0`.
   * - Set from a `spellCore` call, which returns `unknown`:
   *   `const pile = spellCore.randomItemOf(piles) as Pile`, or `UNKNOWN` when spell doesn't know either.
   * - Otherwise unknown:  as javascript, TypeScript works it out, e.g. `const game = new Game()`.
   */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    const { thing, value } = node
    if (!node.isNewVariable) return super.ASTAssignmentStatement(node)
    this.noteLocal(node)
    const declared = this.declarator(node)
    const inner = unwrapped(value)
    if (isCoreCall(inner)) {
      const written = this.bare(value)
      // a list's own method types what it gives by itself, e.g. `startPile.lastItem` is a `Card | undefined`
      if (!written.startsWith("spellCore.")) return `${declared} = ${written}`
      // what spell read it as, e.g. `Card` for `the last card of discards`:  its match says, while parsing
      const datatype = inner.datatype ?? inner.match?.datatype
      const type = typeof datatype === "string" && !datatype.startsWith("list") ? this.typeFor(datatype) : undefined
      if (!type) return `${declared} = ${written}`
      // an item read says its type as a type argument, still maybe nothing:  `spellCore.getItemAt<Card>(...)`
      if (JSWriter.ITEM_READS.has((inner as P.ASTScopedMethodInvocation).methodName)) {
        return `${declared} = ${written.replace(/^spellCore\.(\w+)\(/, `spellCore.$1<${type}>(`)}`
      }
      return `${declared} = ${written} as ${type}`
    }
    const variable = thing instanceof P.ASTVariableExpression ? thing.variable : undefined
    // `[]`, which TypeScript can't type by itself, is a list
    const isList = value instanceof P.ASTArrayLiteral || value instanceof P.ASTListExpression
    const type =
      this.typeFor(thing.datatype ?? variable?.datatype ?? value.datatype) ??
      (isList ? this.typeFor("list") : undefined)
    return type ? `${declared}: ${type} = ${this.bare(value)}` : `${declared} = ${this.bare(value)}`
  }

  /**
   * `return value`, bare -- JSX on several lines in parentheses;  in a loop's body, a bare one is `continue`.
   * - In a getter that says early what nothing means (`if (this.isEmpty) return 0`), a value that may be nothing
   *   falls back to it:  `return this.lastItem?.value ?? 0`.
   */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    if (!node.value) return this.returnContinues ? "continue" : "return"
    const fallback = this.getterDefault
    if (fallback && this.mayBeNothing(node.value)) return `return ${this.tight(node.value)} ?? ${this.bare(fallback)}`
    return `return ${this.parenthesized(this.bare(node.value))}`
  }

  ////////////////
  // ## Parameters
  ////////////////

  /** Each typed:  `(card: Card, message: string = "Really?")`;  `this` first when written outside its class. */
  params(method: P.ASTMethodDefinition, thisType?: string): string {
    const destructured = this.destructuredParam(method)
    const params = (method.args ?? []).map((arg) => {
      if (destructured?.arg !== arg) return this.param(arg)
      // named arguments, `to create a new task (with title as text)`:  typed by their fields, each optional
      const shape = destructured.shape.replace(/(\w+): /g, "$1?: ")
      const declared = `${this.variableName(arg)}: ${shape}`
      return arg.default ? `${declared} = ${this.bare(arg.default)}` : declared
    })
    if (thisType) params.unshift(this.thisParam(thisType))
    return `(${params.join(", ")})`
  }

  /**
   * `method`'s parameter its body destructures first, e.g. a method's named arguments, and what spell knows of
   * them:  `{ title: string }` -- `undefined` if none, or spell knows nothing of them.
   * - SIDE EFFECT:  that destructuring is written untyped, as its parameter says -- see `typedByParam`.
   */
  destructuredParam(method: P.ASTMethodDefinition): { arg: P.ASTVariableExpression; shape: string } | undefined {
    const [first] = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (!(first instanceof P.ASTDestructuredAssignment)) return undefined
    const read = unwrapped(first.thing)
    const arg = (method.args ?? []).find((it) => read instanceof P.ASTVariableExpression && read.name === it.name)
    const shape = arg && this.shapeOf(first)
    if (!arg || !shape) return undefined
    this.typedByParam.add(first)
    return { arg, shape }
  }

  /** `name: type`, or `name: type = default`. */
  param(arg: P.ASTVariableExpression): string {
    const declared = `${this.variableName(arg)}: ${this.paramType(arg)}`
    return arg.default ? `${declared} = ${this.bare(arg.default)}` : declared
  }

  /** The type of parameter `arg`, e.g. `Card` -- `UNKNOWN` if spell can't tell. */
  paramType(arg: P.ASTVariableExpression): string {
    return (
      this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ??
      this.slotType(arg) ??
      this.valueKindType(arg) ??
      TSWriter.UNKNOWN
    )
  }

  /**
   * A method's parameter named for a property of its class:  that property's type, e.g. `isASuit(suit: Suit)` for
   * `a card "is a (suit)" for its suits` -- the slot ranges over a card's suits.  `undefined` if there's none.
   */
  slotType(arg: P.ASTVariableExpression): string | undefined {
    const property = this.project.propertyOf(this.currentClass, arg.name)
    return property && this.propertyType(property)
  }

  /**
   * A value kind's parameter named for it, e.g. `suit` in `static color(suit)` on `Suit`:
   * one of its values, `(typeof SUITS)[number]` -- see `WriterProject.valueKinds`.
   * - `undefined` for any other.
   */
  valueKindType(arg: P.ASTVariableExpression): string | undefined {
    const list = this.currentClass ? this.project.valueKinds.get(this.currentClass) : undefined
    if (!list || typeCaseOf(arg.name) !== this.currentClass) return undefined
    return `(typeof ${list.constant})[number]`
  }

  thisParam(thisType?: string): string {
    return thisType ? `this: ${thisType}` : ""
  }

  ////////////////
  // ## Classes
  ////////////////

  /**
   * `export class Card extends Thing {...}`, with every member the project gives it
   * (see `WriterProject.movedMembers`), and `@thing` above it when it has a `create()`.
   * - Its lists of values go above it, and above its docstring:
   *   see `classPrefix()`, and the statement group holding it.
   */
  ASTClassDeclaration(node: P.ASTClassDeclaration): string {
    const declaration = this.withProjectMembers(node)
    const hoisted = new Set(this.listsOf(declaration).map((list) => list.definition))
    // the docstring right above a hoisted list went with it
    const docstrings = new Set([...hoisted].map((definition) => docstringAbove(definition, declaration.members ?? [])))
    const members = (declaration.members ?? []).filter((member) => !docstrings.has(member as P.ASTDocComment))
    const { match, type, superType } = declaration
    const previousClass = this.currentClass
    this.currentClass = type.name
    try {
      let body = this.classDeclaration(new P.ASTClassDeclaration(match, { type, superType, members }))
      const undeclared = this.project.undeclared.get(type.name) ?? []
      // a value given when one is made:  declared in the class, for TypeScript only
      const declares = undeclared
        .filter((it) => it.isValue)
        .map((it) => `${jsText.INDENT}declare ${this.undeclaredMember(type.name, it)}`)
      if (declares.length) body = body.replace(/\}$/, `\n${declares.join("\n")}\n}`).replace("{}\n", "{\n")
      // a method the classes below it define:  merged in after it, one block, a member a line
      const methods = undeclared.filter((it) => it.method).map((it) => this.undeclaredMember(type.name, it))
      if (methods.length) {
        body = `${body}\nexport interface ${this.typeNameOf(type.name)} {\n${indented(methods.join("\n"))}\n}`
      }
      if (hasCreate(declaration)) body = `@thing\n${body}`
      // a drawable type's element class, with the line handing it to the page
      const element = this.elementClassFor(declaration)
      return element ? `${body}\n\n${element}` : body
    } finally {
      this.currentClass = previousClass
    }
  }

  /**
   * What goes above class `node`:  each of its lists of values as a typed constant, with its docstring and a type
   * for one of its values, a group each:
   * ```
   * /** card ranks *\/
   * const RANKS = ["ace", 2, ...] as const
   * export type Rank = (typeof RANKS)[number]
   * ```
   * - `""` if it has none.
   */
  classPrefix(node: P.ASTClassDeclaration): string {
    const declaration = this.withProjectMembers(node)
    const lists = this.listsOf(declaration)
    if (!lists.length) return ""
    const members = declaration.members ?? []
    const groups = lists.map((list) => {
      const docstring = docstringAbove(list.definition, members)
      const lines = [`const ${list.constant} = ${this.write(list.definition.value)} as const`]
      if (docstring) lines.unshift(String(this.write(docstring)))
      if (list.type) lines.push(`export type ${list.type} = (typeof ${list.constant})[number]`)
      return lines.join("\n")
    })
    return `${groups.join("\n\n")}\n`
  }

  /**
   * A member class `typeName` gets for TypeScript only (`WriterProject.undeclared`),
   * as an interface or a `declare` writes it:  `droppable: boolean`, `canPickUpCard(card: Card): boolean`.
   * - A value:  typed by every value the program gives it -- see `givenKind()`.
   * - A method:  typed by what every class's definition of it returns -- see `definitionsKind()`.
   */
  undeclaredMember(typeName: string, { name, method, definitions }: TSUndeclared): string {
    if (!method) {
      const type = this.typeForKind(this.givenKind(typeName, name)) ?? TSWriter.UNKNOWN
      return `${this.nameOf(name)}: ${type}`
    }
    const returns = this.typeForKind(this.definitionsKind(definitions ?? [{ type: typeName, method }]))
    return `${this.nameOf(name)}${this.signatureParams(method)}: ${returns ?? TSWriter.UNKNOWN}`
  }

  /** The hoisted lists `node` declares, in order -- see `WriterProject.lists`. */
  private listsOf(node: P.ASTClassDeclaration) {
    const lists = [...this.project.lists.values()]
    return (node.members ?? []).flatMap((member) => lists.filter((list) => list.definition === member))
  }

  /** `static Ranks = RANKS` for a hoisted list;  else as javascript's. */
  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    const list = [...this.project.lists.values()].find((it) => it.definition === node)
    if (!list) return super.ASTStaticDefinitionAsMember(node)
    return `static ${this.nameOf(node.name)} = ${list.constant}`
  }

  ////////////////
  // ## Members
  ////////////////

  /**
   * In its class's body, by our name:  `get isFaceUp() {...}`, `turnFaceUp() {...}`.
   * - `@derived` on a getter that loops over a list, e.g. a pile's `state`:  remembered until what it read changes.
   * - `@drawn draw() {...}`:  see `drawMethod()`.
   */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    const name = this.nameOf(node.property.value)
    if (node.get) {
      const getter = this.methodNamed(node.get, `get ${name}`)
      return loopsOverAList(node.get) ? `@derived\n${getter}` : getter
    }
    if (name === "draw") return `@drawn\n${this.drawMethod(node.method!)}`
    return this.methodNamed(node.method!, name)
  }

  /**
   * In its class's body:  `@prop(info) accessor rank!: Rank` -- the same runtime shape as javascript's
   * `declareProp()` and accessor pair.  Its name is spell's:  a property is data a program prints.
   */
  ASTReactivePropertyAsMember(node: P.ASTReactiveProperty): string {
    // one that replaces a member of a class above, e.g. a joker's `color` property for a card's `color` getter:
    // TypeScript won't let an `accessor` do that, so the pair javascript writes
    if (this.project.isInherited(node.typeName, node.property.value)) return super.ASTReactivePropertyAsMember(node)
    const info = this.propInfo(node)
    return `@prop(${info ?? ""}) accessor ${this.write(node.property)}!: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
  }

  /** What `@prop()` declares:  `node`'s `check`, `init` for its `initializer`, a hoisted list by its constant. */
  propInfo(node: P.ASTReactiveProperty): string | undefined {
    const parts = (node.check?.properties ?? []).map((property) => {
      const isOneOf = property instanceof P.ASTObjectLiteralProperty && property.property.value === "oneOf"
      const list = isOneOf && this.project.listFor(property.value)
      if (!list) return String(this.write(property))
      // read when set stays so:  its class is further down
      const isLazy = (property as P.ASTObjectLiteralProperty).value instanceof P.ASTMethodDefinition
      return `oneOf: ${isLazy ? "() => " : ""}${list.constant}`
    })
    if (node.initializer) parts.push(`init: () => ${this.bare(node.initializer)}`)
    return parts.length ? `{ ${parts.join(", ")} }` : undefined
  }

  /**
   * What `node` holds, in TypeScript, from its `check`:
   * - `{ type: 'text' }` => `string`
   * - a hoisted list's values => `Rank`
   * - `{ oneOf: Deck.Suits }` => `(typeof Deck.Suits)[number]`;
   *   the same for a list read when set, `{ oneOf: () => Deck.Suits }`
   * - Else its initializer's datatype;  `undefined` if unknown.
   */
  propertyType(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
      const key = property.property.value
      if (key === "type" && property.value instanceof P.ASTStringLiteral) return this.typeFor(property.value.value)
      if (key !== "oneOf") continue
      const list = this.project.listFor(property.value)
      if (list) return list.type ?? `(typeof ${list.constant})[number]`
      return `(typeof ${this.write(listNamedBy(property.value))})[number]`
    }
    const initializer = node.initializer && unwrapped(node.initializer)
    // made when first read, `as a new task-list`:  the class it makes, e.g. `TaskList`
    if (initializer instanceof P.ASTNewInstanceExpression && initializer.type.name !== "List") {
      return initializer.type.name
    }
    // `as a new list of tasks`:  `List<Task>`
    const itemType = initializer instanceof P.ASTNewInstanceExpression && this.newListItemType(initializer)
    if (itemType) return `List<${itemType}>`
    const initialType = this.typeFor(node.initializer?.datatype)
    if (initialType) return initialType
    // the program never says:  what it gives it (Q54)
    return this.typeForKind(this.givenKind(node.typeName, node.property.value, node.initializer))
  }

  /** `getProp()` returns `unknown`:  `as` its type, when known. */
  getterBody(node: P.ASTReactiveProperty): string {
    const type = this.propertyType(node)
    if (!type) return super.getterBody(node)
    return `{ return this.getProp(${this.propertyKey(node)}) as ${type} }`
  }

  /** `: type`, e.g. `: string`, `: (typeof Card.Suits)[number]`. */
  valueType(node: P.ASTReactiveProperty): string {
    return `: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
  }

  setterParams(node: P.ASTReactiveProperty, thisType?: string): string {
    const value = `value: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return thisType ? `${this.thisParam(thisType)}, ${value}` : value
  }

  /**
   * From outside its class (one another project declares):  first an `interface` merged with its class, so
   * TypeScript knows it's there.
   */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    const member = `${this.write(node.property)}: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return [this.mergedInterface(node.typeName, member), super.ASTReactiveProperty(node)].join(jsText.NEWLINE)
  }

  /**
   * From outside its class (one another project declares), by TypeScript's name:  first an `interface` merged with
   * its class -- a getter `readonly` -- then `Card.prototype.play = function (...) {...}`, or for a getter
   * `Object.defineProperty(Card.prototype, "isFaceUp", {...})`.
   */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition): string {
    const name = this.nameOf(node.property.value)
    const member = node.get
      ? `readonly ${name}: ${this.returnType(node.typeName, node.get) ?? TSWriter.UNKNOWN}`
      : `${name}${this.signatureParams(node.method!)}: ${this.returnType(node.typeName, node.method!) ?? TSWriter.UNKNOWN}`
    const prototype = this.write(node.prototypeExpression)
    const patch = this.inClass(node.typeName, () => {
      if (!node.get) return `${prototype}.${name} = ${this.anonymousFunction(node.method!, node.typeName)}`
      const descriptor = [`${this.methodNamed(node.get, "get", node.typeName)},`, "configurable: true"].join("\n")
      return `Object.defineProperty(${prototype}, ${this.quoted(name)}, ${jsText.Block({ wrap: true, children: descriptor })})`
    })
    return [this.mergedInterface(node.typeName, member), patch].join(jsText.NEWLINE)
  }

  /**
   * What method (or getter) `method` of class `typeName` returns, in TypeScript's words, for its signature --
   * `undefined` if spell can't tell.
   * - Spell's datatype for it, if it knows it.
   * - Else what its `return`s give (`returnedKinds()`), each alike or not:
   *   `boolean | undefined` for `return false`, `return` and `return true`.
   * - One that waits, a promise of it:  `Promise<boolean | undefined>` (epic `output-targets`, T24).
   */
  returnType(typeName: string, method: P.ASTMethodDefinition): string | undefined {
    const returned = this.typeFor(method.datatype) ?? this.returnedType(typeName, method)
    if (!returned) return undefined
    return method.isAsync ? `Promise<${returned}>` : returned
  }

  /** What method `method` of class `typeName` returns, from its `return`s:  see `returnType()`. */
  private returnedType(typeName: string, method: P.ASTMethodDefinition): string | undefined {
    const kinds = this.inPlace({ typeName, methods: [method] }, () => this.returnedKinds(method))
    const types = [...(kinds ?? [])].map((kind) => this.typeForKind(kind))
    if (!types.length || types.some((type) => !type)) return undefined
    return [...new Set(types)].join(" | ")
  }

  /**
   * `export interface Card { member }`:  merges with `export class Card`, wherever it is in the file.
   * - A class from ANOTHER project, imported, can't merge this way (`TS2440`):  `module()` makes it a `declare module`
   *   block in that project's module.
   */
  mergedInterface(typeName: string, member: string): string {
    return `export interface ${this.typeNameOf(typeName)} { ${member} }`
  }

  /** Parameters for a signature, which can't have defaults:  `(card: Card, message?: string)`. */
  signatureParams(method: P.ASTMethodDefinition): string {
    const params = (method.args ?? []).map((arg) => {
      const type = this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ?? TSWriter.UNKNOWN
      return `${this.variableName(arg)}${arg.default ? "?" : ""}: ${type}`
    })
    return `(${params.join(", ")})`
  }

  ////////////////
  // ## A drawable type's element class (epic `drawable-thing` P10, J41)
  ////////////////

  /**
   * The element class of drawable class `node`, written after it, and the line handing it to the page --
   * `undefined` for a class that isn't drawable (no `static elementTag = spellCore.defineElement(...)`).
   *
   * ```ts
   * export class CardElement extends SpellElement<Card> {
   *   @E.proto static vocabulary = SpellElement.vocabularyFor("solitaire-card", "card", [
   *     { name: "rank", kind: "string", description: "Its rank." }
   *   ])
   *   @E.protoMerged static elementSetup = {
   *     styleSheets: { "solitaire-card": Card.css }
   *   } satisfies Partial<E.ElementSetup>
   *
   *   turnOver() {
   *     return this.currentThing?.turnOver()
   *   }
   * }
   * spellCore.useElement(Card, CardElement)
   * ```
   * - On the runtime's own element, `SpellElement`, from `@spell/elements`:  what every drawable thing's element does
   *   (drawing its thing, the two agreeing, a layout's lookup) stays there.
   * - It says only what's the type's own:
   *   - an attribute per property the type declares (`elementAttributes()`)
   *   - its sheet, the type's own `<css>`, when it has one
   *   - a method per method of the type's, calling its thing's (`elementMethods()`)
   * - The page defines the tag with it (`spellCore.useElement()`):  the class never calls `define()`,
   *   so a tag is never defined twice.  What it leaves out, e.g. a super-type's properties, the page adds,
   *   as it does for javascript:  both targets draw the same element.
   * - Javascript writes none:  the page makes its element from the class.
   */
  elementClassFor(node: P.ASTClassDeclaration): string | undefined {
    const project = elementProjectOf(node)
    if (project === undefined) return undefined
    const typeName = this.typeNameOf(node.type.name)
    const name = this.elementClassName(typeName)
    const tag = elementTagFor(project, typeName)
    this.elementTags.set(name, tag)
    const words = wordsOf(typeName)
    const attributes = this.elementAttributes(node)
    const vocabulary = attributes.length
      ? `SpellElement.vocabularyFor(${this.quoted(tag)}, ${this.quoted(words)}, [\n${indented(attributes.join(",\n"))}\n])`
      : `SpellElement.vocabularyFor(${this.quoted(tag)}, ${this.quoted(words)}, [])`
    const members = [`@E.proto static vocabulary = ${vocabulary}`]
    const hasCSS = node.members?.some((member) => member instanceof P.ASTStaticDefinition && member.name === "css")
    if (hasCSS) {
      const setup = `{\n${indented(`styleSheets: { ${this.quoted(tag)}: ${typeName}.css }`)}\n}`
      members.push(`@E.protoMerged static elementSetup = ${setup} satisfies Partial<E.ElementSetup>`)
    }
    const methods = this.elementMethods(node)
    const body = methods.length ? `${members.join("\n")}\n\n${methods.join("\n\n")}` : members.join("\n")
    const docstring = [
      "/**",
      ` * \`<${tag}>\`:  ${a(words)} ${words}, drawn in its own element, e.g. by \`draw the ${words}\`.`,
      ` * - The page defines its tag with this class:  \`spellCore.useElement()\`, below.`,
      ` * - Its attributes are its ${words}'s properties;  its methods call its ${words}'s.`,
      ` * - What every drawable thing's element does, e.g. drawing its ${words}, is \`SpellElement\`'s.`,
      " */"
    ].join("\n")
    const declaration = `export class ${name} extends SpellElement<${typeName}> {\n${indented(body)}\n}`
    return `${docstring}\n${declaration}\nspellCore.useElement(${typeName}, ${name})`
  }

  /** Name of the element class of class `typeName`, e.g. `CardElement` -- one the project's types don't have. */
  private elementClassName(typeName: string): string {
    let name = `${typeName}Element`
    while (this.project.isClass(name)) name = `${name}Element`
    return name
  }

  /**
   * An attribute for each property drawable class `node` declares itself, as its element's vocabulary says it:
   * `{ name: "rank", kind: "string", description: "Its rank." }` -- named as the page names them,
   * see `drawableAttributeFor()` in `$/util`.
   * - Not a super-type's, nor the list holding it (`a card belongs to one pile`):  the page adds those.
   * - None for a name the page or Spell UI already means something by, e.g. `id`.
   */
  elementAttributes(node: P.ASTClassDeclaration): string[] {
    const attributes: string[] = []
    for (const member of node.members ?? []) {
      if (!(member instanceof P.ASTReactiveProperty)) continue
      const attribute = drawableAttributeFor(String(this.write(member.property)), this.declaredTypeOf(member))
      if (!attribute) continue
      const { name, kind, description } = attribute
      attributes.push(
        `{ name: ${this.quoted(name)}, kind: ${this.quoted(kind)}, description: ${this.quoted(description)} }`
      )
    }
    return attributes
  }

  /**
   * The type property `node` is declared as, as its class's schema keeps it, e.g. `number`, `Pile`:
   * its `check`'s `type`;  else `list` for one made when first read;  else `undefined`, text.
   */
  private declaredTypeOf(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || property.property.value !== "type") continue
      if (!(property.value instanceof P.ASTStringLiteral)) continue
      const type = property.value.value
      return this.project.isClass(type) ? this.typeNameOf(type) : type
    }
    return node.initializer ? "list" : undefined
  }

  /**
   * A method for each method drawable class `node` has itself, calling its thing's:
   * `turnOver() { return this.currentThing?.turnOver() }`.
   * - So a page's `card.turnOver()` calls it, typed.
   * - Not a getter, nor `draw()`.  Its super-types' come from their classes, through the page.
   * - None for a name the element itself has (`ELEMENT_MEMBERS`), e.g. `send()`:  the page's still calls the thing's.
   */
  elementMethods(node: P.ASTClassDeclaration): string[] {
    const methods = new Map<string, string>()
    for (const member of node.members ?? []) {
      if (!(member instanceof P.ASTPropertyDefinition) || !member.method || member.get) continue
      const name = this.nameOf(member.property.value)
      if (name === "draw" || name.includes("$") || TSWriter.ELEMENT_MEMBERS.has(name) || methods.has(name)) continue
      const args = (member.method.args ?? []).map((arg) => this.variableName(arg))
      const call = `return this.currentThing?.${name}(${args.join(", ")})`
      methods.set(name, `${name}${this.forwardedParams(member.method)} {\n${indented(call)}\n}`)
    }
    return [...methods.values()]
  }

  /**
   * Parameters of a method passing them on to `method`:  typed as `method`'s, one with a default optional --
   * `(card: Card, message?: string)`.
   */
  private forwardedParams(method: P.ASTMethodDefinition): string {
    const destructured = this.destructuredParam(method)
    const params = (method.args ?? []).map((arg) => {
      const type = destructured?.arg === arg ? destructured.shape.replace(/(\w+): /g, "$1?: ") : this.paramType(arg)
      return `${this.variableName(arg)}${arg.default ? "?" : ""}: ${type}`
    })
    return `(${params.join(", ")})`
  }

  /** `code` with `@spell/elements` imported, below its `@spell/core` import. */
  private withElementsImport(code: string): string {
    const line = `import { E, SpellElement } from "@spell/elements"`
    const replaced = code.replace(/^import .* from "@spell\/core"$/m, (core) => `${core}\n${line}`)
    return replaced !== code ? replaced : `${line}\n${code}`
  }

  /**
   * Each drawable type's tag, declared for the program's JSX (epic `drawable-thing` I7):
   * so a tag written by hand, e.g. `<solitaire-pile>`, type-checks.
   * - Loose, as app types `<ui-*>` tags:  HTML attributes, plus any attribute or `prop:` its element defines.
   */
  private elementTagsDeclaration(): string {
    const tags = [...this.elementTags].map(
      ([name, tag]) =>
        `/** \`${name}\` */\n${this.quoted(tag)}: HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }`
    )
    const intrinsic = `interface IntrinsicElements {\n${indented(tags.join("\n"))}\n}`
    return [
      "// each drawable type's tag, for the JSX",
      `declare module "@solidjs/web/types/jsx.js" {\n${indented(`namespace JSX {\n${indented(intrinsic)}\n}`)}\n}`
    ].join("\n")
  }

  /**
   * What a drawable type's element can't have as a method:  its own members, `SpellElement`'s and Spell UI's.
   * - A type's method of one of these names is left out of its element class (`elementMethods()`).
   * - Its own attribute `thing`, too.
   * - Pinned by app's `SpellElement.browser.test.tsx`:  every member an element has is here.
   */
  static readonly ELEMENT_MEMBERS = new Set<string>([
    "$",
    "adoptStyleSheets",
    "agree",
    "animationToRun",
    "appContext",
    "attributes",
    "boundThing",
    "classNoun",
    "classValue",
    "cssStates",
    "currentThing",
    "domElement",
    "drawing",
    "elementDefinition",
    "elementSetup",
    "elementValueOf",
    "entry",
    "extraClass",
    "formIsDisabled",
    "handedThing",
    "hasInertContent",
    "internalState",
    "isConnected",
    "isControlledByPage",
    "isDisabled",
    "isEnabled",
    "isHidden",
    "isHiding",
    "isInLayout",
    "isMarkedDisabled",
    "isMarkedLoading",
    "isMotionOff",
    "isReady",
    "isStill",
    "isVisible",
    "keepThingAndElementAgreeing",
    "missingText",
    "on",
    "onConnect",
    "onDisconnect",
    "onFormAssociated",
    "onFormDisabled",
    "onFormReset",
    "onFormStateRestore",
    "onMount",
    "onReadyChanged",
    "onRuntimeLoaded",
    "onSharedStatesChanged",
    "onSlotChangeForParts",
    "onVisibleChange",
    "onVisibleOrReadyChanged",
    "ownThing",
    "pageWrote",
    "partForName",
    "referencedThing",
    "render",
    "requestChange",
    "rootClass",
    "runVisibleChange",
    "send",
    "shownValueOf",
    "showsLoader",
    "slotForName",
    "startListeners",
    "styleSheetNames",
    "thing",
    "thingReference",
    "translationForKey",
    "typeProperties",
    "vocabulary",
    "wrapperClass",
    "writeElement",
    "writeReference",
    "writeThing"
  ])

  ////////////////
  // ## Lists
  ////////////////

  /**
   * A list says what it holds:  `a deck is a list of cards` => `class Deck extends List<Card>`, from its
   * `static instanceType = Card`.  So `spellCore.getItemAt(deck, 1)` is a `Card | undefined`.
   * - A drawable list too:  `class Pile extends DrawableList<Card>`.
   */
  superTypeOf(node: P.ASTClassDeclaration): string {
    const name = super.superTypeOf(node)
    if (!P.WriterProject.LIST_CLASSES.includes(name)) return name
    const itemType = node.members?.find(
      (member): member is P.ASTStaticDefinition =>
        member instanceof P.ASTStaticDefinition && member.name === "instanceType"
    )?.value
    if (itemType instanceof P.ASTTypeExpression) return `${name}<${this.typeNameOf(itemType.name)}>`
    // read when made, as a static getter, for an item class further down:  `static get instanceType()`
    const ownItemType = this.project.itemTypes.get(node.type.name)
    return ownItemType ? `${name}<${this.typeNameOf(ownItemType)}>` : name
  }

  /** A new list says what it holds too:  `a new list of piles` => `new List<Pile>({ instanceType: "Pile" })`. */
  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): string {
    const text = super.ASTNewInstanceExpression(node)
    const itemType = this.newListItemType(node)
    return itemType ? text.replace(/^new List/, `new List<${itemType}>`) : text
  }

  /**
   * What a new list holds, in TypeScript's words:  `string` for `a new list of text`, `Pile` for `a new list of
   * piles`;  `undefined` for a list that doesn't say, or anything else made.
   */
  newListItemType(node: P.ASTNewInstanceExpression): string | undefined {
    const itemType = newListItemName(node)
    return itemType && (this.typeFor(itemType) ?? itemType)
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * `draw() {...}`, in Solid's shapes when it can be -- see `drawingShape()`:
   * ```
   * const className = () => `Card face-${this.direction} ...`
   * return (
   *   <Show when={this.isFaceDown} fallback={<div class={className() + this.color}>...</div>}>
   *     <div class={className()}>...</div>
   *   </Show>
   * )
   * ```
   * - Any other shape, as written:  it re-runs whole, in its error boundary (`@drawn`), when something it read changes.
   * - A handler it uses more than once is written once, as a local:  `const click = () => ...`.
   */
  drawMethod(method: P.ASTMethodDefinition): string {
    const shape = drawingShape(method.body.statements ?? [], this.project)
    if (!shape) return this.methodNamed(method, "draw")
    const previous = { accessors: this.accessors, sharedHandlers: this.sharedHandlers }
    this.accessors = new Set(
      shape.locals.filter(({ value }) => !isFixedValue(value)).map(({ thing }) => this.variableName(thing))
    )
    this.sharedHandlers = new Map()
    try {
      const lines = shape.comments.map((comment) => String(this.write(comment)))
      for (const { thing, value } of shape.locals) {
        const name = this.variableName(thing)
        lines.push(`const ${name} = ${this.accessors.has(name) ? "() => " : ""}${this.bare(value)}`)
      }
      lines.push(...this.shareHandlers(shape, new Set(lines.map((line) => line.split(" ")[1]!))))
      lines.push(`return ${this.parenthesized(this.drawingOf(shape))}`)
      return `draw() ${jsText.Block({ wrap: true, children: lines.join(jsText.NEWLINE) })}`
    } finally {
      this.accessors = previous.accessors
      this.sharedHandlers = previous.sharedHandlers
    }
  }

  /** `shape`'s drawing:  its last `return` alone, else in a `<Show>` (one `if`) or a `<Switch>` (more). */
  private drawingOf(shape: DrawingShape): string {
    const final = this.jsxOf(shape.final)
    if (!shape.branches.length) return final
    const fallback = final.includes("\n") ? `fallback={\n${indented(final)}\n}` : `fallback={${final}}`
    if (shape.branches.length === 1) {
      const [{ condition, value }] = shape.branches as [DrawingBranch]
      const open = `<Show\n${indented(`when={${this.bare(condition)}}\n${fallback}`)}\n>`
      return `${open}\n${indented(this.jsxOf(value))}\n</Show>`
    }
    const matches = shape.branches.map(
      ({ condition, value }) => `<Match when={${this.bare(condition)}}>\n${indented(this.jsxOf(value))}\n</Match>`
    )
    return `<Switch\n${indented(fallback)}\n>\n${indented(matches.join("\n"))}\n</Switch>`
  }

  /** `value` as JSX:  an element as is, anything else as `{value}`. */
  private jsxOf(value: P.ASTExpression): string {
    const inner = unwrapped(value)
    return inner instanceof P.ASTJSXElement ? this.write(inner) : `{${this.bare(inner)}}`
  }

  /** `text` alone, or in parentheses and indented when it's JSX on several lines, e.g. after `return`. */
  private parenthesized(text: string): string {
    return text.startsWith("<") && text.includes("\n") ? `(\n${indented(text)}\n)` : text
  }

  /**
   * SIDE EFFECT:  notes each handler `shape`'s elements use more than once in `sharedHandlers`, under a name not in
   * `taken`, e.g. `click` for an `onClick`.  Returns their lines, `const click = () => ...`.
   */
  private shareHandlers(shape: DrawingShape, taken: Set<string>): string[] {
    const handlers = new Map<string, { name: string; count: number }>()
    const values = [...shape.branches.map((branch) => branch.value), shape.final]
    forEachNode(values, (node) => {
      if (!(node instanceof P.ASTJSXAttribute) || !(node.value instanceof P.ASTMethodDefinition)) return
      const text = this.arrow(node.value)
      const found = handlers.get(text)
      if (found) found.count++
      else handlers.set(text, { name: node.name.replace(/^on/, ""), count: 1 })
    })
    const lines: string[] = []
    for (const [text, { name: event, count }] of handlers) {
      if (count < 2) continue
      let name = event.charAt(0).toLowerCase() + event.slice(1)
      for (let number = 2; taken.has(name); number++) name = `${event.toLowerCase()}${number}`
      taken.add(name)
      this.sharedHandlers.set(text, name)
      lines.push(`const ${name} = ${text}`)
    }
    return lines
  }

  ////////////////
  // ## JSX
  ////////////////

  /**
   * Real JSX, which Solid's compiler builds:  `<div class="board">...</div>`, one child a line;
   * short text inline, `<span class="suit">{this.shortSuit}</span>`.
   */
  ASTJSXElement(node: P.ASTJSXElement): string {
    const tag = node.tagName
    // `class` first, as javascript's `h()` calls give it, so both targets draw the same (the core contract)
    const attributes = (node.attrs ?? [])
      .flatMap((attribute) => this.jsxAttribute(tag, attribute) ?? [])
      .sort((a, b) => Number(b.startsWith("class=")) - Number(a.startsWith("class=")))
    const open = `<${tag}${attributes.map((attribute) => ` ${attribute}`).join("")}`
    const children = (node.children ?? []).filter((child) => !(child instanceof P.ASTJSXEndTag))
    const written = children.map((child) => this.jsxChild(child)).filter(Boolean)
    if (!written.length) return `${open} />`
    const inline = written.join("")
    const isShort = !written.some((child) => child.startsWith("<")) && !inline.includes("\n")
    if (isShort && open.length + inline.length < JSX_LINE) return `${open}>${inline}</${tag}>`
    return `${open}>\n${indented(written.join("\n"))}\n</${tag}>`
  }

  /** A value in JSX:  just the expression -- Solid's compiler makes it live. */
  ASTJSXLiveValue(node: P.ASTJSXLiveValue): string {
    return this.bare(node.expression)
  }

  /**
   * One child of an element:  text as is (`{"..."}` when it has `{`, `<` ...), an expression in braces, an element.
   * - `""` for nothing to write.
   */
  jsxChild(child: P.ASTExpression): string {
    if (child instanceof P.ASTJSXText) {
      if (!child.value) return ""
      return /[{}<>]/.test(child.value) ? `{${JSON.stringify(child.value)}}` : child.value
    }
    if (child instanceof P.ASTJSXElement) return this.write(child)
    const expression = child instanceof P.ASTJSXExpression ? child.output : child
    if (!expression) return ""
    // JSX already, e.g. `<For>` for `draw cards in it`:  no braces
    const text = this.bare(expression)
    return text.startsWith("<") ? text : `{${text}}`
  }

  /**
   * `name="text"` or `name={value}`, by the page's names, as compiled javascript's `h()` calls name them:
   * - `class`, `for`, `colspan`;  `prop:value={...}` on a `<ui-*>` tag, for a value that can change:
   *   see `attributeName()`, which both writers share
   * - a handler as an arrow, `onClick={() => autoPlay()}`;  one the drawing shares by its name, `onClick={click}`
   * - no value:  bare on an HTML tag (`hidden`), `{true}` on a `<ui-*>` tag
   * - `undefined` for an attribute that didn't parse:  its error is in the program's parse errors
   */
  jsxAttribute(tag: string, attribute: P.ASTJSXAttribute): string | undefined {
    const { name, value } = attribute
    if (!value && attribute.error) return undefined
    const key = attributeName(tag, name, !!value && !isFixedValue(value))

    // bare, as HTML writes it (`hidden`);  a `<ui-*>` tag's bare attribute would ask for an icon called `true`
    if (!value) return tag.includes("-") ? `${key}={true}` : key
    if (value instanceof P.ASTMethodDefinition) {
      const handler = this.arrow(value)
      return `${key}={${this.sharedHandlers.get(handler) ?? handler}}`
    }
    const inner = unwrapped(value)
    if (inner instanceof P.ASTStringLiteral && inner.quote && !/["\\]/.test(inner.value))
      return `${key}="${inner.value}"`
    return `${key}={${this.bare(value)}}`
  }
}

////////////////
// ## Drawing shapes
////////////////

/**
 * A `to draw` Solid can follow in pieces:  locals, then `if (...) return <...>` lines, then one `return <...>`.
 * See `TSWriter.drawMethod()`.
 */
type DrawingShape = {
  /** Comments above its locals. */
  comments: P.ASTComment[]
  /** Its new variables, each set once, before any `if`:  accessors, unless their value never changes. */
  locals: Array<{ thing: P.ASTVariableExpression; value: P.ASTExpression }>
  /** Each `if (condition) return value`, in order. */
  branches: DrawingBranch[]
  /** What the last `return` draws. */
  final: P.ASTExpression
}

/** `if (condition) return value`, in a drawing. */
type DrawingBranch = { condition: P.ASTExpression; value: P.ASTExpression }

/**
 * `statements`, a `to draw`'s body, as a `DrawingShape`.
 * - `undefined` if they're any other shape,
 *   e.g. a loop, an `else`, a local set twice, or nothing after the last `return`.
 */
function drawingShape(statements: P.ASTNode[], project: WriterProject): DrawingShape | undefined {
  const shape: Partial<DrawingShape> & Pick<DrawingShape, "comments" | "locals" | "branches"> = {
    comments: [],
    locals: [],
    branches: []
  }
  const items = statements.filter((it) => !(it instanceof P.ASTBlankLine))
  for (const [index, statement] of items.entries()) {
    if (shape.final) return undefined
    if (statement instanceof P.ASTComment) {
      if (shape.locals.length || shape.branches.length) return undefined
      shape.comments.push(statement)
    } else if (statement instanceof P.ASTAssignmentStatement && statement.isNewVariable) {
      const { thing, value } = statement
      if (shape.branches.length || !(thing instanceof P.ASTVariableExpression)) return undefined
      if (project.reassigned.has(thing.name)) return undefined
      shape.locals.push({ thing, value })
    } else if (statement instanceof P.ASTIfStatement) {
      const next = items[index + 1]
      if (next instanceof P.ASTElseIfStatement || next instanceof P.ASTElseStatement) return undefined
      const body = (statement.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
      const [only] = body
      if (body.length !== 1 || !(only instanceof P.ASTReturnStatement) || !only.value) return undefined
      shape.branches.push({ condition: statement.condition, value: only.value })
    } else if (statement instanceof P.ASTReturnStatement && statement.value) {
      shape.final = statement.value
    } else {
      return undefined
    }
  }
  if (!shape.final) return undefined
  if (!shape.locals.length && !shape.branches.length) return undefined
  return shape as DrawingShape
}

////////////////
// ## Helpers
////////////////

/**
 * What getter `method` returns early, if it starts so:  `if (...) return <literal>`.
 * - E.g. `0` for a pile's `value` (`if (this.isEmpty) return 0`):  what its later `?.` reads fall back to.
 * - `undefined` if it doesn't.
 */
function earlyReturnOf(method: P.ASTMethodDefinition): P.ASTExpression | undefined {
  const [first] = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
  if (!(first instanceof P.ASTIfStatement)) return undefined
  const [only] = (first.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
  if (!(only instanceof P.ASTReturnStatement) || !only.value) return undefined
  return unwrapped(only.value) instanceof P.ASTLiteral ? only.value : undefined
}

/** The decorators compiled TypeScript may use, all from `@spell/core`. */
const DECORATORS = ["prop", "state", "derived", "thing", "drawn"]

/** Solid's control flow a drawing may use, from `solid-js`. */
const SOLID_COMPONENTS = ["Show", "For", "Switch", "Match"]

/** Longest element written on one line, open tag and children. */
const JSX_LINE = 100

/** Is `node`'s value fixed?  A literal (not a list, which holds expressions), an element, a function. */
function isFixedValue(node: P.ASTExpression): boolean {
  const inner = unwrapped(node)
  if (inner instanceof P.ASTArrayLiteral || inner instanceof P.ASTEnumeration) return false
  return inner instanceof P.ASTLiteral || inner instanceof P.ASTMethodDefinition || inner instanceof P.ASTJSXElement
}

/** Does `declaration` have a `create()`?  Then `@thing` runs it, after its fields. */
function hasCreate(declaration: P.ASTClassDeclaration): boolean {
  return (declaration.members ?? []).some(
    (member) => member instanceof P.ASTPropertyDefinition && member.method && member.property.value === "create"
  )
}

/** Does getter `method` loop over a list, e.g. `for each card in pile`?  Worth remembering:  `@derived`. */
function loopsOverAList(method: P.ASTMethodDefinition): boolean {
  let loops = false
  forEachNode(method.body, (node) => {
    if (node instanceof P.ASTMethodDefinition && node.inline) loops = true
  })
  return loops
}

/**
 * The docstring right above `member` in `members`, if it has one:
 * past a declaration's marker, `/*! SPELL: DECLARES ... *\/`.
 */
function docstringAbove(member: P.ASTNode, members: P.ASTNode[]): P.ASTDocComment | undefined {
  let index = members.indexOf(member) - 1
  while (members[index] instanceof P.ASTPreservedComment) index--
  const above = members[index]
  return above instanceof P.ASTDocComment ? above : undefined
}

/** `text` with every non-blank line indented once. */
const indented = jsText.indented

/**
 * The project drawable class `node` is in, as its `static elementTag = spellCore.defineElement(this, "Solitaire")`
 * names it, e.g. `Solitaire` -- `undefined` for a class that isn't drawable.
 */
function elementProjectOf(node: P.ASTClassDeclaration): string | undefined {
  for (const member of node.members ?? []) {
    if (!(member instanceof P.ASTStaticDefinition) || member.name !== "elementTag") continue
    const found = member.value instanceof P.ASTStringLiteral && DEFINE_ELEMENT.exec(member.value.value)
    if (found) return JSON.parse(found[1]!) as string
  }
  return undefined
}

/** What a drawable class's `elementTag` is:  `spellCore.defineElement(this, "<project>")`. */
const DEFINE_ELEMENT = /^spellCore\.defineElement\(this, ("(?:[^"\\]|\\.)*")\)$/

/** A type's name in words, e.g. `stock pile` for `StockPile`. */
function wordsOf(typeName: string): string {
  return typeName.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase()
}

/** `a` or `an`, for `words`. */
function a(words: string): string {
  return /^[aeiou]/.test(words) ? "an" : "a"
}
