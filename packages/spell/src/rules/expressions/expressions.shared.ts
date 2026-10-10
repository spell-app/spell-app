/**
 * Shared by the `expressions` rule files, and by other modules' operator suffixes:
 * how tightly each operator binds (`Precedence`), what a suffix compiles from (`OperatorOperands`),
 * and what the suffix being parsed follows (`SuffixLeft`).
 */
import { P } from "$/parser"

/**
 * How tightly each operator suffix binds, higher first:  `*` before `+` before `is` before `and`.
 * - Read ONLY by the expression loop, `CompoundExpression`:  it stops at its `bound`,
 *   and its shunting-yard groups the chain, e.g. `x + y is empty` => `isEmpty(x + y)`.
 * - NOT `priority`, which only says which of several rules matching the SAME words wins a `Choice`.
 * - Every suffix rule MUST say one, e.g. `@proto static precedence = Precedence.comparison`.
 * - A new level is a new name here, with a why.
 */
export const Precedence = {
  /** `X if C otherwise Y`:  loosest, so it takes whole expressions either side. */
  ternary: 4,
  or: 5,
  and: 6,
  /** `is`, `is exactly` */
  equality: 10,
  /** `<`, `is a`, `includes`, `is empty`, quoted aliases ... */
  comparison: 11,
  /** The `bound` of `ArithmeticExpression`:  `+ - * /` bind tighter, comparisons don't. */
  takesSum: 12,
  /** `+ -` */
  sum: 13,
  /** `* /` */
  product: 14
}

/** Operands passed to `compileASTExpression()`/`compileAST()` while running the shunting-yard algorithm. */
export type OperatorOperands = {
  /** Operator `Match` -- rule-specific token(s) deciding the concrete operator, e.g. `is not exactly`. */
  operator: P.Match
  /** Left-hand-side AST -- always populated for infix operators; also populated for postfix operators. */
  lhs?: P.ASTExpression
  /** Right-hand-side AST -- only populated for infix operators. */
  rhs?: P.ASTExpression
}

/**
 * What the suffix being parsed FOLLOWS, when `CompoundExpression` knows:  its operand, for the first suffix after it,
 * or the operand after an `and` / `or` -- so a user's phrase can refuse a thing that isn't its own, e.g. a deck's
 * `a rank "is a face card"` on `the card is a face card`, where the card has its own (plan doc `outline-spell`, J8 /
 * J11, I7).
 * - A suffix can't see its left side through `parse()`'s arguments:  this is the side channel, set while
 *   `CompoundExpression` parses that one suffix, and restored after, so nested expressions keep their own.
 * - `undefined`:  not known, e.g. a suffix after `+` (what it follows is the sum so far):  anything fits.
 */
export const SuffixLeft = {
  /** The operand the suffix being parsed follows, if known. */
  current: undefined as P.Match | undefined,

  /** `parse()` with `left` as `current`, restoring what was there after. */
  while<T>(left: P.Match | undefined, parse: () => T): T {
    const outer = SuffixLeft.current
    SuffixLeft.current = left
    try {
      return parse()
    } finally {
      SuffixLeft.current = outer
    }
  },

  /**
   * Could what the suffix follows be a `type`, e.g. the owner of a user's phrase?  `true` unless both are KNOWN and
   * neither is the other -- as `scope.couldBeA()`.
   */
  couldBeA(scope: P.Scope, type: P.Datatype | undefined): boolean {
    return !SuffixLeft.current || scope.couldBeA(SuffixLeft.current.datatype, type)
  }
}
