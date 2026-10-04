/**
 * Rules for async control flow and conceptual "processes" -- `await`, `pause for`, and
 * start/stop/check process.
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { Negatable, SpellExpression } from "./expressions"

/**
 * Rule module for async/process rules (`await`, `pause`, `start_process`, `stop_process`, `check_process`).
 */
export const _async = new SpellParser({ module: "async" })

////////////////
// ## `await` rule
//    e.g. "await"
////////////////

/**
 * `await`/`wait for` an expression, with the expression itself optional (bare `await`).
 * - `:?` in `syntax` is an optional literal colon in the source text (e.g. `await:`), matched but
 *   discarded -- NOT the `name:rule` named-group colon.  The `(await|wait for)` keyword itself
 *   stays required.
 * - Bare `await` (no expression) compiles to `await undefined`.
 * - As a statement it waits for a whole expression;  inside an expression, an operand -- see
 *   `operandInExpressions`.
 * - `await` is a reserved word, so the class is named `_await` -- see `ruleName`.
 * - TODO: add test to make sure parents are made async properly, especially for `await` inside an
 *   if block, etc.
 */
class _await extends SpellStatement<"expression?"> {
  static ruleName = "await"
  @proto static alias = ["expression", "statement"]
  /** `wait for x is 1` => `await (x == 1)`, but `if wait for x is 1` => `(await x) == 1` (plan doc D33). */
  @proto static operandInExpressions = true

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: (expression && P.asAST<P.ASTExpression>(expression.AST)) || new P.ASTUndefinedLiteral(match)
    })
  }
}
_async.addRule(_await, {
  syntax: "(await|wait for) :? {expression}?",
  tests: [
    {
      compileAs: "statement",
      tests: [
        ["await", "await undefined"],
        ["wait for 1", "await 1"],
        ["set the result to wait for 1", "export let result = await 1"],
        ["wait for 2 is 1", "await (2 == 1)"],
        ["if wait for 2 is 1 then print 1", "if (await 2 == 1) { spellCore.console.log(1) }"]
      ]
    },
    {
      compileAs: "block",
      tests: [
        {
          input: ["to do something", "\twait for 1"],
          output: ["export async function do_something() {", "  await 1", "}"]
        },
        {
          input: ["to do something", "\tif (1) wait for 1"],
          output: ["export async function do_something() {", "  if (1) { await 1 }", "}"]
        }
      ]
    }
  ]
})

////////////////
// ## `pause` rule
//    e.g. "pause for 2 seconds"
////////////////

/**
 * Delay for a certain amount of time, e.g. `pause for 2 seconds`.
 * - Compiles to `await spellCore.pauseFor(number, 'units')`.
 * - TODO: "a second", "a little bit", "a while", "a noticeable amount".
 */
class pause extends SpellStatement<"number|units"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { number, units } = match.groups
    return new P.ASTAwaitExpression(match, {
      expression: new P.ASTCoreMethodInvocation(match, {
        methodName: "pauseFor",
        args: [P.asAST<P.ASTExpression>(number.AST), new P.ASTQuotedExpression(units, units.value)]
      })
    })
  }
}
_async.addRule(pause, {
  syntax: "pause for {number:expression} (units:second|seconds|sec|millisecond|milliseconds|msec|tick|ticks)",
  tests: [
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
})

////////////////
// ## `start_process` rule
//    e.g. "start process dealing"
////////////////

/**
 * Start a conceptual animation or process, e.g. `start animation dealing`.
 * - `exclusive` process guards against re-entry: compiles to an early `return` if the process is
 *   already running, then starts it flagged `'EXCLUSIVE'`.
 * - `animation`/`process` are synonyms in the syntax -- purely for readability at the call site.
 */
class start_process extends SpellStatement<"operator?|name"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    return new P.ASTStartProcessInvocation(match, {
      name: name.value,
      exclusive: operator?.value === "exclusive"
    })
  }
}
_async.addRule(start_process, {
  syntax: "start (operator:exclusive|non-exclusive|nonexclusive)? (animation|process) {name:constant}",
  tests: [
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
})

////////////////
// ## `stop_process` rule
//    e.g. "stop animation dealing"
////////////////

/** Stop a conceptual animation or process, e.g. `stop animation dealing` => `spellCore.stopProcess('dealing')`. */
class stop_process extends SpellStatement<"name"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { name } = match.groups
    const args = [new P.ASTQuotedExpression(match, name.value)]
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "stopProcess",
      args
    })
  }
}
_async.addRule(stop_process, {
  syntax: "(stop|end|finish|cancel) (animation|process) {name:constant}",
  tests: [
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
})

////////////////
// ## `check_process` rule
//    e.g. "animation dealing is running"
////////////////

/**
 * Check whether a conceptual animation or process is currently running, e.g.
 * `animation dealing is running`.
 * - `is not`/`isn't`/`isnt` negate the check via `P.ASTNotExpression`.
 */
class check_process extends SpellExpression<"name|operator"> {
  getAST(match: P.MatchFor<this>) {
    const { operator, name } = match.groups
    const expression = new P.ASTCoreMethodInvocation(match, {
      methodName: "processIsRunning",
      args: [new P.ASTQuotedExpression(match, name.value)]
    })
    if (!Negatable.isNegated(operator)) return expression
    return new P.ASTNotExpression(match, { expression })
  }
}
_async.addRule(check_process, {
  syntax: "(animation|process) {name:constant} {operator:is} (running|active)",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`animation dealing is running`, `spellCore.processIsRunning('dealing')`],
        [`animation dealing isn't running`, `!spellCore.processIsRunning('dealing')`],
        [`process dealing is not active`, `!spellCore.processIsRunning('dealing')`]
      ]
    }
  ]
})
