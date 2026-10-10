import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement, type SpellStatementProps } from "$/spell/rules/Statement"

/**
 * Base class for all Spell expressions.
 * - Aliased `expression`, so registered as an `operand` -- see `SpellParser.getNamesForRule()`.
 */
export class SpellExpression<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellStatement<Groups, MatchData> {
  /** Whether `compileAST()` should wrap the output expression in parenthesis. */
  declare parenthesize: boolean
  @proto static parenthesize = false

  /** Every spell expression is registered as an `"expression"` unless a subclass says otherwise. */
  @proto static alias: string | string[] = "expression"

  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: SpellExpressionProps
}

/** Props bag accepted by `SpellExpression` -- `parenthesize` wraps compiled output in `(...)`. */
export type SpellExpressionProps = Prettify<SpellStatementProps & { parenthesize?: boolean }>
