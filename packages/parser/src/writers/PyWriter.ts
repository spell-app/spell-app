import { P } from "$/parser"
// Import directly to avoid circular import
import { ProgramWriter } from "./ProgramWriter"
import { Naming } from "./Naming"
import * as pyText from "./pyText"
import { isCoreCall, unwrapped } from "./jsShapes"

/****************
 * ### `PyWriter`
 * Writes a spell tree as Python:  the `py` target's writer (epic `python-target`).
 * - As idiomatic as Python can be (Owen, Q8):  what a Python programmer would write by hand.
 *   - names as PEP 8 says:  `play_fizzbuzz`, `Card`, `Card.RANKS`, a keyword stepping aside as `class_` (`naming`)
 *   - Python's own words where it has them:  `for number in range(1, 101):`, `print(...)`, `x is None`,
 *     `(number / 15).is_integer()`
 *   - `core`, `spell_core`'s one object, only where Python has no word for what spell says:  spell's tests,
 *     a seeded shuffle, spell's forgiving types
 * - Knows what each value is as the JS writer does:  `kindOf()`, from `P.ProgramWriter`.
 * - ONE method per kind of node, as every `P.Writer`.  A kind it can't write yet throws, naming it.
 * - A block is its indent (`pyText`):  a statement's text may span lines, each block indented under its `:`.
 ****************/
export class PyWriter extends ProgramWriter {
  /** The writer with no project, e.g. for one file in the editor. */
  static readonly instance = new PyWriter()

  /** PEP 8's names, a keyword stepping aside with a trailing `_` -- see `Naming.PYTHON`. */
  naming = new Naming(Naming.PYTHON, Naming.PYTHON_CLASHES)

  /** Between each source file's code:  a comment line. */
  readonly fileSeparator = "\n# -----------\n"

  /** The loop variables of a `for` over a range of whole numbers:  `print()` writes them as Python does. */
  protected wholeNumbers = new Set<string>()

  /**
   * The import lines:  `from spell_core import core, Thing` for spell's runtime -- only what the code uses,
   * as Python's linters ask (see `module()`).
   * - `spellCore` is `core`.
   * - Another project's names:  from its module, by project id, e.g. `@test:fixtures:Cards` => `cards`
   *   (see `projectModule()`).
   */
  importsHeader(imports: P.ModuleImport[]): string {
    const lines = imports
      .filter(({ names }) => names.length)
      .map(({ module, names }) => {
        const from = module === "@spell/core" ? "spell_core" : PyWriter.projectModule(module)
        const named = names.map((name) => (name === "spellCore" ? "core" : name))
        return `from ${from} import ${named.join(", ")}`
      })
    return `${lines.join(pyText.NEWLINE)}\n\n`
  }

  /** The Python module a project's compiled code is, from its `@spell/project/<id>`:  its name, snake_case. */
  static projectModule(module: string): string {
    const id = module.replace(/^@spell\/project\//, "")
    const name = (id.split(":").at(-1) ?? id).replace(/[^\w$]+/g, "_")
    return new Naming({ all: "snake_case" }).nameOf(name, "variable")
  }

  /**
   * The finished module:  `spell_core`'s import keeps only the names the code uses, as Python's linters ask
   * (`ruff`'s F401, an unused import).
   */
  module(code: string): string {
    const imported = code.replace(/^from spell_core import (.*)$/m, (_line, names: string) => {
      const body = code.slice(code.indexOf("\n"))
      const used = names.split(/,\s*/).filter((name) => new RegExp(`\\b${name}\\b`).test(body))
      return used.length ? `from spell_core import ${used.join(", ")}` : ""
    })
    // a pattern, `re.compile(...)`:  Python's `re`, first, as PEP 8 orders imports (the standard library's first)
    const withRe = /\bre\.compile\(/.test(imported) ? `import re\n${imported}` : imported
    // no import left, or a heading that writes nothing:  no blank lines first
    return withRe.replace(/^\n+/, "")
  }

  /** Text in Python's quotes:  `"name"`. */
  quoted(text: string): string {
    return pyText.inQuotes(text)
  }

  ////////////////
  // ## Lists
  ////////////////

  /** `items`, written, between `delimiter`s. */
  list(items: Array<P.ASTNode | null | undefined> | undefined, delimiter = ", "): string {
    return (items ?? []).map((item) => (item == null ? "None" : this.bare(item as P.ASTExpression))).join(delimiter)
  }

  ////////////////
  // ## Literals
  ////////////////

  ASTBlankLine(node: P.ASTBlankLine): string {
    return ""
  }

  /** An expression, its comment after it:  `x  # comment`. */
  ASTExpressionWithComment(node: P.ASTExpressionWithComment): string {
    return `${this.write(node.expression)}  # ${node.comment.value}`
  }

  /** A number as is;  anything else literal as its text. */
  ASTLiteral(node: P.ASTLiteral): string {
    return String(node.value)
  }

  /** A pattern:  `re.compile(r"...")`, its flags as Python's (`re.IGNORECASE`);  `module()` imports `re`. */
  ASTRegExpLiteral(node: P.ASTRegExpLiteral): string {
    const pattern = node.value as RegExp
    const flags = pattern.flags
      .split("")
      .map((flag) => ({ i: "re.IGNORECASE", m: "re.MULTILINE", s: "re.DOTALL" })[flag])
      .filter(Boolean)
    const source = `r"${pattern.source.replace(/"/g, '\\"')}"`
    return flags.length ? `re.compile(${source}, ${flags.join(" | ")})` : `re.compile(${source})`
  }

  /** Text in double quotes;  a fragment (no quote) as is. */
  ASTStringLiteral(node: P.ASTStringLiteral): string {
    return node.quote ? this.quoted(node.value) : node.value
  }

  ASTBooleanLiteral(node: P.ASTBooleanLiteral): string {
    return node.value ? "True" : "False"
  }

  ASTMissingExpression(node: P.ASTMissingExpression): string {
    return "None"
  }

  ASTNothingLiteral(node: P.ASTNothingLiteral): string {
    return "None"
  }

  /** The thing a method runs on:  `self`. */
  ASTSelfLiteral(node: P.ASTSelfLiteral): string {
    return "self"
  }

  ASTArrayLiteral(node: P.ASTArrayLiteral): string {
    return `[${this.list(node.items)}]`
  }

  ASTEnumeration(node: P.ASTEnumeration): string {
    return `[${this.list(node.enumeration)}]`
  }

  /** A quoted word, e.g. an enumeration's value:  `"clubs"`. */
  ASTQuotedExpression(node: P.ASTQuotedExpression): string {
    return this.quoted(String(this.write(node.expression)))
  }

  /** Its spell `value`, as Python says it:  text in double quotes, `"up"`, a number as is. */
  ASTConstantExpression(node: P.ASTConstantExpression): string {
    return typeof node.value === "number" ? String(node.value) : this.quoted(node.value)
  }

  ////////////////
  // ## Properties & variables
  ////////////////

  /** A property's name, by our name. */
  ASTPropertyLiteral(node: P.ASTPropertyLiteral): string {
    return this.nameOf(node.value, "property")
  }

  /** `object.property`, by our name:  `card.is_face_up`;  `getattr(object, "name")` for one that isn't a name. */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const object = this.tight(node.object)
    if (!node.property.isLegalIdentifier) return `getattr(${object}, ${this.quoted(node.property.value)})`
    return `${object}.${this.nameOf(node.property.value, "property")}`
  }

  /** `name`, by our name;  `name=default` for a parameter with a default value. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    const name = this.variableName(node)
    return node.default ? `${name}=${this.bare(node.default)}` : name
  }

  /** `node`'s name as we write a variable's:  `start_pile`;  `spellCore` is `core`. */
  variableName(node: P.ASTVariableExpression): string {
    if (node instanceof P.ASTSpellCoreExpression || node.name === "spellCore") return "core"
    return node.type === "global" ? node.name : this.nameOf(node.name, "variable")
  }

  ////////////////
  // ## Comments
  ////////////////

  /** `# text`. */
  ASTLineComment(node: P.ASTLineComment): string {
    return `#${node.initialWhitespace ?? " "}${node.value}`
  }

  ASTBlockComment(node: P.ASTBlockComment): string {
    return pyText.comment(node.value)
  }

  /** A docstring alone, where nothing below it takes it:  as `#` lines.  See `ASTStatementGroup()`. */
  ASTDocComment(node: P.ASTDocComment): string {
    return pyText.comment(node.lines.join(pyText.NEWLINE))
  }

  /**
   * A declaration's marker, `/*! SPELL: DECLARES ... *\/`, as every target writes it:  `SP.SpellDeclarations`
   * takes it out before the code is saved, so it never reaches the Python file.
   */
  ASTPreservedComment(node: P.ASTPreservedComment): string {
    return `/*! ${node.lines.join("\n")} */`
  }

  /** `# ## heading`, between two rules. */
  ASTBannerComment(node: P.ASTBannerComment): string {
    const heading = `# ## ${node.value}`
    const rule = "#".repeat(heading.length)
    return [rule, heading, rule].join(pyText.NEWLINE)
  }

  ASTParserAnnotation(node: P.ASTParserAnnotation): string {
    return `# ${node.annotation} ${node.value}`
  }

  ////////////////
  // ## Operators & expressions
  ////////////////

  /** `(expression)`. */
  ASTParenthesizedExpression(node: P.ASTParenthesizedExpression): string {
    return `(${this.write(node.expression)})`
  }

  /** `not x`;  `x is None` for `is not defined`. */
  ASTNotExpression(node: P.ASTNotExpression): string {
    const inner = unwrapped(node.expression)
    if (isCoreCall(inner) && (inner as P.ASTScopedMethodInvocation).methodName === "isDefined") {
      const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
      if (value) return `${this.operand(value, "equals", "lhs")} is None`
    }
    return `not ${this.operand(node.expression, "and", "rhs")}`
  }

  /** `lhs op rhs`, `op` Python's for its `operator`'s meaning;  `is` / `is not` as a person writes it. */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    const comparison = this.comparison(node)
    if (comparison) return comparison
    const operator = PyWriter.OPERATORS[node.operator]
    return `${this.operand(node.lhs, node.operator, "lhs")} ${operator} ${this.operand(node.rhs, node.operator, "rhs")}`
  }

  /**
   * Spell's `is` / `is not` as Python says it -- `undefined` for a plain `==`:
   * - nothing:  `x is None`, `x is not None`, as PEP 8 asks
   * - a choice compared to yes or no:  bare, `if pile.droppable:`, `not pile.droppable`
   */
  comparison(node: P.ASTInfixExpression): string | undefined {
    const { operator, lhs, rhs } = node
    if (operator !== "equals" && operator !== "not equals") return undefined
    const isNot = operator === "not equals"
    const isNothing = (it: P.ASTExpression) => unwrapped(it) instanceof P.ASTNothingLiteral
    if (isNothing(rhs)) return `${this.operand(lhs, operator, "lhs")} ${isNot ? "is not" : "is"} None`
    if (isNothing(lhs)) return `${this.operand(rhs, operator, "lhs")} ${isNot ? "is not" : "is"} None`
    const [value, boolean] = unwrapped(rhs) instanceof P.ASTBooleanLiteral ? [lhs, rhs] : [rhs, lhs]
    const yesOrNo = unwrapped(boolean)
    if (yesOrNo instanceof P.ASTBooleanLiteral && this.kindOf(value) === "choice") {
      return yesOrNo.value !== isNot ? this.bare(value) : `not ${this.operand(value, "and", "rhs")}`
    }
    return undefined
  }

  /** `operand` of `operator`, in parentheses where Python needs them, or a reader would want them. */
  operand(operand: P.ASTExpression, operator: P.ASTOperator, side: "lhs" | "rhs"): string {
    const inner = unwrapped(operand)
    if (inner instanceof P.ASTTernaryExpression) return `(${this.write(inner)})`
    if (!(inner instanceof P.ASTInfixExpression)) return this.tight(inner)
    const mine = PRECEDENCE[inner.operator]
    const theirs = PRECEDENCE[operator]
    const needsParens =
      mine < theirs || (mine === theirs && side === "rhs") || (mine <= 4 && theirs <= 4 && mine !== theirs)
    return needsParens ? `(${this.write(inner)})` : String(this.write(inner))
  }

  /** An `if`'s condition, without its parentheses. */
  condition(node: P.ASTExpression): string {
    return this.bare(node)
  }

  /** `node` written without the parentheses around it. */
  bare(node: P.ASTExpression): string {
    return String(this.write(unwrapped(node)))
  }

  /** `node`, in parentheses unless it binds at least as tightly as `.`:  before a `.`, a call's `(`. */
  tight(node: P.ASTExpression): string {
    const inner = unwrapped(node)
    const text = String(this.write(inner))
    const isTight =
      inner instanceof P.ASTLiteral ||
      inner instanceof P.ASTVariableExpression ||
      inner instanceof P.ASTPropertyExpression ||
      inner instanceof P.ASTArrayLiteral ||
      inner instanceof P.ASTQuotedExpression ||
      inner instanceof P.ASTConstantExpression ||
      (inner instanceof P.ASTMethodInvocation && !/^not |\bis (not )?None$/.test(text))
    return isTight ? text : `(${text})`
  }

  ////////////////
  // ## Method invocations
  ////////////////

  ASTInvocationArgs(node: P.ASTInvocationArgs): string {
    return `(${this.list(node.args)})`
  }

  /** `name(args)`, by our name:  `play_fizzbuzz()`. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return `${this.nameOf(node.methodName)}${this.write(node.args)}`
  }

  /**
   * `thing.method(args)`, by our name:  `card.move_to_pile(end_pile)`.
   * - A `spellCore` helper is written as Python says it where it can:  see `coreCall()`.  Else `core.<name>()`.
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (node instanceof P.ASTConsoleMethodInvocation) return this.consoleCall(node)
    if (node.thing instanceof P.ASTSpellCoreExpression) {
      const written = this.coreCall(node)
      if (written !== undefined) return written
      const args = (node.args.args ?? []).map((arg) => this.bare(arg))
      if (this.takesStartAt(node.methodName, node.args.args ?? [])) {
        while (args.length < ProgramWriter.START_AT_ARG[node.methodName]!) args.push("None")
        args.push("0")
      }
      return `core.${this.nameOf(node.methodName)}(${args.join(", ")})`
    }
    return `${this.tight(node.thing)}.${this.nameOf(node.methodName)}${this.write(node.args)}`
  }

  /**
   * `print the number, "fizz"`:  Python's own `print(number, "fizz")` where every value prints as spell's does --
   * text, and whole numbers;  else `core.console.log(...)`, which prints yes / no as `true` / `false`, `3.0` as `3`.
   * - `print warning` / `print error`:  `core.console.warn(...)` / `error(...)`, to stderr.
   */
  consoleCall(node: P.ASTConsoleMethodInvocation): string {
    const args = node.args.args ?? []
    const written = args.map((arg) => this.bare(arg))
    const native = node.methodName === "log" && args.every((arg) => this.printsNatively(arg))
    if (native) return `print(${written.join(", ")})`
    return `core.console.${this.nameOf(node.methodName)}(${written.join(", ")})`
  }

  /** Does Python's `print()` write `node` as spell does?  Text, and whole numbers. */
  printsNatively(node: P.ASTExpression): boolean {
    const inner = unwrapped(node)
    if (this.kindOf(inner) === "text") return true
    if (inner instanceof P.ASTNumericLiteral) return Number.isInteger(Number(inner.value))
    return inner instanceof P.ASTVariableExpression && this.wholeNumbers.has(inner.name)
  }

  ////////////////
  // ## `spellCore`'s helpers, as Python says them
  ////////////////

  /**
   * A `spellCore` helper as Python says it, where it can -- `undefined` for `core.<name>()`:
   * - `heading`:  nothing, a comment above says it (Python has no Thing Explorer to tell)
   * - `is an integer`:  `(x).is_integer()`, an `int`'s and a `float`'s own
   * - `is defined`:  `x is not None`
   * - a range of whole numbers written out:  `range(1, 101)`, its end one past spell's
   */
  coreCall(node: P.ASTScopedMethodInvocation): string | undefined {
    const args = node.args.args ?? []
    const [first, second] = args
    switch (node.methodName) {
      case "heading":
        return ""
      case "isDefined":
        return first ? `${this.operand(first, "equals", "lhs")} is not None` : undefined
      case "isOfType":
        if (first && isText(second, "integer")) return `${this.tight(first)}.is_integer()`
        return undefined
      case "getRange":
        return this.range(first, second)
    }
    return undefined
  }

  /** `range(start, end + 1)` for spell's range of whole numbers from `start` to `end`, counting up;  else `undefined`. */
  range(start: P.ASTExpression | undefined, end: P.ASTExpression | undefined): string | undefined {
    const from = start && unwrapped(start)
    const to = end && unwrapped(end)
    if (!(from instanceof P.ASTNumericLiteral) || !(to instanceof P.ASTNumericLiteral)) return undefined
    const [a, b] = [Number(from.value), Number(to.value)]
    if (!Number.isInteger(a) || !Number.isInteger(b) || a > b) return undefined
    return a === 0 ? `range(${b + 1})` : `range(${a}, ${b + 1})`
  }

  /**
   * A loop as Python says it, `for item in items:` -- for `spellCore.map()` / `forEach()` with a function of its
   * own, written as a statement.  `undefined` for anything else.
   * - With the position too, `for item, index in my-list`:  `for index, item in enumerate(items):`, from 1
   *   unless the project counts from 0.
   * - A bare `return` in the body ends that turn only:  `continue`.
   */
  loop(node: P.ASTNode): string | undefined {
    const call = unwrapped(node as P.ASTExpression)
    if (!isCoreCall(call)) return undefined
    const { methodName, args } = call as P.ASTScopedMethodInvocation
    if (!["map", "forEach", "forEachSequential"].includes(methodName)) return undefined
    const [collection, callback] = args.args ?? []
    const method = callback && unwrapped(callback)
    if (!collection || !(method instanceof P.ASTMethodDefinition)) return undefined
    const [item, position] = method.args ?? []
    if (!item) return undefined
    const range = isCoreCall(unwrapped(collection)) && this.write(unwrapped(collection))
    const isRange = !!range && /^range\(/.test(String(range))
    const items = this.bare(collection)
    const body = this.inBlock(() => {
      this.noteParams(method)
      if (isRange) this.wholeNumbers.add(item.name)
      try {
        return this.blockBody(method.body)
      } finally {
        this.wholeNumbers.delete(item.name)
      }
    })
    const looped = position
      ? `${this.variableName(position)}, ${this.variableName(item)} in enumerate(${items}${this.listsStartAt === 0 ? "" : ", 1"})`
      : `${this.variableName(item)} in ${items}`
    return pyText.block(`for ${looped}`, body)
  }

  ////////////////
  // ## Statements
  ////////////////

  /**
   * A file's or a block's statements, one a line.
   * - A docstring right above a `def` or `class` goes inside it, as Python's docstring;  a declaration's marker
   *   between them stays above.
   * - Two blank lines around a top-level `def` or `class` (PEP 8);  one at most anywhere else.
   */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    return this.statementLines(flattened(node), true)
  }

  /** `statements` as lines;  `topLevel`:  a module's, with PEP 8's two blank lines around a `def` or `class`. */
  statementLines(statements: P.ASTNode[], topLevel = false): string {
    const lines: string[] = []
    let doc: P.ASTDocComment | undefined
    // where the declaration markers right above the next statement start, in `lines`:  they go with it
    let markers: number | undefined
    const pushDoc = () => {
      if (doc) lines.push(String(this.ASTDocComment(doc)))
      doc = undefined
    }
    for (const statement of statements) {
      if (this.project.moved.has(statement)) continue
      if (statement instanceof P.ASTBlankLine) {
        pushDoc()
        markers = undefined
        if (lines.length && lines.at(-1) !== "") lines.push("")
        continue
      }
      if (statement instanceof P.ASTDocComment) {
        pushDoc()
        doc = statement
        continue
      }
      if (statement instanceof P.ASTPreservedComment) {
        markers ??= lines.length
        lines.push(String(this.write(statement)))
        continue
      }
      const isDefinition = isDefinitionStatement(statement)
      const written = isDefinition ? this.definition(statement, doc) : this.statement(statement)
      if (isDefinition) doc = undefined
      else pushDoc()
      const above = markers ?? lines.length
      markers = undefined
      if (!written) continue
      if (topLevel && isDefinition) separateAt(lines, above)
      lines.push(written)
      if (topLevel && isDefinition) lines.push("", "")
    }
    pushDoc()
    while (lines.at(-1) === "") lines.pop()
    return collapseBlankLines(lines.join(pyText.NEWLINE), topLevel)
  }

  /** One statement:  a loop as Python says it (`loop()`), else as written. */
  statement(statement: P.ASTNode): string {
    return this.loop(statement) ?? String(this.write(statement))
  }

  /** A `def` or `class`, with `doc` as its docstring, if any. */
  definition(statement: P.ASTNode, doc: P.ASTDocComment | undefined): string {
    if (statement instanceof P.ASTMethodDefinition) return this.methodDefinition(statement, doc)
    return String(this.write(statement))
  }

  /** A block's statements, indented by whoever puts it under its `:`. */
  ASTStatementBlock(node: P.ASTStatementBlock): string {
    return this.inBlock(() => this.blockBody(node))
  }

  /** `node`'s statements, one a line, `pass` for none -- see `pyText.block()`. */
  blockBody(node: P.ASTStatementBlock | P.ASTNode): string {
    const statements = node instanceof P.ASTStatementBlock ? [...(node.statements ?? [])] : [node]
    return this.statementLines(statements)
  }

  /** `try:`, then `except Exception as error:` and `finally:` as spell said them. */
  ASTTryCatchBlock(node: P.ASTTryCatchBlock): string {
    const { body, errorArg, catchBlock, finallyBlock } = node
    const parts = [pyText.block("try", this.blockBody(body))]
    if (catchBlock) {
      const caught = errorArg ? ` as ${this.write(errorArg)}` : ""
      parts.push(pyText.block(`except Exception${caught}`, this.blockBody(catchBlock)))
    }
    if (finallyBlock) parts.push(pyText.block("finally", this.blockBody(finallyBlock)))
    return parts.join(pyText.NEWLINE)
  }

  /** `if condition:` and its statements. */
  ASTIfStatement(node: P.ASTIfStatement): string {
    const written = pyText.block(`if ${this.condition(node.condition)}`, this.blockBody(node.statements))
    this.noteGuard(node)
    return written
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): string {
    return pyText.block(`elif ${this.condition(node.condition)}`, this.blockBody(node.statements))
  }

  ASTElseStatement(node: P.ASTElseStatement): string {
    return pyText.block("else", this.blockBody(node.statements))
  }

  /** `yes if condition else no`. */
  ASTTernaryExpression(node: P.ASTTernaryExpression): string {
    const yes = this.operand(node.trueValue, "or", "lhs")
    const no = this.operand(node.falseValue, "or", "rhs")
    return `${yes} if ${this.bare(node.condition)} else ${no}`
  }

  /** `return value`, or a bare `return`. */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    return node.value ? `return ${this.bare(node.value)}` : "return"
  }

  /** `name = value`:  Python has no `let` or `const`. */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    this.noteLocal(node)
    return `${this.write(node.thing)} = ${this.bare(node.value)}`
  }

  ////////////////
  // ## Functions
  ////////////////

  /** A function of its own:  see `methodDefinition()`. */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    return this.methodDefinition(node, undefined)
  }

  /**
   * `def name(args):` and its body, `doc` its docstring.
   * - Its parameters are its body's own, so what they are is known (`kindOf()`).
   */
  methodDefinition(node: P.ASTMethodDefinition, doc: P.ASTDocComment | undefined): string {
    const name = node.methodName ? this.nameOf(node.methodName) : "_"
    const params = (node.args ?? []).map((arg) => this.write(arg)).join(", ")
    const body = this.inBlock(() => {
      this.noteParams(node)
      return this.blockBody(node.body)
    })
    const docstring = doc ? `${pyText.docstring(doc.lines)}\n` : ""
    return pyText.block(`def ${name}(${params})`, `${docstring}${body}`)
  }

  ////////////////
  // ## Settings
  ////////////////

  /** Python for each infix operator's meaning (`P.ASTOperator`). */
  static OPERATORS: Record<P.ASTOperator, string> = {
    and: "and",
    or: "or",
    equals: "==",
    "not equals": "!=",
    "exactly equals": "==",
    "not exactly equals": "!=",
    "less than": "<",
    "greater than": ">",
    "at most": "<=",
    "at least": ">=",
    plus: "+",
    minus: "-",
    times: "*",
    "divided by": "/"
  }
}

/** How tightly each operator binds in Python:  higher binds tighter. */
const PRECEDENCE: Record<P.ASTOperator, number> = {
  or: 3,
  and: 4,
  equals: 8,
  "not equals": 8,
  "exactly equals": 8,
  "not exactly equals": 8,
  "less than": 8,
  "greater than": 8,
  "at most": 8,
  "at least": 8,
  plus: 11,
  minus: 11,
  times: 12,
  "divided by": 12
}

/** `group`'s statements, and those of the groups in it, in order. */
function flattened(group: P.ASTStatementGroup): P.ASTNode[] {
  return (group.statements ?? []).flatMap((statement) =>
    statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)
      ? flattened(statement)
      : [statement]
  )
}

/** Is `node` a `def` or a `class` of its own, which a docstring above goes inside? */
function isDefinitionStatement(node: P.ASTNode): boolean {
  return (node instanceof P.ASTMethodDefinition && !node.inline) || node instanceof P.ASTClassDeclaration
}

/** Is `node` the text `text`, written out:  `"integer"`? */
function isText(node: P.ASTExpression | undefined, text: string): boolean {
  const inner = node && unwrapped(node)
  if (inner instanceof P.ASTStringLiteral || inner instanceof P.ASTConstantExpression) return inner.value === text
  if (!(inner instanceof P.ASTQuotedExpression)) return false
  const quoted = inner.expression
  return quoted instanceof P.ASTLiteral && quoted.value === text
}

/**
 * SIDE EFFECT:  two blank lines at `index` of `lines`, as PEP 8 wants before a top-level `def` or `class` -- above
 * the declaration markers that go with it.  None at the very top.
 */
function separateAt(lines: string[], index: number): void {
  let start = index
  while (start > 0 && lines[start - 1] === "") start--
  const gap = start === 0 ? [] : ["", ""]
  lines.splice(start, index - start, ...gap)
}

/** `text` with no more than two blank lines in a row at the top level, one inside a block. */
function collapseBlankLines(text: string, topLevel: boolean): string {
  return text.replace(topLevel ? /\n{4,}/g : /\n{3,}/g, topLevel ? "\n\n\n" : "\n\n")
}
