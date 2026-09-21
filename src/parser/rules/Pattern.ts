import { P } from "~/parser"
// Import directly to avoid circular import
import { Rule } from "./Rule"

/**
 * Regex pattern to match a SINGLE token.
 * - `pattern` is the regular expression to match.
 *    - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
 *    - Note that this can only match a single token!
 * - (optional) `blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
 * - (optional) `mapValue` (optional) is a `function(value) => newValue` used to transform the matched value.
 */
export class Pattern<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends Rule<PatternProps, Groups, MatchData> {
  /**
   * Regular expression to match.
   * - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
   */
  declare pattern: RegExp
  /** Map of `{ matched: compiled }` to return `compiled` value for `matched` string. */
  declare VALUE_MAP: Record<string, any>
  /** Map of `{ key: true }` for strings which will NOT be accepted. */
  declare blacklist: P.IdentifierBlacklist | undefined

  /** Class-level `pattern` / `VALUE_MAP` / `blacklist`, for rules defined as classes -- declare as `@proto static`. */
  static pattern?: RegExp
  static VALUE_MAP?: Record<string, unknown>
  static blacklist?: P.IdentifierBlacklist | string[]

  /** Normalizes a bare `RegExp` into `{ pattern }`, and converts array `blacklist` into a lookup map. */
  constructor(props: PatternProps) {
    if (props instanceof RegExp) props = { pattern: props }
    // convert blacklist to a map if necessary
    if (Array.isArray(props.blacklist)) {
      props.blacklist = props.blacklist.reduce((map, key) => {
        map[key] = true
        return map
      }, {} as P.IdentifierBlacklist)
    }
    super(props)
    // Class-level (`@proto static`) blacklist may be an array too -- normalize ONCE, onto the prototype it came from.
    if (Array.isArray(this.blacklist)) normalizeProtoBlacklist(this)
  }

  /** `true` if token at `start` matches `this.pattern` and isn't in `this.blacklist`. */
  testAtStart(scope: P.Scope, tokens: P.Token[], start = 0) {
    if (start >= tokens.length) return false
    return tokens[start].matchesPattern(this.pattern, this.blacklist)
  }

  /** Match a single token against `this.pattern`, running its value through `mapValue()`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    const raw = tokens[0].value // raw value, used by subclasses
    const value = this.mapValue(raw) // possibly normalized value, used by subclasses
    return new P.Match({
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

  /** Output is just the (possibly mapped) `match.value`. */
  compile(match: P.MatchFor<this>) {
    return match.value
  }
}

/** Props bag accepted by `Pattern`'s constructor. */
export type PatternProps = Prettify<
  P.RuleProps & {
    /** Regular expression to match -- MUST start with `^` and end with `$`. */
    pattern?: RegExp
    /** Map of `{ matched: compiled }` to return `compiled` value for `matched` string. */
    VALUE_MAP?: Record<string, any>
    /** Map (or array) of strings which will NOT be accepted. */
    blacklist?: P.IdentifierBlacklist | string[]
  }
>

/** Convert array `blacklist` found on `rule`'s prototype chain into a lookup map, in place. */
function normalizeProtoBlacklist(rule: Pattern) {
  let proto = Object.getPrototypeOf(rule)
  while (proto && !Object.hasOwn(proto, "blacklist")) proto = Object.getPrototypeOf(proto)
  if (!proto) return
  const map: P.IdentifierBlacklist = {}
  for (const key of proto.blacklist as string[]) map[key] = true
  proto.blacklist = map
}
