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
      // HACK: we also mutate scope in `getAST()`...  :-(
      mutateScope(match) {
        const { thing } = match.groups
        // If `thing` is a variable...
        // TODO: this is not necessarily the best check...
        if (thing.rule.name === "variable" || thing.rule.name.endsWith("_variable")) {
          // get just the `identifier` bit to ignore leading "the "
          const varName = thing.groups.identifier.value
          const scopeVar = match.scope.variables.get(varName)
          match.isNewVariable = !scopeVar || scopeVar.isAlias
          // define a new variable in `scope` if not already defined
          if (!scopeVar) match.scope.variables.add(varName)
          // Remember the original scopeVar for hackery in getAST() below
          match.originalVar = scopeVar
        }
      },
      getAST(match) {
        const { thing, value } = match.groups
        const { originalVar } = match
        const ast = new AST.AssignmentStatement(match, {
          // if we got an originalVar which was an alias, get a clean VariableExpression for the original name
          thing: originalVar?.isAlias ? new AST.VariableExpression(match, { name: originalVar.name }) : thing.AST,
          value: value.AST,
          isNewVariable: match.isNewVariable
        })
        // HACK: if `originalVar` was an alias, redefine as a normal variable.
        // We have to do this AFTER the above in case the alias variable was in the value expression.
        if (originalVar?.isAlias) match.scope.variables.replace(originalVar.name)
        return ast
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("thing")
            scope.variables.add({ name: "it", output: "this", isAlias: true })
            scope.types.add("Person")
          },
          tests: [
            { title: "non-existing var: equals", input: "unkown-var = yes", output: "let unkown_var = true" },
            { title: "non-existing var: set", input: "set unkown-var to yes", output: "let unkown_var = true" },
            {
              title: "non-existing var: variable is",
              input: `bob is a new person whose name is "bob"`,
              output: `let bob = new Person({ name: "bob" })`
            },
            {
              title: "non-existing var: property set (won't work)",
              input: `let the name of unkown-var = "bob"`,
              output: `/* PARSE ERROR: UNABLE TO PARSE: "let the name of unkown-var = \"bob\"" */`
            },

            { title: "existing var: equals", input: "thing = yes", output: "thing = true" },
            { title: "existing var: set", input: "set thing to yes", output: "thing = true" },
            { title: "existing var: variable is", input: "thing is a new person", output: "thing = new Person()" },
            {
              title: "existing var: property set",
              input: `let the name of thing = "bob"`,
              output: `thing.name = "bob"`
            },
            {
              title: "alias var reassign works",
              input: "set it to the name of it",
              output: "let it = this.name"
            },
            {
              title: "assignment to alias property doesn't redefine alias",
              input: "set the title of it to the name of it",
              output: "this.title = this.name"
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
      // NOTE: we also mutate scope in `getAST()`...  :-(
      mutateScope(match) {
        // Did we have a LOCAL `it` variable?
        const itVar = match.scope.variables.get("it", "LOCAL")
        // Remember the original itVar for hackery in getAST() below
        match.itVar = itVar
        match.isNewVarable = !itVar || itVar.isAlias
        // Define a new local "it" variable if we don't have one
        if (!itVar) match.scope.variables.add("it")
      },
      getAST(match) {
        const { value } = match.groups
        const ast = new AST.AssignmentStatement(match, {
          thing: new AST.VariableExpression(match, { name: "it" }),
          value: value.AST,
          isNewVariable: match.isNewVarable
        })
        // HACK: if `match.itVar` was an alias, redefine as a normal variable
        // We have to do this AFTER the above in case the alias `it` was in the value expression.
        match.scope.variables.replace("it")
        return ast
      },
      tests: [
        {
          title: "`it` is not already defined",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("thing")
          },
          tests: [
            ["get thing", "let it = thing"],
            ["get the foo of the thing", "let it = thing.foo"]
          ]
        },
        {
          title: "`it` is already defined",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add("it")
            scope.variables.add("thing")
          },
          tests: [
            ["get thing", "it = thing"],
            ["get the foo of the thing", "it = thing.foo"]
          ]
        },
        {
          title: "`it` gets redefined if defined as an alias",
          compileAs: "block",
          beforeEach(scope) {
            scope.variables.add({ name: "it", output: "this", isAlias: true })
            scope.variables.add("thing")
          },
          tests: [
            {
              input: ["print it", "get the thing", "print it"],
              output: ["spellCore.console.log(this)", "let it = thing", "spellCore.console.log(it)"]
            },
            {
              input: ["print it", "get its name", "print it"],
              output: ["spellCore.console.log(this)", "let it = this.name", "spellCore.console.log(it)"]
            }
          ]
        }
      ]
    },

    //
    //  ## Returns
    //

    // Return a value.
    // Accepts a single expression in a nested block.
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
              ["return", "\t<div>", "\t\t<span/>", "\t</div>"],
              ['return spellCore.element({ tag: "div", children: [', '\tspellCore.element({ tag: "span" })', "] })"]
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
