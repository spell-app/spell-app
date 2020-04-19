//
//  # Rules for inline spell tests.
//

import { Spell, AST } from ".."

export default new Spell.Parser({
  module: "tests",
  rules: [
    {
      name: "expect_test",
      alias: ["statement"],
      syntax: "expect {expression} (to be {value:expression})?",
      testRule: "expect",
      constructor: Spell.Rule.Statement,
      getAST(match) {
        const { expression, value } = match.groups
        const expressionLiteral = new AST.StringLiteral(match, { value: `\`${expression.value}\`` })
        if (!value) {
          return new AST.CoreMethodInvocation(match, {
            method: "assert",
            arguments: [expression.AST, expressionLiteral]
          })
        }
        return new AST.CoreMethodInvocation(match, {
          method: "assertEquals",
          arguments: [
            expression.AST,
            value.AST,
            expressionLiteral,
            new AST.StringLiteral(match, { value: `\`${value.value}\`` })
          ]
        })
      },
      tests: [
        {
          beforeEach(scope) {
            scope.compile("a card is a thing")
            scope.compile("it = a new card with rank = 'queen' and is-face-up = true")
          },
          tests: [
            [
              'expect the rank of it to be "queen"',
              'spellCore.assertEquals(it.rank, "queen", `the rank of it`, `"queen"`)'
            ],
            ["expect the is-face-up of it", "spellCore.assert(it.is_face_up, `the is-face-up of it`)"]
          ]
        }
      ]
    }
  ]
})
