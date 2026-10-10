import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { classes } from "./classes.parser"

/**
 * `new_list` rule:  `a new list of <type>` -- constructs a `List`, optionally tagged with `instanceType`.
 * - Compiles to `new List(...)`, e.g. `a new list of Todos` => `new List({ instanceType: "Todo" })`.
 */
export class NewList extends SpellStatement<"instanceType?"> {
  @proto static alias = "expression"

  /** A `list`, or a `list of` what it says, e.g. `list of todos`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    const { instanceType } = match.groups
    return instanceType ? P.listOf(SP.typeName(`${instanceType.value}`)) : "list"
  }

  getAST(match: P.MatchFor<this>): P.ASTNewInstanceExpression {
    const { instanceType } = match.groups
    return new P.ASTNewInstanceExpression(match, {
      type: new P.ASTTypeExpression(match, { name: "List" }),
      props:
        instanceType &&
        new P.ASTObjectLiteral(instanceType, {
          properties: [
            new P.ASTObjectLiteralProperty(instanceType, {
              property: "instanceType",
              value: new P.ASTStringLiteral(instanceType, { value: String(instanceType.value), quote: '"' })
            })
          ]
        })
    })
  }
}
classes.addRule(NewList, {
  syntax: "a new (list|List) of {instanceType:type}?",
  tests: [
    {
      compileAs: "expression",
      tests: [
        [`a new list`, `new List()`],
        [`a new List`, `new List()`],
        [
          `a new list of objects`,
          `new List({ instanceType: "Object" })`,
          'new List<Object>({ instanceType: "Object" })'
        ],
        [
          `a new list of numbers`,
          `new List({ instanceType: "number" })`,
          'new List<number>({ instanceType: "number" })'
        ],
        [`a new list of Todos`, `new List({ instanceType: "Todo" })`, 'new List<Todo>({ instanceType: "Todo" })']
      ]
    }
  ]
})
