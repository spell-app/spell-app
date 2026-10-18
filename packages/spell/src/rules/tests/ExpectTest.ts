import { proto } from "$/util"
import { P } from "$/parser"
import { SpellConstant } from "$/spell/rules/constants"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { tests } from "./tests.parser"

/**
 * `expect_test` rule:  `expect {expression}`, `expect {expression} to be {value}` or
 * `{expression} should be {value}` -- an assertion.
 * - e.g. `expect the rank of it to be "queen"` => `core.expect(it.rank, ..., "queen", ...)`.
 * - e.g. `its rank should be queen` => `core.expect(it.rank, \`its rank\`, "queen", \`queen\`)`.
 * - The value is an expression, else a bare word, e.g. `queen`, as `"queen"` (as `value_if`'s is).
 * - What it says when it fails names both as written:  `its rank`, `queen`.
 */
export class ExpectTest extends SpellStatement<"expression|value?"> {
  @proto static alias = ["statement"]

  /** SIDE EFFECT:  a bare word, e.g. `queen`, becomes a known value -- see `SpellConstant.declareValue()`. */
  mutateScope(match: P.MatchFor<this>) {
    SpellConstant.declareValue(match, match.groups.value)
  }

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
tests.addRule(ExpectTest, {
  syntax: "expect that? {expression} (to be (value:{expression}|{constant}))?",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        // `Scope.compile()`'s `ruleName` has no default even though the `Parser.compile()` it delegates
        // to defaults it to `"block"` -- see report. Pass it explicitly to match the original behavior.
        scope.compile(`it = a new thing with rank = "queen", is-face-up = yes`, "block")
        scope.compile("my-list is a new list", "block")
      },
      tests: [
        ['expect the rank of it to be "queen"', 'core.expect(it.rank, `the rank of it`, "queen", `"queen"`)'],
        ["expect the is-face-up of it to be yes", "core.expect(it.isFaceUp, `the is-face-up of it`, true, `yes`)"],
        ["expect the is-face-up of it", "core.expect(it.isFaceUp, `the is-face-up of it`)"],
        [
          "expect the number of items in my-list to be 0",
          "core.expect(core.itemCountOf(myList), `the number of items in my-list`, 0, `0`)"
        ],
        ["expect that it is a thing", 'core.expect(core.isOfType(it, "Thing"), `it is a thing`)'],
        ["expect its rank to be queen", 'core.expect(it.rank, `its rank`, "queen", `queen`)']
      ]
    }
  ]
})
tests.addRule(ExpectTest, {
  syntax: "{expression} should be (value:{expression}|{constant})",
  tests: [
    {
      beforeEach(scope: P.Scope) {
        // `Scope.compile()`'s `ruleName` has no default even though the `Parser.compile()` it delegates
        // to defaults it to `"block"` -- see report. Pass it explicitly to match the original behavior.
        scope.compile(`it = a new thing with rank = "queen", is-face-up = yes`, "block")
        scope.compile("my-list is a new list", "block")
      },
      tests: [
        ["its rank should be queen", 'core.expect(it.rank, `its rank`, "queen", `queen`)'],
        ['the rank of it should be "queen"', 'core.expect(it.rank, `the rank of it`, "queen", `"queen"`)'],
        [
          "the number of items in my-list should be 0",
          "core.expect(core.itemCountOf(myList), `the number of items in my-list`, 0, `0`)"
        ]
      ]
    }
  ]
})
