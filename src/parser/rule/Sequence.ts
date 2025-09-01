//  # Parser Rules
//  Rules can be as simple as a string `Keyword` or a complex sequence of (nested) rules.
//
//  Parse a rule with `rule.parse(scope, tokens)`.
//  If UNSUCCESSFUL, it will return `undefined`
//  If SUCCESSFUL,   it will return a new `Match()` object which is guaranteed to have:
//    - `match.rule`        : pointer back to the rule.
//    - `match.matched`     : array of *significant* tokens that were actually matched.
//    - `match.length` : number of tokens actually consumed (`matched` may not contain them all)
//    ... and other rule-specific values.
//
//  The match returned can be manipulated with:
//    - `match.compile()`    Return javascript source to interpret the rule.
//
import flattenDeep from "lodash/flattenDeep"

import { Prettify } from "~/global_types.js"
import { Match } from "~/parser/Match.js"
import { Rule, RuleProps, Scope } from "./Rule.js"
import { Token } from "../tokenizer/Tokens.js"

export type SequenceProps = Prettify<
  RuleProps & {
    rules: Rule[]
  }
>

// Sequence of rules to match.
//  `rule.rules` is the array of rules to match.
//  `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
export class Sequence extends Rule<SequenceProps> {
  /** The array of rules to match. */
  declare rules: Rule[]
  /** Separtor string for base compile() rule which just joins the `matched` outputs. */
  declare compileSeparator: string

  static {
    Object.defineProperty(this.prototype, "compileSeparator", { value: " ", writable: true })
  }

  constructor(...args: [SequenceProps] | Rule[]) {
    if (args.length > 1) super({ rules: args as Rule[] })
    else if (Array.isArray(args[0])) super({ rules: args[0] })
    else super(args[0] as SequenceProps)

    if (!this.rules) {
      throw new TypeError(`Sequence '${this.name}' created without specifying 'rules'!`)
    }
  }

  parse(scope: Scope, tokens: Token[]) {
    if (this.test(scope, tokens) === false) return undefined

    const matched = []
    let length = 0

    let remainingTokens = tokens
    for (let i = 0, rule; (rule = this.rules[i++]); ) {
      // If we're out of tokens, bail if rule is not optional
      if (remainingTokens.length === 0) {
        // eslint-disable-next-line no-continue
        if (rule.optional) continue
        return undefined
      }
      const match = rule.parse(scope, remainingTokens)
      if (!match) {
        // eslint-disable-next-line no-continue
        if (rule.optional) continue
        return undefined
      }

      matched.push(match)
      length += match.length
      remainingTokens = remainingTokens.slice(match.length)
    }
    // if we get here, we matched all the rules!
    const usedTokens = tokens.slice(0, length)
    return new Match({
      rule: this,
      matched,
      // TODOC: WHY??  FOR USE AS A LITERAL STRING??
      value: usedTokens.join("").trim(),
      input: flattenDeep(matched.map((next) => next.input)),
      length,
      scope
    })
  }

  /**
   * Best we can do generically for sequences is join the `matched` outputs.
   * Implement in your subclass if you want something else.
   */
  compile(match: Match) {
    return match.matched
      .filter((it) => it instanceof Match)
      .map((next) => next.compile())
      .join(this.compileSeparator)
  }

  getGroupsForMatch(match: Match) {
    // Sequences add child matches to their groups, ignoring the "outer" match.
    return match.addMatchedToGroups({}, match.matched)
  }

  // Echo this rule back out.
  toRulexSyntax() {
    const { argument, optional } = this.getRulexFlags()
    const rules = this.rules.map((rule) => rule.toRulexSyntax()).join(" ")
    if (optional || argument) return `(${argument}${rules})${optional}`
    return `${rules}${optional}`
  }
}
