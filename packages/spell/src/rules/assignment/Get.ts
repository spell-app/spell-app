import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { assignment } from "./assignment.parser"
import { AssignmentStatement } from "./AssignmentStatement"

/**
 * `get` rule:  `get {value}` -- assign `value` to a NEW `it`.
 * - e.g. `get thing`
 * - SIDE EFFECT: `mutateScope()` declares that `it`:  plain `it` the first time, then `it_2`, `it_3`...
 *   so a callback which captured an earlier `it` keeps it -- see `AssignmentStatement.declareIt()`.
 * - Compiles to `let it = value`, `let it_2 = value`, ...
 */
export class Get extends SpellStatement<"value", GetMatchData> {
  @proto static alias = ["assignment", "statement"]
  @proto static changesScope: P.ScopeChanges = "internal"

  /** Declare a new `it`, holding what `value` is -- see `AssignmentStatement.declareIt()`. */
  mutateScope(match: P.MatchFor<this>) {
    // `match.scope` is typed as `P.Scope`, whose `.variables` getter can be `undefined` -- we know it's a block.
    const scope = match.scope as P.BlockScope
    match.data.itVar = AssignmentStatement.declareIt(scope, match, match.groups.value.datatype)
  }
  /** Build `P.ASTAssignmentStatement` declaring our new `it` as `value`. */
  getAST(match: P.MatchFor<this>): P.ASTAssignmentStatement {
    const { value } = match.groups
    const { itVar } = match.data
    return new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: itVar?.output ?? "it" }),
      value: value.AST as P.ASTExpression,
      isNewVariable: true
    })
  }
}
assignment.addRule(Get, {
  syntax: "get {value:expression}",
  tests: [
    {
      title: "`it` is not already defined",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("thing")
      },
      tests: [
        ["get thing", "const it = thing"],
        ["get the foo of the thing", "const it = thing.foo"]
      ]
    },
    {
      title: "`it` is already defined",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("it")
        variables.add("thing")
      },
      tests: [
        ["get thing", "const it2 = thing"],
        ["get the foo of the thing", "const it2 = thing.foo"]
      ]
    },
    {
      title: "each `get` declares a new `it`, so a callback which captured an earlier one keeps it",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("thing")
      },
      tests: [
        {
          input: ["get thing", "get the foo of the thing", "print it"],
          js: ["const it = thing", "const it2 = thing.foo", "spellCore.console.log(it2)"]
        }
      ]
    },
    {
      title: "numbered `it`s skip names already in use",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("thing")
        variables.add("it-2")
      },
      tests: [
        {
          input: ["get thing", "get the foo of the thing"],
          js: ["const it = thing", "const it3 = thing.foo"]
        }
      ]
    },
    {
      title: "`it` gets redefined if defined as an alias",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add({ name: "it", output: "this", isAlias: true })
        variables.add("thing")
      },
      tests: [
        {
          input: ["print it", "get the thing", "print it"],
          js: ["spellCore.console.log(this)", "const it = thing", "spellCore.console.log(it)"]
        },
        {
          input: ["print it", "get its name", "print it"],
          js: ["spellCore.console.log(this)", "const it = this.name", "spellCore.console.log(it)"]
        }
      ]
    }
  ]
})

/** What `get` stashes on its match. */
type GetMatchData = {
  /** The NEW `it` variable we declared -- see `AssignmentStatement.declareIt()`. */
  itVar?: P.ScopeVariable
}
