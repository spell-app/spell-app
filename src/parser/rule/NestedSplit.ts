import { Prettify } from "~/types"
import { Match, type MatchGroups } from "~/parser/Match"
import { RuleProps } from "~/parser/rule/Rule"
import type { Scope } from "~/parser/scope/Scope"
import { Token } from "~/parser/tokenizer/Tokens"
import { Rule } from "./Rule"

export type NestedSplitProps = Prettify<
  RuleProps & {
    start: Rule
    prefix?: Rule
    item: Rule
    delimiter: Rule
    end: Rule
  }
>

/** `match.groups` for a `NestedSplit` match: the split `items` plus the optional `prefix` match. */
export type NestedSplitGroups = MatchGroups & {
  items: Match[]
  prefix?: Match
}

/**
 * Recursively find balanced instances of `start` and `end` rule,
 * then split by `delimiter` and apply `rule` to each,
 * returning an array of the `rule` matches.
 *
 * - `start` (required) is the start rule.
 * - `prefix` (optional) rule to look for immediately after `start`.
 *    If provied and non-optional, we won't match if prefix is not found.
 * - `item` (required) is the middle rule which is matched repeatedly inside start/end.
 * - `delimiter` (required) used to split the middle bit into `items`.
 * - `end` (required) is the end rule.
 *
 * Use `match.groups` to work with the resulting match:
 * - `prefix` will be the prefix match, if any.
 * - `items` will be the instances of `rule` which were matched.
 */
export class NestedSplit extends Rule<NestedSplitProps> {
  /** Start rule, e.g. `Symbol("(")`. */
  declare start: Rule
  /** Optional rule to match inside the FIRST item, e.g. right after the. */
  declare prefix: Rule
  /** Middle-bit to match inside start/end, probably a sequence or subrule. */
  declare item: Rule
  /** Optional delimiter to split on, e.g. `Symbol("|")`. */
  declare delimiter: Rule
  /** End rule, e.g. `Symbol(")")`. */
  declare end: Rule

  parse(scope: Scope, tokens: Token[]) {
    const end = this.findNestedEnd(scope, tokens)
    if (end === undefined) return undefined

    const tokenSets = this.splitTokens(scope, tokens.slice(1, end))
    if (tokenSets === undefined) return undefined

    let prefixMatch: Match | undefined
    // everything that we matched, including prefix
    const matched: Match[] = []
    // split items only
    const items: Match[] = []
    if (this.prefix) {
      const firstTokenSet = tokenSets[0]!
      prefixMatch = this.prefix.parse(scope, firstTokenSet)
      if (!prefixMatch && !this.prefix.optional) return undefined
      if (prefixMatch) {
        // remove prefix tokens from the first token set
        tokenSets[0] = firstTokenSet.slice(prefixMatch.length)
        matched.push(prefixMatch)
      }
    }
    for (let i = 0, tokenSet; (tokenSet = tokenSets[i]); i++) {
      const match = this.item.parse(scope, tokenSet)
      // forget it if we didn't match the whole token set
      if (!match || match.length !== tokenSet.length) return undefined
      items.push(match)
      matched.push(match)
    }
    if (!matched.length) return undefined

    const tokens_used = tokens.slice(0, end + 1)
    return new Match({
      rule: this,
      items, // the items we matched
      matched, // optional prefix + items matched
      tokens: tokens_used,
      scope
    })
  }
  getGroupsForMatch(match: Match): NestedSplitGroups {
    const groups = super.getGroupsForMatch(match) as NestedSplitGroups
    const { items, matched } = match
    const prefix = matched[0]
    if (items.length !== matched.length && prefix instanceof Match) groups.prefix = prefix
    groups.items = items
    return groups
  }

  /** Don't use `nestedSplit.compile()` -- use `match.groups` instead. */
  compile(match: Match) {
    throw new TypeError("don't use nestedSplit.compile() -- check `match.groups` instead.")
    return ""
  }

  // If tokens starts with our `start` literal,
  //  find the index of the token which matches our `end` literal.
  // Returns `undefined` if not found or not balanced.
  findNestedEnd(scope: Scope, tokens: Token[], start = 0) {
    if (!this.start.testAtStart(scope, tokens, start)) return undefined
    let nesting = 0
    for (let end = start + 1, last = tokens.length; end < last; end++) {
      if (this.start.testAtStart(scope, tokens, end)) {
        nesting++
      }
      if (this.end.testAtStart(scope, tokens, end)) {
        if (nesting === 0) return end
        nesting--
      }
    }
    return undefined
  }

  // If tokens starts with our `start` literal,
  //  find the index of the token which matches our `end` literal.
  // Returns `undefined` if not found or not balanced.
  splitTokens(scope: Scope, tokens: Token[]) {
    const items = []
    let current: Token[] = []
    for (let i = 0, token; (token = tokens[i]); i++) {
      // handle alternate marker
      if (this.delimiter.testAtStart(scope, tokens, i)) {
        items.push(current)
        current = []
        // eslint-disable-next-line no-continue
        continue
      }
      // handle nested start/emd
      if (this.start.testAtStart(scope, tokens, i)) {
        const end = this.findNestedEnd(scope, tokens, i)
        if (end) {
          current = current.concat(tokens.slice(i, end + 1))
          i = end
          // eslint-disable-next-line no-continue
          continue
        }
      }
      current.push(token)
    }
    // Pick up the last list ONLY if it's not empty
    // This ensures we don't pick up an empty list for a delimiter at the end.
    if (current.length) items.push(current)

    if (!items.length) return undefined
    return items
  }
}
