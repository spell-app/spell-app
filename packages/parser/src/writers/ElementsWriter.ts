import { P } from "$/parser"
// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"
import { Naming } from "./Naming"
import { unwrapped } from "./jsShapes"

/****************
 * ### `ElementsWriter`
 * Writes a Python program's DRAWING half as javascript, for a page that mirrors it:  `<Project>.elements.js`
 * (epic `python-target` P19, Q20 A).
 * - Python keeps the program:  its state, its logic, its event handlers.
 *   The page draws it with these classes, as compiled javascript draws, from the state Python sends
 *   (`StateMirror`, in `@spell/core`).
 * - As `P.JSWriter`, with:
 *   - its CLASSES as they are:  their properties, getters, `to draw`, styles
 *   - the program's top-level steps LEFT OUT (dealing, tests, `start the game`):  Python ran them
 *   - each thing it keeps at its top level a variable, `export let stock`, bound from Python's state by `adopt()`,
 *     under Python's name for it:  `stock = state["stock"]`, `allPiles = state["all_piles"]`
 *   - each top-level function a stand-in that asks Python to run it:
 *
 *     ```js
 *     export function playFromTheStockPile(...args) {
 *       return sendCall("play_from_the_stock_pile", args)
 *     }
 *     ```
 *
 *   - in a drawing's event handler (`onClick`), a call of a thing's method asks Python too:
 *     `this.turnOver()` => `sendCall("turn_over", [], this)`
 *   - an event, ANYWHERE, goes to Python's handlers:  `trigger("card-click", { card: this })` => `sendTrigger(...)`
 * - Python's names in what it sends, `Naming.PYTHON`:  the same for the `py` and `py/asyncio` targets.
 * - A thing in a message is sent by its id:  see `sendCall()` in `@spell/core`'s `page.ts`.
 ****************/
export class ElementsWriter extends JSWriter {
  /** The writer with no project. */
  static readonly instance = new ElementsWriter()

  /** Python's names, for what the page sends:  `play_from_the_stock_pile`. */
  readonly python = new Naming(Naming.PYTHON, Naming.PYTHON_CLASHES)

  /** The things the program keeps at its top level, our name and Python's:  bound by `adopt()`. */
  protected bound: Array<{ name: string; python: string }> = []

  /** Writing the module's own top level, where only what draws is kept -- see `ASTStatementGroup()`. */
  protected atTopLevel = true

  /** Writing a drawing's event handler, e.g. `onClick`'s:  a call of a thing's method asks Python. */
  protected inHandler = false

  /** As `JSWriter`'s, starting with nothing bound. */
  forProject(files: P.ASTNode[][], scope?: P.Scope, options?: P.WriterOptions): this {
    const writer = super.forProject(files, scope, options)
    writer.bound = []
    writer.atTopLevel = true
    return writer
  }

  ////////////////
  // ## The top level
  ////////////////

  /**
   * A file's statements, at the top level:  only what draws -- see the class docs;  any other group as `JSWriter`'s.
   */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    if (!this.atTopLevel) return super.ASTStatementGroup(node)
    this.atTopLevel = false
    try {
      const kept = this.drawingHalf(node.statements ?? [])
      return super.ASTStatementGroup(new P.ASTStatementGroup(node.match, { statements: kept }))
    } finally {
      this.atTopLevel = true
    }
  }

  /** Of `statements`, the top level of a file, what the page needs to draw:  see the class docs. */
  protected drawingHalf(statements: P.ASTNode[]): P.ASTNode[] {
    const kept: P.ASTNode[] = []
    for (const statement of statements) {
      if (statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)) {
        kept.push(...this.drawingHalf(statement.statements ?? []))
      } else if (keptAsTheyAre().some((kind) => statement instanceof kind)) {
        kept.push(statement)
      } else if (statement instanceof P.ASTMethodDefinition && statement.methodName) {
        this.standIns.add(statement)
        kept.push(statement)
      } else if (statement instanceof P.ASTAssignmentStatement && statement.isNewVariable) {
        if (this.isMade(statement.value)) this.boundThings.add(statement)
        kept.push(statement)
      }
    }
    return kept
  }

  /** Is `value` made by the program, e.g. `new StockPile(...)`, `deck.merged()`:  not a value written out? */
  protected isMade(value: P.ASTExpression): boolean {
    const inner = unwrapped(value)
    return !(inner instanceof P.ASTLiteral || inner instanceof P.ASTArrayLiteral || inner instanceof P.ASTObjectLiteral)
  }

  /** The top-level functions written as stand-ins -- see `ASTMethodDefinition()`. */
  protected standIns = new WeakSet<P.ASTMethodDefinition>()

  /** The top-level things bound from Python's state -- see `ASTAssignmentStatement()`. */
  protected boundThings = new WeakSet<P.ASTAssignmentStatement>()

  /** A thing the program keeps, `export let stock`, bound from Python's state by `adopt()`;  else as `JSWriter`'s. */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    const { thing } = node
    if (!this.boundThings.has(node) || !(thing instanceof P.ASTVariableExpression)) {
      return super.ASTAssignmentStatement(node)
    }
    const name = this.nameOf(thing.name, "variable")
    this.bound.push({ name, python: this.python.nameOf(thing.name, "variable") })
    return `export let ${name}`
  }

  /** A top-level function, as a stand-in that asks Python to run it (see the class docs);  else as `JSWriter`'s. */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    if (!this.standIns.has(node)) return super.ASTMethodDefinition(node)
    const name = this.nameOf(node.methodName!)
    this.coreImports.add("sendCall")
    const body = `return sendCall(${this.quoted(this.python.nameOf(node.methodName!, "method"))}, args)`
    return `export function ${name}(...args) {\n  ${body}\n}`
  }

  /**
   * As `JSWriter`'s, then `adopt(state)`:  binds each thing the program keeps from Python's state.
   *
   * ```js
   * export function adopt(state) {
   *   stock = state["stock"]
   *   allPiles = state["all_piles"]
   * }
   * ```
   */
  module(code: string): string {
    const lines = this.bound.map(({ name, python }) => `  ${name} = state[${this.quoted(python)}]`)
    const adopt = `\n\n/** Binds each thing the program keeps, from Python's state. */\nexport function adopt(state) {\n${lines.join("\n")}\n}\n`
    return super.module(code.trimEnd() + adopt)
  }

  ////////////////
  // ## What the page sends
  ////////////////

  /** An event goes to Python:  `sendTrigger("card-click", { card: this })`;  `on()` as `JSWriter`'s. */
  eventCall(name: string, args: P.ASTExpression[]): string {
    if (name !== "trigger") return super.eventCall(name, args)
    this.coreImports.add("sendTrigger")
    return `sendTrigger(${args.map((arg) => this.bare(arg)).join(", ")})`
  }

  /** In a handler:  a thing's method asks Python, `sendCall("turn_over", [], this)`;  else as `JSWriter`'s. */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (!this.inHandler || node.thing instanceof P.ASTSpellCoreExpression) return super.ASTScopedMethodInvocation(node)
    this.coreImports.add("sendCall")
    const args = (node.args.args ?? []).map((arg) => this.bare(arg)).join(", ")
    const name = this.quoted(this.python.nameOf(node.methodName, "method"))
    return `sendCall(${name}, [${args}], ${this.bare(node.thing)})`
  }

  /** As `JSWriter`'s, noting its event handlers' values (`onClick`'s), written as handlers -- see `write()`. */
  protected jsxProps(node: P.ASTJSXElement): string {
    for (const attribute of node.attrs ?? []) {
      if (/^on/i.test(attribute.name)) this.handlers.add(attribute.propValue)
    }
    return super.jsxProps(node)
  }

  /** The event handlers' values in the drawings, noted by `jsxProps()`. */
  protected handlers = new WeakSet<object>()

  /** As `P.Writer`'s, with `inHandler` on while it writes an event handler's value. */
  write(node: P.ASTNode): ReturnType<JSWriter["write"]> {
    if (!this.handlers.has(node)) return super.write(node)
    const previous = this.inHandler
    this.inHandler = true
    try {
      return super.write(node)
    } finally {
      this.inHandler = previous
    }
  }
}

/** Kept at the top level, as they are:  the classes, what's added to one, comments.  Made when first asked for. */
function keptAsTheyAre(): Array<abstract new (...args: never[]) => P.ASTNode> {
  return (KEPT ??= [
    P.ASTClassDeclaration,
    P.ASTPropertyDefinition,
    P.ASTReactiveProperty,
    P.ASTStaticDefinition,
    P.ASTStaticMethod,
    P.ASTPatchedMember,
    P.ASTDocComment,
    P.ASTPreservedComment,
    P.ASTLineComment,
    P.ASTBlockComment,
    P.ASTBannerComment,
    P.ASTBlankLine
  ])
}

/** See `keptAsTheyAre()`:  made then, as the AST classes may not be loaded when this module is. */
let KEPT: Array<abstract new (...args: never[]) => P.ASTNode> | undefined
