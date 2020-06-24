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
        return new AST.ExpectMethodInvocation(match, {
          expression: expression.AST,
          expressionString: expression.value,
          value: value?.AST,
          valueString: value?.value
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
    },
    // TODO: start test, end test
    {
      name: "echo",
      alias: ["statement"],
      syntax: "echo {expression}",
      constructor: "Statement",
      getAST(match) {
        const { expression } = match.groups
        return new AST.EchoInvocation(match, {
          expression: expression.AST
        })
      },
      tests: [
        {
          tests: [
            [`echo 1`, `spellCore.echo(1)`],
            [`echo "foo"`, `spellCore.echo("foo")`],
            ["echo the rank of a new thing", "spellCore.echo(new Thing().rank)"]
          ]
        }
      ]
    }
  ]
})
