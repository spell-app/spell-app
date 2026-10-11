import { P } from "$/parser"
// Import directly to avoid circular import
import { PyWriter } from "./PyWriter"
import * as pyText from "./pyText"

const { isCoreCall, unwrapped } = P.jsShapes

/****************
 * ### `PyAsyncWriter`
 * Writes a spell tree as Python on `asyncio`:  the `py/asyncio` target's writer (epic `python-target` P11, Q3 B, Q18).
 * - As `PyWriter`, but a function that waits is `async def`, and everything that calls it awaits it:
 *
 *   ```python
 *   async def turn_face_up(self):
 *       self.direction = "up"
 *       await core.sleep(50, "msec")
 *
 *   async def turn_over(self):
 *       if self.direction == "up":
 *           await self.turn_face_down()
 *   ```
 *
 * - Which functions wait is worked out for the whole project first (`forProject()`):
 *   - any that pauses, or calls one that does
 *   - by NAME:  every method of a name waits if one does, so `await` is never put before a plain value
 *   - Why:  javascript calls them without waiting (`this.turnFaceDown()`),
 *     where Python's call, not awaited, would do nothing at all.
 * - A function given as a value that waits is a lifted `async def`, never a `lambda`.
 * - At the top of the module, where Python can't `await`:  `asyncio.run(...)`
 *   - a call alone:  `asyncio.run(main())`
 *   - anything else that waits:  in an `async def` of its own, run so
 ****************/
export class PyAsyncWriter extends PyWriter {
  /** The writer with no project. */
  static readonly instance = new PyAsyncWriter()

  /** The spell names of the functions and methods that wait -- see `forProject()`. */
  protected waitingNames = new Set<string>()

  /** The functions that wait, as the tree holds them:  each is written `async def`. */
  protected waitingMethods = new WeakSet<P.ASTMethodDefinition>()

  /** Writing the module's top level, where Python can't `await` -- see `statement()`. */
  protected atTopLevel = false

  /** The steps lifted out of the top level, for a name each -- see `topLevelStep()`. */
  protected steps = 0

  /** As `PyWriter`'s, then which functions wait -- see the class docs. */
  forProject(files: P.ASTNode[][], scope?: P.Scope, options?: P.WriterOptions): this {
    const writer = super.forProject(files, scope, options)
    writer.importedWaiting(scope)
    writer.findWaiting(files)
    return writer
  }

  /**
   * SIDE EFFECT:  notes which methods the project IMPORTS wait, from their declarations (`P.ScopeMethod.waits`):
   * Klondike's `card.turn_face_up()`, from Cards, is awaited too.
   */
  protected importedWaiting(scope: P.Scope | undefined): void {
    const imports = scope?.parentScope
    if (!(imports instanceof P.ImportScope)) return
    const methods = [...imports.methods.get(), ...imports.types.get().flatMap((type) => type.methods.get())]
    for (const method of methods) if (method.waits) this.waitingNames.add(method.name)
  }

  /**
   * SIDE EFFECT:  notes which functions in `files` wait:
   * - any that pauses (`await` in the tree)
   * - then, until nothing changes, any that calls one by name
   */
  protected findWaiting(files: P.ASTNode[][]): void {
    const named = new Map<P.ASTMethodDefinition, string | undefined>()
    P.forEachNode(files, (node) => {
      if (node instanceof P.ASTPropertyDefinition && node.method) named.set(node.method, node.property.value)
      else if (node instanceof P.ASTStaticMethod) named.set(node.method, node.name)
      else if (node instanceof P.ASTMethodDefinition && !named.has(node)) named.set(node, node.methodName)
    })
    let changed = true
    while (changed) {
      changed = false
      for (const [method, name] of named) {
        if (this.waitingMethods.has(method)) continue
        if (!method.isAsync && !this.callsWaiting(method)) continue
        this.waitingMethods.add(method)
        if (name) this.waitingNames.add(name)
        changed = true
      }
      // every method of a name waits if one does:  `await` is never put before a plain value
      for (const [method, name] of named) {
        if (name && this.waitingNames.has(name) && !this.waitingMethods.has(method)) {
          this.waitingMethods.add(method)
          changed = true
        }
      }
    }
  }

  /** Does `method`'s own body call a function that waits?  Not counting a function inside it, which is its own. */
  protected callsWaiting(method: P.ASTMethodDefinition): boolean {
    let found = false
    const visit = (node: unknown) => {
      if (found || node === undefined) return
      if (Array.isArray(node)) return node.forEach(visit)
      if (!(node instanceof P.ASTNode)) return
      // a function inside it is its own, e.g. a click's handler:  it waits when it's called, not now
      if (node instanceof P.ASTMethodDefinition && node !== method) return
      if (this.isWaitingCall(node)) {
        found = true
        return
      }
      // ...but a loop runs its function right there, `for card in cards:`:  if that waits, so does this
      if (isCoreCall(node) && LOOPS.has((node as P.ASTScopedMethodInvocation).methodName)) {
        const arg = (node as P.ASTScopedMethodInvocation).args.args?.[1]
        const callback = arg && unwrapped(arg)
        if (callback instanceof P.ASTMethodDefinition && this.waitingMethods.has(callback)) {
          found = true
          return
        }
      }
      for (const [key, value] of Object.entries(node)) if (key !== "match") visit(value)
    }
    visit(method.body)
    return found
  }

  /** Is `node` a call of a function that waits, by name, or spell's own pause? */
  isWaitingCall(node: P.ASTNode): boolean {
    if (!(node instanceof P.ASTMethodInvocation)) return false
    if (isCoreCall(node)) return node.methodName === "pauseFor"
    return this.waitingNames.has(node.methodName)
  }

  ////////////////
  // ## Functions that wait
  ////////////////

  /** As `PyWriter`'s, `async def` when it waits. */
  methodDefinition(
    node: P.ASTMethodDefinition,
    doc: P.ASTDocComment | undefined,
    how: { name?: string; first?: "self" | "cls"; decorators?: string[] } = {}
  ): string {
    const written = super.methodDefinition(node, doc, how)
    return this.waitingMethods.has(node) ? written.replace(/^((?:@.*\n)*)def /, "$1async def ") : written
  }

  /** As `PyWriter`'s, but one that waits is always a lifted `async def`:  a `lambda` can't `await`. */
  inlineFunction(node: P.ASTMethodDefinition): string {
    if (!this.waitingMethods.has(node)) return super.inlineFunction(node)
    const name = `_${this.nameOf(node.methodName ?? "each")}_${this.lifted.length + 1}`
    this.lifted.push(this.methodDefinition(node, undefined, { name }))
    return name
  }

  /** `await name(args)` for a function that waits. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    const written = super.ASTMethodInvocation(node)
    return this.waitingNames.has(node.methodName) ? `await ${written}` : written
  }

  /**
   * `await thing.method(args)` for a method that waits;  spell's pause, `await core.sleep(50, "msec")`:
   * `spell_core`'s, so a test run can skip it (`--no-pauses`).
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (isCoreCall(node) && node.methodName === "pauseFor") {
      return `await ${pyText.call("core.sleep", this.items(node.args.args))}`
    }
    const written = super.ASTScopedMethodInvocation(node)
    const waits = !isCoreCall(node) && this.waitingNames.has(node.methodName)
    return waits ? `await ${written}` : written
  }

  /** What it waits for, which says its own `await` -- see the calls above. */
  ASTAwaitExpression(node: P.ASTAwaitExpression): string {
    return this.loop(node.expression) ?? String(this.write(node.expression))
  }

  /** `node`, in parentheses unless it binds tightly:  `(await x.play()).name`. */
  tight(node: P.ASTExpression): string {
    const written = super.tight(node)
    return /^await /.test(written) ? `(${written})` : written
  }

  ////////////////
  // ## The top level
  ////////////////

  /** As `PyWriter`'s, noting when it's the module's own top level -- see `statement()`. */
  statementLines(statements: P.ASTNode[], topLevel = false): string {
    const previous = this.atTopLevel
    this.atTopLevel = topLevel
    try {
      return super.statementLines(statements, topLevel)
    } finally {
      this.atTopLevel = previous
    }
  }

  /**
   * As `PyWriter`'s;  at the top level, a statement that waits runs through `asyncio.run()`,
   * as Python can't `await` there:
   * - a call alone:  `asyncio.run(reset_the_game())`
   * - set from one:  `card = asyncio.run(deal())`
   * - anything else:  an `async def` of its own, then run -- see `topLevelStep()`
   */
  statement(statement: P.ASTNode): string {
    const atTop = this.atTopLevel
    this.atTopLevel = false
    let written: string
    try {
      written = super.statement(statement)
    } finally {
      this.atTopLevel = atTop
    }
    if (!atTop || !/\bawait /.test(written)) return written
    const call = /^await ([^\n]*)$/.exec(written)
    if (call && !/\bawait /.test(call[1]!)) return `asyncio.run(${call[1]})`
    const set = /^([\w.]+) = await ([^\n]*)$/.exec(written)
    if (set && !/\bawait /.test(set[2]!)) return `${set[1]} = asyncio.run(${set[2]})`
    return this.topLevelStep(written)
  }

  /**
   * `written`, a top-level statement that waits, as an `async def` of its own and its run:
   *
   * ```python
   * async def _step_1():
   *     for card in deck:
   *         await card.move_to_pile(stock)
   *
   *
   * asyncio.run(_step_1())
   * ```
   */
  topLevelStep(written: string): string {
    const name = `_step_${++this.steps}`
    return `${pyText.block(`async def ${name}()`, written)}\n\n\nasyncio.run(${name}())`
  }

  /** As `PyWriter`'s, importing `asyncio` first when the code runs any (the standard library's first, PEP 8). */
  module(code: string): string {
    const written = super.module(code)
    if (!/\basyncio\.run\(/.test(written)) return written
    // after `from __future__ import ...`, which must come first
    const future = written.startsWith(PyWriter.FUTURE) ? `${PyWriter.FUTURE}\n` : ""
    const rest = written.slice(future ? PyWriter.FUTURE.length : 0).replace(/^\n+/, "")
    return `${future}import asyncio\n${/^import re\n/.test(rest) ? "" : "\n"}${rest}`
  }
}

/** `spellCore`'s loops, which call their function for each item right there -- see `PyAsyncWriter.callsWaiting()`. */
const LOOPS = new Set(["map", "forEach", "forEachSequential"])
