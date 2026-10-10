/**
 * Rules for inline spell tests -- `expect`/`start test`/`end test`/`echo`, used to write assertions and
 * debug output directly in spell source rather than in a separate test language.
 */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"

/**
 * Rule module for inline test rules (`expect_test`, `start_test`, `end_test`, `echo`).
 * - Each rule class below is followed by the `tests.addRule()` call which defines and registers it.
 */
export const tests = new SpellParser({ module: "tests" })

////////////////
// ## `expect_test` rule
//    e.g. 'expect the rank of it to be "queen"'
////////////////

/**
 * `expect {expression}` or `expect {expression} to be {value}` -- an assertion.
 * - e.g. `expect the rank of it to be "queen"` => `spellCore.expect(it.rank, ..., "queen", ...)`.
 */
class expect_test extends SpellStatement<"expression|value?"> {
  @proto static alias = ["statement"]

  getAST(match: P.MatchFor<this>) {
    const { expression, value } = match.groups
    // `Match.raw` is a `declare`d field, always statically present, so `"raw" in value` can't narrow it here
    // (TS treats the "absent" branch as `never`); use nullish coalescing for the same runtime fallback.
    const valueString: string | undefined = value ? (value.raw ?? value.value) : undefined
    return new P.ASTExpectMethodInvocation(match, {
      expression: P.asAST<P.ASTExpression>(expression.AST),
      expressionString: expression.value,
      value: value && P.asAST<P.ASTExpression>(value.AST),
      valueString
    })
  }
}
tests.addRule(expect_test, {
  syntax: "expect that? {expression} (to be {value:expression})?",
  tests: [
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
          "spellCore.expect(spellCore.itemCountOf(my_list), `the number of items in my-list`, 0, `0`)",
          "spellCore.expect(spellCore.itemCountOf(myList), `the number of items in my-list`, 0, `0`)"
        ],
        [
          "expect that it is a thing",
          "spellCore.expect(spellCore.isOfType(it, 'Thing'), `it is a thing`)",
          'spellCore.expect(spellCore.isOfType(it, "Thing"), `it is a thing`)'
        ]
      ]
    }
  ]
})

////////////////
// ## `start_test` rule
//    e.g. 'start test "my test"'
////////////////

/**
 * `start test {message}` or `start quiet test {message}` -- marks beginning of a named test run.
 * - `quiet` suppresses normal test output (e.g. for tests nested inside other tests).
 */
class start_test extends SpellStatement<"quiet?|message"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    const { quiet, message } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "startTest",
      args: [P.matchAST<P.ASTStringLiteral>(message), new P.ASTBooleanLiteral(match, !!quiet)]
    })
  }
}
tests.addRule(start_test, {
  syntax: "start (quiet:quiet)? test {message:text}"
})

////////////////
// ## `end_test` rule
//    e.g. "end test"
////////////////

/** `end test` -- marks end of the current named test run started by `start_test`. */
class end_test extends SpellStatement {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>) {
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "endTest"
    })
  }
}
tests.addRule(end_test, {
  syntax: "end test"
})

////////////////
// ## `echo` rule
//    e.g. "echo 1"
////////////////

/** `echo {expression}` -- print `expression`'s value, e.g. for debugging. */
class echo extends SpellStatement<"expression"> {
  @proto static alias = ["statement"]

  getAST(match: P.MatchFor<this>) {
    const { expression } = match.groups
    return new P.ASTEchoInvocation(match, {
      expression: P.asAST<P.ASTExpression>(expression.AST)
    })
  }
}
tests.addRule(echo, {
  syntax: "echo {expression}",
  tests: [
    {
      tests: [
        [`echo 1`, `spellCore.echo(1)`],
        [`echo "foo"`, `spellCore.echo("foo")`],
        ["echo the rank of a new thing", "spellCore.echo(new Thing().rank)", "spellCore.echo((new Thing()).rank)"]
      ]
    }
  ]
})
