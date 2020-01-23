import Rule from "./Rule"
import { Match } from "../all"

// Regex pattern to match a SINGLE token.
// - `pattern` is the regular expression to match.
//    - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
//    - Note that this can only match a single token!
// - (optional) `blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
// - (optional) `mapValue` (optional) is a `function(value) => newValue` used to transform the matched value.
Rule.Pattern = class pattern extends Rule {
  constructor(props) {
    if (props instanceof RegExp) props = { pattern: props }
    super(props)
    // convert blacklist to a map if necessary
    if (Array.isArray(this.blacklist)) {
      this.blacklist = this.blacklist.reduce((map, key) => {
        map[key] = true
        return map
      }, {})
    }
  }

  testAtStart(scope, tokens, start = 0) {
    if (start >= tokens.length) return false
    return tokens[start].matchesPattern(this.pattern, this.blacklist)
  }

  parse(scope, tokens) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new Match({
      rule: this,
      matched: [tokens[0]],
      raw: tokens[0].value, // raw value, used by subclasses
      length: 1,
      scope
    })
  }

  compile(scope, match) {
    return this.getTokenValue(scope, match)
  }

  getTokenValue(scope, match) {
    const { value } = match.matched[0]
    return this.mapValue(value)
  }

  /** Map `value` from the matched expression to corresponding JS value. */
  mapValue(value) {
    if (this.VALUE_MAP && Object.prototype.hasOwnProperty.call(this.VALUE_MAP, value)) {
      return this.VALUE_MAP[value]
    }
    return value
  }
}
