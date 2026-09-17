
import { Tokenizer } from "~/parser/tokenizer/Tokenizer"
import { Token } from "~/parser/tokenizer/Tokens"
import { Rule, type RuleProps } from "./Rule"
import type { Scope } from "~/parser/scope/Scope"
import { Match } from "~/parser/Match"
import type { Parser } from "~/parser/Parser"

// Turn on debugging of choice / precedence semantics
const DEBUG_CHOICES = false

export type ChoiceProps = Prettify<
  RuleProps & {
    rules: Rule[]
  }
>

/**
 * Alternative syntax, matching one of a number of different rules.
 * The result of a parse is the longest rule that actually matched.
 *
 * - NOTE: Currently takes the longest valid match.
 * - TODO: match all valid choices
 *
 * After parsing we'll return the rule which is the "best match" (rather than cloning this rule).
 */
export class Choice extends Rule<ChoiceProps> {
  /** List of rules, any of which will match. */
  declare rules: Rule[]

  constructor(props: ChoiceProps) {
    props.rules = Array.isArray(props.rules) ? [...props.rules] : []
    super(props)
  }

  compile(match: Match) {
    throw new TypeError(`Choice.compile() is not implemented`)
    return ""
  }

  /**
   * Add one or more `rules` to the list of choices.
   * `parser` is the parser instance that's calling this.
   */
  addChoice(_parser: Parser, ...rules: Rule[]) {
    this.rules = [...this.rules, ...rules]
  }

  // Return (`true` or index) if ANY of our rules is found.
  // If ANY rules return `undefined`, this will return `undefined`.
  // If ALL rules return `false`, this will return `false`.
  testAtStart(scope: Scope, tokens: Token[], start = 0) {
    if (start >= tokens.length) return false
    let undefinedFound = false
    for (let i = 0, rule; (rule = this.rules[i]); i++) {
      const result = rule.testAtStart(scope, tokens, start)
      if (result) return true
      if (result === undefined) undefinedFound = true
    }
    if (undefinedFound) return undefined
    return false
  }

  // Find all rules which match and delegate to `getBestMatch()` to pick the best one.
  parse(scope: Scope, tokens: Token[]) {
    const CHOICE = `choice '${this.name || this.argument}:'`
    if (DEBUG_CHOICES) console.group(`${CHOICE} start matching '${Tokenizer.join(tokens)}'`, this)

    // Try to match each rule in turn.
    // For efficiency, complicated rules (e.g. sequences or recursive rules)
    //  should exit quickly via a `testRule` or similar mechanism.
    const matches: Match[] = []
    for (let i = 0, rule; (rule = this.rules[i++]); ) {
      if (DEBUG_CHOICES) console.group("parsing rule", rule.name)
      const match = rule.parse(scope, tokens)
      if (match) matches.push(match)
      if (DEBUG_CHOICES) console.groupEnd()
    }

    let match: Match | undefined = matches[0]
    if (DEBUG_CHOICES) {
      if (matches.length === 0) {
        console.debug(`${CHOICE} nothing matched`)
      } else if (matches.length === 1) {
        console.debug(`${CHOICE} got 1 match`, match)
      } else {
        console.debug(`${CHOICE} matched:`)
        matches.forEach((nextMatch, index) => {
          console.debug(`   #${index}: (len: ${nextMatch.length}, prec: ${nextMatch.rule.precedence}): `, match)
        })
      }
    }
    match = matches.length > 1 ? this.getBestMatch(matches) : matches[0]
    if (DEBUG_CHOICES) console.debug(`${CHOICE} returning:`, match)
    if (DEBUG_CHOICES) console.groupEnd()
    if (!match) return undefined

    // assign special properties to the result
    match.choiceRule = this.argument || this.name
    if (this.argument) match.argument = this.argument
    return match
  }

  // Return the "best" match given more than one matches at the head of the tokens.
  // First we find the match(es) with the highest preceedence.
  // Then we take the one with the longest matched string.
  // If more than one rule with same length, takes LATEST one.
  getBestMatch(matches: Match[]) {
    if (matches.length === 1) return matches[0]

    // Filter to rules with highest precedence.
    // NOTE: we run this BACKWARDS to put later-defined rules first
    let match
    let highPriority: Match[] = []
    for (let max = -Infinity, i = 0; (match = matches[i++]); ) {
      const { precedence } = match.rule
      if (precedence > max) {
        max = precedence
        highPriority = [match]
      } else if (precedence === max) {
        highPriority.push(match)
      }
    }

    if (highPriority.length === 1) return highPriority[0]

    // Return the longest rule (???)
    let longest
    for (let i = highPriority.length; (match = highPriority[--i]); ) {
      if (!longest || match.length >= longest.length) longest = match
    }
    return longest
  }

  toRulexSyntax() {
    const { testLocation, argument, optional } = this.getRulexFlags()
    const rules = this.rules.map((rule) => rule.toRulexSyntax()).join("|")
    return `${testLocation}(${argument}${rules})${optional}`
  }
}

/**
 * Alias for `Choice` used to merge choices together
 * when implicitly combining multiple rules under the same name.
 *
 * This lets us distinguish between:
 *  - actually defining a semantically-meaning "choices", and
 *  - smooshing rules together because they share the same name.
 */
export class Group extends Choice {}
