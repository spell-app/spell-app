import Rule from "./Rule"
import { Match } from "../all"

// Recursively find balanced instances of `start` and `end`,
// then split by `delimiter` and apply `rule` to each, returning an array of matches.
// If you provide a `prefix`, we'll look for that after `start`.
//
// `start` (required) is the start token string
// `end` (required) is the end token string
// `rule` (required) is the middle bit, which is probably a sequence
// `delimiter` (optional) if provided, we'll split on this string and apply `rule` to each item inside
// `prefix` (optional) optional array of rules to match inside the FIRST item
//
// If nested start/end blocks are found, WHAT WILL HAPPEN???
Rule.NestedSplit = class nestedSplit extends Rule {
  parse(scope, tokens) {
    const end = this.findNestedEnd(scope, tokens)
    if (end === undefined) return undefined

    const tokenSets = this.splitTokens(scope, tokens.slice(1, end))
    if (tokenSets === undefined) return undefined

    let prefix
    const items = []
    for (let i = 0, tokenSet; (tokenSet = tokenSets[i]); i++) {
      // For the first item only, match the `prefix` rules if supplied
      if (i === 0 && this.prefix) {
        prefix = this.prefix.parse(scope, tokenSet)
        if (!prefix && !prefix.optional) return undefined
        if (prefix) tokenSet = tokenSet.slice(prefix.length)
      }
      const match = this.rule.parse(scope, tokenSet)
      if (!match) return undefined

      if (match.length !== tokenSet.length) {
        return undefined
      }
      items.push(match)
    }
    const matched = tokens.slice(0, end + 1)
    return new Match({
      rule: this,
      prefix,
      items,
      matched,
      input: matched,
      length: end + 1,
      scope
    })
  }

  // Return `results` for someone else to consume.
  compile(match) {
    const { rule, prefix, items } = match
    const results = (prefix && prefix.compile()) || {}
    const name = rule.rule.argument || rule.rule.name
    results[name] = items.map(item => item.compile())
    return results
  }

  // If tokens starts with our `start` literal,
  //  find the index of the token which matches our `end` literal.
  // Returns `undefined` if not found or not balanced.
  findNestedEnd(scope, tokens, start = 0) {
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
  splitTokens(scope, tokens) {
    const items = []
    let current = []
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
