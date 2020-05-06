import { Match } from "~/parser"
import { Rule } from "."

// Regex pattern to match a SINGLE token.
// - `pattern` is the regular expression to match.
//    - Note that you MUST start your pattern with `^` and end with `$` to make sure it matches the entire token.
//    - Note that this can only match a single token!
// - (optional) `blacklist` is a map of `{ key: true }` for strings which will NOT be accepted.
// - (optional) `mapValue` (optional) is a `function(value) => newValue` used to transform the matched value.
export class Pattern extends Rule {
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
    const raw = tokens[0].value // raw value, used by subclasses
    const value = this.mapValue(raw) // possibly normalized value, used by subclasses
    return new Match({
      rule: this,
      matched: [tokens[0]],
      raw,
      value,
      input: [tokens[0]],
      length: 1,
      scope
    })
  }

  /** Map `value` from the matched expression to corresponding JS value. */
  mapValue(value) {
    if (this.VALUE_MAP && value in this.VALUE_MAP) return this.VALUE_MAP[value]
    return value
  }

  compile(match) {
    return match.value
  }
}
