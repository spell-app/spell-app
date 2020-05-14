//
//  # Rules for assignment and returning values.
//

import { SpellParser, AST } from "~/languages/spell"

export const assignment = new SpellParser({
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
      constructor: "Statement",
      mutateScope(match) {
        const { thing } = match.groups
        // If `thing` is a variable...
        if (thing.rule.name === "variable") {
          // get just the `identifier` bit to ignore leading "the "
          const varName = thing.groups.identifier.value
          match.isNewVariable = !match.scope.variables.get(varName)
          // define it a a new variable in `scope` if not already defined
          if (match.isNewVariable) match.scope.variables.add(varName) // TODO: type???
        }
      },
      getAST(match) {
        const { thing, value } = match.groups
        return new AST.AssignmentStatement(match, {
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
              output: `/* PARSE ERROR: UNABLE TO PARSE: "let the name of nothing = 'bob'" */`
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
      constructor: "Statement",
      mutateScope(match) {
        // make sure 'it' is declared LOCALLY
        match.isNewVarable = !match.scope.variables.get("it", "LOCAL")
        if (!match.isNewVarable) match.scope.variables.add("it")
      },
      getAST(match) {
        const { value } = match.groups
        return new AST.AssignmentStatement(match, {
          thing: new AST.VariableExpression(match, { raw: "it", name: "it" }),
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
          tests: [
            ["get thing", "let it = thing"],
            ["get the foo of the thing", "let it = thing.foo"]
          ]
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
      constructor: "Statement",
      wantsNestedBlock: true,
      parseNestedBlockAs: "expression",
      getNestedScope(match) {
        return match.scope
      },
      getAST(match) {
        const result = match.groups.expression || match.groups.nestedBlock
        return new AST.ReturnStatement(match, { value: result?.AST })
      },
      tests: [
        {
          title: "Simple return with inline expression",
          compileAs: "statement",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["return", "return"],
            ["return thing", "return thing"],
            ["exit", "return"],
            ["exit with false", "return false"]
          ]
        },
        {
          title: "Return with nested block expression",
          compileAs: "block",
          tests: [
            // simple expression
            ["return\n\t1 + 2", "return (1 + 2)"],
            // inline JSX
            ["return\n\t<div/>", 'return spellCore.element({ tag: "div" })'],
            ["return\n\t1 + <div/>", 'return (1 + spellCore.element({ tag: "div" }))'],
            // multi-line JSX
            [
              "return\n\t<div>\n\t\t<span/>\n\t</div>",
              'return spellCore.element({ tag: "div", children: [\n\tspellCore.element({ tag: "span" })\n] })'
            ],
            // fails for more than one indented line
            [
              "return\n\t<div/>\n\t1",
              ["return", '/* PARSE ERROR: UNABLE TO PARSE: "<div/>" */', '/* PARSE ERROR: UNABLE TO PARSE: "1" */']
            ]
          ]
        }
      ]
    }
  ]
})
