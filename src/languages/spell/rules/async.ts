/**
 * Rules for async control flow and conceptual "processes" -- `await`, `pause for`, and
 * start/stop/check process.
 */

import { proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { SpellExpression } from "./expressions"

/**
 * Narrow `node` from `P.ASTNode | undefined` to concrete subtype `T`.
 * - `Match.AST` (`src/parser/Match.ts`) is always typed as `ASTNode` because `Rule.getAST()`'s return type
 *   isn't parameterized per the specific rule a rulex group refers to -- only the rule's own semantics
 *   (which we know, writing the rule) tell us which concrete node type comes back.
 * - Does not actually check `node`'s type or that it's defined -- purely a compile-time cast.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

/**
 * `await`/`wait for` an expression, with the expression itself optional (bare `await`).
 * - `:?` in `syntax` is an optional literal colon in the source text (e.g. `await:`), matched but
 *   discarded -- NOT the `name:rule` named-group colon.  The `(await|wait for)` keyword itself
 *   stays required.
 * - Bare `await` (no expression) compiles to `await undefined`.
 * - `await` is a reserved word, so the class is named `_await` -- see `ruleName`.
 * - TODO: add test to make sure parents are made async properly, especially for `await` inside an
 *   if block, etc.
 */
export class _await extends SpellStatement<"expression?"> {
  static ruleName = "await"
  @proto static alias = ["expression", "statement"]
  @proto static syntax = "(await|wait for) :? {expression}?"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: (expression && ast<P.ASTExpression>(expression.AST)) || new P.ASTUndefinedLiteral(match)
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        ["await", "await undefined"],
        ["wait for 1", "await 1"],
        ["set the result to wait for 1", "result = await 1"]
      ]
    },
    {
      compileAs: "block",
      tests: [
        {
          input: ["to do something", "\twait for 1"],
          output: ["/* SPELL: added rule: `do something` */", "async function do_something() {", "\tawait 1", "}"]
        },
        {
          input: ["to do something", "\tif (1) wait for 1"],
          output: [
            "/* SPELL: added rule: `do something` */",
            "async function do_something() {",
            "\tif (1) { await 1 }",
            "}"
          ]
        }
      ]
    }
  ]
}

/**
 * Delay for a certain amount of time, e.g. `pause for 2 seconds`.
 * - Compiles to `await spellCore.pauseFor(number, 'units')`.
 * - TODO: "a second", "a little bit", "a while", "a noticeable amount".
 */
export class pause extends SpellStatement<"number|units"> {
  @proto static alias = "statement"
  @proto static syntax =
    "pause for {number:expression} (units:second|seconds|sec|millisecond|milliseconds|msec|tick|ticks)"

  getAST(match: P.MatchFor<this>) {
    const { number, units } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "pauseFor",
        args: [ast<P.ASTExpression>(number.AST), new P.ASTQuotedExpression(units, units.value)]
      })
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`pause for 2 seconds"`, `await spellCore.pauseFor(2, 'seconds')`],
        [`pause for 500 msec"`, `await spellCore.pauseFor(500, 'msec')`],
        [`pause for 10 ticks"`, `await spellCore.pauseFor(10, 'ticks')`],
        [`pause for (10 + 10) sec`, `await spellCore.pauseFor(10 + 10, 'sec')`]
      ]
    }
  ]
}

/**
 * Start a conceptual animation or process, e.g. `start animation dealing`.
 * - `exclusive` process guards against re-entry: compiles to an early `return` if the process is
 *   already running, then starts it flagged `'EXCLUSIVE'`.
 * - `animation`/`process` are synonyms in the syntax -- purely for readability at the call site.
 */
export class start_process extends SpellStatement<"operator?|name"> {
  @proto static alias = "statement"
  @proto static syntax = "start (operator:exclusive|non-exclusive|nonexclusive)? (animation|process) {name:constant}"

  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    return new P.ASTStartProcessInvocation(match, {
      name: name.value,
      exclusive: operator?.value === "exclusive"
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`start process dealing`, `spellCore.startProcess('dealing')`],
        [`start animation dealing`, `spellCore.startProcess('dealing')`],
        [`start non-exclusive animation dealing`, `spellCore.startProcess('dealing')`],
        [`start nonexclusive process dealing`, `spellCore.startProcess('dealing')`],
        [
          `start exclusive process dealing`,
          [`if (spellCore.processIsRunning('dealing')) { return }`, `spellCore.startProcess('dealing', 'EXCLUSIVE')`]
        ]
      ]
    }
  ]
}

/** Stop a conceptual animation or process, e.g. `stop animation dealing` => `spellCore.stopProcess('dealing')`. */
export class stop_process extends SpellStatement<"name"> {
  @proto static alias = "statement"
  @proto static syntax = "(stop|end|finish|cancel) (animation|process) {name:constant}"

  getAST(match: P.MatchFor<this>) {
    const { name } = match.groups
    const args = [new P.ASTQuotedExpression(match, name.value)]
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "stopProcess",
      args
    })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "statement",
      tests: [
        [`stop animation dealing`, `spellCore.stopProcess('dealing')`],
        [`stop process dealing`, `spellCore.stopProcess('dealing')`],
        [`end process dealing`, `spellCore.stopProcess('dealing')`],
        [`finish process dealing`, `spellCore.stopProcess('dealing')`],
        [`cancel process dealing`, `spellCore.stopProcess('dealing')`]
      ]
    }
  ]
}

/**
 * Check whether a conceptual animation or process is currently running, e.g.
 * `animation dealing is running`.
 * - `is not`/`isn't`/`isnt` negate the check via `P.ASTNotExpression`.
 */
export class check_process extends SpellExpression<"name|operator"> {
  @proto static alias = "expression"
  @proto static syntax = "(animation|process) {name:constant} (operator:is|is not|isn't|isnt) (running|active)"

  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "processIsRunning",
      args: [new P.ASTQuotedExpression(match, name.value)]
    })
    if (operator.value === "is") return expression
    return new P.ASTNotExpression(match, { expression })
  }

  static tests: P.RuleTests = [
    {
      compileAs: "expression",
      tests: [[`animation dealing is running`, `spellCore.processIsRunning('dealing')`]]
    }
  ]
}

/** Rule module for async/process rules (`await`, `pause`, `start_process`, `stop_process`, `check_process`). */
export const _async = new SpellParser({
  module: "async",
  rules: [_await, pause, start_process, stop_process, check_process]
})
