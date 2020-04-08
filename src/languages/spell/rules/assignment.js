//
//  # Rules for assignment and returning values.
//

import { Spell, AST } from "../all"

export default new Spell.Parser({
  module: "assignment",
  rules: [
    {
      name: "assignment",
      alias: "statement",
      syntax: [
        { syntax: "(thing:{expression}|{variable}) = {value:expression}", testRule: "…=" },
        { syntax: "let (thing:{expression}|{variable}) = {value:expression}", testRule: "let" },
        { syntax: "set (thing:{expression}|{variable}) to {value:expression}", testRule: "set" },
        { syntax: "(thing:{variable}) is {value: expression}", testRule: "…is" }
      ],
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results, groups }) {
        const { thing, value } = results
        // Add `thing` as a variable if not already in scope.
        const thingMatch = groups.thing
        const isNewVarable = thingMatch.rule.name === "variable" && !thingMatch.variable
        if (isNewVarable) scope.variables.add(thing)

        const statement = scope.addStatement(`${isNewVarable ? "let " : ""}${thing} = ${value}`)
        results.statements.push(statement)
      },
      updateASTScope(scope, match) {
        const { thing } = match.groups
        // If `thing` is a variable...
        if (thing.rule.name === "variable") {
          // get just the `identifier` bit to ignore leading "the "
          const varName = thing.groups.identifier.value
          match.isNewVariable = !scope.variables(varName)
          // define it a a new variable in `scope` if not already defined
          if (match.isNewVariable) scope.variables.add(varName) // TODO: type???
        }
      },
      toAST(scope, match) {
        const { thing, value } = match.groups
        return new AST.AssignmentStatement(scope, match, {
          thing: thing.AST,
          value: value.AST,
          isNewVariable: match.isNewVariable
        })
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.types.add("Person")
          },
          tests: [
            { title: "non-existing var: equals", input: "nothing = yes", output: "let nothing = true" },
            { title: "non-existing var: set", input: "set nothing to yes", output: "let nothing = true" },
            {
              title: "non-existing var: variable is",
              input: "bob is a new person whose name is 'bob'",
              output: "let bob = new Person({ name: 'bob' })"
            },
            {
              title: "non-existing var: property set (won't work)",
              input: "let the name of nothing = 'bob'",
              output: `// PARSE ERROR: UNABLE TO PARSE: "let the name of nothing = 'bob'"`
            },

            { title: "existing var: equals", input: "thing = yes", output: "thing = true" },
            { title: "existing var: set", input: "set thing to yes", output: "thing = true" },
            { title: "existing var: variable is", input: "thing is a new person", output: "thing = new Person()" },
            {
              title: "existing var: property set",
              input: "let the name of thing = 'bob'",
              output: "thing.name = 'bob'"
            }
          ]
        }
      ]
    },

    {
      name: "get",
      alias: ["assignment", "statement"],
      syntax: "get {value:expression}",
      testRule: "get",
      constructor: Spell.Rule.Statement,
      mutatesScope: true,
      updateScope(scope, { results }) {
        const { value } = results
        // make sure 'it' is declared LOCALLY
        const isNewVarable = !scope.variables("it", "LOCAL")
        if (isNewVarable) scope.variables.add("it")
        const statement = scope.addStatement(`${isNewVarable ? "let " : ""}it = ${value}`)
        results.statements.push(statement)
      },
      updateASTScope(scope, match) {
        // make sure 'it' is declared LOCALLY
        match.isNewVarable = !scope.variables("it", "LOCAL")
        if (!match.isNewVarable) scope.variables.add("it")
      },
      toAST(scope, match) {
        const { value } = match.groups
        return new AST.AssignmentStatement(scope, match, {
          thing: new AST.VariableExpression(scope, match, { raw: "it", name: "it" }),
          value: value.AST,
          isNewVariable: match.isNewVarable
        })
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [["get thing", "let it = thing"], ["get the foo of the thing", "let it = thing.foo"]]
        }
      ]
    },

    //
    //  ## Returns
    //

    // Return a value
    {
      name: "return_statement",
      alias: "statement",
      syntax: "(return|exit with?) {expression}?",
      testRule: "(return|exit)",
      constructor: Spell.Rule.Statement,
      updateScope(scope, { results }) {
        const { expression = "undefined" } = results
        const statement = scope.addStatement(`return ${expression}`)
        results.statements.push(statement)
      },
      toAST(scope, match) {
        return new AST.ReturnStatement(scope, match, {
          value: match.groups.expression?.AST || new AST.UndefinedLiteral(scope, match)
        })
      },
      tests: [
        {
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["return", "return undefined"],
            ["return thing", "return thing"],
            ["exit", "return undefined"],
            ["exit with false", "return false"]
          ]
        }
      ]
    }
  ]
})
