//
//  # Rules for inline spell tests.
//

import { Spell } from "../all"

export default new Spell.Parser({
  module: "tests",
  rules: [
    {
      name: "expect_test",
      alias: ["statement"],
      syntax: "expect {expression} (to be {value:expression})?",
      testRule: "expect",
      constructor: Spell.Rule.Statement,
      updateScope(scope, match) {
        const { results, groups } = match
        const args = [
          results.expression,
          "value" in results ? results.value : true,
          // TODO: output expression spell for error messages in output
          JSON.stringify(groups.expression.tokens.join(" ")),
          groups.value ? JSON.stringify(groups.value.tokens.join(" ")) : "true"
        ]
        const statement = scope.addStatement(`spellCore.assertEquals(${args.join(", ")})`)
        results.statements.push(statement)
      },
      tests: [
        {
          beforeEach(scope) {
            scope.compile("create a type named thing")
            scope.compile("the thing = a new thing with foo = 'bar'")
          },
          tests: [
            [
              "expect the foo of the thing to be 'bar'",
              "spellCore.assertEquals(thing.foo, 'bar', \"the foo of the thing\", \"'bar'\")"
            ],
            [
              "expect the foo of the thing is 'bar'",
              "spellCore.assertEquals((thing.foo == 'bar'), true, \"the foo of the thing is 'bar'\", true)"
            ]
          ]
        }
      ]
    }
  ]
})
