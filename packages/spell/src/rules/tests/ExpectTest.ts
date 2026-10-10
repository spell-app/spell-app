import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { tests } from "./tests.parser"

/**
 * `expect_test` rule:  `expect {expression}` or `expect {expression} to be {value}` -- an assertion.
 * - e.g. `expect the rank of it to be "queen"` => `spellCore.expect(it.rank, ..., "queen", ...)`.
 */
export class ExpectTest extends SpellStatement<"expression|value?"> {
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
tests.addRule(ExpectTest, {
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
