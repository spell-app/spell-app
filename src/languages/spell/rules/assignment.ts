/** Rules for assignment and returning values. */

import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"
import "./match-fields.B"

/** Match groups for `assignment` -- `thing` (target) and `value` (expression to assign). */
type AssignmentGroups = P.RulexGroups<"thing:value">
/** Match groups for `get` -- just the `value` expression, which gets assigned to `it`. */
type GetGroups = P.RulexGroups<"value">
/** Match groups for `return_statement` -- inline `expression`, or an indented `nestedBlock` expression. */
type ReturnGroups = P.RulexGroups<"expression"> & { nestedBlock?: P.Match }

export const assignment = new SpellParser({
  module: "assignment",
  rules: [
    /**
     * Assignment, via any of 4 equivalent surface forms:  `{thing} = {value}`, `let {thing} = {value}`,
     * `set {thing} to {value}`, or `{variable} is {value}`.
     * - `thing` may be a plain `{variable}` (declares/updates a scope variable) or an arbitrary
     *   `{expression}` (e.g. property assignment `let the name of X = ...`, which only compiles if `X`
     *   already exists).
     * - SIDE EFFECT: `mutateScope()` declares a new scope variable for `thing` if it's a `{variable}` and
     *   isn't already declared (or is only an alias, e.g. `it`) -- see `isNewVariable`/`originalVar`.
     * - HACK: also mutates `scope` again in `getAST()`, to redefine an alias `thing` as a real variable --
     *   must happen after building the `value` AST, in case `value` itself refers to the alias.
     * - Compiles to `let thing = value` (new variable) or `thing = value` (existing).
     */
    {
      name: "assignment",
      alias: "statement",
      syntax: [
        { syntax: "(thing:{expression}|{variable}) = {value:expression}", testRule: "…=" },
        { syntax: "let (thing:{expression}|{variable}) = {value:expression}", testRule: "let" },
        { syntax: "set (thing:{expression}|{variable}) to {value:expression}", testRule: "set" },
        { syntax: "(thing:{variable}) is {value: expression}", testRule: "…is" }
      ],
      constructor: class assignment extends SpellStatement {
        /**
         * HACK: we also mutate scope in `getAST()`...  :-(
         * - Declares a new scope variable for `thing` (if it's a `{variable}` and not already declared,
         *   or only an alias) so later statements in the block see it -- see rule doc above.
         */
        mutateScope(match: P.Match<AssignmentGroups>) {
          const thing = match.groups.thing! // `thing` is required in every syntax variant above.
          // If `thing` is a variable...
          // TODO: this is not necessarily the best check...
          if (thing.rule.name === "variable" || thing.rule.name?.endsWith("_variable")) {
            // get just the `identifier` bit to ignore leading "the "
            // `thing.rule.name` check above guarantees `thing` came from `variable`/`*_variable`, whose own
            // syntax always includes a single, non-repeated `{identifier}` group.
            const identifier = thing.groups.identifier as P.Match
            const varName: string = identifier.value
            // `match.scope` is typed as `P.Scope`, whose `.variables` getter can be `undefined` (it just
            // forwards to `parentScope.variables`) -- cast to `P.BlockScope` for its non-optional override,
            // which already accepts a plain name string as `.add()`/`.get()` input.
            const { variables } = match.scope as P.BlockScope
            const scopeVar = variables.get(varName)
            match.isNewVariable = !scopeVar || scopeVar.isAlias
            // define a new variable in `scope` if not already defined
            if (!scopeVar) variables.add(varName)
            // Remember the original scopeVar for hackery in getAST() below
            match.originalVar = scopeVar
          }
        }
        /**
         * Build `AST.AssignmentStatement`.
         * - HACK: if `originalVar` was an alias (e.g. `it`), redefines it as a real variable in `scope`
         *   here -- must happen after building `thing`/`value` ASTs, in case the alias appeared inside
         *   `value` itself.
         */
        getAST(match: P.Match<AssignmentGroups>): AST.AssignmentStatement {
          const { thing, value } = match.groups
          const { originalVar } = match
          const ast = new AST.AssignmentStatement(match, {
            // if we got an originalVar which was an alias, get a clean VariableExpression for the original name
            thing: originalVar?.isAlias
              ? new AST.VariableExpression(match, { name: originalVar.name })
              : (thing!.AST as AST.Expression),
            value: value!.AST as AST.Expression,
            isNewVariable: match.isNewVariable
          })
          // HACK: if `originalVar` was an alias, redefine as a normal variable.
          // We have to do this AFTER the above in case the alias variable was in the value expression.
          if (originalVar?.isAlias) (match.scope as P.BlockScope).variables.replace(originalVar.name)
          return ast
        }
      },
      tests: [
        {
          compileAs: "block",
          beforeEach(scope) {
            // `scope` is typed as `P.Scope`, whose `.variables`/`.types` getters can be `undefined` --
            // cast to `P.RootScope` for their non-optional override, which already accepts a plain
            // name string as `.add()`/`.get()` input.
            const { variables, types } = scope as P.RootScope
            variables.add("thing")
            variables.add({ name: "it", output: "this", isAlias: true })
            types.add("Person")
          },
          tests: [
            { title: "non-existing var: equals", input: "unknown-var = yes", output: "export let unknown_var = true" },
            {
              title: "non-existing var: set",
              input: "set unknown-var to yes",
              output: "export let unknown_var = true"
            },
            {
              title: "non-existing var: variable is",
              input: `bob is a new person whose name is "bob"`,
              output: `export let bob = new Person({ name: "bob" })`
            },
            {
              title: "non-existing var: property set (won't work)",
              input: `let the name of unknown-var = "bob"`,
              output: `/* PARSE ERROR: Don't understand "let the name of unknown-var = "bob"" */`
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

    /**
     * `get {value}` -- assign `value` to (possibly-new) variable `it`.
     * - SIDE EFFECT: `mutateScope()` declares a LOCAL `it` variable if one isn't already locally defined
     *   (an inherited/aliased `it` from an outer scope doesn't count -- see `"LOCAL_ONLY"` lookup).
     * - HACK: also mutates scope again in `getAST()` to redefine `it` as a real variable -- see there.
     * - Compiles to `let it = value` (new) or `it = value` (existing).
     */
    {
      name: "get",
      alias: ["assignment", "statement"],
      syntax: "get {value:expression}",
      testRule: "get",
      constructor: class get extends SpellStatement {
        /**
         * NOTE: we also mutate scope in `getAST()`...  :-(
         * - Declares a LOCAL `it` variable if one isn't already locally defined.
         */
        mutateScope(match: P.Match<GetGroups>) {
          // `match.scope` is typed as `P.Scope`, whose `.variables` getter can be `undefined` (it just
          // forwards to `parentScope.variables`) -- cast to `P.BlockScope` for its non-optional override,
          // which already accepts a plain name string as `.add()`/`.get()` input.
          const { variables } = match.scope as P.BlockScope
          // Did we have a LOCAL `it` variable?
          const itVar = variables.get("it", "LOCAL_ONLY")
          // Remember the original itVar for hackery in getAST() below
          match.itVar = itVar
          match.isNewVariable = !itVar || itVar.isAlias
          // Define a new local "it" variable if we don't have one
          if (!itVar) variables.add("it")
        }
        /**
         * Build `AST.AssignmentStatement` assigning `value` to `it`.
         * - HACK: unconditionally redefines `it` as a real (non-alias) variable in `scope` -- regardless
         *   of whether `match.itVar` was actually an alias, unlike `assignment.getAST()`'s guarded
         *   `if (originalVar?.isAlias)` equivalent.
         * - TODO: should this be guarded the same way?  As written a real `it` variable loses its `kind`/`datatype`.
         */
        getAST(match: P.Match<GetGroups>): AST.AssignmentStatement {
          const { value } = match.groups
          const ast = new AST.AssignmentStatement(match, {
            thing: new AST.VariableExpression(match, { name: "it" }),
            value: value!.AST as AST.Expression,
            isNewVariable: match.isNewVariable
          })
          // HACK: redefine `it` as a normal variable -- unconditionally (see docstring above).
          // We have to do this AFTER the above in case the alias `it` was in the value expression.
          ;(match.scope as P.BlockScope).variables.replace("it")
          return ast
        }
      },
      tests: [
        {
          title: "`it` is not already defined",
          compileAs: "block",
          beforeEach(scope) {
            ;(scope as P.BlockScope).variables.add("thing")
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
            const { variables } = scope as P.BlockScope
            variables.add("it")
            variables.add("thing")
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
            const { variables } = scope as P.BlockScope
            variables.add({ name: "it", output: "this", isAlias: true })
            variables.add("thing")
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

    ////////////////
    // ## Returns
    ////////////////

    /**
     * `(return|exit with?) {expression}?` -- return a value.
     * - `(return|exit with?)` accepts `return`, `exit`, or `exit with` as equivalent keywords.
     * - Accepts the returned expression inline (`return thing`) or in a nested indented block
     *   (`return\n\t1 + 2`), via `wantsInlineStatement`/`wantsNestedBlock` (both parsed as `"expression"`).
     */
    {
      name: "return_statement",
      alias: "statement",
      syntax: "(return|exit with?) {expression}?",
      testRule: "(return|exit)",
      wantsInlineStatement: true,
      parseInlineStatementAs: "expression",
      wantsNestedBlock: true,
      parseNestedBlockAs: "expression",
      constructor: class return_statement extends SpellStatement {
        getAST(match: P.Match<ReturnGroups>): AST.ReturnStatement {
          const result = match.groups.expression || match.groups.nestedBlock
          return new AST.ReturnStatement(match, { value: result?.AST as AST.Expression | undefined })
        }
      },
      tests: [
        {
          title: "Simple return with inline expression",
          compileAs: "statement",
          beforeEach(scope) {
            ;(scope as P.BlockScope).variables.add("thing")
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
              ["return", '/* PARSE ERROR: Don\'t understand "<div/>" */', '/* PARSE ERROR: Don\'t understand "1" */']
            ]
          ]
        }
      ]
    }
  ]
})
