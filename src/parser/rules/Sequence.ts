import flattenDeep from "lodash/flattenDeep"

import { proto } from "~/util/decorators"
import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Sequence of rules to match, in order.
 * - `rule.rules` is the array of rules to match.
 * - `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
 */
export class Sequence<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<SequenceProps, Groups, MatchData> {
  /** The array of rules to match. */
  declare rules: P.Rule[]
  /** Separtor string for base compile() rule which just joins the `matched` outputs. */
  declare compileSeparator: string
  /** Class-level default for `compileSeparator`. */
  @proto static compileSeparator = " "

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
  compile(match: P.MatchFor<this>): unknown {
    return match.matched
      .filter((it) => it instanceof P.Match)
      .map((next) => next.compile())
      .join(this.compileSeparator)
  }

  /** Sequences add child matches to their groups, ignoring the "outer" match. */
  getGroupsForMatch(match: P.MatchFor<this>): Record<string, unknown> {
    return match.addMatchedToGroups<P.MatchGroups>({}, match.matched)
  }

  /** Whatever our child `rules` contribute, one after another. */
  getGroupSpecEntries(): P.GroupSpecEntry[] {
    return P.concatGroupSpecs(...this.rules.map((rule) => rule.getGroupSpecContribution()))
  }

  /** Anonymous sequence is promoted into containing rule's groups -- all optional if we are. */
  getGroupSpecContribution(): P.GroupSpecEntry[] {
    if (this.matchGroup || this.name) return super.getGroupSpecContribution()
    const entries = this.getGroupSpecEntries()
    return this.optional ? entries.map((entry) => ({ ...entry, optional: true })) : entries
  }

  /** Echo this rule back out as rulex syntax, wrapping in parens only when `matchGroup` or `optional` need it. */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    const rules = this.rules.map((rule) => rule.toRulexSyntax()).join(" ")
    if (optional || matchGroup) return `(${matchGroup}${rules})${optional}`
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
