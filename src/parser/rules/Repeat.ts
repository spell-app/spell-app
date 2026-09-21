import flattenDeep from "lodash/flattenDeep"

import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Repeating rule.  Returns `undefined` if we don't match at least once.
 * - `repeat.rule` is pointer to the rule that repeats.
 * - `repeat.delimiter` (optional) if provided, we'll look for one of these
 *    between each instance of `rule`.
 *    - The delimiter at the end is optional.
 *    - Note that the delimiters are NOT added to the `matched` array.
 * - `repeat.minCount` (optional) is the minimum number we need to match successfully.
 * - `repeat.maxCount` (optional) is the maximum number we need to match successfully.
 *
 * In the resulting match
 * - `match.items` will be just he `rule` matches, ignoring delimiters,
 * - `match.matched` will include delimiters.
 */
export class Repeat<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<RepeatProps, Groups, MatchData> {
  /** The rule that repeats. */
  declare rule: P.Rule
  /** The delimiter between each instance of the rule. */
  declare delimiter: P.Rule
  /** The minimum number of times the rule must match. */
  declare minCount: number
  /** The maximum number of times the rule must match. */
  declare maxCount: number

  /** Pass a bare `Rule` to repeat it with no delimiter / min / max, or a full `RepeatProps` bag. */
  constructor(props: RepeatProps | P.Rule) {
    super(props instanceof Rule ? { rule: props } : props)
  }

  /** Greedily match `this.rule` (optionally separated by `this.delimiter`) as many times as possible. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (this.testAtStart(scope, tokens, 0) === false) return undefined

    // everything that was matched
    const matched = []
    // items only
    const items = []
    let length = 0

    let remainingTokens = tokens
    while (remainingTokens.length) {
      const match = this.rule.parse(scope, remainingTokens)
      if (!match) break
      matched.push(match)
      items.push(match)
      length += match.length
      remainingTokens = remainingTokens.slice(match.length)

      if (this.delimiter) {
        // get delimiter, exiting if not found
        const delimiter = this.delimiter.parse(scope, remainingTokens)
        if (!delimiter) break
        matched.push(delimiter)
        length += delimiter.length
        remainingTokens = remainingTokens.slice(delimiter.length)
      }
    }

    // Forget it if nothing matched at all
    if (matched.length === 0) return undefined
    if (typeof this.minCount === "number" && matched.length < this.minCount) return undefined
    if (typeof this.maxCount === "number" && matched.length > this.maxCount) return undefined

    const match = new P.Match({
      rule: this,
      matched,
      items,
      tokens: flattenDeep(matched.map((next) => next.tokens)),
      scope
    })
    if (this.matchGroup) match.matchGroup = this.matchGroup
    return match
  }

  /** Returns an array by default; subclasses (e.g. rulex `sequence`) may return other things. */
  compile(match: P.MatchFor<this>): unknown {
    return match.items.map((next) => next.compile())
  }

  /**
   * Return rulex string for this rule.
   * - `rule+` / `rule*` normally, or `[rule delimiter]` (optionally suffixed `?`) when `delimiter` is set.
   */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    const repeatSymbol = this.optional ? "*" : "+"

    // don't double-up on parens
    let rule = this.rule.toRulexSyntax()
    if (this.delimiter) {
      const delimiter = this.delimiter.toRulexSyntax()
      return `[${matchGroup}${rule}${delimiter}]${optional}`
    }

    const wrapInParens =
      matchGroup ||
      this.rule instanceof P.Sequence ||
      (this.rule instanceof P.Literals && this.rule.literals.length > 1)

    if (wrapInParens && rule.startsWith("(") && rule.endsWith(")")) rule = rule.slice(1, -1)

    if (wrapInParens) return `(${matchGroup}${rule})${repeatSymbol}`
    return `${rule}${repeatSymbol}`
  }
}

/** Props bag accepted by `Repeat`'s constructor. */
export type RepeatProps = Prettify<
  P.RuleProps & {
    /** The rule that repeats. */
    rule: P.Rule
    /** Delimiter to look for between each instance of `rule`; the trailing delimiter is optional. */
    delimiter?: P.Rule
    /** Minimum number of times `rule` must match. */
    minCount?: number
    /** Maximum number of times `rule` must match. */
    maxCount?: number
  }
>
