import flattenDeep from "lodash/flattenDeep"

import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Sequence of rules to match, in order.
 * - `rule.rules` is the array of rules to match.
 * - `test()` checks our own words / symbols before `parse()` goes near a subrule -- see "Quick testing" below.
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

  /**
   * Match each rule in `this.rules` in order against `tokens`, bailing unless every non-optional rule matches.
   * - In expecting mode (see `P.Expectations`):
   *   - out of tokens before a child, records it -- and each optional one after it, up to the first we can't
   *     do without
   *   - failing on a child after one ran out of tokens INSIDE it, records that one as `within`:  we're partway
   *     through it, e.g. an argument of a method call being typed -- for signature help
   *   - children parse one level deeper
   * - A required word failing right after a `{slot}` may make the slot GIVE BACK what it took -- see `giveBack()`.
   * - NOTE: HOT -- normal parsing reads `P.Expectations.current` once, and only after `test()` passes.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (this.test(scope, tokens) === false) return undefined
    return this.parseFrom(scope, tokens, 0, 0, [])
  }

  /**
   * Match our `rules` from the `index`th on, at `start` of `tokens`, after `matched`.
   * - The body of `parse()`, a method of its own so `giveBack()` can resume it.
   */
  private parseFrom(
    scope: P.Scope,
    tokens: P.Token[],
    index: number,
    start: number,
    matched: P.Match[]
  ): P.Match | undefined {
    const expecting = P.Expectations.current
    // expecting only:  index of the last child which ran out of tokens inside itself
    let within = -1

    let remainingTokens = start ? tokens.slice(start) : tokens
    for (let i = index, rule; (rule = this.rules[i++]);) {
      // If we're out of tokens, bail if rule is not optional
      if (remainingTokens.length === 0) {
        if (expecting) expecting.expect(rule, this, i - 1)
        if (rule.optional) continue
        return expecting ? undefined : this.giveBack(scope, tokens, i - 1, start, matched)
      }
      let match: P.Match | undefined
      // spaced wrong for the syntax:  no match, without even trying
      if (!P.spacingAllows(tokens[start - 1], rule.spacing)) {
        match = undefined
      } else if (expecting) {
        const from = expecting.records.length
        match = expecting.nested(() => rule.parse(scope, remainingTokens))
        if (expecting.records.length > from) within = i - 1
      } else {
        match = rule.parse(scope, remainingTokens)
      }
      if (!match) {
        if (rule.optional) continue
        if (expecting && within >= 0) expecting.expect(this.rules[within]!, this, within, false, true)
        return expecting ? undefined : this.giveBack(scope, tokens, i - 1, start, matched)
      }

      matched.push(match)
      start += match.length
      remainingTokens = remainingTokens.slice(match.length)
    }
    // if we get here, we matched all the rules!
    const usedTokens = tokens.slice(0, start)
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
   * Our `index`th rule, a required word, failed right after a `{slot}` -- maybe because the slot took it,
   * e.g. `of` in `remove the card of the pile` for `remove {thisArg:expression} of {callArgs:expression}`.
   * - Re-parse the slot on tokens ending just before each place the word is, LAST first, and go on from there.
   * - Only on the way to failing:  whatever parsed before still parses the same.
   * - Only a required `{slot}` straight before a required word -- so `matched`'s last match is the slot's.
   * - NEVER in expecting mode (`parseFrom()` doesn't call us):
   *   a cut-short slot would record that it ran out of tokens, and completion would offer what can't come next.
   */
  private giveBack(
    scope: P.Scope,
    tokens: P.Token[],
    index: number,
    start: number,
    matched: P.Match[]
  ): P.Match | undefined {
    const word = this.rules[index]!
    const slot = this.rules[index - 1]
    const taken = matched.at(-1)
    if (!taken || !slot || slot.optional || !(slot instanceof P.Subrule) || !this.isWord(word)) return undefined
    const slotStart = start - taken.length
    for (let cut = taken.length - 1; cut > 0; cut--) {
      if (!word.test(scope, tokens, slotStart + cut)) continue
      const shorter = slot.parse(scope, tokens.slice(slotStart, slotStart + cut))
      if (shorter?.length !== cut) continue
      const rest = this.parseFrom(scope, tokens, index, slotStart + cut, [...matched.slice(0, -1), shorter])
      if (rest) return rest
    }
    return undefined
  }

  /** Is `rule` a required word or words matched literally, e.g. `of`, `(in|of)`, `does not`?  See `giveBack()`. */
  protected isWord(rule: P.Rule): boolean {
    return !rule.optional && (rule instanceof P.Literal || rule instanceof P.Literals)
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

  /**
   * Echo this rule back out as rulex syntax, spaced as written (`P.joinRulex()`), wrapping in parens only when
   * `matchGroup` or `optional` need it.
   */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    const rules = P.joinRulex(this.rules)
    if (optional || matchGroup) return `(${matchGroup}${rules})${optional}`
    return `${rules}${optional}`
  }

  ////////////////
  // ## Quick testing
  ////////////////

  /**
   * Could we match at `start` of `tokens`?  Checks our own words / symbols BEFORE `parse()` tries any subrule,
   * e.g. `{expression}`, which is what's expensive.
   * - Word, symbol, pattern or token type => checked where it must be.
   * - Choice => each alternative.  Optional => with and without.
   * - Anything else, e.g. subrule => skips 1+ tokens, so what follows is searched for later on,
   *   e.g. `the? {arg} (in|of) {list} where` ~== `the? … (in|of) … where`.
   * - Tracks EVERY place we could be up to, so never rejects a real match, e.g. `x is y is z if w`
   *   for `{thing} is {value} if {condition}` -- the `is` which works isn't the first one.
   * - NOTE: can still say `true` for a non-match, as it can't know where a subrule actually ends.
   * - In expecting mode (see `P.Expectations`), running out of tokens is NOT a mismatch:  the rest may not be
   *   typed yet.  Words that ARE there still have to fit.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0): boolean | undefined {
    if (start >= tokens.length) return false
    allowRunOut = P.Expectations.current !== undefined
    return testPlacesAfterRules(this.rules, scope, tokens, [{ start, skipped: false }]).length > 0
  }
}

/** Props bag accepted by `Sequence`'s constructor. */
export type SequenceProps = Prettify<
  P.RuleProps & {
    /** The array of rules to match, in order. */
    rules: P.Rule[]
  }
>

////////////////
// ## Quick testing helpers -- see `Sequence.test()`
////////////////

/**
 * Where a quick test could be up to in `tokens`.
 * - `start` ~== where next rule starts...
 * - `skipped` ~== ...or anywhere from there on, as we just skipped a subrule.
 */
type TestPlace = { start: number; skipped: boolean }

/**
 * Expecting mode (see `P.Expectations`), for the walk under way:  a rule with no tokens left to test could
 * still match, e.g. the rest isn't typed yet.  Set by `Sequence.test()`.
 * - NOTE: a module flag, NOT an argument threaded through the helpers below:  `test()` is the hottest path
 *   in parsing, and the argument alone cost ~2% of a whole parse.
 */
let allowRunOut = false

/** Places we could be after testing `rules`, in order, starting from any of `places`.  Empty => no match. */
function testPlacesAfterRules(rules: P.Rule[], scope: P.Scope, tokens: P.Token[], places: TestPlace[]): TestPlace[] {
  for (const rule of rules) {
    if (!places.length) break
    places = testPlacesAfterRule(rule, scope, tokens, places)
  }
  return places
}

/** Places we could be after testing `rule`, starting from any of `places`.  Empty => no match. */
function testPlacesAfterRule(rule: P.Rule, scope: P.Scope, tokens: P.Token[], places: TestPlace[]): TestPlace[] {
  let after: TestPlace[]
  if (rule instanceof Sequence) {
    after = testPlacesAfterRules(rule.rules, scope, tokens, places)
  } else if (rule instanceof P.Choice && rule.rules.length) {
    after = rule.rules.flatMap((alternative) => testPlacesAfterRule(alternative, scope, tokens, places))
  } else if (rule instanceof P.Literals) {
    after = places
    for (const { literal, optional } of rule.literals) {
      const matched = testPlacesAfterToken((index) => !!tokens[index]?.matchesLiteral(literal), tokens, after)
      after = optional ? [...after, ...matched] : matched
    }
  } else if (rule instanceof P.Literal || rule instanceof P.Pattern || rule instanceof P.TokenType) {
    after = testPlacesAfterToken((index) => rule.test(scope, tokens, index) !== false, tokens, places)
  } else {
    // Can't test cheaply, e.g. a subrule:  skip 1+ tokens.
    after = places.map(({ start }) => ({ start: start + 1, skipped: true }))
    if (allowRunOut) after = runOutPlaces(places, after, tokens)
  }
  if (rule.optional) after = [...places, ...after]
  return pruneTestPlaces(after, tokens)
}

/** Places just after a single token which passes `test`, starting from any of `places`. */
function testPlacesAfterToken(test: (index: number) => boolean, tokens: P.Token[], places: TestPlace[]): TestPlace[] {
  const after: TestPlace[] = []
  for (const { start, skipped } of places) {
    const last = skipped ? tokens.length - 1 : start
    for (let index = start; index <= last; index++) {
      if (test(index)) after.push({ start: index + 1, skipped: false })
    }
  }
  return allowRunOut ? runOutPlaces(places, after, tokens) : after
}

/**
 * `allowRunOut` only:  `after`, plus the end of `tokens` if any of `places` is there already,
 * or could be, after a skipped subrule -- what's next may not be typed yet.
 */
function runOutPlaces(places: TestPlace[], after: TestPlace[], tokens: P.Token[]): TestPlace[] {
  if (!places.some(({ start, skipped }) => skipped || start >= tokens.length)) return after
  return [...after, { start: tokens.length, skipped: false }]
}

/**
 * Drop duplicate / redundant `places`, and any past the end of `tokens`.
 * - A `skipped` place covers every place at or after it, so we keep at most one.
 */
function pruneTestPlaces(places: TestPlace[], tokens: P.Token[]): TestPlace[] {
  let skippedFrom = tokens.length + 1
  for (const { start, skipped } of places) {
    if (skipped && start < skippedFrom) skippedFrom = start
  }
  const pruned: TestPlace[] = []
  const seen = new Set<number>()
  for (const place of places) {
    if (place.start > tokens.length || place.start >= skippedFrom || seen.has(place.start)) continue
    seen.add(place.start)
    pruned.push(place)
  }
  if (skippedFrom <= tokens.length) pruned.push({ start: skippedFrom, skipped: true })
  return pruned
}
