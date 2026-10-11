import { P } from "$/parser"
// Import directly to avoid circular import
import * as pyText from "./pyText"

const { attributeName, isCoreCall, kindFromDatatype, unwrapped } = P.jsShapes

/****************
 * ### `PyBaseWriter`
 * Writes a spell tree as Python, all but waiting:  what `PY.PyWriter`, the `py` target's writer, builds on
 * (epic `python-target`).
 * - As idiomatic as Python can be (Owen, Q8):  what a Python programmer would write by hand.
 *   - names as PEP 8 says:  `play_fizzbuzz`, `Card`, `Card.RANKS`, a keyword stepping aside as `class_` (`naming`)
 *   - Python's own words where it has them:
 *     `for number in range(1, 101):`, `print(...)`, `x is None`, `(number / 15).is_integer()`
 *   - `core`, `spell_core`'s one object, only where Python has no word for what spell says:
 *     spell's tests, a seeded shuffle, spell's forgiving types
 * - Knows what each value is as the JS writer does:  `kindOf()`, from `P.ProgramWriter`.
 * - ONE method per kind of node, as every `P.Writer`.
 *   A kind it can't write yet throws, naming it.
 * - A block is its indent (`pyText`):  a statement's text may span lines, each block indented under its `:`.
 ****************/
export class PyBaseWriter extends P.ProgramWriter {
  /** The writer with no project, e.g. for one file in the editor. */
  static readonly instance = new PyBaseWriter()

  /** PEP 8's names, a keyword stepping aside with a trailing `_` -- see `Naming.PYTHON`. */
  naming = new P.Naming(P.Naming.PYTHON, P.Naming.PYTHON_CLASHES)

  /** Between each source file's code:  a comment line, two blank lines either side, as PEP 8 spaces top-level code. */
  readonly fileSeparator = "\n\n\n# -----------\n\n\n"

  /** The loop variables of a `for` over a range of whole numbers:  `print()` writes them as Python does. */
  protected wholeNumbers = new Set<string>()

  /**
   * The import lines:  `from spell_core import core, Thing` for spell's runtime -- only what the code uses,
   * as Python's linters ask (see `module()`).
   * - `spellCore` is `core`.
   * - Another project's names:  from its module, by project id (see `projectModule()`),
   *   e.g. `@test:fixtures:Cards` => `cards`.
   */
  importsHeader(imports: P.ModuleImport[]): string {
    const lines = imports
      .filter(({ names }) => names.length)
      .map(({ module, names }) => {
        const from = module === "@spell/core" ? "spell_core" : PyBaseWriter.projectModule(module)
        const named = names.map((name) => (name === "spellCore" ? "core" : name))
        return `from ${from} import ${named.join(", ")}`
      })
    // two blank lines after them, as PEP 8 wants before a top-level `def` or `class`
    return `${lines.join(pyText.NEWLINE)}\n\n\n`
  }

  /** What `spell_core` gives besides spell's runtime names, imported when the code uses them -- see `module()`. */
  static CORE_EXTRAS = ["prop", "h", "position", "spell_position", "end_position", "with_spell_positions"]

  /** How Python says nothing:  `None`, for a range with no end -- see `P.ProgramWriter.positionArgs()`. */
  nothing = "None"

  /** The Python module a project's compiled code is, from its `@spell/project/<id>`:  its name, snake_case. */
  static projectModule(module: string): string {
    const id = module.replace(/^@spell\/project\//, "")
    const name = (id.split(":").at(-1) ?? id).replace(/[^\w$]+/g, "_")
    return new P.Naming({ all: "snake_case" }).nameOf(name, "variable")
  }

  /**
   * The finished module:  `spell_core`'s import keeps only the names the code uses, as Python's linters ask
   * (`ruff`'s F401, an unused import).
   */
  module(code: string): string {
    const imported = code.replace(/^from spell_core import (.*)$/m, (_line, names: string) => {
      const body = code.slice(code.indexOf("\n"))
      // what the code says that only Python's writer does:  a stored property, an element
      const all = [...names.split(/,\s*/), ...PyBaseWriter.CORE_EXTRAS]
      // a function by its call, `position(...)`:  a variable may say the word
      const used = all.filter((name) => new RegExp(`\\b${name}\\b${CALLED.has(name) ? "\\(" : ""}`).test(body))
      return used.length ? `from spell_core import ${used.join(", ")}` : ""
    })
    // the standard library's modules it uses, first, in order, as PEP 8 orders imports:
    // rounding, `math.floor(...)`;  a pattern, `re.compile(...)`
    const standard = [/\bmath\.\w+\(/.test(imported) && "math", /\bre\.compile\(/.test(imported) && "re"].filter(
      Boolean
    )
    const withStandard = standard.length
      ? `${standard.map((name) => `import ${name}`).join("\n")}\n${imported}`
      : imported
    // no import left, or a heading that writes nothing:  no blank lines first
    const written = withStandard.replace(/^\n+/, "")
    // hints:  read when needed, so one may name a class written further down (`-> Pile` in `Card`)
    return /\) -> |\w: [A-Z]\w*\b/.test(written) ? `${PyBaseWriter.FUTURE}\n${written}` : written
  }

  /** The line a module with type hints starts with:  every hint is read only when asked for (PEP 563). */
  static FUTURE = "from __future__ import annotations\n"

  /**
   * A `.css` file's part, `spellCore.installStyles(undefined, \`...\`)`, as Python:
   * `core.install_styles(None, """...""")`, its lines as they were (javascript's has them as `¬`).
   * - Anything else that comes as javascript code:  a comment saying so, as Python can't run it.
   */
  codePart(code: string): string {
    const styles = /^spellCore\.installStyles\((undefined|"[^"]*"), `([\s\S]*)`\)$/.exec(code.trim())
    if (styles) {
      const file = styles[1] === "undefined" ? "None" : styles[1]
      const css = styles[2]!.replace(/¬/g, "\n").replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"')
      return `core.install_styles(${file}, """${css}""")`
    }
    return code.trim() ? pyText.comment(`javascript, which Python can't run:\n${code}`) : ""
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
    return pyText.call("", this.items(node.items), ["[", "]"])
  }

  ASTEnumeration(node: P.ASTEnumeration): string {
    return pyText.call("", this.items(node.enumeration), ["[", "]"])
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

  /**
   * `object.property`, by our name:  `card.is_face_up`.
   * - A class's constant, `Card.RANKS`;  bare in that class's own body, `RANKS`, as the class isn't made yet there.
   * - Off what may be nothing (`mayBeNothing()`), as spell reads off nothing as nothing:
   *   `getattr(deck.last_item, "name", None)`.
   * - `getattr(object, "name")` for one that isn't a name.
   */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const object = unwrapped(node.object)
    if (object instanceof P.ASTTypeExpression) {
      const name = this.staticName(node.property.value)
      return this.inClassBody && object.name === this.currentClass ? name : `${this.write(object)}.${name}`
    }
    const written = this.tight(node.object)
    const name = this.nameOf(node.property.value, "property")
    if (!node.property.isLegalIdentifier) return `getattr(${written}, ${this.quoted(node.property.value)}, None)`
    if (this.mayBeNothing(node.object) && !this.isSettingNow(node))
      return `getattr(${written}, ${this.quoted(name)}, None)`
    return `${written}.${name}`
  }

  /** What's being set, while it's written:  read off with `.`, as `getattr()` can't be set. */
  protected settingNow: P.ASTNode | undefined

  /** Is `node` what an assignment sets, being written now? */
  protected isSettingNow(node: P.ASTNode): boolean {
    return this.settingNow === node
  }

  /** `name`, by our name;  `name=default` for a parameter with a default value. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    const name = this.variableName(node)
    return node.default ? `${name}=${this.bare(node.default)}` : name
  }

  /** `node`'s name as we write a variable's:  `start_pile`;  `spellCore` is `core`. */
  variableName(node: P.ASTVariableExpression): string {
    if (node instanceof P.ASTSpellCoreExpression || node.name === "spellCore") return "core"
    // the thing a method runs on, where the tree still names it javascript's way
    if (node.name === "this") return "self"
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
   * A declaration's marker, `/*! SPELL: DECLARES ... *\/`, as every target writes it.
   * - `SP.SpellDeclarations` takes it out before the code is saved, so it never reaches the Python file.
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
    // `is not empty`, for a list or text:  itself, as Python tests it -- `if discards:`
    if (isCoreCall(inner) && (inner as P.ASTScopedMethodInvocation).methodName === "isEmpty") {
      const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
      const kind = value && this.kindOf(value)
      if (value && (this.isList(value) || kind === "array" || kind === "text")) return this.bare(value)
    }
    return `not ${this.operand(node.expression, "and", "rhs")}`
  }

  /**
   * `lhs op rhs`, `op` Python's for its `operator`'s meaning;  `is` / `is not` as a person writes it.
   * - `+` building text:  an f-string, `f"{self.rank}-of-{self.suit}"` -- see `textJoin()`.
   */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    const text = node.operator === "plus" && this.textJoin(node)
    if (text) return text
    const comparison = this.comparison(node)
    if (comparison) return comparison
    const operator = PyBaseWriter.OPERATORS[node.operator]
    return `${this.operand(node.lhs, node.operator, "lhs")} ${operator} ${this.operand(node.rhs, node.operator, "rhs")}`
  }

  /**
   * `node`, a chain of `+` with text written out in it, as an f-string:  `"Score: " + score` => `f"Score: {score}"`.
   * - Python won't add text and a number:  an f-string writes each value as text.
   * - `undefined` when it isn't:  no text in the chain,
   *   or text only after two values (`a + b + "!"` adds `a` and `b` first).
   */
  textJoin(node: P.ASTInfixExpression): string | undefined {
    const parts: P.ASTExpression[] = []
    let rest: P.ASTExpression = node
    while (rest instanceof P.ASTInfixExpression && rest.operator === "plus") {
      parts.unshift(rest.rhs)
      rest = unwrapped(rest.lhs)
    }
    parts.unshift(rest)
    const textAt = parts.findIndex((part) => textLiteral(part) !== undefined)
    if (textAt < 0 || textAt > 1) return undefined
    return this.fString(parts.map((part) => textLiteral(part) ?? { value: part }))
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
      inner instanceof P.ASTListExpression ||
      inner instanceof P.ASTEnumeration ||
      inner instanceof P.ASTTypeExpression ||
      inner instanceof P.ASTSelfLiteral ||
      inner instanceof P.ASTObjectLiteral ||
      inner instanceof P.ASTTemplateString ||
      inner instanceof P.ASTNewInstanceExpression ||
      inner instanceof P.ASTJSXElement ||
      inner instanceof P.ASTQuotedExpression ||
      inner instanceof P.ASTConstantExpression ||
      (inner instanceof P.ASTMethodInvocation && !/^not |\bis (not )?None$/.test(text))
    return isTight ? text : `(${text})`
  }

  ////////////////
  // ## Method invocations
  ////////////////

  ASTInvocationArgs(node: P.ASTInvocationArgs): string {
    return pyText.call("", this.items(node.args))
  }

  /** `items`, each written -- `None` for one left out -- for a call or a literal to put between its brackets. */
  items(items: Array<P.ASTNode | null | undefined> | undefined): string[] {
    return (items ?? []).map((item) => (item == null ? "None" : this.bare(item as P.ASTExpression)))
  }

  /** `name(args)`, by our name:  `play_fizzbuzz()`;  one argument a line when it's long -- see `pyText.call()`. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return pyText.call(this.nameOf(node.methodName), this.items(node.args.args))
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
      const name = node.methodName
      const takesPositions = name in P.ProgramWriter.POSITION_ARGS || P.ProgramWriter.POSITION_LOOPS.has(name)
      const args = takesPositions
        ? this.positionArgs(name, node.args.args ?? [])
        : (node.args.args ?? []).map((arg) => this.bare(arg))
      const call = pyText.call(`core.${this.nameOf(name)}`, args)
      return P.ProgramWriter.POSITION_RESULTS.has(name) ? this.positionOut(call) : call
    }
    return pyText.call(`${this.tight(node.thing)}.${this.nameOf(node.methodName)}`, this.items(node.args.args))
  }

  /**
   * `print the number, "fizz"`, as Python prints it.
   * - Python's own `print(number, "fizz")`, where every value prints as spell's does:  text, and whole numbers.
   * - Else `core.console.log(...)`, which prints yes / no as `true` / `false`, `3.0` as `3`.
   * - `print warning` / `print error`:  `core.console.warn(...)` / `error(...)`, to stderr.
   */
  consoleCall(node: P.ASTConsoleMethodInvocation): string {
    const args = node.args.args ?? []
    const written = args.map((arg) => this.bare(arg))
    const native = node.methodName === "log" && args.every((arg) => this.printsNatively(arg))
    if (native) return pyText.call("print", written)
    return pyText.call(`core.console.${this.nameOf(node.methodName)}`, written)
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
    const name = node.methodName
    switch (name) {
      case "heading":
        return ""
      case "isDefined":
        return first ? `${this.operand(first, "equals", "lhs")} is not None` : undefined
      case "isOfType":
        return first && second ? this.typeTest(first, second) : undefined
      case "getRange":
        return this.range(first, second)
      // Python's own rounding (Owen, on Q29):  `round` as javascript's `Math.round()`, a half up, not Python's
      // `round()`, which rounds a half to the even number (2.5 is 2)
      case "round":
        return first ? `math.floor(${this.operand(first, "plus", "lhs")} + 0.5)` : undefined
      case "roundUp":
        return first ? `math.ceil(${this.bare(first)})` : undefined
      case "roundDown":
        return first ? `math.floor(${this.bare(first)})` : undefined
      case "test":
        // a test called from a value, not a statement:  `core.test(name, fn)`
        return undefined
      case "trigger": {
        // its payload as keywords, as Python passes named values:  `core.trigger("card-click", card=self)`
        const payload = second && unwrapped(second)
        if (!first || !(payload instanceof P.ASTObjectLiteral)) return undefined
        const kwargs = payload.properties.flatMap((property) =>
          property instanceof P.ASTObjectLiteralProperty
            ? [
                `${this.nameOf(property.property.value, "variable")}=${
                  property.value ? this.bare(property.value) : this.nameOf(property.property.value, "variable")
                }`
              ]
            : []
        )
        return pyText.call("core.trigger", [this.bare(first), ...kwargs])
      }
    }
    if (!first) return undefined
    const kind = this.kindOf(first)
    const rest = args.slice(1)
    if (name === "itemCountOf" && (this.isList(first) || kind === "array" || kind === "text")) {
      return `len(${this.bare(first)})`
    }
    if (name === "isEmpty" && (this.isList(first) || kind === "array" || kind === "text")) {
      return `not ${this.tight(first)}`
    }
    // a plain list's own:  `state.append(pile.state)`
    if (name === "append" && rest.length === 1 && kind === "array") {
      return `${this.tight(first)}.append(${this.bare(rest[0]!)})`
    }
    if (name === "includes" && rest.length === 1 && (kind === "array" || kind === "text" || this.isList(first))) {
      return `${this.operand(rest[0]!, "equals", "lhs")} in ${this.tight(first)}`
    }
    if ((name === "upperCase" || name === "lowerCase") && kind === "text") {
      return `${this.tight(first)}.${name === "upperCase" ? "upper" : "lower"}()`
    }
    if (this.isList(first)) return this.listCall(name, first, rest)
    return undefined
  }

  /**
   * `spellCore.isOfType(thing, type)` as Python tests a type -- `undefined` to leave it to `core`:
   * - a class:  `isinstance(x, Tableau)`
   * - a number:  `isinstance(x, (int, float))`;  text:  `isinstance(x, str)`
   * - a whole number:  `(x).is_integer()`, an `int`'s and a `float`'s own
   */
  typeTest(thing: P.ASTExpression, type: P.ASTExpression): string | undefined {
    const name = textValue(type)
    if (name === undefined) return undefined
    if (name === "integer") return `${this.tight(thing)}.is_integer()`
    if (name === "number") return `isinstance(${this.bare(thing)}, (int, float))`
    if (name === "text") return `isinstance(${this.bare(thing)}, str)`
    if (this.project.isClass(name)) return `isinstance(${this.bare(thing)}, ${this.typeNameOf(name)})`
    return undefined
  }

  /**
   * One of spell's `List`s doing it itself, as `spell_core`'s List does it:
   * `deck.first_item`, `deck.filter(lambda card: ...)`, `deck[2]`.
   * - `undefined` for a helper it has no method for.
   * - Positions:
   *   - a number written out:  Python's own index, from 0 (`deck[2]` for spell's `card 3`, counting from 1)
   *   - else the list's own `get_item(n)`, counting as the project does
   *   - an index out of range is nothing (`None`), as spell reads it
   */
  listCall(name: string, list: P.ASTExpression, rest: P.ASTExpression[]): string | undefined {
    const self = this.tight(list)
    const [second, third] = rest
    const fn = (arg: P.ASTExpression) => this.functionArg(arg)
    switch (name) {
      case "getItemAt": {
        if (rest.length !== 1) return undefined
        const index = this.literalIndex(second)
        if (index === 0) return `${self}.first_item`
        if (index === -1) return `${self}.last_item`
        // Python's own index:  `deck[2]`, `deck[position(column)]` (which reads nothing for spell's item 0)
        return `${self}[${this.index(second!)}]`
      }
      case "filter":
      case "all":
      case "any":
      case "removeWhere":
        return second ? `${self}.${this.nameOf(name)}(${fn(second)})` : undefined
      case "map":
      case "forEach":
        return second ? `${self}.${this.nameOf(name)}(${this.positionedCallback(second, fn(second))})` : undefined
      case "randomItemOf":
        return `${self}.random_item()`
      case "randomItemsOf":
        return second ? `${self}.random_items(${this.bare(second)})` : undefined
      case "largestOf":
        return `${self}.largest`
      case "smallestOf":
        return `${self}.smallest`
      case "positionOf":
        return rest.length === 1 ? this.positionOut(`${self}.position_of(${this.bare(second!)})`) : undefined
      case "remove":
      case "includesAny":
      case "append":
      case "prepend":
      case "addBefore":
      case "addAfter":
        return `${self}.${this.nameOf(name)}(${rest.map((arg) => this.bare(arg)).join(", ")})`
      case "reverse":
      case "randomize":
        return `${self}.${name}()`
      case "rangeStartingAt": {
        if (rest.length !== 1) return undefined
        const inner = unwrapped(second!)
        if (isCoreCall(inner) && (inner as P.ASTScopedMethodInvocation).methodName === "positionOf") {
          const [ofList, item] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
          if (ofList && item && this.write(ofList) === this.write(list))
            return `${self}.starting_with(${this.bare(item)})`
        }
        return `${self}.starting_from(${this.index(second!)})`
      }
      case "rangeBetween": {
        // Python's own slice (Owen, on J41):  `items 2 to 4` is `deck[1:4]`;  to the last, `deck[1:]`
        if (rest.length !== 2) return undefined
        return `${self}[${this.index(second!)}:${this.endIndex(third!) ?? ""}]`
      }
      case "duplicateList": {
        if (!(second instanceof P.ASTTypeExpression)) return `${self}.clone()`
        const own = this.kindOf(list)
        const isAlready = !!own && this.project.isSubclassOf(own, second.name)
        return isAlready ? `${self}.clone()` : `${self}.clone_as(${this.typeNameOf(second.name)})`
      }
      case "mergeLists":
        return second instanceof P.ASTTypeExpression ? `${self}.merged(${this.typeNameOf(second.name)})` : undefined
    }
    return undefined
  }

  /** A function given to a list's method:  a `lambda`, or a lifted `def`'s name -- see `inlineFunction()`. */
  functionArg(arg: P.ASTExpression): string {
    const inner = unwrapped(arg)
    return inner instanceof P.ASTMethodDefinition ? this.inlineFunction(inner) : this.bare(arg)
  }

  /**
   * A spell test, `spellCore.test(name, function)`, as a block:
   *
   * ```python
   * with core.test("test card setup"):
   *     core.expect(...)
   * ```
   *
   * - `undefined` for anything else.
   */
  testBlock(node: P.ASTExpression | undefined): string | undefined {
    const call = node && unwrapped(node)
    if (!call || !isCoreCall(call) || (call as P.ASTScopedMethodInvocation).methodName !== "test") return undefined
    const [name, method] = (call as P.ASTScopedMethodInvocation).args.args ?? []
    const body = method && unwrapped(method)
    if (!name || !(body instanceof P.ASTMethodDefinition)) return undefined
    const block = this.inBlock(() => this.blockBody(body.body))
    return pyText.block(`with core.test(${this.bare(name)})`, block)
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
   * A loop as Python says it, `for item in items:`.
   * - For `spellCore.map()` / `forEach()` with a function of its own, written as a statement.
   * - `undefined` for anything else.
   * - With the position too, `for item, index in my-list`:
   *   `for index, item in enumerate(items):`, from 1 unless the project counts from 0.
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
    const previous = this.returnContinues
    this.returnContinues = true
    const body = this.inBlock(() => {
      this.noteParams(method)
      if (isRange) this.wholeNumbers.add(item.name)
      try {
        return this.blockBody(method.body)
      } finally {
        this.wholeNumbers.delete(item.name)
        this.returnContinues = previous
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
   * - A docstring right above a `def` or `class` goes inside it, as Python's docstring.
   *   A declaration's marker between them stays above.
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
      // a member written outside its class goes in its class's body (`withProjectMembers()`):  written there, not here
      if (!this.inClassBody && this.project.moved.has(statement)) continue
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
      const isDefinition = isDefinitionStatement(statement) || isHandlerCall(statement)
      const written = this.withLifted(() =>
        isDefinition ? this.definition(statement, doc) : this.statement(statement)
      )
      if (isDefinition) doc = undefined
      else pushDoc()
      const above = markers ?? lines.length
      markers = undefined
      if (!written) continue
      // PEP 8:  two blank lines around a top-level `def` or `class`, one around a method
      const gap = topLevel ? 2 : statement instanceof P.ASTClassMember ? 1 : 0
      if (isDefinition && gap) separateAt(lines, above, gap)
      lines.push(written)
      if (isDefinition && gap) lines.push(...Array<string>(gap).fill(""))
    }
    pushDoc()
    while (lines.at(-1) === "") lines.pop()
    return collapseBlankLines(lines.join(pyText.NEWLINE), topLevel)
  }

  /**
   * `write()`'s statement, the functions it lifted (`inlineFunction()`) written above it, a blank line between:
   * `def _each_1(card): ...` then `deck.for_each(_each_1)`.
   */
  withLifted(write: () => string): string {
    const outer = this.lifted
    this.lifted = []
    try {
      const written = write()
      return this.lifted.length ? [...this.lifted, written].join("\n\n") : written
    } finally {
      this.lifted = outer
    }
  }

  /** One statement:  a class member in its class's body, a loop as Python says it (`loop()`), else as written. */
  statement(statement: P.ASTNode): string {
    if (statement instanceof P.ASTClassMember) return String(this.writeAsMember(statement))
    const expression = statement instanceof P.ASTExpression ? statement : undefined
    return (
      this.loop(statement) ??
      this.testBlock(expression) ??
      this.handlerBlock(expression) ??
      String(this.write(statement))
    )
  }

  /** A `def` or `class` -- a method or a getter in a class body too -- with `doc` as its docstring, if any. */
  definition(statement: P.ASTNode, doc: P.ASTDocComment | undefined): string {
    if (statement instanceof P.ASTMethodDefinition) return this.methodDefinition(statement, doc)
    if (statement instanceof P.ASTClassDeclaration)
      return this.classDeclaration(this.withProjectMembers(statement), doc)
    if (statement instanceof P.ASTPropertyDefinition) {
      // outside a class body:  a class of another project, e.g. Klondike's `to play a card` for Cards' `Card`
      return this.inClassBody ? this.memberDefinition(statement, doc) : this.ASTPropertyDefinition(statement, doc)
    }
    if (statement instanceof P.ASTStaticMethod) return this.staticMethod(statement, doc)
    if (statement instanceof P.ASTExpression) {
      const handler = this.handlerBlock(statement)
      // its docstring inside the handler's `def`
      if (handler && doc)
        return handler.replace(/^((?:@.*\n)*def .*:\n)/, `$1${pyText.indented(pyText.docstring(doc.lines))}\n`)
      if (handler) return handler
    }
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

  /**
   * `return value`, or a bare `return`.
   * - A spell test's `return spellCore.test(...)`:  its `with core.test(...):` block -- see `testBlock()`.
   */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    // in a loop's body, written from a function per item:  ends that turn only
    if (!node.value) return this.returnContinues ? "continue" : "return"
    return this.testBlock(node.value) ?? `return ${this.bare(node.value)}`
  }

  /** `name = value`:  Python has no `let` or `const`. */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    this.noteLocal(node)
    const previous = this.settingNow
    this.settingNow = node.thing
    try {
      return `${this.write(node.thing)} = ${this.bare(node.value)}`
    } finally {
      this.settingNow = previous
    }
  }

  /** `card = event.card`, a line each:  Python takes a tuple apart, not an object -- by our names. */
  ASTDestructuredAssignment(node: P.ASTDestructuredAssignment): string {
    const thing = this.tight(node.thing)
    return node.variables
      .map((variable) => `${this.write(variable)} = ${thing}.${this.nameOf(variable.name, "property")}`)
      .join(pyText.NEWLINE)
  }

  /** `await x`:  what it waits for, plain -- `PY.PyWriter` says the `await`, where it works out what waits. */
  ASTAwaitExpression(node: P.ASTAwaitExpression): string {
    return this.loop(node.expression) ?? String(this.write(node.expression))
  }

  ////////////////
  // ## Objects & text
  ////////////////

  /** `{"key": value}`:  a dict. */
  ASTObjectLiteral(node: P.ASTObjectLiteral): string {
    const entries = node.properties.map((property) =>
      property instanceof P.ASTMethodDefinition
        ? `${this.quoted(this.nameOf(property.methodName ?? ""))}: ${this.inlineFunction(property)}`
        : String(this.write(property))
    )
    return pyText.call("", entries, ["{", "}"])
  }

  /** `"key": value`;  with no value, the variable of its name. */
  ASTObjectLiteralProperty(node: P.ASTObjectLiteralProperty): string {
    const key = this.quoted(this.nameOf(node.property.value, "property"))
    const value = node.value ? this.bare(node.value) : this.nameOf(node.property.value, "variable")
    return `${key}: ${value}`
  }

  /** Text with values in it:  an f-string, `f"{self.rank}-of-{self.suit}"`. */
  ASTTemplateString(node: P.ASTTemplateString): string {
    return this.fString(node.parts.map((part) => (typeof part === "string" ? part : { value: part })))
  }

  /** Spell source quoted in a test's line, e.g. `` `the rank of the card` ``:  plain text, or an f-string. */
  ASTBackTickExpression(node: P.ASTBackTickExpression): string {
    return this.fString([{ value: node.expression }])
  }

  ASTBacktickSubstitution(node: P.ASTBacktickSubstitution): string {
    return `{${this.bare(node.expression)}}`
  }

  ASTTripleBackTickExpression(node: P.ASTTripleBackTickExpression): string {
    return `"""${String(this.write(node.expression)).replace(/"""/g, '\\"\\"\\"')}"""`
  }

  /**
   * `parts`, text and values, as Python text:  `"plain"` when all text, else `f"{a}-of-{b}"`.
   * - Braces in the text are doubled, as an f-string reads them.
   */
  fString(parts: Array<string | { value: P.ASTExpression }>): string {
    if (parts.every((part) => typeof part === "string")) return this.quoted(parts.join(""))
    const body = parts
      .map((part) =>
        typeof part === "string"
          ? pyText.inQuotes(part).slice(1, -1).replace(/[{}]/g, "$&$&")
          : // Python 3.12 lets a value in braces use the f-string's own quotes (PEP 701)
            `{${this.bare(part.value)}}`
      )
      .join("")
    return `f"${body}"`
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * An element, as `spell_core`'s `h()` makes it:  `h("span", {"class": "suit"}, self.short_suit)`.
   * - It makes HTML text, as Python has no page (Q2).
   * - A value the page would track (`() => value` in javascript) is just the value:  the HTML is made once.
   * - A handler, `on_click=...`, is kept, for a page that can call back one day;  `h()` leaves it out of the HTML.
   */
  ASTJSXElement(node: P.ASTJSXElement): string {
    const attrs = (node.attrs ?? [])
      .map((attribute) => {
        const value = attribute.propValue
        // by the page's names, `class` first, as javascript draws them:  the core contract compares the HTML
        const key = attributeName(node.tagName, attribute.name, value instanceof P.ASTJSXLiveValue)
        return `${this.quoted(key)}: ${value ? this.bare(value) : "True"}`
      })
      .sort((a, b) => Number(b.startsWith('"class"')) - Number(a.startsWith('"class"')))
    const props = attrs.length ? [pyText.call("", attrs, ["{", "}"])] : []
    const children = node.childValues.map((child) => this.bare(child))
    return pyText.call("h", [this.quoted(node.tagName), ...props, ...children])
  }

  /** The value itself:  HTML text is made once -- see `ASTJSXElement()`. */
  ASTJSXLiveValue(node: P.ASTJSXLiveValue): string {
    return this.bare(node.expression)
  }

  ////////////////
  // ## Functions
  ////////////////

  /** A function of its own (see `methodDefinition()`), or one where a value goes (see `inlineFunction()`). */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    return node.inline ? this.inlineFunction(node) : this.methodDefinition(node, undefined)
  }

  /**
   * `def name(args) -> hint:` and its body, `doc` its docstring.
   * - Its parameters are its body's own, so what they are is known (`kindOf()`).
   * - Type hints where spell knows the kind (P13):  `def is_a_suit(self, suit: str) -> bool:` -- see `hintOf()`.
   */
  methodDefinition(
    node: P.ASTMethodDefinition,
    doc: P.ASTDocComment | undefined,
    { name, first, decorators = [] }: { name?: string; first?: "self" | "cls"; decorators?: string[] } = {}
  ): string {
    const defName = name ?? (node.methodName ? this.nameOf(node.methodName) : "_")
    const { inClassBody, returnContinues } = this
    this.inClassBody = false
    // a bare `return` in it is its own, even in a loop's body
    this.returnContinues = false
    try {
      const params = [...(first ? [first] : []), ...(node.args ?? []).map((arg) => this.param(arg))]
      const returns = this.returnHint(node)
      const body = this.inBlock(() => {
        this.noteParams(node)
        return this.blockBody(node.body)
      })
      const docstring = doc ? `${pyText.docstring(doc.lines)}\n` : ""
      const signature = `${pyText.call(`def ${defName}`, params)}${returns ? ` -> ${returns}` : ""}`
      const header = [...decorators.map((decorator) => `@${decorator}`), signature]
      return pyText.block(header.join(pyText.NEWLINE), `${docstring}${body}`)
    } finally {
      this.inClassBody = inClassBody
      this.returnContinues = returnContinues
    }
  }

  /** A parameter, by our name, with its hint where spell knows its kind:  `suit: str`, `pile: Pile | None = None`. */
  param(arg: P.ASTVariableExpression): string {
    const name = this.variableName(arg)
    const hint = this.hintOf(kindOfDatatype(arg.datatype ?? arg.variable?.datatype))
    const defaultValue = arg.default ? this.bare(arg.default) : undefined
    if (!hint) return defaultValue === undefined ? name : `${name}=${defaultValue}`
    return defaultValue === undefined ? `${name}: ${hint}` : `${name}: ${hint} = ${defaultValue}`
  }

  /**
   * What `method` returns, as a hint:
   * - `None` when it never returns a value
   * - else the kind all its returns share, `str`, with `| None` after it when one may give nothing
   * - `undefined` when they differ or can't be told
   * - Worked out in its class, its parameters known -- see `ProgramWriter.returnedKinds()`.
   */
  returnHint(method: P.ASTMethodDefinition): string | undefined {
    const returns: P.ASTReturnStatement[] = []
    forEachReturn(method.body, (node) => returns.push(node))
    if (!returns.some((it) => it.value)) return "None"
    const kinds = this.inPlace({ typeName: this.currentClass ?? "", methods: [method] }, () =>
      this.returnedKinds(method)
    )
    const values = kinds ? [...kinds] : []
    // one that may end without a `return`, or `return` alone:  nothing too
    const mayBeNothing =
      !kinds || kinds.has("nothing") || returns.some((it) => it.value && this.returnsNothingMaybe(it.value, method))
    const known = new Set(values.filter((kind) => kind !== "nothing"))
    if (known.size !== 1) return undefined
    const hint = this.hintOf([...known][0])
    return hint && mayBeNothing ? `${hint} | None` : hint
  }

  /**
   * May `value`, returned from `method`, be nothing?  As `mayBeNothing()` says, in `method`'s place.
   * - Also the list that owns a thing, `Pile.owner_of(card)`, as a card may be in no pile.
   */
  returnsNothingMaybe(value: P.ASTExpression, method: P.ASTMethodDefinition): boolean {
    const inner = unwrapped(value)
    if (inner instanceof P.ASTScopedMethodInvocation && inner.methodName === "ownerOf") return true
    return this.inPlace({ typeName: this.currentClass ?? "", methods: [method] }, () => this.mayBeNothing(value))
  }

  /**
   * Python's hint for a value of `kind` (`kindOf()`) -- `undefined` for one it can't tell:
   * - `str`, `bool`, a class
   * - `float`, which takes an `int` too, as PEP 484 has it
   * - `List` (spell's), `list` (Python's)
   */
  hintOf(kind: string | undefined): string | undefined {
    if (kind === "text") return "str"
    if (kind === "number") return "float"
    if (kind === "choice") return "bool"
    if (kind === "list") return "List"
    if (kind === "array") return "list"
    return kind && this.project.isClass(kind) ? this.typeNameOf(kind) : undefined
  }

  /**
   * A function written where a value goes, e.g. a list's `filter()`'s:
   * - `lambda card: card.rank == "queen"` when it returns one expression
   *   (or only calls or sets one thing it doesn't need to)
   * - else a name, its `def` written above the statement it's in -- see `lifted`
   */
  inlineFunction(node: P.ASTMethodDefinition): string {
    const statements = (node.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [only] = statements
    const params = (node.args ?? []).map((arg) => this.variableName(arg)).join(", ")
    const lambda = (body: string) => (params ? `lambda ${params}: ${body}` : `lambda: ${body}`)
    if (statements.length === 1) {
      const value =
        only instanceof P.ASTReturnStatement ? only.value : only instanceof P.ASTExpression ? only : undefined
      if (value) {
        return this.inBlock(() => {
          this.noteParams(node)
          return lambda(this.bare(value))
        })
      }
    }
    // more than one statement:  a `def` of its own, above the statement that uses it
    const name = `_${this.nameOf(node.methodName ?? "each")}_${this.lifted.length + 1}`
    this.lifted.push(this.methodDefinition(node, undefined, { name }))
    return name
  }

  /**
   * An event's handler, `spellCore.on("card-click", (event) => {...})`, as Python registers one:
   * a decorator on a function named for the event --
   *
   * ```python
   * @core.on("card-click")
   * def on_card_click(event):
   *     ...
   * ```
   *
   * - `undefined` for anything else, e.g. a handler that's a name already.
   */
  handlerBlock(node: P.ASTExpression | undefined): string | undefined {
    const call = node && unwrapped(node)
    if (!call || !isCoreCall(call)) return undefined
    const { methodName, args } = call as P.ASTScopedMethodInvocation
    if (methodName !== "on" && methodName !== "once") return undefined
    const [event, handler] = args.args ?? []
    const method = handler && unwrapped(handler)
    const eventName = event && textValue(event)
    if (!eventName || !(method instanceof P.ASTMethodDefinition)) return undefined
    const name = this.nameOf(`on_${eventName.replace(/[^\w]+/g, "_")}`)
    return this.methodDefinition(method, undefined, {
      name,
      decorators: [`core.${methodName}(${this.bare(event)})`]
    })
  }

  /** The functions of the statement being written that are too long for a `lambda`:  written above it. */
  protected lifted: string[] = []

  /** Are we writing a class's body, outside its methods?  There, the class's own constants are bare names. */
  protected inClassBody = false

  /** While writing a loop's body (`loop()`):  a bare `return` in it is `continue`. */
  protected returnContinues = false

  ////////////////
  // ## Classes & instances
  ////////////////

  /** A class, by itself:  see `classDeclaration()`. */
  ASTClassDeclaration(node: P.ASTClassDeclaration): string {
    return this.classDeclaration(this.withProjectMembers(node), undefined)
  }

  /**
   * `class Card(Thing):`, `doc` its docstring, then its members:
   * - its constants
   * - its properties, `rank = prop(one_of=RANKS)`
   * - its getters (`@property`) and methods, one blank line between methods (PEP 8)
   */
  classDeclaration(node: P.ASTClassDeclaration, doc: P.ASTDocComment | undefined): string {
    const { type, superType, members } = node
    const base = superType ? `(${this.typeNameOf(superType.name)})` : ""
    const docstring = doc ? pyText.docstring(doc.lines) : ""
    const previous = this.inClassBody
    this.inClassBody = true
    try {
      const body = this.inClass(type.name, () => this.statementLines(members ?? []))
      return pyText.block(`class ${this.typeNameOf(type.name)}${base}`, [docstring, body].filter(Boolean).join("\n\n"))
    } finally {
      this.inClassBody = previous
    }
  }

  /** `Card(rank="queen", suit="spades")`:  a new thing, its props as keywords, by our names;  `Card()` for none. */
  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): string {
    const props = (node.props?.properties ?? []).map((property) => {
      if (property instanceof P.ASTMethodDefinition) return this.inlineFunction(property)
      const key = this.staticName(property.property.value)
      const value = property.value ? this.bare(property.value) : this.nameOf(property.property.value, "variable")
      return `${key}=${value}`
    })
    return pyText.call(String(this.write(node.type)), props)
  }

  /** `[a, b]`. */
  ASTListExpression(node: P.ASTListExpression): string {
    return pyText.call("", this.items(node.items), ["[", "]"])
  }

  /** A type, by our name:  `Card`. */
  ASTTypeExpression(node: P.ASTTypeExpression): string {
    return this.typeNameOf(node.name)
  }

  /** A type's prototype:  in Python, the class itself. */
  ASTPrototypeExpression(node: P.ASTPrototypeExpression): string {
    return String(this.write(node.type))
  }

  ////////////////
  // ## Class members
  ////////////////

  /** In its class's body:  a getter, `@property` and its `def`, or a method's `def`, `self` first -- see below. */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    return this.memberDefinition(node, undefined)
  }

  /** `node`, a getter or method, in its class's body, `doc` its docstring:  `def is_a_suit(self, suit):`. */
  memberDefinition(node: P.ASTPropertyDefinition, doc: P.ASTDocComment | undefined): string {
    const name = this.nameOf(node.property.value)
    if (node.get) return this.methodDefinition(node.get, doc, { name, first: "self", decorators: ["property"] })
    return this.methodDefinition(node.method!, doc, { name, first: "self" })
  }

  /**
   * From outside its class:  its function, then set on the class -- `Card.pile = property(_card_pile)`.
   * - For a class of another project:  a class of this one has it in its body (`withProjectMembers()`).
   * - `doc`:  its docstring, if any.
   */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition, doc?: P.ASTDocComment): string {
    const type = this.typeNameOf(node.typeName)
    const name = this.nameOf(node.property.value)
    const helper = `_${this.nameOf(node.typeName, "variable")}_${name}`
    return this.inClass(node.typeName, () => {
      const method = node.get ?? node.method!
      const def = this.methodDefinition(method, doc, { name: helper, first: "self" })
      const value = node.get ? `property(${helper})` : helper
      return `${def}\n\n\n${type}.${name} = ${value}`
    })
  }

  /**
   * In its class's body:  `rank = prop(one_of=RANKS)`, a stored property, made by `spell_core`'s `prop()` (a descriptor).
   * - its check's keys as keywords:  `oneOf` => `one_of`
   * - its first value:  `default=` (a value) or `init=` (made new for each thing)
   */
  ASTReactivePropertyAsMember(node: P.ASTReactiveProperty): string {
    return `${this.nameOf(node.property.value, "property")} = prop(${this.propArguments(node)})`
  }

  /** From outside its class:  `Deck.declare_prop("is_set_up", type="choice")`. */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    const name = this.quoted(this.nameOf(node.property.value, "property"))
    const args = this.propArguments(node)
    return `${this.write(node.type)}.declare_prop(${args ? `${name}, ${args}` : name})`
  }

  /** A stored property's `prop()` keywords:  its check's, then `default=` or `init=` -- see above. */
  propArguments(node: P.ASTReactiveProperty): string {
    const args = (node.check?.properties ?? []).flatMap((property) => {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) return []
      const key = this.nameOf(property.property.value, "property")
      const value = unwrapped(property.value)
      // a type's name:  as we name types, e.g. `type="Pile"`
      const isType = key === "type" && value instanceof P.ASTStringLiteral && this.project.isClass(value.value)
      return [`${key}=${isType ? this.quoted(this.typeNameOf((value as P.ASTStringLiteral).value)) : this.bare(value)}`]
    })
    const initial = node.initializer && unwrapped(node.initializer)
    if (initial) {
      const isValue = initial instanceof P.ASTLiteral || initial instanceof P.ASTConstantExpression
      args.push(isValue ? `default=${this.bare(initial)}` : `init=lambda: ${this.bare(initial)}`)
    }
    return args.join(", ")
  }

  /**
   * In its class's body:  `RANKS = ("ace", 2, ...)`, a constant in capitals;  the item type, `item_type = Card`.
   * - A list of values written out is a tuple, as it never changes.
   *   A list there would be one list every thing shares (ruff's RUF012).
   */
  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    const value = unwrapped(node.value)
    const items =
      value instanceof P.ASTEnumeration
        ? value.enumeration
        : value instanceof P.ASTArrayLiteral
          ? value.items
          : undefined
    const written = items
      ? pyText.call("", [...this.items(items), ...(items.length === 1 ? [""] : [])], ["(", ")"])
      : this.bare(node.value)
    return `${this.staticName(node.name)} = ${written.replace(/, \)$/, ",)")}`
  }

  ASTStaticDefinition(node: P.ASTStaticDefinition): string {
    return `${this.write(node.type)}.${this.staticName(node.name)} = ${this.bare(node.value)}`
  }

  /**
   * A class-level name, by our name:
   * - a list of values in capitals, a constant:  `Ranks` => `RANKS`
   * - spell's `instanceType` is `spell_core`'s `item_type`
   * - the rest as any member:  `exclusive`
   */
  staticName(name: string): string {
    if (name === "instanceType") return "item_type"
    return /^[A-Z]/.test(name) ? this.nameOf(name, "constant") : this.nameOf(name, "property")
  }

  /** In its class's body:  `@staticmethod` and its `def`. */
  ASTStaticMethodAsMember(node: P.ASTStaticMethod): string {
    return this.staticMethod(node, undefined)
  }

  /** `@staticmethod`, `doc` its docstring;  a getter too:  Python has no class-level property. */
  staticMethod(node: P.ASTStaticMethod, doc: P.ASTDocComment | undefined): string {
    return this.methodDefinition(node.method, doc, { name: this.nameOf(node.name), decorators: ["staticmethod"] })
  }

  /** From outside its class:  `Card.name = staticmethod(...)`, its function written first. */
  ASTStaticMethod(node: P.ASTStaticMethod): string {
    const type = this.write(node.type)
    const name = this.nameOf(node.name)
    const helper = `_${this.nameOf(node.typeName, "variable")}_${name}`
    const def = this.methodDefinition(node.method, undefined, { name: helper })
    return `${def}\n\n\n${type}.${name} = staticmethod(${helper})`
  }

  /** Its `member`, set on its class from outside, wherever that class is written. */
  ASTPatchedMember(node: P.ASTPatchedMember): string {
    return String(this.write(node.member))
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

/** SIDE EFFECT:  calls `callback` with each `return` in `body` -- not one in a function inside it, which is its own. */
function forEachReturn(body: unknown, callback: (node: P.ASTReturnStatement) => void): void {
  if (Array.isArray(body)) return body.forEach((item) => forEachReturn(item, callback))
  if (!(body instanceof P.ASTNode) || body instanceof P.ASTMethodDefinition) return
  if (body instanceof P.ASTReturnStatement) callback(body)
  for (const [key, value] of Object.entries(body)) if (key !== "match") forEachReturn(value, callback)
}

/** The kind (`kindOf()`'s word) of a value spell declares as `datatype`:  `text`, `number`, a class's name. */
function kindOfDatatype(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
  return kindFromDatatype(datatype)
}

/** `group`'s statements, and those of the groups in it, in order. */
function flattened(group: P.ASTStatementGroup): P.ASTNode[] {
  return (group.statements ?? []).flatMap((statement) =>
    statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)
      ? flattened(statement)
      : [statement]
  )
}

/** Is `node` an event's handler, `spellCore.on("card-click", (event) => {...})`?  Written as a `def` -- see `handlerBlock()`. */
function isHandlerCall(node: P.ASTNode): boolean {
  const call = node instanceof P.ASTExpression ? unwrapped(node) : undefined
  if (!call || !isCoreCall(call)) return false
  const { methodName, args } = call as P.ASTScopedMethodInvocation
  const handler = args.args?.[1]
  return (
    (methodName === "on" || methodName === "once") && !!handler && unwrapped(handler) instanceof P.ASTMethodDefinition
  )
}

/** Is `node` a `def` or a `class` of its own -- a method or a getter too -- which a docstring above goes inside? */
function isDefinitionStatement(node: P.ASTNode): boolean {
  return (
    (node instanceof P.ASTMethodDefinition && !node.inline) ||
    node instanceof P.ASTClassDeclaration ||
    node instanceof P.ASTPropertyDefinition ||
    node instanceof P.ASTStaticMethod
  )
}

/** The text of `node` if it's quoted text written out, `"-of-"` -- `undefined` for anything else. */
function textLiteral(node: P.ASTExpression): string | undefined {
  const inner = unwrapped(node)
  return inner instanceof P.ASTStringLiteral && inner.quote ? inner.value : undefined
}

/** The text `node` says, written out (`"integer"`) -- `undefined` if it isn't text written out. */
function textValue(node: P.ASTExpression | undefined): string | undefined {
  const inner = node && unwrapped(node)
  if (inner instanceof P.ASTStringLiteral) return inner.value
  if (inner instanceof P.ASTConstantExpression) return String(inner.value)
  if (!(inner instanceof P.ASTQuotedExpression)) return undefined
  const quoted = inner.expression
  return quoted instanceof P.ASTLiteral ? String(quoted.value) : undefined
}

/**
 * SIDE EFFECT:  `count` blank lines at `index` of `lines`, as PEP 8 wants before a `def` or `class`.
 * - They go above the declaration markers that go with it.
 * - None at the very top.
 */
function separateAt(lines: string[], index: number, count: number): void {
  let start = index
  while (start > 0 && lines[start - 1] === "") start--
  const gap = start === 0 ? [] : Array<string>(count).fill("")
  lines.splice(start, index - start, ...gap)
}

/** `text` with no more than two blank lines in a row at the top level, one inside a block. */
function collapseBlankLines(text: string, topLevel: boolean): string {
  return text.replace(topLevel ? /\n{4,}/g : /\n{3,}/g, topLevel ? "\n\n\n" : "\n\n")
}

/** `spell_core`'s functions imported only when the code CALLS them:  a variable may be named `position` too. */
const CALLED = new Set(["position", "spell_position", "end_position", "with_spell_positions"])
