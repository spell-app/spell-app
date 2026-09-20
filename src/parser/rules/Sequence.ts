import flattenDeep from "lodash/flattenDeep"

import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Sequence of rules to match, in order.
 * - `rule.rules` is the array of rules to match.
 * - `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
 */
export class Sequence extends Rule<SequenceProps> {
  /** The array of rules to match. */
  declare rules: P.Rule[]
  /** Separtor string for base compile() rule which just joins the `matched` outputs. */
  declare compileSeparator: string

  static {
    Object.defineProperty(this.prototype, "compileSeparator", { value: " ", writable: true })
  }

  /**
   * Accepts `props`, a bare array of `rules`, or `rules` spread as individual arguments.
   * - Throws if no `rules` end up set.
   */
  constructor(...args: [SequenceProps] | [P.Rule[]] | P.Rule[]) {
    if (args.length > 1) super({ rules: args as P.Rule[] })
    else if (Array.isArray(args[0])) super({ rules: args[0] })
    else super(args[0] as SequenceProps)

    if (!this.rules) {
      throw new TypeError(`Sequence '${this.name}' created without specifying 'rules'!`)
    }
  }

  /** Match each rule in `this.rules` in order against `tokens`, bailing unless every non-optional rule matches. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (this.test(scope, tokens) === false) return undefined

    const matched = []
    let length = 0

    let remainingTokens = tokens
    for (let i = 0, rule; (rule = this.rules[i++]);) {
      // If we're out of tokens, bail if rule is not optional
      if (remainingTokens.length === 0) {
        if (rule.optional) continue
        return undefined
      }
      const match = rule.parse(scope, remainingTokens)
      if (!match) {
        if (rule.optional) continue
        return undefined
      }

      matched.push(match)
      length += match.length
      remainingTokens = remainingTokens.slice(match.length)
    }
    // if we get here, we matched all the rules!
    const usedTokens = tokens.slice(0, length)
    return new P.Match({
      rule: this,
      matched,
      // TODOC: WHY??  FOR USE AS A LITERAL STRING??
      value: usedTokens.join("").trim(),
      tokens: flattenDeep(matched.map((next) => next.tokens)),
      scope
    })
  }

  /**
   * Best we can do generically for sequences is join the `matched` outputs.
   * Implement in your subclass if you want something else.
   */
  compile(match: P.Match): unknown {
    return match.matched
      .filter((it) => it instanceof P.Match)
      .map((next) => next.compile())
      .join(this.compileSeparator)
  }

  /** Sequences add child matches to their groups, ignoring the "outer" match. */
  getGroupsForMatch(match: P.Match): Record<string, unknown> {
    return match.addMatchedToGroups<P.MatchGroups>({}, match.matched)
  }

  /** Echo this rule back out as rulex syntax, wrapping in parens only when `argument` or `optional` need it. */
  toRulexSyntax() {
    const { argument, optional } = this.getRulexFlags()
    const rules = this.rules.map((rule) => rule.toRulexSyntax()).join(" ")
    if (optional || argument) return `(${argument}${rules})${optional}`
    return `${rules}${optional}`
  }
}

/** Props bag accepted by `Sequence`'s constructor. */
export type SequenceProps = Prettify<
  P.RuleProps & {
    /** The array of rules to match, in order. */
    rules: P.Rule[]
  }
>
