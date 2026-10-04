/** Rules for `if`/`else if`/`else` statements, plus the backwards `if...else` ternary suffix. */

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { InfixOperatorSuffix, Precedence } from "./expressions"

/** Rule module for `if`/`else if`/`else` statement rules, plus the `backwards_if` ternary suffix. */
export const _if_ = new SpellParser({ module: "if" })

////////////////
// ## `if` rule
//    e.g. "if a"
////////////////

/**
 * `if {condition} (then|:)?` statement, with an inline statement or an indented nested block as body.
 * - Named `_if` to avoid the reserved word `if` -- `name: "if"` keeps the actual rule name;
 *   the module export below is `_if_` for the same reason.
 * - `{statement_body}?`: doesn't parse its own body -- `SpellStatement` parses a trailing inline statement,
 *   or `commitStatement()` a following indented block, into `getBody(match)`.
 * - Compiles body in a nested `BlockScope` (named `"if"`) via `getNestedScopeForMatch()`.
 * - Prefers nested block over inline statement when (invalidly) given both -- see `getBody()`.
 * - Compiles to `if (condition) { ...statements }`.
 */
class _if extends SpellStatement<"condition|body?"> {
  static ruleName = "if"
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
_if_.addRule(_if, {
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
        ["if a then b = 1", "if (a) { let b = 1 }"],
        ["if a: b = 1", "if (a) { let b = 1 }"],
        ["if a : b = 1", "if (a) { let b = 1 }"]
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
          output: ["if (a) {}", "export let b = 1"] // NOTE: this is correct!
        },
        {
          title: "Single tabbed statement appears inline",
          input: ["if a:", "\tb = 1"],
          output: "if (a) { let b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["if a:", " b = 1"],
          output: "if (a) { let b = 1 }"
        },
        {
          title: "Indent with tab, output has tabs spaces",
          input: ["if a:", "\tb = 1", "\tc=1"],
          output: ["if (a) {", "  let b = 1", "  let c = 1", "}"]
        },
        {
          title: "Multiple lines in the nested block",
          input: ["if a:", "\tb = 1", "\tc = 2"],
          output: ["if (a) {", "  let b = 1", "  let c = 2", "}"]
        },
        {
          title: "Nested ifs work fine",
          input: ["if a", "\tb = 1", "\tif b", "\t\tc = 2", "\t\td = 3"],
          output: ["if (a) {", "  let b = 1", "  if (b) {", "    let c = 2", "    let d = 3", "  }", "}"]
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["if a b = 1", "\tc = 2"],
          output: ["if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})

////////////////
// ## `else_if` rule
//    e.g. "else if a"
////////////////

/**
 * `(else|otherwise) if {condition} (then|:)?` -- else-if branch, chained after `if`.
 * - NOTE: this MUST be before `else` or that will eat `else if` statements... :-(
 * - `priority: 1` (default 0) also biases resolution toward this rule over `else` when ambiguous.
 *   TODO: is `priority` load-bearing here, or does rule-definition order (see NOTE above) suffice?
 * - Compiles body in a nested `BlockScope` (named `"elseif"`) via `getNestedScopeForMatch()`.
 * - Prefers nested block over inline statement when (invalidly) given both -- see `getBody()`.
 * - Compiles to `else if (condition) { ...statements }`.
 */
class else_if extends SpellStatement<"condition|body?"> {
  @proto static alias = "statement"
  @proto static priority = 1

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
_if_.addRule(else_if, {
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
        ["else if a b = 1", "else if (a) { let b = 1 }"],
        ["else if a: b = 1", "else if (a) { let b = 1 }"],
        ["else if a then b = 1", "else if (a) { let b = 1 }"]
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
          output: ["else if (a) {}", "export let b = 1"]
        },
        {
          title: "Indent with tab",
          input: ["else if a:", "\tb = 1"],
          output: "else if (a) { let b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["else if a:", " b = 1"],
          output: "else if (a) { let b = 1 }"
        },
        {
          title: "Multiple lines in the nested block",
          input: ["else if a:", "\tb = 1", "\tc = 2"],
          output: ["else if (a) {", "  let b = 1", "  let c = 2", "}"]
        },
        {
          title: "Nested else ifs work fine",
          input: ["else if a", "\tif a", "\t\tc=2"],
          output: "else if (a) { if (a) { let c = 2 } }"
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["else if a b = 1", "\tc = 2"],
          output: ["else if (a) { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})

////////////////
// ## `else` rule (class `_else`)
//    e.g. "else"
////////////////

/**
 * `(else|otherwise) :?` -- else branch; must be tried after `else_if` (see NOTE there) so this
 * rule's bare `(else|otherwise)` prefix doesn't eat an `else if` statement.
 * - Compiles body in a nested `BlockScope` (named `"else"`) via `getNestedScopeForMatch()`.
 * - Compiles to `else { ...statements }`.
 */
class _else extends SpellStatement<"body?"> {
  static ruleName = "else"
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
_if_.addRule(_else, {
  syntax: "(else|otherwise) :? {statement_body}?",
  tests: [
    {
      title: "correctly matches single-line else statements",
      compileAs: "block",
      tests: [
        ["else", "else {}"],
        ["otherwise", "else {}"],
        ["else: b = 1", "else { let b = 1 }"],
        ["otherwise: b = 1", "else { let b = 1 }"],
        ["else b = 1", "else { let b = 1 }"],
        ["otherwise b = 1", "else { let b = 1 }"]
      ]
    },
    {
      title: "correctly matches multi-line else blocks",
      compileAs: "block",
      tests: [
        {
          title: "Separate blocks if no indentation on second line.",
          input: ["else", "b = 1"],
          output: ["else {}", "export let b = 1"]
        },
        {
          title: "Indent with tab",
          input: ["else", "\tb = 1"],
          output: "else { let b = 1 }"
        },
        {
          title: "ANY number of spaces should count as indentation",
          input: ["else", " b = 1"],
          output: "else { let b = 1 }"
        },
        {
          title: "Multiple lines in the nested block",
          input: ["else", "\tb = 1", "\tlet c = 2"],
          output: ["else {", "  let b = 1", "  let c = 2", "}"]
        },
        {
          title: "Show error if nested block AND inline statement. Prefer block.",
          input: ["else b = 1", "\tc = 2"],
          output: ["else { let c = 2 }", "/* PARSE ERROR: Got both inline statement and nested block */"]
        }
      ]
    }
  ]
})

////////////////
// ## `backwards_if` rule
//    e.g. "1 if bar else 2"
////////////////

/**
 * Postfix ternary: `{expr} if {condition} (else|otherwise) {expr}` -- English word order
 * ("do X if Y else Z") rather than `condition ? then : else`.
 * - `expression_suffix`: `lhs` (the value before `if`) is supplied by `compound_expression`'s
 *   shunting-yard; this rule's own `syntax` only spells out `operator` (actually the *condition*
 *   expression here) and the trailing `rhs` expression.
 * - Compiles to `P.ASTTernaryExpression`.
 */
class backwards_if extends InfixOperatorSuffix<"operator|expression"> {
  @proto static precedence = Precedence.ternary

  /** What both sides are, if they agree -- else unknown. */
  getResultDatatype(
    match: P.MatchFor<this>,
    lhs: P.Datatype | undefined,
    rhs: P.Datatype | undefined
  ): P.Datatype | undefined {
    return lhs === rhs ? lhs : undefined
  }

  compileASTExpression(
    match: P.Match,
    { lhs, operator, rhs }: { lhs: P.ASTExpression; operator: P.Match; rhs: P.ASTExpression }
  ): P.ASTTernaryExpression {
    return new P.ASTTernaryExpression(match, {
      condition: operator.AST as P.ASTExpression,
      trueValue: lhs,
      falseValue: rhs
    })
  }
}
_if_.addRule(backwards_if, {
  syntax: "if {operator:expression} (else|otherwise) {expression}",
  tests: [
    {
      title: "correctly matches single-line backwards_if statements",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("bar")
        variables.add("foo")
      },
      tests: [
        { input: "print 1 if bar else 2", output: "spellCore.console.log((bar ? 1 : 2))" },
        {
          input: "get the foo of the bar if bar is defined otherwise the bar of the foo",
          output: "let it = (spellCore.isDefined(bar) ? bar.foo : foo.bar)"
        },
        {
          input: `set color to "red" if 1 + 1 else "black"`,
          output: `export let color = ((1 + 1) ? "red" : "black")`
        }
      ]
    }
  ]
})
