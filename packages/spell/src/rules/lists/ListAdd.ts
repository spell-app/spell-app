import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { lists } from "./lists.parser"

/**
 * `list_add` rule:  add to list, e.g. `add thing to my-list`, `add thing to the front of my-list`.
 * - Compiles to `spellCore.prepend(list, thing)` when `method` is `start`/`front`/`top`,
 *   else `spellCore.append(list, thing)`.
 */
export class ListAdd extends SpellStatement<"thing|method?|list"> {
  @proto static alias = "statement"

  getAST(match: P.MatchFor<this>): P.ASTCoreMethodInvocation {
    const { thing, list, method } = match.groups
    const spellMethod = method && ["start", "front", "top"].includes(method.value) ? "prepend" : "append"
    return new P.ASTCoreMethodInvocation(match, {
      methodName: spellMethod,
      args: [P.matchAST(list), P.matchAST(thing)]
    })
  }
}
lists.addRule(ListAdd, {
  syntax: "add {thing:expression} to (the (method:start|front|top|end|back|bottom) of)? {list:expression}",
  tests: [
    {
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("my-list")
        scope.variables?.add("thing")
      },
      tests: [
        ["add thing to the start of my-list", "spellCore.prepend(my_list, thing)", "spellCore.prepend(myList, thing)"],
        ["add thing to the front of my-list", "spellCore.prepend(my_list, thing)", "spellCore.prepend(myList, thing)"],
        ["add thing to the top of my-list", "spellCore.prepend(my_list, thing)", "spellCore.prepend(myList, thing)"],

        ["add thing to my-list", "spellCore.append(my_list, thing)", "spellCore.append(myList, thing)"],
        ["add thing to the end of my-list", "spellCore.append(my_list, thing)", "spellCore.append(myList, thing)"],
        ["add thing to the back of my-list", "spellCore.append(my_list, thing)", "spellCore.append(myList, thing)"],
        ["add thing to the bottom of my-list", "spellCore.append(my_list, thing)", "spellCore.append(myList, thing)"]
      ]
    }
  ]
})
