/**
 * The `expressions` rule module:  Spell boolean/comparison/type-check expression suffixes -- `and`, `or`, `is`,
 * `is a`, `includes`, `is empty`, string-case conversion, type coercion, etc.
 * - Also defines `InfixOperatorSuffix` / `PostfixOperatorSuffix`, the base classes every operator-suffix
 *   rule here extends, and `CompoundExpression`, which runs the shunting-yard algorithm combining them.
 * - One rule per file, each registering itself on `expressions` (`expressions.parser.ts`) as it loads.
 *   The base classes, `SpellExpression` and the two operator suffixes, register nothing themselves.
 * - NOTE: the rule files are listed in TIE-BREAK order:  when two rules match the same words with the same
 *   `priority` and length, the one registered first wins.  Moving a line here can change what parses.
 */
export * from "./expressions.parser"
export * from "./expressions.shared"
export * from "./SpellExpression"
export * from "./Negatable"
export * from "./InfixOperatorSuffix"
export * from "./PostfixOperatorSuffix"
export * from "./ParenthesizedExpression"
export * from "./CompoundExpression"
export * from "./ArithmeticExpression"
export * from "./And"
export * from "./Or"
export * from "./IsEqual"
export * from "./IsExactly"
export * from "./IsA"
export * from "./IsSameTypeAs"
export * from "./IsIn"
export * from "./Includes"
export * from "./DoesNotInclude"
export * from "./IsDefined"
export * from "./Exists"
export * from "./ThereIsA"
export * from "./IsEmpty"
export * from "./AsUppercase"
export * from "./AsLowercase"
export * from "./AsAType"
