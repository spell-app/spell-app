import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"

/**
 * `if` rule:  `if {condition} (then|:)?` statement, with an inline statement or an indented nested block as body.
 * - e.g. `if a`
 * - The module's parser is `_if_`, since `if` is a reserved word.
 * - `{statement_body}?`: doesn't parse its own body -- `SpellStatement` parses a trailing inline statement,
 *   or `commitStatement()` a following indented block, into `getBody(match)`.
 * - Compiles body in a nested `BlockScope` (named `"if"`) via `getNestedScopeForMatch()`.
 * - Prefers nested block over inline statement when (invalidly) given both -- see `getBody()`.
 * - Compiles to `if (condition) { ...statements }`.
 */
export class If extends SpellStatement<"condition|body?"> {
  @proto static alias = "statement"

  getNestedScopeForMatch(match: P.MatchFor<this>): P.Scope {
    return new P.BlockScope({ name: "if", parentScope: match.scope })
  }
  getAST(match: P.MatchFor<this>): P.ASTIfStatement {
    const { condition } = match.groups
    return new P.ASTIfStatement(match, {
      condition: condition.AST as P.ASTExpression,
      statements: this.getBody(match)?.AST as P.ASTStatement | P.ASTStatementBlock | undefined
    })
  }
}
_if_.addRule(If, {
  syntax: "if {condition:expression} (then|:)? {statement_body}?",
  tests: [
    {
      title: "correctly matches single-line if statements",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("a")
      },
      tests: [
        ["if a", "if (a) {}"],
        ["if a then", "if (a) {}"],
        ["if a:", "if (a) {}"],
        ["if a then b = 1", "if (a) { let b = 1 }", "if (a) const b: number = 1"],
        ["if a: b = 1", "if (a) { let b = 1 }", "if (a) const b: number = 1"],
        ["if a : b = 1", "if (a) { let b = 1 }", "if (a) const b: number = 1"]
      ]
    },
    {
      title: "correctly matches multi-line if blocks",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("a")
      },
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: ["if a:", "b = 1"],
          js: ["if (a) {}", "export let b = 1"],
          ts: ["if (a) {}", "export const b: number = 1"] // NOTE: this is correct!
        },
        {
          title: "Single tabbed statement appears inline",
          input: ["if a:", "\tb = 1"],
          js: "if (a) { let b = 1 }",
          ts: "if (a) const b: number = 1"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["if a:", " b = 1"],
          js: "if (a) { let b = 1 }",
          ts: "if (a) const b: number = 1"
        },
        {
          title: "Indent with tab, output has tabs spaces",
          input: ["if a:", "\tb = 1", "\tc=1"],
          js: ["if (a) {", "  let b = 1", "  let c = 1", "}"],
          ts: ["if (a) {", "  const b: number = 1", "  const c: number = 1", "}"]
        },
        {
          title: "Multiple lines in the nested block",
          input: ["if a:", "\tb = 1", "\tc = 2"],
          js: ["if (a) {", "  let b = 1", "  let c = 2", "}"],
          ts: ["if (a) {", "  const b: number = 1", "  const c: number = 2", "}"]
        },
        {
          title: "Nested ifs work fine",
          input: ["if a", "\tb = 1", "\tif b", "\t\tc = 2", "\t\td = 3"],
          js: ["if (a) {", "  let b = 1", "  if (b) {", "    let c = 2", "    let d = 3", "  }", "}"],
          ts: [
            "if (a) {",
            "  const b: number = 1",
            "  if (b) {",
            "    const c: number = 2",
            "    const d: number = 3",
            "  }",
            "}"
          ]
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["if a b = 1", "\tc = 2"],
          js: ["if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"],
          ts: ["if (a) const c: number = 2", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})
