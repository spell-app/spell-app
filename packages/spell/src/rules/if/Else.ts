import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { _if_ } from "./if.parser"

/**
 * `else` rule:  `(else|otherwise) :?` -- else branch; must be tried after `else_if` (see NOTE there) so this
 * rule's bare `(else|otherwise)` prefix doesn't eat an `else if` statement.
 * - Compiles body in a nested `BlockScope` (named `"else"`) via `getNestedScopeForMatch()`.
 * - Compiles to `else { ...statements }`.
 */
export class Else extends SpellStatement<"body?"> {
  @proto static alias = "statement"

  getNestedScopeForMatch(match: P.MatchFor<this>): P.Scope {
    return new P.BlockScope({ name: "else", parentScope: match.scope })
  }
  getAST(match: P.MatchFor<this>): P.ASTElseStatement {
    return new P.ASTElseStatement(match, {
      statements: this.getBody(match)?.AST as P.ASTStatement | P.ASTStatementBlock | undefined
    })
  }
}
_if_.addRule(Else, {
  syntax: "(else|otherwise) :? {statement_body}?",
  tests: [
    {
      title: "correctly matches single-line else statements",
      compileAs: "block",
      tests: [
        ["else", "else {}"],
        ["otherwise", "else {}"],
        ["else: b = 1", "else { let b = 1 }", "else const b: number = 1"],
        ["otherwise: b = 1", "else { let b = 1 }", "else const b: number = 1"],
        ["else b = 1", "else { let b = 1 }", "else const b: number = 1"],
        ["otherwise b = 1", "else { let b = 1 }", "else const b: number = 1"]
      ]
    },
    {
      title: "correctly matches multi-line else blocks",
      compileAs: "block",
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: ["else", "b = 1"],
          js: ["else {}", "export let b = 1"],
          ts: ["else {}", "export const b: number = 1"]
        },
        {
          title: "Indent with tab",
          input: ["else", "\tb = 1"],
          js: "else { let b = 1 }",
          ts: "else const b: number = 1"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["else", " b = 1"],
          js: "else { let b = 1 }",
          ts: "else const b: number = 1"
        },
        {
          title: "Multiple lines in the nested block",
          input: ["else", "\tb = 1", "\tlet c = 2"],
          js: ["else {", "  let b = 1", "  let c = 2", "}"],
          ts: ["else {", "  const b: number = 1", "  const c: number = 2", "}"]
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["else b = 1", "\tc = 2"],
          js: ["else { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"],
          ts: ["else const c: number = 2", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})
