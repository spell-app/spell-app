import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { assignment } from "./assignment.parser"

/**
 * `return_statement` rule:  `(return|exit with?) {expression}? {nested_expression}?` -- return a value.
 * - `(return|exit with?)` accepts `return`, `exit`, or `exit with` as equivalent keywords.
 * - Accepts the returned expression inline (`return thing`) or as ONE line in a nested indented block
 *   (`return\n\t1 + 2`).
 */
export class ReturnStatement extends SpellStatement<"expression?|body?"> {
  @proto static alias = "statement"

  /** We return what follows `return`, or what's indented under it -- see `SpellStatement.getReturnedDatatype()`. */
  getReturnValue(match: P.MatchFor<this>): { value: P.Match | undefined } {
    return { value: match.groups.expression || this.getBody(match) }
  }

  getAST(match: P.MatchFor<this>): P.ASTReturnStatement {
    const result = match.groups.expression || this.getBody(match)
    return new P.ASTReturnStatement(match, { value: result?.AST as P.ASTExpression | undefined })
  }
}
assignment.addRule(ReturnStatement, {
  syntax: "(return|exit with?) {expression}? {nested_expression}?",
  tests: [
    {
      title: "Simple return with inline expression",
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
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
        ["return\n\t1 + 2", "return (1 + 2)", "return 1 + 2"],
        // inline JSX
        ["return\n\t<div/>", 'return spellCore.element({ tag: "div" })', "return <div />"],
        ["return\n\t1 + <div/>", 'return (1 + spellCore.element({ tag: "div" }))', "return 1 + (<div />)"],
        // multi-line JSX
        [
          ["return", "\t<div>", "\t\t<span/>", "\t</div>"],
          ['return spellCore.element({ tag: "div", children: [', '  spellCore.element({ tag: "span" })', "] })"],
          ["return (", "  <div>", "    <span />", "  </div>", ")"]
        ],
        // fails for more than one indented line
        [
          "return\n\t<div/>\n\t1",
          ["return", '/* PARSE ERROR: Don\'t understand "<div/>" */', '/* PARSE ERROR: Don\'t understand "1" */']
        ]
      ]
    }
  ]
})
