//  # Parser Rules
//  Rules can be as simple as a string `Keyword` or a complex sequence of (nested) rules.
//
//  Parse a rule with `rule.parse(scope, tokens)`.
//  If UNSUCCESSFUL, it will return `undefined`
//  If SUCCESSFUL,   it will return a new `Match()` object which is guaranteed to have:
//    - `match.rule`        : pointer back to the rule.
//    - `match.matched`     : array of *significant* tokens that were actually matched.
//    - `match.length` : number of tokens actually consumed (`matched` may not contain them all)
//    ... and other rule-specific values.
//
//  The match returned can be manipulated with:
//    - `match.compile()`    Return javascript source to interpret the rule.
//
import flattenDeep from "lodash/flattenDeep"

import { Rule } from "."
import { Match } from ".."

// Sequence of rules to match.
//  `rule.rules` is the array of rules to match.
//  `rule.testRule` is a QUICK rule to test if there's any way the sequence can match.
Rule.Sequence = class sequence extends Rule {
  constructor(...args) {
    let [props] = args
    if (arguments.length > 1) props = { rules: args }
    if (Array.isArray(props)) props = { rules: props }
    if (!props.rules) throw new TypeError(`Sequence '${props.name}' created without specifying 'rules'!`)
    super(props)
  }

  parse(scope, tokens) {
    if (this.test(scope, tokens) === false) return undefined

    const matched = []
    let length = 0

    let remainingTokens = tokens
    for (let i = 0, rule; (rule = this.rules[i++]); ) {
      // If we're out of tokens, bail if rule is not optional
      if (remainingTokens.length === 0) {
        // eslint-disable-next-line no-continue
        if (rule.optional) continue
        return undefined
      }
      const match = rule.parse(scope, remainingTokens)
      if (!match) {
        // eslint-disable-next-line no-continue
        if (rule.optional) continue
        return undefined
      }

      matched.push(match)
      length += match.length
      remainingTokens = remainingTokens.slice(match.length)
    }
    // if we get here, we matched all the rules!
    const usedTokens = tokens.slice(0, length)
    return new Match({
      rule: this,
      matched,
      // tokens: usedTokens,
      // TODOC: WHY??  FOR USE AS A LITERAL STRING??
      value: usedTokens.join("").trim(),
      input: flattenDeep(matched.map(next => next.input)),
      length,
      scope
    })
  }

  // If no explcit compile method, gather our groups and return the compiled output of each.
  // TODO: ... ??
  compile(match) {
    return this._addGroups({}, match.matched, nextMatch => nextMatch.compile())
  }

  gatherGroups(match) {
    return this._addGroups({}, match.matched)
  }

  _addGroups(results, matched, callback) {
    for (let i = 0, match; (match = matched[i]); i++) {
      const { name, rule } = match
      // if the match has a name:
      if (name) {
        const value = callback ? callback(match) : match
        // If arg already exists, convert to an array
        if (name in results) {
          if (!Array.isArray(results[name])) {
            results[name] = [results[name]]
          }
          results[name].push(value)
        } else {
          results[name] = value
        }
      }
      // if it's an anonymous sequence, promote it to the main map
      if (!name && rule instanceof Rule.Sequence) {
        this._addGroups(results, match.matched, callback)
      }
      // ignore other anonymous bits
      // else {}
    }
    return results
  }

  // Echo this rule back out.
  toSyntax() {
    const { argument, optional } = this.getSyntaxFlags()
    const rules = this.rules.map(rule => rule.toSyntax()).join(" ")
    if (optional || argument) return `(${argument}${rules})${optional}`
    return `${rules}${optional}`
  }
}
