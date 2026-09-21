/**
 * Rules for inline spell tests -- `expect`/`start test`/`end test`/`echo`, used to write assertions and
 * debug output directly in spell source rather than in a separate test language.
 */

import { proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * Narrow `node` from `P.ASTNode | undefined` to concrete subtype `T`.
 * - `Match.AST` is typed generically as `ASTNode | undefined`; use this where a referenced sub-rule's
 *   `getAST()` is known (by inspection, not statically provable) to always produce `T`.
 * - Does not actually check `node`'s type or that it's defined -- purely a compile-time cast.
 */
function ast<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

/**
 * `expect {expression}` or `expect {expression} to be {value}` -- an assertion.
 * - `testRule: "expect"` is a quick keyword pre-check (compiled from rulex syntax) so the full
 *   sequence match is only attempted when the line actually starts with `expect`.
 * - e.g. `expect the rank of it to be "queen"` => `spellCore.expect(it.rank, ..., "queen", ...)`.
 */
export class expect_test extends SpellStatement<"expression|value?"> {
  @proto static alias = ["statement"]
  @proto static syntax = "expect that? {expression} (to be {value:expression})?"
  @proto static testRule = "expect"

  getAST(match: P.MatchFor<this>) {
    const { expression, value } = match.groups
    // `Match.raw` is a `declare`d field, always statically present, so `"raw" in value` can't narrow it here
    // (TS treats the "absent" branch as `never`); use nullish coalescing for the same runtime fallback.
    const valueString: string | undefined = value ? (value.raw ?? value.value) : undefined
    return new P.ASTExpectMethodInvocation(match, {
      expression: ast<P.ASTExpression>(expression.AST),
      expressionString: expression.value,
      value: value && ast<P.ASTExpression>(value.AST),
      valueString
    })
  }

  static tests: P.RuleTests = [
    {
      beforeEach(scope: P.Scope) {
        // `Scope.compile()`'s `ruleName` has no default even though the `Parser.compile()` it delegates
        // to defaults it to `"block"` -- see report. Pass it explicitly to match the original behavior.
        scope.compile("a card is a thing", "block")
        scope.compile(`it = a new thing with rank = "queen", is-face-up = yes`, "block")
        scope.compile("my-list is a new list", "block")
      },
      tests: [
        ['expect the rank of it to be "queen"', 'spellCore.expect(it.rank, `the rank of it`, "queen", `"queen"`)'],
        [
          "expect the is-face-up of it to be yes",
          "spellCore.expect(it.is_face_up, `the is-face-up of it`, true, `yes`)"
        ],
        ["expect the is-face-up of it", "spellCore.expect(it.is_face_up, `the is-face-up of it`)"],
        [
          "expect the number of items in my-list to be 0",
          "spellCore.expect(spellCore.itemCountOf(my_list), `the number of items in my-list`, 0, `0`)"
        ],
        ["expect that it is a thing", "spellCore.expect(spellCore.isOfType(it, 'Thing'), `it is a thing`)"]
      ]
    }
  ]
}

/**
 * `start test {message}` or `start quiet test {message}` -- marks beginning of a named test run.
 * - `quiet` suppresses normal test output (e.g. for tests nested inside other tests).
 */
export class start_test extends SpellStatement<"quiet?|message"> {
  @proto static alias = "statement"
  @proto static syntax = "start (quiet:quiet)? test {message:text}"

  getAST(match: P.MatchFor<this>) {
    const { quiet, message } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "startTest",
      // NOTE: `ASTQuotedString` doesn't exist -- `message.value` already carries the enclosing quotes
      // (see the `text` rule in core.js), so `StringLiteral` reproduces the original intent exactly.
      args: [new P.ASTStringLiteral(message, message.value), new P.ASTBooleanLiteral(match, !!quiet)]
    })
  }
}

/** `end test` -- marks end of the current named test run started by `start_test`. */
export class end_test extends SpellStatement {
  @proto static alias = "statement"
  @proto static syntax = "end test"

  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "endTest"
    })
  }
}

/** `echo {expression}` -- print `expression`'s value, e.g. for debugging. */
export class echo extends SpellStatement<"expression"> {
  @proto static alias = ["statement"]
  @proto static syntax = "echo {expression}"

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTEchoInvocation(match, {
      expression: ast<P.ASTExpression>(expression.AST)
    })
  }

  static tests: P.RuleTests = [
    {
      tests: [
        [`echo 1`, `spellCore.echo(1)`],
        [`echo "foo"`, `spellCore.echo("foo")`],
        ["echo the rank of a new thing", "spellCore.echo(new Thing().rank)"]
      ]
    }
  ]
}

/** Rule module for inline test rules (`expect_test`, `start_test`, `end_test`, `echo`). */
export const tests = new SpellParser({
  module: "tests",
  rules: [expect_test, start_test, end_test, echo]
})
