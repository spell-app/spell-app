import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/** `list_append` rule:  append to list, e.g. `append thing to my-list` => `spellCore.append(my_list, thing)`. */
export class ListAppend extends SpellStatement<"thing|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list } = match.groups
    return new P.ASTCoreMethodInvocation(match, {
      methodName: "append",
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListAppend, {
  syntax: "append {thing:expression} to {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [["append thing to my-list", "spellCore.append(my_list, thing)", "spellCore.append(myList, thing)"]]
    }
  ]
})
