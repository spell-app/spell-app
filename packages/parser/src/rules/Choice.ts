import { itemsWithHighest } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/** Turn on debugging of choice / priority semantics. */
const DEBUG_CHOICES = false

/**
 * Alternative syntax, matching one of a number of different rules.
 * The result of a parse is the longest rule that actually matched.
 *
 * - NOTE: Currently takes the longest valid match.
 * - TODO: match all valid choices
 *
 * After parsing we'll return the rule which is the "best match" (rather than cloning this rule).
 */
export class Choice<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<ChoiceProps, Groups, MatchData> {
  /** List of rules, any of which will match. */
  declare rules: P.Rule[]

  /** Copy `props.rules` into a new array (defaulting to `[]`) so callers can't mutate our list from outside. */
  constructor(props: ChoiceProps) {
    super(props)
    // NOTE: set after `super()` rather than on `props`, which may be someone else's object (see `clone()`).
    // No `props.rules` => keep what `super()` built from `syntax`, e.g. `(is|is not|isn't|isnt)`.
    const rules = props.rules ?? this.rules
    this.rules = Array.isArray(rules) ? [...rules] : []
  }

  /**
   * Return a copy with its own `rules` list, so `addChoice()` on the copy leaves us alone.
   * - Only `Choice` / `Group` are ever cloned (by `Parser.mergeRule()`) -- other rules are immutable and shared.
   * - NOTE: choices themselves are shared, not copied.
   */
  clone(): this {
    const constructor = this.constructor as new (props: ChoiceProps) => this
    // HOT: every `parser.clone()` (so every new scope) clones every group -- keep this cheap.
    // Own props (`rules`, `matchGroup`, `name`...) go straight through;  constructor copies `rules`.
    return new constructor(this as unknown as ChoiceProps)
  }

  /** Always throws -- a `Choice` has no output of its own, use `match.groups` / the winning sub-match instead. */
  compile(match: P.MatchFor<this>) {
    throw new TypeError(`Choice.compile() is not implemented`)
  }

  /**
   * Add one or more `rules` to the list of choices.
   * `parser` is the parser instance that's calling this.
   */
  addChoice(_parser: P.Parser, ...rules: P.Rule[]) {
    this.rules = [...this.rules, ...rules]
  }

  /**
   * Return `true` if ANY of our rules is found.
   * - If ANY rules return `undefined`, this will return `undefined`.
   * - If ALL rules return `false`, this will return `false`.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (start >= tokens.length) return false
    let undefinedFound = false
    for (let i = 0, rule; (rule = this.rules[i]); i++) {
      const result = rule.test(scope, tokens, start)
      if (result) return true
      if (result === undefined) undefinedFound = true
    }
    if (undefinedFound) return undefined
    return false
  }

  /** Winning choice's match replaces ours:  named by our `matchGroup`, else whatever that choice contributes. */
  getGroupSpecContribution(): P.GroupSpecEntry[] {
    if (this.matchGroup) return super.getGroupSpecContribution()
    const entries = P.mergeGroupSpecs(...this.rules.map((rule) => rule.getGroupSpecContribution()))
    return this.optional ? entries.map((entry) => ({ ...entry, optional: true })) : entries
  }

  /** Find all rules which match and delegate to `getBestMatch()` to pick the best one. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const CHOICE = `choice '${this.name || this.matchGroup}:'`
    if (DEBUG_CHOICES) console.group(`${CHOICE} start matching '${P.Tokenizer.join(tokens)}'`, this)

    // In expecting mode (see `P.Expectations`):  out of tokens, we're what comes next.  Else note what each
    // alternative records, so what only extends a complete alternative can be marked as such.
    const expecting = P.Expectations.current
    if (expecting && !tokens.length) expecting.expect(this)
    // NOTE: only allocated when expecting:  `Choice.parse()` is too hot for an array per call
    const alternatives: Array<{ from: number; to: number; complete: boolean }> | undefined = expecting ? [] : undefined

    // Try to match each rule in turn.
    // For efficiency, complicated rules (e.g. sequences or recursive rules)
    //  should exit quickly via their own `test()`, see `Sequence.parse()`.
    const matches: P.Match[] = []
    for (let i = 0, rule; (rule = this.rules[i++]);) {
      if (DEBUG_CHOICES) console.group("parsing rule", rule.name)
      const from = expecting ? expecting.records.length : 0
      const match = rule.parse(scope, tokens)
      if (match) matches.push(match)
      if (expecting) {
        alternatives!.push({ from, to: expecting.records.length, complete: match?.length === tokens.length })
      }
      if (DEBUG_CHOICES) console.groupEnd()
    }
    if (expecting) expecting.endChoice(alternatives!)

    let match: P.Match | undefined = matches[0]
    if (DEBUG_CHOICES) {
      if (matches.length === 0) {
        console.debug(`${CHOICE} nothing matched`)
      } else if (matches.length === 1) {
        console.debug(`${CHOICE} got 1 match`, match)
      } else {
        console.debug(`${CHOICE} matched:`)
        matches.forEach((nextMatch, index) => {
          console.debug(`   #${index}: (len: ${nextMatch.length}, priority: ${nextMatch.rule.priority}): `, match)
        })
      }
    }
    match = matches.length > 1 ? this.getBestMatch(matches) : matches[0]
    if (DEBUG_CHOICES) console.debug(`${CHOICE} returning:`, match)
    if (DEBUG_CHOICES) console.groupEnd()
    if (!match) return undefined

    // assign special properties to the result
    match.choiceRule = this.matchGroup || this.name
    if (this.matchGroup) match.matchGroup = this.matchGroup
    return match
  }

  /**
   * Return the "best" match given more than one matches at the head of the tokens.
   * - First we find the match(es) with the highest `priority`.
   * - Then we take the one with the longest matched string.
   * - If more than one rule with same length, takes the EARLIEST one -- so in a `(a|b)` choice, `a` wins a tie,
   *   and in a `Group` of same-named rules the FIRST-registered wins.  Pinned by `Rule.test.ts`.
   * - NOTE: both loops below were commented as preferring LATER rules;  they never did -- see agents/SUSPECTED-BUGS.md.
   */
  getBestMatch(matches: P.Match[]) {
    if (matches.length === 1) return matches[0]

    // rules with the highest priority, in `matches` order (earliest first)
    const highPriority = itemsWithHighest(matches, (it) => it.rule.priority)

    if (highPriority.length === 1) return highPriority[0]

    // Longest wins;  scanning backwards with `>=` means an equally-long EARLIER match replaces a later one,
    // so ties end up on the earliest.
    let match
    let longest
    for (let i = highPriority.length; (match = highPriority[--i]);) {
      if (!longest || match.length >= longest.length) longest = match
    }
    return longest
  }

  /**
   * Return rulex string for this rule:  `(rule1|rule2|...)`, with flags applied.
   * - A plain choice of words among the choices prints flat, as written:  `(=|is|of)`, not `(=|(is|of))`.
   */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    const rules = this.rules.map((rule) => Choice.choiceSyntax(rule)).join("|")
    return `(${matchGroup}${rules})${optional}`
  }

  /** `rule` as one of our choices:  a plain word choice (`Keyword(["is", "of"])`) without its parens. */
  private static choiceSyntax(rule: P.Rule) {
    const flat =
      rule instanceof P.Literal &&
      Array.isArray(rule.literal) &&
      !rule.matchGroup &&
      !rule.optional &&
      !rule.caseInsensitive
    return flat ? (rule.literal as string[]).join("|") : rule.toRulexSyntax()
  }
}

/** Props bag accepted by `Choice`'s constructor. */
export type ChoiceProps = Prettify<
  P.RuleProps & {
    /** List of rules, any of which will match. */
    rules: P.Rule[]
  }
>

/**
 * Alias for `Choice` used to merge choices together
 * when implicitly combining multiple rules under the same name.
 *
 * This lets us distinguish between:
 *  - actually defining a semantically-meaning "choices", and
 *  - smooshing rules together because they share the same name.
 */
export class Group<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Choice<Groups, MatchData> {}
