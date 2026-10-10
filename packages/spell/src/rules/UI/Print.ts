import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { UI } from "./UI.parser"

/**
 * `print` rule:  print an expression (to the console currently).
 * - e.g. `print "Yo!"`
 * - `operator` (`info`/`warning`/`error`/`group`/`collapsed group`) selects the `console` method
 *   via `operatorMap`; omitted operator defaults to `log`.
 */
export class Print extends SpellStatement<"operator?|expressions"> {
  @proto static alias = "statement"

  /** Maps `operator` group value to `console` method name; `default` is used when `operator` is absent. */
  operatorMap: Record<string, string> = {
    info: "info",
    warning: "warn",
    error: "error",
    group: "group",
    "collapsed group": "groupCollapsed",
    default: "log"
  }
  getAST(match: P.MatchFor<this>) {
    const { operator, expressions } = match.groups
    const methodName = this.operatorMap[operator?.value || "default"]
    return new P.ASTConsoleMethodInvocation(match, {
      methodName,
      args: expressions.items.map((item) => P.asAST<P.ASTExpression>(item.AST))
    })
  }
}
UI.addRule(Print, {
  syntax: "print (operator:info|warning|error|collapsed? group)? [expressions:{expression} ,]",
  tests: [
    {
      compileAs: "statement",
      tests: [
        [`print "Yo!"`, `spellCore.console.log("Yo!")`],
        [`print warning "Yo!"`, `spellCore.console.warn("Yo!")`],
        [`print error "Yo!"`, `spellCore.console.error("Yo!")`],
        [`print group "Yo!"`, `spellCore.console.group("Yo!")`],
        [`print collapsed group "Yo!"`, `spellCore.console.groupCollapsed("Yo!")`]
      ]
    }
  ]
})
