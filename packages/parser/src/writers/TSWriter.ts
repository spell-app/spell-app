import { P } from "$/parser"
// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"
import * as jsText from "./jsText"
import { TSProject, camelCaseOf, forEachNode, listNamedBy, type TSUndeclared, type TSWhere } from "./TSProject"

/****************
 * ### `TSWriter`
 * Writes a spell tree as TypeScript on Solid, as a person would write it by hand:  the `ts/solid` target's writer,
 * for `<Project>.compiled.tsx`.
 * - Real JSX, which Solid's compiler builds:  `<span class="suit">{this.shortSuit}</span>`.
 * - A drawing in Solid's shapes, where it can be:  a computed local becomes an accessor
 *   (`const className = () => ...`), an `if ... return` chain a `<Show>` / `<Switch>`, `draw cards in it` a `<For>`.
 *   Any other `to draw` re-runs whole, in its error net.
 * - Decorators:  `@prop({ oneOf: RANKS }) accessor rank!: Rank`, `@derived get state()`, `@thing`, and `@drawn` on
 *   `draw()` (each drawn thing in its own error net, the one `spellCore.drawThing()` gives compiled javascript).
 * - TypeScript's names:  `isASuit()`, `turnFaceUp()`, `allPiles`.  Properties keep spell's, e.g. `short_name` stays
 *   a getter's `shortName` but a property's `is_set_up` -- they're data a program prints.
 * - One class body per type:  members written anywhere in the project go inside their class.
 * - Tidy:  `const` unless set again, template text, no extra parentheses or braces, no unused parameters.
 * - Types where spell knows them:  parameters, properties, lists `as const`.  A type spell DOESN'T know is written
 *   `UNKNOWN`, `any /* spell: type unknown *\/`, never a bare `any`:  so every gap shows, and can be counted (epic
 *   `output-targets`, Q16).
 * - Where the program never says a type, what it does says it (Q54):  a property's type from the values it's given
 *   (`givenKind()`), a method only sub-classes define from what they return (`definitionsKind()`).
 * - Spell's own built-ins stay `spellCore` calls:  `getItemAt(rank, 1)` counts from 1, so both targets print the same
 *   (the core contract, `contract.test.ts` in `$/cli`).
 * - Sees the whole project first (`forProject()`, a `TSProject`):  `TSWriter.instance` alone knows nothing of it,
 *   e.g. writing one node in a test.
 * - Checked by `tsc` against `@spell/core`'s types -- see `typescript.test.ts` in `$/spell`.
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

  /** What we know of the project we're writing -- see `TSProject`. */
  readonly project: TSProject

  /**
   * While writing a drawing in Solid's shapes:  its locals that became accessors, by TypeScript name, e.g.
   * `className`:  each read is a call, `className()`.
   */
  private accessors = new Set<string>()
  /** While writing a drawing:  handlers it uses more than once, written once as a local, by their text => its name. */
  private sharedHandlers = new Map<string, string>()
  /** The class we're writing, e.g. `Tableau`:  names `<For>`'s item for `draw cards in it`. */
  private currentClass: string | undefined
  /** Destructurings typed by the parameter they read, e.g. an event's payload:  see `arrow()`. */
  private typedByParam = new WeakSet<P.ASTDestructuredAssignment>()
  /** `@spell/core`'s helpers the code calls by name, e.g. `on`, `trigger`, `positionOf`:  imported by `module()`. */
  private coreImports = new Set<string>()
  /** While writing a getter:  what it returns early for nothing, e.g. `0` -- see `ASTReturnStatement()`. */
  private getterDefault: P.ASTExpression | undefined
  /** While writing a call of the program's own:  its arguments are passed as found -- see `argsOf()`. */
  private passedAsFound = false
  /** The nodes written as statements, not values:  `spellCore.map()` there is a `forEach()`. */
  private statements = new WeakSet<P.ASTNode>()
  /** While writing a loop's body:  a bare `return` in it is `continue` -- see `loop()`. */
  private returnContinues = false
  /** While writing a callback a list's own method takes:  its item is typed by the list -- see `listCall()`. */
  private untypedItems = false
  /** What the program gives each member, worked out once, by `<Class>.<member>` -- see `givenKind()`. */
  private givenKinds = new Map<string, string | undefined>()
  /** The members `givenKind()` is working out, by `<Class>.<member>`:  one asked for again can't be told. */
  private workingOut = new Set<string>()

  constructor(project = new TSProject()) {
    super()
    this.project = project
  }

  /** A writer for the project whose files' statements are `files`, parsed in `scope`:  see `TSProject`. */
  forProject(files: P.ASTNode[][], scope?: P.Scope): this {
    return new TSWriter(TSProject.of(files, scope)) as this
  }

  /**
   * The finished module:
   * - its `@spell/core` import names the decorators `code` uses too, and Solid's control flow (`<Show>`, `<For>` ...)
   *   is imported from `solid-js` above it
   * - what it imports from another project by TypeScript's names, e.g. `playFromTheStockPile`:  that project's
   *   `.tsx` exports them so.  A class keeps its name, e.g. `Stock_Pile`.
   * - a member it adds to a class it imports is declared in that project's module, `declare module "..." { interface
   *   Card {...} }`:  TypeScript refuses an `interface` merged with an import (`TS2440`)
   * - a helper it calls by name (`on()`, `trigger()`, `positionOf()`) is imported from `@spell/core` too
   */
  module(code: string): string {
    const decorators = DECORATORS.filter((name) => new RegExp(`^\\s*@${name}\\b`, "m").test(code))
    const solid = SOLID_COMPONENTS.filter((name) => new RegExp(`<${name}[\\s>]`).test(code))
    code = code.replace(/^import \{ ([^}]*) \} from "@spell\/core"$/m, (_line, names: string) => {
      const all = [...names.split(/,\s*/), ...decorators, ...this.coreImports]
      return `import { ${all.join(", ")} } from "@spell/core"`
    })
    // what this project gives a class it imports, for TypeScript only (Q25):  declared in that project's module
    for (const [type, undeclared] of this.project.undeclared) {
      if (!this.project.importedMembers.has(type)) continue
      const members = undeclared.map((it) => this.undeclaredMember(type, it))
      code = `${code.replace(/\n*$/, "")}\nexport interface ${type} {\n${indented(members.join("\n"))}\n}\n`
    }
    // each class imported from another project, by its name here => [its module, its name there]
    const imported = new Map<string, [string, string]>()
    code = code.replace(/^import \{ ([^}]*) \} from "(@spell\/project\/[^"]*)"$/gm, (_line, names: string, from) => {
      const renamed = names.split(/,\s*/).map((name) => {
        const [there, here = there] = name.split(/\s+as\s+/) as [string, string?]
        if (/^[A-Z]/.test(there)) imported.set(here, [from, there])
        const tsName = /^[A-Z]/.test(there) ? there : camelCaseOf(there)
        return here === there ? tsName : `${tsName} as ${camelCaseOf(here)}`
      })
      return `import { ${renamed.join(", ")} } from "${from}"`
    })
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

  /**
   * TypeScript for what `kindOf()` says a value is, e.g. `string` for `"text"`, `Pile` for `"Pile"` -- `undefined`
   * for a list (it doesn't say what it holds), or for nothing known.
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

  /** `node`'s name in TypeScript:  `start_pile` => `startPile`;  `spellCore` and `this` as they are. */
  variableName(node: P.ASTVariableExpression): string {
    return node.type === "global" ? node.name : camelCaseOf(node.name)
  }

  /**
   * `object.property`:  a getter the project declares by TypeScript's name (`card.isFaceUp`), a property by spell's.
   * - `?.` off what may be nothing (`mayBeNothing()`):  `startPile.lastItem?.state`.
   * - Being SET, it can't be `?.`:  `!` instead, `spellCore.getItemAt(app.tasks, 1)!.title = "New title"`.
   */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const name = node.property.value
    const property = this.project.getters.has(name) ? camelCaseOf(name) : name
    const object = this.tight(node.object)
    const maybe = this.mayBeNothing(node.object)
    const dot = !maybe ? "." : this.isSetting(node) ? "!." : "?."
    if (P.jsText.isLegalIdentifier(property)) return `${object}${dot}${property}`
    return `${object}${dot === "." ? "" : dot}[${jsText.inQuotes(property, '"')}]`
  }

  /** What a member is read from, ready for a `.` or `?.` after it -- see `ASTPropertyExpression()`. */
  memberObject(object: P.ASTExpression): string {
    return this.tight(object)
  }

  /** `node`, in parentheses unless it binds at least as tightly as `.` -- see `isTight()`. */
  tight(node: P.ASTExpression): string {
    const inner = unwrapped(node)
    if (!isTight(inner)) return `(${this.write(inner)})`
    const text = String(this.write(inner))
    // a `spellCore` helper TypeScript says with an operator:  `x !== undefined`, `x instanceof Tableau`, `!x`
    return isCoreCall(inner) && LOOSE_CORE_CALL.test(text) ? `(${text})` : text
  }

  /** `name(args)`, by TypeScript's name:  `playFromTheStockPile()`. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return `${camelCaseOf(node.methodName)}${this.argsOf(node)}`
  }

  /**
   * A call's `(args)`, for a method or function of the program's own:  one that may be nothing (an item read from a
   * list) is passed as found, `moveToPile(tableaus.getItem(column)!)`, as spell passes it:  a typed parameter can't
   * take it otherwise.  `spellCore`'s helpers take anything:  see `ASTInvocationArgs()`.
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
   * `thing.name(args)`, by TypeScript's name:  `card.moveToPile(endPile)`;  `?.` off what may be nothing.
   * - A `spellCore` helper is written as TypeScript says it where it can:  see `coreCall()`.
   * - The list holding an item, `the pile of a card`, is read as found:  `Pile.ownerOf(this)!`.
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (node.thing instanceof P.ASTSpellCoreExpression) {
      const written = this.coreCall(node)
      if (written !== undefined) return written
    }
    const dot = this.mayBeNothing(node.thing) ? "?." : "."
    const call = `${this.memberObject(node.thing)}${dot}${camelCaseOf(node.methodName)}${this.argsOf(node)}`
    const isOwnerRead = node.thing instanceof P.ASTTypeExpression && node.methodName === "ownerOf"
    return isOwnerRead ? `${call}!` : call
  }

  ////////////////
  // ## What a value is
  ////////////////

  /**
   * What `node` is, as far as TypeScript cares:  `"text"`, `"number"`, `"choice"`, `"array"` (JavaScript's), `"list"`
   * (spell's `List`), a class's name, e.g. `"Pile"` -- or `undefined` if the writer can't tell.
   * - From where it came from:  a literal, `new Pile(...)`, `this` in a class, what a variable was set to, a
   *   property's declared type, a `spellCore` helper's result -- else spell's own datatype for it.
   * - Spell's `list` datatype is left out:  it's a `List` or a plain array, and only where it came from tells.
   */
  kindOf(node: P.ASTExpression, depth = 0): string | undefined {
    if (depth > 8) return undefined
    const inner = unwrapped(node)
    if ((inner instanceof P.ASTStringLiteral && inner.quote) || inner instanceof P.ASTQuotedExpression) return "text"
    if (inner instanceof P.ASTTemplateString) return "text"
    if (inner instanceof P.ASTNumericLiteral) return "number"
    if (inner instanceof P.ASTBooleanLiteral) return "choice"
    if (
      inner instanceof P.ASTArrayLiteral ||
      inner instanceof P.ASTEnumeration ||
      inner instanceof P.ASTListExpression
    ) {
      return "array"
    }
    if (inner instanceof P.ASTSelfLiteral) return this.currentClass
    if (inner instanceof P.ASTNewInstanceExpression) return inner.type.name === "List" ? "list" : inner.type.name
    if (inner instanceof P.ASTInfixExpression) return this.infixKindOf(inner, depth)
    if (inner instanceof P.ASTNotExpression) return "choice"
    if (inner instanceof P.ASTVariableExpression && !(inner instanceof P.ASTSpellCoreExpression)) {
      if (inner.name === "this") return this.currentClass
      const value = this.localValue(inner.name) ?? this.project.moduleValues.get(inner.name)
      // a parameter (noted as itself):  its own datatype
      const isParameter = value instanceof P.ASTVariableExpression && value.name === inner.name
      const valueKind = value && !isParameter ? this.kindOf(value, depth + 1) : undefined
      const declared = isParameter ? value : inner
      return valueKind ?? kindFromDatatype(declared.datatype ?? declared.variable?.datatype)
    }
    if (inner instanceof P.ASTPropertyExpression) {
      if (inner.object instanceof P.ASTTypeExpression && this.isStaticList(inner)) return "array"
      const owner = this.kindOf(inner.object, depth + 1)
      const name = inner.property.value
      const property = this.project.propertyOf(owner, name)
      const kind = property
        ? kindFromTypeScript(this.propertyType(property))
        : (this.undeclaredKind(owner, name) ?? this.getterKind(owner, name, depth))
      if (kind) return kind
    }
    if (inner instanceof P.ASTScopedMethodInvocation) {
      if (inner.thing instanceof P.ASTTypeExpression && inner.methodName === "ownerOf") return inner.thing.name
      if (inner.thing instanceof P.ASTSpellCoreExpression) {
        const kind = this.coreKindOf(inner, depth)
        if (kind) return kind
      }
    }
    return kindFromDatatype(inner.datatype ?? inner.match?.datatype)
  }

  /** What a value class `owner` gets for TypeScript only is (`TSProject.undeclared`), e.g. `droppable`:  a choice. */
  private undeclaredKind(owner: string | undefined, name: string): string | undefined {
    for (let type = owner; type; type = this.project.superTypes.get(type)) {
      const found = this.project.undeclared.get(type)?.some((it) => it.name === name && it.isValue)
      if (found) return this.givenKind(type, name)
    }
    return undefined
  }

  /**
   * What the program gives member `name` of class `typeName` (or of a class below it), when every value given is
   * alike, e.g. `"text"` for a pile's `name`, given `"stock"`, `"discards"` ... (Q54)
   * - `undefined` when they differ, when any can't be told, or when nothing is given.
   * - Given when one is made, `a new stock-pile with name = "stock"`, or set on one, `set the name of the pile to ...`
   *   -- see `TSProject.givenValues`.  Set on something the writer can't tell is one:  it doesn't count.
   * - And `initial`, a property's initial value, if it has one.
   * - A value read off the same member, `set the name of a to the name of b`, says nothing new:  it doesn't count.
   */
  givenKind(typeName: string, name: string, initial?: P.ASTExpression): string | undefined {
    const key = `${typeName}.${name}`
    if (this.givenKinds.has(key)) return this.givenKinds.get(key)
    // asked again while working it out:  a value read off it can't be told
    if (this.workingOut.has(key)) return undefined
    this.workingOut.add(key)
    const kinds = new Set<string | undefined>()
    try {
      if (initial) kinds.add(this.inPlace({ typeName, methods: [] }, () => this.kindOf(initial)))
      for (const given of this.project.givenValues.get(name) ?? []) {
        if (readsMember(given.value, name)) continue
        this.inPlace(given.where, () => {
          const owner = given.made ?? this.kindOf(given.object!)
          if (this.project.isSubclassOf(owner, typeName)) kinds.add(this.kindOf(given.value))
        })
      }
    } finally {
      this.workingOut.delete(key)
    }
    const kind = alike(kinds)
    // worked out while another was:  it may have read that one as unknown, so it's not kept
    if (!this.workingOut.size) this.givenKinds.set(key, kind)
    return kind
  }

  /**
   * What every class's definition of a method returns, when all alike, e.g. `"choice"` for each pile's
   * `can_play_$card` (Q54) -- `undefined` when they differ, or any can't be told.
   * - Spell's own datatype for a definition, if it knows it;  else what its `return`s give, `returnedKind()`.
   */
  definitionsKind(definitions: Array<{ type: string; method: P.ASTMethodDefinition }>): string | undefined {
    const kinds = definitions.map(
      ({ type, method }) =>
        kindFromDatatype(method.datatype) ??
        this.inPlace({ typeName: type, methods: [method] }, () => this.returnedKind(method))
    )
    return alike(new Set(kinds))
  }

  /**
   * What `method` returns, when every `return` in it gives a value, and all alike:  `return card === this.lastItem` and
   * `return false` are choices -- `undefined` otherwise.
   * - Not one that waits (it returns a promise), nor one that may end without a `return`:  its last statement isn't
   *   one.
   * - Its new variables are known by what they're set to;  a `return` in a function inside it isn't its own.
   */
  private returnedKind(method: P.ASTMethodDefinition): string | undefined {
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (method.isAsync || !(statements.at(-1) instanceof P.ASTReturnStatement)) return undefined
    const returns: P.ASTReturnStatement[] = []
    const visit = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(visit)
      if (!(node instanceof P.ASTNode) || node instanceof P.ASTMethodDefinition) return
      if (node instanceof P.ASTReturnStatement) returns.push(node)
      if (node instanceof P.ASTAssignmentStatement) this.noteLocal(node)
      for (const [key, value] of Object.entries(node)) if (key !== "match") visit(value)
    }
    return this.inBlock(() => {
      visit(method.body.statements)
      return alike(new Set(returns.map((it) => it.value && this.kindOf(it.value))))
    })
  }

  /**
   * `work()`, as if writing what's at `where`:  `this` is its class, and the parameters of the methods it's inside are
   * known.  Nothing else written so far is.
   */
  private inPlace<T>(where: TSWhere, work: () => T): T {
    const { currentClass, locals } = this
    this.currentClass = where.typeName
    this.locals = [new Map()]
    try {
      for (const method of where.methods) {
        this.locals.push(new Map())
        this.noteParams(method)
      }
      return work()
    } finally {
      this.currentClass = currentClass
      this.locals = locals
    }
  }

  /**
   * What getter `name` of class `owner` gives, from what it returns:  the kind ALL its returns share, e.g. `"text"`
   * for a card's `color` (`"red"` or `"black"`) -- `undefined` if they differ, or any can't tell.
   */
  private getterKind(owner: string | undefined, name: string, depth: number): string | undefined {
    const getter = this.project.getterOf(owner, name)
    if (!getter || depth > 4) return undefined
    const kinds = new Set<string | undefined>()
    forEachNode(getter.body, (node) => {
      if (node instanceof P.ASTReturnStatement && node.value) kinds.add(this.kindOf(node.value, depth + 1))
    })
    const [kind] = kinds
    return kinds.size === 1 ? kind : undefined
  }

  /** What a `spellCore` helper's result is, from what it's given -- see `kindOf()`. */
  private coreKindOf(node: P.ASTScopedMethodInvocation, depth: number): string | undefined {
    const [first, second] = node.args.args ?? []
    switch (node.methodName) {
      case "getRange":
        return "array"
      case "getItemAt":
      case "randomItemOf": {
        // one of a list's items:  its class's item type, e.g. a `Card` of a `Pile`
        const list = first && this.kindOf(first, depth + 1)
        return this.project.isListClass(list) ? this.project.itemTypeOf(list) : undefined
      }
      case "filter":
      case "rangeStartingAt":
      case "rangeBetween":
      case "randomItemsOf":
        return first && this.kindOf(first, depth + 1)
      case "duplicateList":
      case "mergeLists":
        if (second instanceof P.ASTTypeExpression) return second.name
        return node.methodName === "duplicateList" && first ? this.kindOf(first, depth + 1) : undefined
      case "upperCase":
      case "lowerCase":
        return "text"
      case "itemCountOf":
      case "positionOf":
        return "number"
      case "isEmpty":
      case "includes":
      case "isOfType":
      case "isDefined":
        return "choice"
    }
    return undefined
  }

  /** What an operator's result is:  text for `+` with text, a number for sums, a choice for the rest. */
  private infixKindOf(node: P.ASTInfixExpression, depth: number): string | undefined {
    if (!["plus", "minus", "times", "divided by"].includes(node.operator)) return "choice"
    const lhs = this.kindOf(node.lhs, depth + 1)
    const rhs = this.kindOf(node.rhs, depth + 1)
    if (node.operator === "plus" && (lhs === "text" || rhs === "text")) return "text"
    return lhs === "number" && rhs === "number" ? "number" : undefined
  }

  /** Is `node`, `Card.Ranks`, a class's list of values written out?  A plain array. */
  private isStaticList(node: P.ASTPropertyExpression): boolean {
    const owner = (node.object as P.ASTTypeExpression).name
    return !!this.project.listFor(node) || this.project.staticLists.has(`${owner}.${node.property.value}`)
  }

  /** Is `node` one of spell's `List`s, so it has its own methods?  See `kindOf()`. */
  isList(node: P.ASTExpression): boolean {
    const kind = this.kindOf(node)
    return kind === "list" || this.project.isListClass(kind)
  }

  ////////////////
  // ## `spellCore`'s helpers, as TypeScript says them
  ////////////////

  /**
   * A `spellCore` helper as TypeScript says it, where it can -- `undefined` where it can't, for `spellCore.<name>()`:
   * - drawing:  `card.draw()`, `<For>` -- see `drawThing()`, `drawItems()`
   * - `is defined`:  `x !== undefined`
   * - text spell knows is text:  `!this.right`, `this.input.includes(".")`, `x.toLocaleUpperCase()`
   * - a list written out:  `["diamonds", "hearts"].includes(this.suit)`
   * - a type test:  `x instanceof Tableau`, `typeof x === "number"`
   * - one of spell's `List`s:  its own method, see `listCall()`
   * - a position in a list written out, or another helper used often:  imported by name, `positionOf(Card.Ranks, rank)`
   * - events:  `trigger()`, `on()`, see `eventCall()`
   */
  coreCall(node: P.ASTScopedMethodInvocation): string | undefined {
    const args = node.args.args ?? []
    const [first, ...rest] = args
    const name = node.methodName
    if (name === "drawThing") return this.drawThing(first)
    if (name === "drawItems") return first && this.drawItems(first)
    if (name === "isDefined" && first) return `${this.tight(first)} !== undefined`
    if (EVENTS.has(name)) return this.eventCall(name, args)
    if (!first) return undefined
    const kind = this.kindOf(first)
    if (kind === "text") {
      if (name === "isEmpty") return `!${this.tight(first)}`
      if (name === "includes" && rest.length === 1) return `${this.tight(first)}.includes(${this.bare(rest[0]!)})`
      if (name === "upperCase") return `${this.tight(first)}.toLocaleUpperCase()`
      if (name === "lowerCase") return `${this.tight(first)}.toLocaleLowerCase()`
    }
    if (name === "upperCase") return `\`\${${this.bare(first)} ?? ""}\`.toLocaleUpperCase()`
    if (name === "includes" && rest.length === 1 && unwrapped(first) instanceof P.ASTArrayLiteral) {
      return `${this.write(unwrapped(first))}.includes(${this.bare(rest[0]!)})`
    }
    if (name === "isOfType" && rest.length === 1) {
      const typeTest = this.typeTest(first, rest[0]!)
      if (typeTest) return typeTest
    }
    if (this.isList(first)) {
      const written = this.listCall(name, first, rest, this.statements.has(node))
      if (written !== undefined) return written
    }
    if (kind === "array" && (name === "map" || name === "forEach") && this.statements.has(node)) {
      return this.forEachOf(first, rest[0])
    }
    if (IMPORTED_HELPERS.has(name)) {
      this.coreImports.add(name)
      return `${name}${this.write(node.args)}`
    }
    return undefined
  }

  /**
   * `spellCore.isOfType(x, "Tableau")`, as TypeScript tests a type -- `undefined` to leave it to `spellCore`:
   * - a class:  `x instanceof Tableau`
   * - a number:  `typeof x === "number"`, text:  `typeof x === "string"`
   * - spell's other kinds, on one of spell's things:  its own `x.isOfType("integer")`
   */
  private typeTest(thing: P.ASTExpression, type: P.ASTExpression): string | undefined {
    const inner = unwrapped(type)
    const name =
      inner instanceof P.ASTStringLiteral || inner instanceof P.ASTQuotedExpression ? this.textOf(inner) : undefined
    if (!name) return undefined
    const text = this.tight(thing)
    if (name === "number") return `typeof ${text} === "number"`
    if (name === "text") return `typeof ${text} === "string"`
    if (this.project.isClass(name)) return `${text} instanceof ${name}`
    const kind = this.kindOf(thing)
    return kind && this.project.isClass(kind) ? `${text}.isOfType("${name}")` : undefined
  }

  /**
   * One of spell's `List`s doing it itself, as its own method:  `allPiles.filter((pile) => ...)`,
   * `droppablePiles.firstItem`, `startPile.startingWith(this)` ... -- `undefined` for a helper it has no method for.
   * - Every position counts from 1, as spell's.  A callback's item is typed by the list, so it's written bare.
   * - Epic `output-targets` P14:  Q33, Q35, Q36.
   */
  private listCall(
    name: string,
    list: P.ASTExpression,
    rest: P.ASTExpression[],
    isStatement: boolean
  ): string | undefined {
    // `?.` off a list that may be nothing, e.g. `pile?.filter(...)` for `a random pile in ...`
    const self = `${this.tight(list)}${this.mayBeNothing(list) ? "?" : ""}`
    const [second, third] = rest
    const callback = () => this.callback(second)
    // a typed argument that may be nothing, passed as found:  see `argsOf()`
    const found = (arg: P.ASTExpression) => (this.mayBeNothing(arg) ? `${this.tight(arg)}!` : this.bare(arg))
    switch (name) {
      case "filter":
      case "all":
      case "any":
      case "removeWhere":
        return second ? `${self}.${name}(${callback()})` : undefined
      case "map":
      case "forEach":
        return second ? `${self}.${isStatement ? "forEach" : name}(${callback()})` : undefined
      case "forEachSequential":
        return second ? `${self}.forEachSequential(${callback()})` : undefined
      case "getItemAt":
        if (rest.length !== 1) return undefined
        if (isNumber(second, 1)) return `${self}.firstItem`
        if (isNumber(second, -1)) return `${self}.lastItem`
        return `${self}.getItem(${this.bare(second!)})`
      case "randomItemOf":
        return `${self}.randomItem()`
      case "randomItemsOf":
        return second ? `${self}.randomItems(${this.bare(second)})` : undefined
      case "isEmpty":
        return `${self}.isEmpty`
      case "itemCountOf":
        return `${self}.length`
      case "largestOf":
        return `${self}.max`
      case "smallestOf":
        return `${self}.min`
      case "positionOf":
      case "remove":
        return rest.length === 1 ? `${self}.${name}(${found(second!)})` : undefined
      case "includes":
      case "includesAny":
      case "append":
      case "prepend":
      case "addBefore":
      case "addAfter":
        return `${self}.${name}(${rest.map(found).join(", ")})`
      case "reverse":
      case "randomize":
        return `${self}.${name}()`
      case "rangeStartingAt":
        if (rest.length !== 1) return undefined
        if (
          isCoreCall(unwrapped(second!)) &&
          (unwrapped(second!) as P.ASTScopedMethodInvocation).methodName === "positionOf"
        ) {
          const [ofList, item] = (unwrapped(second!) as P.ASTScopedMethodInvocation).args.args ?? []
          if (ofList && item && this.write(ofList) === this.write(list))
            return `${self}.startingWith(${this.bare(item)})`
        }
        return `${self}.startingFrom(${this.bare(second!)})`
      case "rangeBetween":
        return rest.length === 2 ? `${self}.between(${this.bare(second!)}, ${this.bare(third!)})` : undefined
      case "duplicateList": {
        if (!(second instanceof P.ASTTypeExpression)) return `${self}.clone()`
        // already that class, e.g. a `Discard_Pile` is a `Pile`:  a copy of its own class (Q36)
        const own = this.kindOf(list)
        const isAlready = !!own && this.project.isSubclassOf(own, second.name)
        return isAlready ? `${self}.clone()` : `${self}.cloneAs(${second.name})`
      }
      case "mergeLists":
        return second instanceof P.ASTTypeExpression ? `${self}.merged(${second.name})` : undefined
    }
    return undefined
  }

  /** `callback`, the function a list's own method takes:  its item typed by the list, so bare -- see `listCall()`. */
  private callback(callback: P.ASTExpression | undefined): string {
    if (!callback) return ""
    const previous = this.untypedItems
    this.untypedItems = true
    try {
      return this.bare(callback)
    } finally {
      this.untypedItems = previous
    }
  }

  /** `array.forEach((item) => ...)` for a loop over a plain array, when it takes the item only. */
  private forEachOf(array: P.ASTExpression, callback: P.ASTExpression | undefined): string | undefined {
    const method = callback && unwrapped(callback)
    if (!(method instanceof P.ASTMethodDefinition) || (method.args?.length ?? 0) > 1) return undefined
    return `${this.tight(array)}.forEach(${this.bare(callback!)})`
  }

  /**
   * An event, through `@spell/core`'s own `trigger()` / `on()`, imported:
   * - `trigger("card-click", { card: this })`
   * - `on<{ card: Card }>("card-click", ({ card }) => card.play())`:  the payload's type as a type argument, taken
   *   apart in the handler's parameter (Q37)
   */
  private eventCall(name: string, args: P.ASTExpression[]): string {
    this.coreImports.add(name)
    const [type, handler] = args
    const method = handler && unwrapped(handler)
    if (name !== "on" || !(method instanceof P.ASTMethodDefinition)) {
      return `${name}(${args.map((arg) => this.bare(arg)).join(", ")})`
    }
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [first, ...rest] = statements
    const [event] = method.args ?? []
    const read = first instanceof P.ASTDestructuredAssignment ? unwrapped(first.thing) : undefined
    const shape = first instanceof P.ASTDestructuredAssignment ? this.shapeOf(first) : undefined
    const takesPayload = shape && event && read instanceof P.ASTVariableExpression && read.name === event.name
    if (!takesPayload) return `on(${this.bare(type!)}, ${this.bare(handler!)})`
    const names = (first as P.ASTDestructuredAssignment).variables.map((variable) => {
      const written = this.variableName(variable)
      return written === variable.name ? written : `${variable.name}: ${written}`
    })
    const async = method.isAsync ? "async " : ""
    const [only] = rest
    const body =
      rest.length === 1 && (only instanceof P.ASTScopedMethodInvocation || only instanceof P.ASTMethodInvocation)
        ? String(this.write(only))
        : this.write(new P.ASTStatementBlock(method.body.match, { statements: rest, wrap: true }))
    return `on<${shape}>(${this.bare(type!)}, ${async}({ ${names.join(", ")} }) => ${body})`
  }

  /**
   * A loop whose body waits, `await spellCore.forEachSequential(cards, async (card) => {...})`, as a plain loop:
   * `for (const card of cards) {...}`, so the waits happen in turn -- `undefined` if it isn't one.
   * - Over a spell `List` (iterable) or a plain array, when the body takes the item only.
   * - A bare `return` in the body ends that turn only:  `continue`.
   */
  loop(node: P.ASTExpression): string | undefined {
    const call = unwrapped(node)
    if (!isCoreCall(call) || (call as P.ASTScopedMethodInvocation).methodName !== "forEachSequential") return undefined
    const [collection, callback] = (call as P.ASTScopedMethodInvocation).args.args ?? []
    const method = callback && unwrapped(callback)
    if (!collection || !(method instanceof P.ASTMethodDefinition) || method.args?.length !== 1) return undefined
    if (!this.isList(collection) && this.kindOf(collection) !== "array") return undefined
    const [item] = method.args
    const previous = this.returnContinues
    this.returnContinues = true
    try {
      const body = this.write(method.body)
      return `for (const ${this.variableName(item!)} of ${this.tight(collection)}) ${body}`
    } finally {
      this.returnContinues = previous
    }
  }

  /** `await x`, or a loop whose body waits written as a plain loop -- see `loop()`. */
  ASTAwaitExpression(node: P.ASTAwaitExpression): string {
    return (this.statements.has(node) && this.loop(node.expression)) || `await ${this.tight(node.expression)}`
  }

  /** `thing.draw()` -- `?.draw()` when it may be nothing, e.g. the last card of a pile. */
  drawThing(thing: P.ASTExpression | undefined): string {
    if (!thing) return "undefined"
    return `${this.tight(thing)}${this.mayBeNothing(thing) ? "?." : "."}draw()`
  }

  /**
   * `<For each={pile.items}>{(card) => card.draw()}</For>`:  each item in its own error net, kept by identity.
   * - Its item is named for the list's item type when it's ours, e.g. `card` in a `Tableau`, else `item`.
   */
  drawItems(list: P.ASTExpression): string {
    const self = unwrapped(list)
    const isSelf = self instanceof P.ASTSelfLiteral || (self instanceof P.ASTVariableExpression && self.name === "this")
    const itemType = isSelf && this.project.itemTypeOf(this.currentClass)
    const item = itemType ? itemType.charAt(0).toLowerCase() + itemType.slice(1) : "item"
    return `<For each={${this.memberObject(list)}.items}>{(${item}) => ${item}.draw()}</For>`
  }

  /** `name(args) {...}` by TypeScript's name;  an inline function as an arrow -- see `arrow()`. */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    if (!node.inline) return super.ASTMethodDefinition(node)
    const error = node.error ? ` ${this.write(node.error)}` : ""
    if (node.asProperty) return `${this.methodNameOf(node)}: ${this.arrow(node)}${error}`
    return `${this.arrow(node)}${error}`
  }

  /**
   * As javascript's, plus a getter's type when spell knows it:  `get state(): string {...}`.
   * - Why:  TypeScript works a getter's type out from its body, and a body that loops over a list of the getter's
   *   own class (`the state of a pile` reads each card, a card reads its pile) goes round in a circle:  TypeScript
   *   gives up quietly, and the loop's item is `unknown`.
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

  /** TypeScript's name for `method`:  `testCardSetup`. */
  methodNameOf(method: P.ASTMethodDefinition): string {
    const { methodName } = method
    if (!methodName) return ""
    const name = camelCaseOf(methodName)
    if (method.asProperty && !jsText.isLegalIdentifier(name)) return jsText.inQuotes(name, '"')
    return name
  }

  /**
   * `method` as an arrow, tidy:  `(pile) => pile.droppable == true` -- its body an expression when it only returns
   * one, and trailing parameters it never uses left out, e.g. a handler's `event`.
   */
  arrow(method: P.ASTMethodDefinition): string {
    const previous = { returnContinues: this.returnContinues, untypedItems: this.untypedItems }
    this.returnContinues = false
    try {
      return this.arrowOf(method, previous.untypedItems)
    } finally {
      Object.assign(this, previous)
    }
  }

  /** `arrow()`'s work:  `untypedItems`, whether its item is typed by the list it's given to. */
  private arrowOf(method: P.ASTMethodDefinition, untypedItems: boolean): string {
    this.untypedItems = false
    const async = method.isAsync ? "async " : ""
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [only] = statements
    // an event's payload, destructured first:  its parameter says what it brings, `(event: { card: Card }) =>`
    const destructured = only instanceof P.ASTDestructuredAssignment ? only : undefined
    const payload = destructured && this.shapeOf(destructured)
    const [first] = method.args ?? []
    const read = destructured && unwrapped(destructured.thing)
    const typesFirst = !!payload && read instanceof P.ASTVariableExpression && read.name === first?.name
    if (typesFirst) this.typedByParam.add(destructured!)
    // its parameters are the body's own, so what they are is known (`kindOf()`)
    const body = this.inBlock(() => {
      this.noteParams(method)
      if (statements.length === 1 && only instanceof P.ASTReturnStatement && only.value) {
        const value = unwrapped(only.value)
        return value instanceof P.ASTObjectLiteral ? `(${this.write(value)})` : this.bare(only.value)
      }
      // one that only sets something, on one line:  `() => (this.operator = "+")`
      if (statements.length === 1 && only instanceof P.ASTAssignmentStatement && !only.isNewVariable) {
        return `(${this.write(only)})`
      }
      // one that only calls something:  `(card) => card.play()`
      if (statements.length === 1 && only instanceof P.ASTScopedMethodInvocation && !typesFirst) {
        this.statements.add(only)
        return String(this.write(only))
      }
      return String(this.write(method.body))
    })
    const args = [...(method.args ?? [])]
    while (args.length && !new RegExp(`\\b${camelCaseOf(args.at(-1)!.name)}\\b`).test(body)) args.pop()
    this.untypedItems = untypedItems
    const params = args.map((arg, index) =>
      index === 0 && typesFirst ? `${this.variableName(arg)}: ${payload}` : this.arrowParam(arg)
    )
    return `${async}(${params.join(", ")}) => ${body}`
  }

  /** SIDE EFFECT:  notes `method`'s parameters as the block's own, so what they are is known -- see `kindOf()`. */
  private noteParams(method: P.ASTMethodDefinition) {
    for (const arg of method.args ?? []) this.locals.at(-1)!.set(arg.name, arg)
  }

  /**
   * What `node` destructures, as a type, when spell knows what any of it is:  `{ card: Card }` -- else `undefined`.
   * - A field spell doesn't know is `UNKNOWN`.
   */
  shapeOf(node: P.ASTDestructuredAssignment): string | undefined {
    if (!node.isNewVariable) return undefined
    const types = node.variables.map((variable) => this.typeFor(variable.datatype ?? variable.variable?.datatype))
    if (!types.some(Boolean)) return undefined
    const fields = node.variables.map((variable, index) => `${variable.name}: ${types[index] ?? TSWriter.UNKNOWN}`)
    return `{ ${fields.join("; ")} }`
  }

  /**
   * An arrow's parameter:  typed when spell knows its type (`(card: Card) =>`), else bare, for TypeScript to type
   * from what it's passed to, e.g. `spellCore.map(spellCore.getRange(1, 7), (number) => ...)`:  a `number`.
   * - So no `UNKNOWN` marker:  an arrow is always passed somewhere that says what it gets (a `spellCore` helper, a
   *   handler), unlike a method's own parameter.
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
   * `key: value`, bare;  shorthand `{ name }` when its key is TypeScript's name for the variable it reads, else
   * `{ name: tsName }`.
   */
  ASTObjectLiteralProperty(node: P.ASTObjectLiteralProperty): string {
    const error = node.error ? ` ${this.write(node.error)}` : ""
    if (node.value) return `${this.write(node.property)}: ${this.bare(node.value)}${error}`
    const key = node.property.value
    const variable = camelCaseOf(key)
    return variable === key ? `${key}${error}` : `${key}: ${variable}${error}`
  }

  /**
   * `const { card } = event`:  a key whose variable TypeScript names differently is renamed, `{ start_pile: startPile }`.
   * - Typed when spell knows what any of them is, e.g. an event's payload, `on card-click with a card`:
   *   `const { card }: { card: Card } = event`.
   */
  ASTDestructuredAssignment(node: P.ASTDestructuredAssignment): string {
    const variables = node.variables.map((variable) => {
      const written = this.write(variable)
      return variable.name === this.variableName(variable) ? written : `${variable.name}: ${written}`
    })
    const declarator = !node.isNewVariable ? "" : this.isReassigned(node.variables) ? "let " : "const "
    const shape = this.typedByParam.has(node) ? undefined : this.shapeOf(node)
    return `${declarator}{ ${variables.join(", ")} }${shape ? `: ${shape}` : ""} = ${this.bare(node.thing)}`
  }

  ////////////////
  // ## Literals
  ////////////////

  /** A text value in double quotes, unless it's single-quoted with a `"` in it. */
  ASTStringLiteral(node: P.ASTStringLiteral): string {
    const text = super.ASTStringLiteral(node)
    return doubleQuoted(text)
  }

  /** A quoted word, e.g. an enumeration's value:  `"clubs"`. */
  ASTQuotedExpression(node: P.ASTQuotedExpression): string {
    return doubleQuoted(super.ASTQuotedExpression(node))
  }

  /** Its pre-baked `output`, a single-quoted word in double quotes. */
  ASTConstantExpression(node: P.ASTConstantExpression): string {
    return doubleQuoted(super.ASTConstantExpression(node))
  }

  ////////////////
  // ## Operators
  ////////////////

  /**
   * `lhs op rhs`, without parentheses JavaScript doesn't need (`a + b + c`, `x == 1 && y`) -- and `+` building text as
   * template text:  `` `${this.rank}-of-${this.suit}` ``.
   */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    const template = node.operator === "plus" && this.templateText(node)
    if (template) return template
    const comparison = this.comparison(node)
    if (comparison) return comparison
    const operator = JSWriter.OPERATORS[node.operator]
    return `${this.operand(node.lhs, node.operator, "lhs")} ${operator} ${this.operand(node.rhs, node.operator, "rhs")}`
  }

  /**
   * Spell's `is` / `is not` as a person writes it in TypeScript -- `undefined` to keep JavaScript's forgiving `==`:
   * - a choice compared to yes or no:  bare, `pile.droppable`, `!pile.droppable` (Q39)
   * - nothing:  `=== undefined` / `!== undefined`, as spell's nothing is `undefined`
   * - both sides' types known and alike (text, numbers, choices, one class):  `===` / `!==`, which then means the same
   *   -- `this.operator === "+"`, `this.value === card.value + 1`.  Where they aren't, `"2"` is `2` in spell:  `==`.
   */
  comparison(node: P.ASTInfixExpression): string | undefined {
    const { operator, lhs, rhs } = node
    if (operator !== "equals" && operator !== "not equals") return undefined
    const isNot = operator === "not equals"
    const [value, boolean] = unwrapped(rhs) instanceof P.ASTBooleanLiteral ? [lhs, rhs] : [rhs, lhs]
    const yesOrNo = unwrapped(boolean)
    if (yesOrNo instanceof P.ASTBooleanLiteral && this.kindOf(value) === "choice") {
      return yesOrNo.value !== isNot ? this.bare(value) : `!${this.tight(value)}`
    }
    const strict = isNot ? "!==" : "==="
    const isNothing = (it: P.ASTExpression) => unwrapped(it) instanceof P.ASTNothingLiteral
    if (isNothing(lhs) || isNothing(rhs))
      return `${this.operand(lhs, operator, "lhs")} ${strict} ${this.operand(rhs, operator, "rhs")}`
    const kind = this.kindOf(lhs)
    const other = this.kindOf(rhs)
    // two of the project's things:  `==` and `===` mean the same for objects
    const areThings = !!kind && !!other && this.project.isClass(kind) && this.project.isClass(other)
    if (!areThings && (!kind || kind !== other || kind === "list" || kind === "array")) return undefined
    return `${this.operand(lhs, operator, "lhs")} ${strict} ${this.operand(rhs, operator, "rhs")}`
  }

  /**
   * `operand` of an `operator`, in parentheses only where JavaScript needs them, or where a reader would want them:
   * `&&` inside `||`, a comparison in a comparison.
   */
  operand(operand: P.ASTExpression, operator: P.ASTOperator, side: "lhs" | "rhs"): string {
    const inner = unwrapped(operand)
    if (inner instanceof P.ASTTernaryExpression) return `(${this.write(inner)})`
    // `!x` and `await x` bind tighter than any operator
    if (inner instanceof P.ASTNotExpression || inner instanceof P.ASTAwaitExpression) return String(this.write(inner))
    // a helper written as a comparison (`x instanceof Tableau`) binds tighter than `&&` / `||`
    if (isCoreCall(inner) && PRECEDENCE[operator] <= PRECEDENCE.and) return String(this.write(inner))
    if (!(inner instanceof P.ASTInfixExpression)) return this.tight(inner)
    const mine = PRECEDENCE[inner.operator]
    const theirs = PRECEDENCE[operator]
    const isLogical = (level: number) => level <= PRECEDENCE.and
    const needsParens =
      mine < theirs ||
      (mine === theirs && side === "rhs") ||
      (mine === theirs && mine >= PRECEDENCE.equals && mine <= PRECEDENCE["less than"]) ||
      (isLogical(mine) && isLogical(theirs) && mine !== theirs)
    return needsParens ? `(${this.write(inner)})` : this.write(inner)
  }

  /**
   * `node`, a chain of `+` with text in it, as template text:  `"Score: " + this.score` => `` `Score: ${this.score}` ``.
   * - `undefined` when it isn't:  no text in the chain, or text only after two values (`a + b + "!"` adds `a` and `b`
   *   first), or text with escapes in it.
   */
  templateText(node: P.ASTInfixExpression): string | undefined {
    const parts: P.ASTExpression[] = []
    let rest: P.ASTExpression = node
    // `+` is left-associative:  only the LEFT side is the same chain
    while (rest instanceof P.ASTInfixExpression && rest.operator === "plus") {
      parts.unshift(rest.rhs)
      rest = unwrapped(rest.lhs)
    }
    parts.unshift(rest)
    const firstText = parts.findIndex((part) => this.textOf(part) !== undefined)
    if (firstText < 0 || firstText > 1) return undefined
    const body = parts.map((part) => this.textOf(part) ?? `\${${this.bare(part)}}`)
    if (body.some((text) => text === ESCAPED)) return undefined
    return `\`${body.join("")}\``
  }

  /**
   * `part`'s text for template text, if it's text written out:  escaped for back ticks;  `ESCAPED` if it has escapes
   * of its own, which would change meaning.
   */
  private textOf(part: P.ASTExpression): string | undefined {
    const inner = unwrapped(part)
    let text: string | undefined
    if (inner instanceof P.ASTStringLiteral && inner.quote) {
      if (inner.raw?.includes("\\")) return ESCAPED
      text = inner.value
    } else if (inner instanceof P.ASTQuotedExpression) {
      text = String(this.write(inner.expression))
    }
    return text?.replace(/`/g, "\\`").replace(/\$\{/g, "\\${")
  }

  /** `!x`, or `!(a && b)` when what it negates is an operator. */
  ASTNotExpression(node: P.ASTNotExpression): string {
    const inner = unwrapped(node.expression)
    // `is not defined`:  `x === undefined`
    if (isCoreCall(inner) && (inner as P.ASTScopedMethodInvocation).methodName === "isDefined") {
      const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
      if (value) return `${this.tight(value)} === undefined`
    }
    // `is not empty` on text:  `!!x`, not `!(!x)`
    const text = this.nonEmptyText(node)
    if (text) return `!!${this.tight(text)}`
    return `!${this.tight(node.expression)}`
  }

  /** The text `node` says isn't empty (`!spellCore.isEmpty(text)`), else `undefined`. */
  nonEmptyText(node: P.ASTExpression): P.ASTExpression | undefined {
    const not = unwrapped(node)
    if (!(not instanceof P.ASTNotExpression)) return undefined
    const inner = unwrapped(not.expression)
    if (!isCoreCall(inner) || (inner as P.ASTScopedMethodInvocation).methodName !== "isEmpty") return undefined
    const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
    return value && this.kindOf(value) === "text" ? value : undefined
  }

  /** An `if`'s condition:  text that isn't empty is tested bare, `if (this.right)`. */
  condition(node: P.ASTExpression): string {
    const text = this.nonEmptyText(node)
    return text ? this.bare(text) : this.bare(node)
  }

  /** `condition ? yes : no`:  in parentheses only where its reader puts it (an operand -- see `operand()`). */
  ASTTernaryExpression(node: P.ASTTernaryExpression): string {
    const { condition, trueValue, falseValue } = node
    const test = unwrapped(condition)
    const conditionText = test instanceof P.ASTTernaryExpression ? `(${this.write(test)})` : this.write(test)
    return `${conditionText} ? ${this.bare(trueValue)} : ${this.bare(falseValue)}`
  }

  /** `node` written without the parentheses around it:  where nothing binds tighter, e.g. after `return`. */
  bare(node: P.ASTExpression): string {
    return String(this.write(unwrapped(node)))
  }

  ////////////////
  // ## Statements
  ////////////////

  /**
   * Its statements, and those of the groups in it, in order, less those moved into a class.
   * - A class's constants and types go above its docstring:  see `classPrefix()`.
   */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    const lines: string[] = []
    // where the doc comment right above the next statement starts, in `lines`
    let docStart = 0
    for (const statement of flattened(node)) {
      if (this.project.moved.has(statement)) continue
      // one blank line at most, none at the start:  where a member moved out, two would meet
      if (statement instanceof P.ASTBlankLine) {
        if (lines.length && lines.at(-1) !== "") lines.push("")
        docStart = lines.length
        continue
      }
      // a docstring, and a declaration's marker below it, go with the statement below them
      if (statement instanceof P.ASTDocComment || statement instanceof P.ASTPreservedComment) {
        lines.push(String(this.write(statement)))
        continue
      }
      if (statement instanceof P.ASTClassDeclaration) {
        const prefix = this.classPrefix(statement)
        if (prefix) lines.splice(docStart, 0, prefix)
      }
      this.statements.add(statement)
      lines.push(String(this.write(statement)))
      docStart = lines.length
    }
    return elseOnItsLine(lines.join(jsText.NEWLINE))
  }

  /**
   * `{ statements }`:  braces around a block, its blank lines left unindented, none at either end.
   * - Its new variables are its own, see `inBlock()`.
   */
  ASTStatementBlock(node: P.ASTStatementBlock): string {
    const statements = [...(node.statements ?? [])]
    while (statements[0] instanceof P.ASTBlankLine) statements.shift()
    while (statements.at(-1) instanceof P.ASTBlankLine) statements.pop()
    for (const statement of statements) this.statements.add(statement)
    const children = this.inBlock(() => elseOnItsLine(this.list(statements, jsText.NEWLINE)))
    if (!children) return jsText.EMPTY_BLOCK
    if (!node.wrap) return `{ ${children} }`
    return `{\n${indented(children)}\n}`
  }

  /**
   * A new variable:  `const` unless it's set again (`let`), typed when spell knows its datatype,
   * e.g. `let count: number = 0`.
   * - Set from a `spellCore` call, which returns `unknown`:  `const pile = spellCore.randomItemOf(piles) as Pile`, or
   *   `UNKNOWN` when spell doesn't know either.
   * - Otherwise unknown:  as javascript, TypeScript works it out, e.g. `const game = new Game()`.
   */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    const { thing, value } = node
    this.noteLocal(node)
    if (!node.isNewVariable) return `${this.setting(thing)} = ${this.bare(value)}`
    const export_ = this.isExported(node) ? "export " : ""
    const declarator = thing instanceof P.ASTVariableExpression && this.isReassigned([thing]) ? "let" : "const"
    const declared = `${export_}${declarator} ${this.write(thing)}`
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

  /** Is any of `variables` set again after it's declared?  Then it's `let`. */
  isReassigned(variables: P.ASTVariableExpression[]): boolean {
    return variables.some((variable) => this.project.reassigned.has(variable.name))
  }

  /** As javascript's, by spell's own name:  `it_2` is never exported, whatever TypeScript calls it. */
  isExported(node: P.ASTAssignmentStatement): boolean {
    if (!JSWriter.EXPORT_VARS || !node.isNewVariable) return false
    const { scope } = node.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const name = node.thing instanceof P.ASTVariableExpression ? node.thing.name : String(this.write(node.thing))
    return !JSWriter.EXPORT_BLACKLIST.test(name)
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

  /** `if (condition) statement` -- braces only around more than one statement. */
  ASTIfStatement(node: P.ASTIfStatement): string {
    const written = `if (${this.condition(node.condition)}) ${this.body(node.statements)}`
    this.noteGuard(node)
    return written
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): string {
    return `else if (${this.condition(node.condition)}) ${this.body(node.statements)}`
  }

  ASTElseStatement(node: P.ASTElseStatement): string {
    return `else ${this.body(node.statements)}`
  }

  /** An `if`'s statements:  bare when it's one simple statement on one line, e.g. `return "?"`;  else a block. */
  body(block: P.ASTStatementBlock): string {
    const statements = (block.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [only] = statements
    if (statements.length === 1 && isSimpleStatement(only!)) {
      const text = String(this.write(only!))
      if (!text.includes(jsText.NEWLINE)) return text
    }
    return this.write(block)
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
      return arg.default ? `${this.variableName(arg)}: ${shape} = ${this.bare(arg.default)}` : `${arg.name}: ${shape}`
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
    const type =
      this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ??
      this.slotType(arg) ??
      TSWriter.UNKNOWN
    const declared = `${this.variableName(arg)}: ${type}`
    return arg.default ? `${declared} = ${this.bare(arg.default)}` : declared
  }

  /**
   * A method's parameter named for a property of its class:  that property's type, e.g. `isASuit(suit: Suit)` for
   * `a card "is a (suit)" for its suits` -- the slot ranges over a card's suits.  `undefined` if there's none.
   */
  slotType(arg: P.ASTVariableExpression): string | undefined {
    const property = this.project.propertyOf(this.currentClass, arg.name)
    return property && this.propertyType(property)
  }

  thisParam(thisType?: string): string {
    return thisType ? `this: ${thisType}` : ""
  }

  ////////////////
  // ## Classes
  ////////////////

  /**
   * `export class Card extends Thing {...}`, with every member the project gives it (see `TSProject.movedMembers`),
   * and `@thing` above it when it has a `create()`.
   * - Its lists of values go above it:  see `classPrefix()`.  The statement group holding it puts them above its
   *   docstring, too.
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
      let body = super.ASTClassDeclaration(new P.ASTClassDeclaration(match, { type, superType, members }))
      const undeclared = this.project.undeclared.get(type.name) ?? []
      // a value given when one is made:  declared in the class, for TypeScript only
      const declares = undeclared
        .filter((it) => it.isValue)
        .map((it) => `${jsText.INDENT}declare ${this.undeclaredMember(type.name, it)}`)
      if (declares.length) body = body.replace(/\}$/, `\n${declares.join("\n")}\n}`).replace("{}\n", "{\n")
      // a method the classes below it define:  merged in after it, one block, a member a line
      const methods = undeclared.filter((it) => it.method).map((it) => this.undeclaredMember(type.name, it))
      if (methods.length) body = `${body}\nexport interface ${type.name} {\n${indented(methods.join("\n"))}\n}`
      return hasCreate(declaration) ? `@thing\n${body}` : body
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
   * A member class `typeName` gets for TypeScript only (`TSProject.undeclared`), as an interface or a `declare` writes
   * it:  `droppable: boolean`, `canPickUpCard(card: Card): boolean`.
   * - A value:  typed by every value the program gives it -- see `givenKind()`.
   * - A method:  typed by what every class's definition of it returns -- see `definitionsKind()`.
   */
  undeclaredMember(typeName: string, { name, method, definitions }: TSUndeclared): string {
    if (!method) return `${name}: ${this.typeForKind(this.givenKind(typeName, name)) ?? TSWriter.UNKNOWN}`
    const returns = this.typeForKind(this.definitionsKind(definitions ?? [{ type: typeName, method }]))
    return `${camelCaseOf(name)}${this.signatureParams(method)}: ${returns ?? TSWriter.UNKNOWN}`
  }

  /** `node` with the members the project wrote for it elsewhere -- see `TSProject.movedMembers`. */
  private withProjectMembers(node: P.ASTClassDeclaration): P.ASTClassDeclaration {
    const moved = this.project.movedMembers.get(node.type.name)
    if (!moved?.length) return node
    const separator = node.members?.length ? [new P.ASTBlankLine(node.match)] : []
    return node.withMembers([...separator, ...moved])
  }

  /** The hoisted lists `node` declares, in order -- see `TSProject.lists`. */
  private listsOf(node: P.ASTClassDeclaration) {
    const lists = [...this.project.lists.values()]
    return (node.members ?? []).flatMap((member) => lists.filter((list) => list.definition === member))
  }

  /** `static Ranks = RANKS` for a hoisted list;  else as javascript's. */
  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    const list = [...this.project.lists.values()].find((it) => it.definition === node)
    return list ? `static ${node.name} = ${list.constant}` : super.ASTStaticDefinitionAsMember(node)
  }

  /** `static name(args) {...}`, by TypeScript's name. */
  ASTStaticMethodAsMember(node: P.ASTStaticMethod): string {
    const name = camelCaseOf(node.name)
    return this.methodNamed(node.method, node.getter ? `static get ${name}` : `static ${name}`)
  }

  ////////////////
  // ## Members
  ////////////////

  /**
   * In its class's body, by TypeScript's name:  `get isFaceUp() {...}`, `turnFaceUp() {...}`.
   * - `@derived` on a getter that loops over a list, e.g. a pile's `state`:  remembered until what it read changes.
   * - `@drawn draw() {...}`:  see `drawMethod()`.
   */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    const name = camelCaseOf(node.property.value)
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
   * What `node` holds, in TypeScript, from its `check`:  `{ type: 'text' }` => `string`;  a hoisted list's values
   * => `Rank`;  `{ oneOf: Deck.Suits }` => `(typeof Deck.Suits)[number]`, as for a list read when set,
   * `{ oneOf: () => Deck.Suits }`.  Else its initializer's datatype.  `undefined` if unknown.
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
    // made when first read, `as a new task-list`:  the class it makes, e.g. `Task_List`
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
    return `{ return this.getProp(${jsText.quoted(node.property.value)}) as ${type} }`
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
    const name = camelCaseOf(node.property.value)
    const member = node.get
      ? `readonly ${name}: ${this.typeFor(node.get.datatype) ?? TSWriter.UNKNOWN}`
      : `${name}${this.signatureParams(node.method!)}: ${this.typeFor(node.method!.datatype) ?? TSWriter.UNKNOWN}`
    const prototype = this.write(node.prototypeExpression)
    let patch: string
    if (node.get) {
      const descriptor = [`${this.methodNamed(node.get, "get", node.typeName)},`, "configurable: true"].join("\n")
      patch = `Object.defineProperty(${prototype}, ${jsText.inQuotes(name, '"')}, ${jsText.Block({ wrap: true, children: descriptor })})`
    } else {
      patch = `${prototype}.${name} = ${this.anonymousFunction(node.method!, node.typeName)}`
    }
    return [this.mergedInterface(node.typeName, member), patch].join(jsText.NEWLINE)
  }

  /** From outside its class:  `Suit.color = function (...) {...}`, by TypeScript's name. */
  ASTStaticMethod(node: P.ASTStaticMethod): string {
    if (node.getter) return super.ASTStaticMethod(node)
    return `${this.write(node.type)}.${camelCaseOf(node.name)} = ${this.anonymousFunction(node.method)}`
  }

  /**
   * `export interface Card { member }`:  merges with `export class Card`, wherever it is in the file.
   * - A class from ANOTHER project, imported, can't merge this way (`TS2440`):  `module()` makes it a `declare module`
   *   block in that project's module.
   */
  mergedInterface(typeName: string, member: string): string {
    return `export interface ${typeName} { ${member} }`
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
  // ## Lists
  ////////////////

  /**
   * A list says what it holds:  `a deck is a list of cards` => `class Deck extends List<Card>`, from its
   * `static instanceType = Card`.  So `spellCore.getItemAt(deck, 1)` is a `Card | undefined`.
   */
  superTypeOf(node: P.ASTClassDeclaration): string {
    const name = super.superTypeOf(node)
    if (name !== "List") return name
    const itemType = node.members?.find(
      (member): member is P.ASTStaticDefinition =>
        member instanceof P.ASTStaticDefinition && member.name === "instanceType"
    )?.value
    if (itemType instanceof P.ASTTypeExpression) return `List<${itemType.name}>`
    // read when made, as a static getter, for an item class further down:  `static get instanceType()`
    const ownItemType = this.project.itemTypes.get(node.type.name)
    return ownItemType ? `List<${ownItemType}>` : name
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
    if (node.type.name !== "List") return undefined
    const itemType = node.props?.properties.find(
      (property): property is P.ASTObjectLiteralProperty =>
        property instanceof P.ASTObjectLiteralProperty && property.property.value === "instanceType"
    )?.value
    if (!(itemType instanceof P.ASTStringLiteral) || !itemType.quote) return undefined
    return this.typeFor(itemType.value) ?? itemType.value
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
   * - Any other shape, as written:  it re-runs whole, in its error net (`@drawn`), when something it read changes.
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
   * Real JSX, which Solid's compiler builds:  `<div class="board">...</div>`, one child a line;  short text
   * inline, `<span class="suit">{this.shortSuit}</span>`.
   */
  ASTJSXElement(node: P.ASTJSXElement): string {
    const tag = node.tagName
    // `class` first:  the order the page gets them in from javascript's `spellCore.element()`, so both targets
    // draw the same (the core contract)
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
   * `name="text"` or `name={value}`, by the page's names, as `spellCore.element()` gives compiled javascript:
   * - `className` => `class`, `htmlFor` => `for`, a camelCase attribute of an HTML tag lowercased (`colSpan` =>
   *   `colspan`)
   * - on a tag with a dash (`<ui-form>`), a value that can change, or an object, is a PROPERTY:  `prop:value={...}`
   * - a handler as an arrow, `onClick={() => autoPlay()}`;  one the drawing shares by its name, `onClick={click}`
   * - no value:  bare on an HTML tag (`hidden`), `{true}` on a `<ui-*>` tag
   * - `undefined` for an attribute that didn't parse:  its error is in the program's parse errors
   */
  jsxAttribute(tag: string, attribute: P.ASTJSXAttribute): string | undefined {
    const { name, value } = attribute
    if (!value && attribute.error) return undefined
    let key = name
    if (name === "className") key = "class"
    else if (name === "htmlFor") key = "for"
    else if (tag.includes("-")) {
      const isProperty = !name.startsWith("on") && !name.includes("-") && !ATTRIBUTES_ONLY.has(name)
      if (isProperty && value && !isFixedValue(value)) key = `prop:${name}`
    } else if (!name.startsWith("on") && /[a-z][A-Z]/.test(name)) key = name.toLowerCase()

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
 * `statements`, a `to draw`'s body, as a `DrawingShape` -- `undefined` if they're any other shape, e.g. a loop, an
 * `else`, a local set twice, or nothing after the last `return`.
 */
function drawingShape(statements: P.ASTNode[], project: TSProject): DrawingShape | undefined {
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
 * What getter `method` returns early, if it starts so:  `if (...) return <literal>` -- e.g. `0` for a pile's `value`
 * (`if (this.isEmpty) return 0`), what its later `?.` reads fall back to.  `undefined` if it doesn't.
 */
function earlyReturnOf(method: P.ASTMethodDefinition): P.ASTExpression | undefined {
  const [first] = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
  if (!(first instanceof P.ASTIfStatement)) return undefined
  const [only] = (first.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
  if (!(only instanceof P.ASTReturnStatement) || !only.value) return undefined
  return unwrapped(only.value) instanceof P.ASTLiteral ? only.value : undefined
}

/** A `spellCore` helper written with an operator, which needs parentheses as an operand:  see `TSWriter.tight()`. */
const LOOSE_CORE_CALL = /^!|^typeof |\s(?:===|!==|instanceof)\s/

/** Spell's events, through `@spell/core`'s own `on()`, `trigger()` ... -- see `TSWriter.eventCall()`. */
const EVENTS = new Set(["on", "off", "once", "trigger"])

/** `spellCore` helpers worth importing by name, e.g. `positionOf(Card.Ranks, this.rank)`. */
const IMPORTED_HELPERS = new Set(["positionOf"])

/** What spell's `datatype` is, as `TSWriter.kindOf()` says it -- `undefined` for a list (a `List` or an array). */
function kindFromDatatype(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
  if (typeof datatype !== "string" || !datatype || datatype.startsWith("list")) return undefined
  if (datatype === "text" || datatype === "character") return "text"
  if (datatype === "number" || datatype === "integer") return "number"
  if (datatype === "choice") return "choice"
  return /^[A-Z]/.test(datatype) ? datatype : undefined
}

/** What a TypeScript type is, as `TSWriter.kindOf()` says it, e.g. `"text"` for `string`, `"Pile"` for `Pile`. */
function kindFromTypeScript(type: string | undefined): string | undefined {
  if (type === "string") return "text"
  if (type === "number") return "number"
  if (type === "boolean") return "choice"
  return type && /^[A-Z]\w*$/.test(type) ? type : undefined
}

/** The one kind in `kinds`, e.g. `"text"` -- `undefined` if there's more than one, or one can't be told. */
function alike(kinds: Set<string | undefined>): string | undefined {
  const [kind] = kinds
  return kinds.size === 1 ? kind : undefined
}

/** Is `value` member `name` read off something, e.g. `the name of the pile` for `name`? */
function readsMember(value: P.ASTExpression, name: string): boolean {
  const inner = unwrapped(value)
  return inner instanceof P.ASTPropertyExpression && inner.property.value === name
}

/** Is `node` the number `value` written out, e.g. `-1`? */
function isNumber(node: P.ASTExpression | undefined, value: number): boolean {
  const inner = node && unwrapped(node)
  return inner instanceof P.ASTNumericLiteral && Number(inner.value) === value
}

/** The decorators compiled TypeScript may use, all from `@spell/core`. */
const DECORATORS = ["prop", "state", "derived", "thing", "drawn"]

/** Solid's control flow a drawing may use, from `solid-js`. */
const SOLID_COMPONENTS = ["Show", "For", "Switch", "Match"]

/** What stays an attribute on a tag with a dash, whatever its value -- as `spellCore.element()`'s. */
const ATTRIBUTES_ONLY = new Set(["class", "className", "style", "id", "slot", "part"])

/** Longest element written on one line, open tag and children. */
const JSX_LINE = 100

/** `TSWriter.textOf()`'s answer for text with escapes of its own. */
const ESCAPED = "\u0000escaped"

/**
 * How tightly each operator binds, JavaScript's levels:  higher binds tighter.
 * - SEE:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence
 */
const PRECEDENCE: Record<P.ASTOperator, number> = {
  or: 3,
  and: 4,
  equals: 8,
  "not equals": 8,
  "exactly equals": 8,
  "not exactly equals": 8,
  "less than": 9,
  "greater than": 9,
  "at most": 9,
  "at least": 9,
  plus: 11,
  minus: 11,
  times: 12,
  "divided by": 12
}

/** `node` without the parentheses around it. */
function unwrapped(node: P.ASTExpression): P.ASTExpression {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node
}

/** Does `node` bind at least as tightly as `.`, so nothing needs parentheses around it?  A name, a read, a call ... */
function isTight(node: P.ASTExpression): boolean {
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
function isCoreCall(node: P.ASTNode): boolean {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node instanceof P.ASTScopedMethodInvocation && node.thing instanceof P.ASTSpellCoreExpression
}

/** Can't value `node` change?  A literal (not a list, which holds expressions), an element, a function. */
function isFixedValue(node: P.ASTExpression): boolean {
  const inner = unwrapped(node)
  if (inner instanceof P.ASTArrayLiteral || inner instanceof P.ASTEnumeration) return false
  return inner instanceof P.ASTLiteral || inner instanceof P.ASTMethodDefinition || inner instanceof P.ASTJSXElement
}

/** Is `node` one simple statement an `if` may hold without braces?  A return, a set, a call. */
function isSimpleStatement(node: P.ASTNode): boolean {
  return (
    node instanceof P.ASTReturnStatement || node instanceof P.ASTAssignmentStatement || node instanceof P.ASTExpression
  )
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
 * The docstring right above `member` in `members` -- past a declaration's marker (`/*! SPELL: DECLARES ... *\/`) --
 * if it has one.
 */
function docstringAbove(member: P.ASTNode, members: P.ASTNode[]): P.ASTDocComment | undefined {
  let index = members.indexOf(member) - 1
  while (members[index] instanceof P.ASTPreservedComment) index--
  const above = members[index]
  return above instanceof P.ASTDocComment ? above : undefined
}

/** `group`'s statements, and those of the groups in it, in order. */
function flattened(group: P.ASTStatementGroup): P.ASTNode[] {
  return (group.statements ?? []).flatMap((statement) =>
    statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)
      ? flattened(statement)
      : [statement]
  )
}

/** `text` with each `else` after a block's `}` on the same line, `} else {`, as a person writes it. */
function elseOnItsLine(text: string): string {
  return text.replace(/\}\n[ \t]*else\b/g, "} else")
}

/** `text` with every non-blank line indented once. */
function indented(text: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `${jsText.INDENT}${line}` : line))
    .join("\n")
}

/** `'text'` as `"text"`, when it has no `"` or `\` in it;  anything else as is. */
function doubleQuoted(text: string): string {
  return /^'[^'"\\]*'$/.test(text) ? `"${text.slice(1, -1)}"` : text
}
