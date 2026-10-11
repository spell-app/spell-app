import { P } from "$/parser"
// Import directly to avoid circular import
import { Writer } from "./Writer"
import { alike, isKnownType, kindFromDatatype, kindOfType, newListItemName, readsMember, unwrapped } from "./jsShapes"
import { WriterProject, forEachNode, type ProgramPlace } from "./WriterProject"
import { type Naming, type NameKind } from "./Naming"

/****************
 * ### `ProgramWriter`
 * What every writer of a PROGRAM shares, whatever language it writes (epic `python-target` P4):
 * what it knows of the project, and so what each value is.
 * - `P.JSWriter` (and `P.TSWriter` on it) and the Python writer extend it:  it writes no code itself.
 * - What the whole project says, before writing any of it:  `forProject()`, a `WriterProject`.
 * - What a value is, as far as writing it goes:  `kindOf()` -- text, a number, a choice, a list, a class.
 * - What may be nothing:  `mayBeNothing()`, from what each new variable is set to (`locals`).
 * - Where the project's lists start counting:  `listsStartAt`, and which `spellCore` helpers take a position.
 * - How it writes spell's names:  `naming`, set by each language's writer.
 ****************/
export abstract class ProgramWriter extends Writer {
  /** What we know of the project we're writing -- see `WriterProject`. */
  readonly project: WriterProject

  /** How we write each kind of name, e.g. a type in PascalCase:  each language's writer sets its own -- see `Naming`. */
  abstract naming: Naming

  /**
   * Between each source file's code, when a project's files are written as one module, e.g. `\n// -----------\n`.
   * - A comment line in the language written:  readers find each file's part of the module by it.
   */
  abstract readonly fileSeparator: string

  /**
   * The lines a module starts with:  what it imports, by module, in order -- spell's runtime first, then other
   * projects, e.g. `import { spellCore, Thing } from "@spell/core"`.
   * - Ends with a blank line, ready for the code.
   */
  abstract importsHeader(imports: P.ModuleImport[]): string

  /**
   * Where the project's lists start counting, 1 or 0 (`project.json`'s `"listsStartAt"`) -- see `forProject()`.
   * - Counting from 0, a position is written as the language says it where it can (javascript's `deck.at(n)`),
   *   else `spellCore`'s helper is told so with a last `0` -- see `takesStartAt()`.
   */
  listsStartAt: 0 | 1 = 1

  /** The class we're writing, e.g. `Tableau`:  what `this` is -- see `kindOf()`. */
  protected currentClass: string | undefined

  /** What the program gives each member, worked out once, by `<Class>.<member>` -- see `givenKind()`. */
  protected givenKinds = new Map<string, string | undefined>()
  /** The members `givenKind()` is working out, by `<Class>.<member>`:  one asked for again can't be told. */
  protected workingOut = new Set<string>()

  constructor(project = new WriterProject()) {
    super()
    this.project = project
  }

  /**
   * A writer of our class for the project whose files' statements are `files`, parsed in `scope`:
   * see `WriterProject`.
   */
  forProject(files: P.ASTNode[][], scope?: P.Scope, options?: P.WriterOptions): this {
    const Class = this.constructor as new (project: WriterProject) => this
    const writer = new Class(WriterProject.of(files, scope))
    // our language's names, as set on us
    writer.naming = this.naming
    writer.listsStartAt = options?.listsStartAt ?? 1
    return writer
  }

  /**
   * `match`'s code, a file's, a statement's or a rule test's, written as if it were the whole project, in its scope
   * (`forProject()`):  so a getter its project declares, or imports, is read by its member name, `card.isFaceUp`.
   * - For code alone, e.g. the editor's view of one file, a hover, a rule test:
   *   a project's is written whole, by `SP.SpellProject.combineCompiled()`.
   * - A rule with no tree compiles itself.
   */
  writeMatch(match: P.Match | undefined): unknown {
    const ast = match?.rule.getAST ? match.AST : undefined
    if (!ast) return match?.compile()
    const statements = ast instanceof P.ASTStatementGroup ? (ast.statements ?? []) : [ast]
    return this.forProject([statements], match!.scope).write(ast)
  }

  /**
   * How we write spell's `name`, e.g. `add_card_to_pile`:
   * each writer says how it writes names (epic `output-targets`, Q51, Q56).
   * - The case for each kind of name is `naming`'s, e.g. `type` => PascalCase (epic `drawable-thing`, P11):
   *   - javascript (and TypeScript) write every member in camelCase:  `addCardToPile`, `isSetUp`
   *   - Python writes them in snake_case:  `add_card_to_pile`
   * - A member's name is a method's unless `kind` says otherwise:
   *   one rule for every member, so a read, `deck.isSetUp`, needn't know which kind it is.
   */
  nameOf(name: string, kind: NameKind | "member" = "member"): string {
    return this.naming.nameOf(name, kind === "member" ? "method" : kind)
  }

  /** spell's type `name`, e.g. `BankAccount`, as we write a type's name -- `naming`'s `type`;  a value type as is. */
  typeNameOf(name: string): string {
    return P.isValueType(name) ? name : this.nameOf(name, "type")
  }

  /**
   * A position said with an ordinal word, e.g. `the first card`'s `1`:  as the project counts it, so one less
   * counting from 0 (`listsStartAt`), `0`.  Negative ones count from the end either way:  as they are.
   */
  ASTOrdinalLiteral(node: P.ASTOrdinalLiteral): number {
    return this.listsStartAt === 0 && node.value > 0 ? node.value - 1 : node.value
  }

  /**
   * `spellCore`'s helpers that take or give a position, and where their last `startAt` goes:
   * the argument a project counting from 0 passes, `0` -- see `startAtArgs()`.
   * - A loop's only when its callback takes the position too:  `for item, index in my-list`.
   */
  static START_AT_ARG: Record<string, number> = {
    getItemAt: 2,
    setItemAt: 3,
    removeItemAt: 2,
    positionOf: 2,
    rangeBetween: 3,
    removeRangeBetween: 3,
    rangeStartingAt: 3,
    map: 2,
    forEach: 2,
    forEachSequential: 2
  }

  /**
   * Does `spellCore`'s helper `name`, given `args`, take a last `startAt` in this project:  does the project count
   * from 0, and is it a position, or a loop that hands its callback the position?
   */
  takesStartAt(name: string, args: P.ASTExpression[]): boolean {
    if (this.listsStartAt !== 0 || !(name in ProgramWriter.START_AT_ARG)) return false
    if (name !== "map" && name !== "forEach" && name !== "forEachSequential") return true
    const callback = args[1] && unwrapped(args[1])
    return callback instanceof P.ASTMethodDefinition && (callback.args?.length ?? 0) >= 2
  }

  /**
   * The position `node` says as a number, as we write it:  an ordinal counted as the project counts
   * (`first` is `0` counting from 0), a number as is -- `undefined` for anything else.
   */
  writtenPosition(node: P.ASTExpression | undefined): number | undefined {
    const inner = node && unwrapped(node)
    if (inner instanceof P.ASTOrdinalLiteral) return this.ASTOrdinalLiteral(inner)
    if (inner instanceof P.ASTNumericLiteral) return Number(inner.value)
    return undefined
  }

  ////////////////
  // ## What a value is
  ////////////////

  /**
   * What `node` is, as far as writing it goes -- or `undefined` if the writer can't tell:
   * `"text"`, `"number"`, `"choice"`, `"array"` (JavaScript's), `"list"` (spell's `List`),
   * or a class's name, e.g. `"Pile"`.
   * - From where it came from:  a literal, `new Pile(...)`, `this` in a class, what a variable was set to,
   *   a property's declared type, a `spellCore` helper's result -- else spell's own datatype for it.
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
        ? this.propertyKind(property)
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

  /** Is `node` one of spell's `List`s, so it has its own methods?  See `kindOf()`. */
  isList(node: P.ASTExpression): boolean {
    const kind = this.kindOf(node)
    return kind === "list" || this.project.isListClass(kind)
  }

  /**
   * What property `node` holds, as `kindOf()` says it -- `undefined` for a list, or what can't be told.
   * - From its `check`:
   *   - `{ type: 'text' }` => `"text"`
   *   - a list of values hoisted as a typed constant => its type, e.g. `"Rank"` (`WriterProject.lists`)
   * - Else from its initializer:  the class it makes, its datatype.
   * - Else what the program gives it (`givenKind()`).
   */
  propertyKind(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
      const key = property.property.value
      if (key === "type" && property.value instanceof P.ASTStringLiteral) return kindOfType(property.value.value)
      if (key === "oneOf") return this.project.listFor(property.value)?.type
    }
    const initializer = node.initializer && unwrapped(node.initializer)
    if (initializer instanceof P.ASTNewInstanceExpression) {
      // made when first read, `as a new task-list`:  the class it makes, e.g. `TaskList`;  a new list is a list
      if (initializer.type.name !== "List") return kindOfType(initializer.type.name)
      if (newListItemName(initializer)) return undefined
    }
    const initial = node.initializer?.datatype
    if (isKnownType(initial)) return kindOfType(initial)
    // the program never says:  what it gives it (Q54)
    return kindOfType(this.givenKind(node.typeName, node.property.value, node.initializer))
  }

  /**
   * What a value class `owner` gets for TypeScript only is (`WriterProject.undeclared`),
   * e.g. `droppable`:  a choice.
   */
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
   *   -- see `WriterProject.givenValues`.
   *   Set on something the writer can't tell is one:  it doesn't count.
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
   * What every class's definition of a method returns, when all alike,
   * e.g. `"choice"` for each pile's `can_play_$card` (Q54) -- `undefined` when they differ, or any can't be told.
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
   * What `method` returns, when every `return` in it gives a value, and all alike -- `undefined` otherwise.
   * - `return card === this.lastItem` and `return false` are choices.
   * - Not one that waits (it returns a promise),
   *   nor one that may end without a `return`:  see `returnedKinds()`.
   */
  private returnedKind(method: P.ASTMethodDefinition): string | undefined {
    const kinds = method.isAsync ? undefined : this.returnedKinds(method)
    return kinds && !kinds.has("nothing") ? alike(kinds) : undefined
  }

  /**
   * What each `return` in `method` gives, as `kindOf()` says it:  `"nothing"` for a bare `return`,
   * `undefined` for one that can't be told.
   * - `undefined` for a method that may end without a `return`:  its last statement isn't one.
   * - Its new variables are known by what they're set to;  a `return` in a function inside it isn't its own.
   */
  protected returnedKinds(method: P.ASTMethodDefinition): Set<string | undefined> | undefined {
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (!(statements.at(-1) instanceof P.ASTReturnStatement)) return undefined
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
      return new Set(returns.map((it) => (it.value ? this.kindOf(it.value) : "nothing")))
    })
  }

  /**
   * `work()`, as if writing what's at `where`:
   * `this` is its class, and the parameters of the methods it's inside are known.
   * Nothing else written so far is.
   */
  protected inPlace<T>(where: ProgramPlace, work: () => T): T {
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

  /** `write()` with `this` being class `typeName`:  for a member written outside its class. */
  protected inClass<T>(typeName: string, write: () => T): T {
    const previous = this.currentClass
    this.currentClass = typeName
    try {
      return write()
    } finally {
      this.currentClass = previous
    }
  }

  /**
   * What getter `name` of class `owner` gives, from what it returns:  the kind ALL its returns share,
   * e.g. `"text"` for a card's `color` (`"red"` or `"black"`) -- `undefined` if they differ, or any can't tell.
   */
  private getterKind(owner: string | undefined, name: string, depth: number): string | undefined {
    const getter = this.project.getterOf(owner, name)
    if (!getter || depth > 4) return undefined
    const kinds = new Set<string | undefined>()
    forEachNode(getter.body, (node) => {
      if (node instanceof P.ASTReturnStatement && node.value) kinds.add(this.kindOf(node.value, depth + 1))
    })
    return alike(kinds)
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

  ////////////////
  // ## What may be nothing
  ////////////////

  /**
   * What each new variable of the blocks being written is set to, by spell's name -- see `mayBeNothing()`.
   * - One map per block, innermost last.
   * - The first holds a file's own top level.
   */
  protected locals: Array<Map<string, P.ASTExpression>> = [new Map()]

  /** SIDE EFFECT:  notes `method`'s parameters as the block's own, so what they are is known -- see `kindOf()`. */
  protected noteParams(method: P.ASTMethodDefinition) {
    for (const arg of method.args ?? []) this.locals.at(-1)!.set(arg.name, arg)
  }

  /** `write()` inside a block of its own:  its new variables are forgotten when it's written. */
  protected inBlock<T>(write: () => T): T {
    this.locals.push(new Map())
    try {
      return write()
    } finally {
      this.locals.pop()
    }
  }

  /** SIDE EFFECT:  notes what `node`, a new variable, is set to -- in a block only:  a writer is shared by programs. */
  protected noteLocal(node: P.ASTAssignmentStatement) {
    if (!node.isNewVariable || !(node.thing instanceof P.ASTVariableExpression) || this.locals.length < 2) return
    this.locals.at(-1)!.set(node.thing.name, node.value)
  }

  /**
   * SIDE EFFECT:  notes that after a guard, the value it checks is THERE for the rest of the block:
   * read off it with `.`, not `?.` -- see `mayBeNothing()`.
   * - A guard:  `if (!spellCore.isDefined(endPile)) return false`.
   */
  protected noteGuard(node: P.ASTIfStatement) {
    const condition = unwrapped(node.condition)
    const [only] = (node.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (!(condition instanceof P.ASTNotExpression) || !(only instanceof P.ASTReturnStatement)) return
    const checked = unwrapped(condition.expression)
    const isDefined =
      checked instanceof P.ASTScopedMethodInvocation &&
      checked.thing instanceof P.ASTSpellCoreExpression &&
      checked.methodName === "isDefined"
    const [value] = isDefined ? ((checked as P.ASTScopedMethodInvocation).args.args ?? []) : []
    const variable = value && unwrapped(value)
    if (variable instanceof P.ASTVariableExpression) this.locals.at(-1)!.set(variable.name, ProgramWriter.FOUND)
  }

  /** What a variable a guard checked is noted as:  there -- see `noteGuard()`. */
  static FOUND: P.ASTExpression = Object.freeze({}) as P.ASTExpression

  /** What new variable `name` was set to, in the blocks being written -- `undefined` if it wasn't. */
  localValue(name: string): P.ASTExpression | undefined {
    for (let index = this.locals.length - 1; index >= 0; index--) {
      const value = this.locals[index]!.get(name)
      if (value) return value
    }
    return undefined
  }

  /**
   * May `node` be nothing?
   * - Yes for:  an item read from a list (`spellCore.getItemAt(pile, -1)`), what's read off one,
   *   or a variable set to one.
   * - Reading off it is written `?.`, so spell reads off nothing as nothing and never throws
   *   (epic `output-targets`, Q38).
   */
  mayBeNothing(node: P.ASTExpression): boolean {
    const inner = unwrapped(node)
    if (inner instanceof P.ASTScopedMethodInvocation && inner.thing instanceof P.ASTSpellCoreExpression) {
      if (ProgramWriter.ITEM_READS.has(inner.methodName)) return true
      // a helper given what may be nothing gives nothing back, e.g. the cards of a random pile
      const [first] = inner.args.args ?? []
      return !!first && this.mayBeNothing(first)
    }
    // read off what may be nothing:  `?.`, so it may be nothing too
    if (inner instanceof P.ASTPropertyExpression) return this.mayBeNothing(inner.object)
    if (inner instanceof P.ASTScopedMethodInvocation) return this.mayBeNothing(inner.thing)
    if (!(inner instanceof P.ASTVariableExpression) || inner instanceof P.ASTSpellCoreExpression) return false
    const value = this.localValue(inner.name)
    if (!value || value === ProgramWriter.FOUND || value === node) return false
    return this.mayBeNothing(value)
  }

  /** The `spellCore` helpers that read ONE item of a list, which may be nothing:  see `mayBeNothing()`. */
  static ITEM_READS = new Set(["getItemAt", "randomItemOf"])
}
