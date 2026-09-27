import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/** `match.groups` for a `NestedSplit` match: the split `items` plus the optional `prefix` match. */
export type NestedSplitGroups = P.MatchGroups & {
  items: P.Match[]
  prefix?: P.Match
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
export class NestedSplit<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<NestedSplitProps, Groups, MatchData> {
  /** Start rule, e.g. `Symbol("(")`. */
  declare start: P.Rule
  /** Optional rule to match inside the FIRST item, e.g. right after `start`. */
  declare prefix: P.Rule
  /** Middle-bit to match inside start/end, probably a sequence or subrule. */
  declare item: P.Rule
  /** Delimiter to split on, e.g. `Symbol("|")`. */
  declare delimiter: P.Rule
  /** End rule, e.g. `Symbol(")")`. */
  declare end: P.Rule

  /** Find balanced `start`/`end` span, split its contents on `delimiter`, then match `item` against each piece. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const end = this.findNestedEnd(scope, tokens)
    if (end === undefined) return undefined

    const tokenSets = this.splitTokens(scope, tokens.slice(1, end))
    if (tokenSets === undefined) return undefined

    let prefixMatch: P.Match | undefined
    // everything that we matched, including prefix
    const matched: P.Match[] = []
    // split items only
    const items: P.Match[] = []
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
    return new P.Match({
      rule: this,
      items, // the items we matched
      matched, // optional prefix + items matched
      tokens: tokens_used,
      scope
    })
  }
  /** Add `groups.items` (the split `item` matches) and `groups.prefix` (if a `prefix` rule matched). */
  getGroupsForMatch(match: P.MatchFor<this>): NestedSplitGroups {
    const groups = super.getGroupsForMatch(match) as NestedSplitGroups
    const { items, matched } = match
    const prefix = matched[0]
    if (items.length !== matched.length && prefix instanceof P.Match) groups.prefix = prefix
    groups.items = items
    return groups
  }

  /** Don't use `nestedSplit.compile()` -- use `match.groups` instead. */
  compile(match: P.MatchFor<this>) {
    throw new TypeError("don't use nestedSplit.compile() -- check `match.groups` instead.")
  }

  /**
   * If tokens starts with our `start` literal, find index of token which matches our `end` literal.
   * - Returns `undefined` if not found or not balanced.
   */
  findNestedEnd(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (!this.start.test(scope, tokens, start)) return undefined
    let nesting = 0
    for (let end = start + 1, last = tokens.length; end < last; end++) {
      if (this.start.test(scope, tokens, end)) {
        nesting++
      }
      if (this.end.test(scope, tokens, end)) {
        if (nesting === 0) return end
        nesting--
      }
    }
    return undefined
  }

  /**
   * Split `tokens` on `delimiter`, treating balanced `start`/`end` spans as opaque (not split on delimiters inside).
   * - Returns `undefined` if nothing was produced.
   */
  splitTokens(scope: P.Scope, tokens: P.Token[]) {
    const items = []
    let current: P.Token[] = []
    for (let i = 0, token; (token = tokens[i]); i++) {
      // handle alternate marker
      if (this.delimiter.test(scope, tokens, i)) {
        items.push(current)
        current = []

        continue
      }
      // handle nested start/emd
      if (this.start.test(scope, tokens, i)) {
        const end = this.findNestedEnd(scope, tokens, i)
        if (end) {
          current = current.concat(tokens.slice(i, end + 1))
          i = end

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

/** Props bag accepted by `NestedSplit`'s constructor. */
export type NestedSplitProps = Prettify<
  P.RuleProps & {
    /** Start rule, e.g. `Symbol("(")`. */
    start: P.Rule
    /** Optional rule to match inside the FIRST item, e.g. right after `start`. */
    prefix?: P.Rule
    /** Middle-bit to match inside start/end, probably a sequence or subrule. */
    item: P.Rule
    /** Delimiter to split on, e.g. `Symbol("|")`. */
    delimiter: P.Rule
    /** End rule, e.g. `Symbol(")")`. */
    end: P.Rule
  }
>
