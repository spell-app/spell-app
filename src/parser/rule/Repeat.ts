import flattenDeep from "lodash/flattenDeep"

import { Prettify } from "~/global_types.js"
import { Rule, type RuleProps, type Scope } from "./Rule.js"
import { Token } from "~/parser/tokenizer/Tokens.js"
import { Rules } from "./index.js"
import { Match } from "~/parser/Match.js"

export type RepeatProps = Prettify<
  RuleProps & {
    rule: Rule
    delimiter?: Rule
    minCount?: number
    maxCount?: number
  }
>

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
export class Repeat extends Rule<RepeatProps> {
  /** The rule that repeats. */
  declare rule: Rule
  /** The delimiter between each instance of the rule. */
  declare delimiter: Rule
  /** The minimum number of times the rule must match. */
  declare minCount: number
  /** The maximum number of times the rule must match. */
  declare maxCount: number

  constructor(props: RepeatProps) {
    if (props instanceof Rule) props = { rule: props }
    super(props)
  }

  parse(scope: Scope, tokens: Token[]) {
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

    const match = new Match({
      rule: this,
      matched,
      items,
      input: flattenDeep(matched.map((next) => next.input)),
      length,
      scope
    })
    if (this.argument) match.argument = this.argument
    return match
  }

  compile(match: Match) {
    return match.items.map((next) => next.compile())
  }

  toRulexSyntax() {
    const { argument, optional } = this.getRulexFlags()
    const repeatSymbol = this.optional ? "*" : "+"

    // don't double-up on parens
    let rule = this.rule.toRulexSyntax()
    if (this.delimiter) {
      const delimiter = this.delimiter.toRulexSyntax()
      return `[${argument}${rule}${delimiter}]${optional}`
    }

    const wrapInParens =
      argument ||
      this.rule instanceof Rules.Sequence ||
      (this.rule instanceof Rules.Literals && this.rule.literals.length > 1)

    if (wrapInParens && rule.startsWith("(") && rule.endsWith(")")) rule = rule.slice(1, -1)

    if (wrapInParens) return `(${argument}${rule})${repeatSymbol}`
    return `${rule}${repeatSymbol}`
  }
}
