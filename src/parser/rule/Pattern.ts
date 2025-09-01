import { Match } from "~/parser/Match.js"
import { Rule, type RuleProps, type Scope } from "./Rule.js"
import { Token } from "~/parser/tokenizer/Tokens.js"
import { Prettify } from "~/global_types.js"
import { IdentifierBlacklist } from "~/parser/types.js"

export type PatternProps = Prettify<
  RuleProps & {
    pattern?: RegExp
    VALUE_MAP?: Record<string, any>
    blacklist?: IdentifierBlacklist
  }
>

/**
 * Regex pattern to match a SINGLE token.
 * - `pattern` is the regular expression to match.
 *    - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
 *    - Note that this can only match a single token!
 * - (optional) `blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
 * - (optional) `mapValue` (optional) is a `function(value) => newValue` used to transform the matched value.
 */
export class Pattern extends Rule<PatternProps> {
  /**
   * Regular expression to match.
   * - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
   */
  declare pattern: RegExp
  /** Map of `{ matched: compiled }` to return `compiled` value for `matched` string. */
  declare VALUE_MAP: Record<string, any>
  /** Map of `{ key: true }` for strings which will NOT be accepted. */
  declare blacklist: IdentifierBlacklist | undefined

  constructor(props: PatternProps) {
    if (props instanceof RegExp) props = { pattern: props }
    // convert blacklist to a map if necessary
    if (Array.isArray(props.blacklist)) {
      props.blacklist = props.blacklist.reduce((map, key) => {
        map[key] = true
        return map
      }, {} as IdentifierBlacklist)
    }
    super(props)
  }

  testAtStart(scope: Scope, tokens: Token[], start = 0) {
    if (start >= tokens.length) return false
    return tokens[start].matchesPattern(this.pattern, this.blacklist)
  }

  parse(scope: Scope, tokens: Token[]) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    const raw = tokens[0].value // raw value, used by subclasses
    const value = this.mapValue(raw) // possibly normalized value, used by subclasses
    return new Match({
      rule: this,
      matched: [tokens[0]],
      raw,
      value,
      tokens: [tokens[0]],
      scope
    })
  }

  /** Map `value` from the matched expression to corresponding JS value. */
  mapValue<T = string>(value: string): T {
    if (this.VALUE_MAP && value in this.VALUE_MAP) return this.VALUE_MAP[value]
    return value as T
  }

  compile(match: Match) {
    return match.value
  }
}
