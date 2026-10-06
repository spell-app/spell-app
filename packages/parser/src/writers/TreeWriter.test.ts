import { describe, expect, test } from "vite-plus/test"

import { P } from "$/parser"

/**
 * `TreeWriter`:  AST => boxes for `<ui-tree-diagram>`.  Built from hand-made ASTs, so no language is needed:  spell's
 * real trees are checked through `spell parse --tree` (`packages/cli`).
 */

/** A match for hand-made AST:  no tokens, so no title or datatype comes from it. */
const match = new P.Match({ rule: new P.Symbol({} as never), matched: [] } as never)

/** Just each box's label, slot and children:  what the diagram shows. */
function shape(box: P.TreeNode): unknown {
  const { label, slot, children } = box
  return { label, ...(slot && { slot }), ...(children && { children: children.map(shape) }) }
}

const write = (node: P.ASTNode) => shape(P.TreeWriter.instance.write(node))

describe("TreeWriter", () => {
  test("an `if`:  its condition and statements as slots, operators as their meaning", () => {
    const condition = new P.ASTInfixExpression(match, {
      lhs: new P.ASTVariableExpression(match, { name: "number" }),
      operator: "divided by",
      rhs: new P.ASTNumericLiteral(match, 15)
    })
    const print = new P.ASTConsoleMethodInvocation(match, {
      methodName: "log",
      args: [new P.ASTStringLiteral(match, { value: "fizzbuzz", quote: '"' })]
    })
    expect(write(new P.ASTIfStatement(match, { condition, statements: print }))).toEqual({
      label: "If",
      children: [
        {
          label: "divided by",
          slot: "condition",
          children: [
            { label: "Variable number", slot: "lhs" },
            { label: "Number 15", slot: "rhs" }
          ]
        },
        { label: "Print", slot: "statements", children: [{ label: 'Text "fizzbuzz"', slot: "args" }] }
      ]
    })
  })

  test("parentheses, argument lists and blocks are drawn through", () => {
    const inner = new P.ASTNumericLiteral(match, 1)
    const parens = new P.ASTParenthesizedExpression(match, { expression: inner })
    expect(write(parens)).toEqual({ label: "Number 1" })
    const call = new P.ASTMethodInvocation(match, { methodName: "go", args: [parens] })
    expect(write(call)).toEqual({ label: "Call go", children: [{ label: "Number 1", slot: "args" }] })
  })

  test("a `spellCore` call is `Core <method>`, its `spellCore` left out;  a quoted word is one `Text` box", () => {
    const call = new P.ASTCoreMethodInvocation(match, {
      methodName: "isOfType",
      args: [new P.ASTQuotedExpression(match, "integer")]
    })
    expect(write(call)).toEqual({ label: "Core isOfType", children: [{ label: 'Text "integer"', slot: "args" }] })
  })

  test("a kind with no label of its own:  its class name in words, its children by field", () => {
    const tryCatch = new P.ASTTryCatchBlock(match, {
      body: new P.ASTReturnStatement(match),
      finallyBlock: new P.ASTReturnStatement(match)
    })
    expect(write(tryCatch)).toEqual({
      label: "Try catch block",
      children: [
        { label: "Return", slot: "body" },
        { label: "Return", slot: "finallyBlock" }
      ]
    })
  })
})
