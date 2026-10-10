import { proto } from "$/util"
import { P } from "$/parser"
import { Priority } from "$/spell/rules/rules.types"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"

/**
 * `else_if` rule:  `(else|otherwise) if {condition} (then|:)?` -- else-if branch, chained after `if`.
 * - e.g. `else if a`
 * - NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
 * - `Priority.preferred` also biases resolution toward this rule over `else` when ambiguous.
 *   TODO: is `priority` load-bearing here, or does rule-definition order (see NOTE above) suffice?
 * - Compiles body in a nested `BlockScope` (named `"elseif"`) via `getNestedScopeForMatch()`.
 * - Prefers nested block over inline statement when (invalidly) given both -- see `getBody()`.
 * - Compiles to `else if (condition) { ...statements }`.
 */
export class ElseIf extends SpellStatement<"condition|body?"> {
  @proto static alias = "statement"
  @proto static priority = Priority.preferred

  getNestedScopeForMatch(match: P.MatchFor<this>): P.Scope {
    return new P.BlockScope({ name: "elseif", parentScope: match.scope })
  }
  getAST(match: P.MatchFor<this>): P.ASTElseIfStatement {
    const { condition } = match.groups
    return new P.ASTElseIfStatement(match, {
      condition: condition.AST as P.ASTExpression,
      statements: this.getBody(match)?.AST as P.ASTStatement | P.ASTStatementBlock | undefined
    })
  }
}
_if_.addRule(ElseIf, {
  syntax: "(else|otherwise) if {condition:expression} (then|:)? {statement_body}?",
  tests: [
    {
      title: "correctly matches single-line else_if statements",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("a")
      },
      tests: [
        ["else if a", "else if (a) {}"],
        ["else if a:", "else if (a) {}"],
        ["else if a then", "else if (a) {}"],
        ["else if a b = 1", "else if (a) { let b = 1 }", "else if (a) const b: number = 1"],
        ["else if a: b = 1", "else if (a) { let b = 1 }", "else if (a) const b: number = 1"],
        ["else if a then b = 1", "else if (a) { let b = 1 }", "else if (a) const b: number = 1"]
      ]
    },
    {
      title: "correctly matches multi-line else_if blocks",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("a")
      },
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: ["else if a:", "b = 1"],
          js: ["else if (a) {}", "export let b = 1"],
          ts: ["else if (a) {}", "export const b: number = 1"]
        },
        {
          title: "Indent with tab",
          input: ["else if a:", "\tb = 1"],
          js: "else if (a) { let b = 1 }",
          ts: "else if (a) const b: number = 1"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["else if a:", " b = 1"],
          js: "else if (a) { let b = 1 }",
          ts: "else if (a) const b: number = 1"
        },
        {
          title: "Multiple lines in the nested block",
          input: ["else if a:", "\tb = 1", "\tc = 2"],
          js: ["else if (a) {", "  let b = 1", "  let c = 2", "}"],
          ts: ["else if (a) {", "  const b: number = 1", "  const c: number = 2", "}"]
        },
        {
          title: "Nested else ifs work fine",
          input: ["else if a", "\tif a", "\t\tc=2"],
          js: "else if (a) { if (a) { let c = 2 } }",
          ts: "else if (a) { if (a) const c: number = 2 }"
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["else if a b = 1", "\tc = 2"],
          js: ["else if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"],
          ts: ["else if (a) const c: number = 2", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})
