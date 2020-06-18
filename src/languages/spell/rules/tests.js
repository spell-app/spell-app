//
//  # Rules for inline spell tests.
//

import { SpellParser, AST } from "~/languages/spell"

export const tests = new SpellParser({
  module: "tests",
  rules: [
    {
      name: "expect_test",
      alias: ["statement"],
      syntax: "expect {expression} (to be {value:expression})?",
      testRule: "expect",
      constructor: "Statement",
      getAST(match) {
        const { expression, value } = match.groups
        const expressionLiteral = new AST.StringLiteral(match, { value: `\`${expression.value}\`` })
        if (!value) {
          return new AST.CoreMethodInvocation(match, {
            methodName: "expect",
            args: [expression.AST, expressionLiteral]
          })
        }
        return new AST.CoreMethodInvocation(match, {
          methodName: "expect",
          wrap: false,
          args: [
            expression.AST,
            expressionLiteral,
            value.AST,
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
            ['expect the rank of it to be "queen"', 'spellCore.expect(it.rank, `the rank of it`, "queen", `"queen"`)'],
            ["expect the is-face-up of it", "spellCore.expect(it.is_face_up, `the is-face-up of it`)"]
          ]
        }
      ]
    }
  ]
})
