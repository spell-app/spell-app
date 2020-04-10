//
//  # Rules for inline spell tests.
//

import { Spell, AST } from "../all"

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
        const args = [
          expression.AST,
          value?.AST || new AST.BooleanLiteral(match, { value: true }),
          new AST.StringLiteral(match, { value: `\`${expression.value}\`` }),
          new AST.StringLiteral(match, { value: value?.value || '"true"' })
        ]
        return new AST.CoreMethodInvocation(match, {
          method: "assertEquals",
          arguments: args
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
              'spellCore.assertEquals(it.rank, "queen", `the rank of it`, "queen")'
            ],
            [
              "expect the is-face-up of it",
              'spellCore.assertEquals(it.is_face_up, true, `the is-face-up of it`, "true")'
            ]
          ]
        }
      ]
    }
  ]
})
