import { Match, Rule } from "./all"

// Abstract rule to match a single literal value.
// `rule.literal` is either:
//    - string to match, or
//    - array of strings, any of which will work.
//
// NOTE: Don't use this -- use `Rule.Keyword` or `Rule.Literal` instead!
Rule.Literal = class literal extends Rule {
  constructor(props) {
    if (Array.isArray(props)) props = { literal: props }
    if (typeof props === "string") props = { literal: props }
    super(props)
  }

  testAtStart(scope, tokens, start = 0) {
    if (start >= tokens.length) return false
    return tokens[start].matchesLiteral(this.literal)
  }

  parse(scope, tokens) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new Match({
      rule: this,
      matched: [tokens[0]],
      length: 1,
      scope
    })
  }

  compile(scope, match) {
    return match.tokens[0]
  }

  toSyntax() {
    const { testLocation, argument, optional } = this.getSyntaxFlags()
    const isVariable = Array.isArray(this.literal)
    const literal = isVariable ? this.literal.join("|") : this.isEscaped ? `\\${this.literal}` : this.literal

    const wrapInParens = isVariable || argument || (this.isEscaped && optional)
    if (wrapInParens) return `${testLocation}(${argument}${literal})${optional}`
    return `${testLocation}${literal}${optional}`
  }
}

// Syntactic sugar for composing rules.
Rule.Keyword = class keyword extends Rule.Literal {}
Rule.Symbol = class symbol extends Rule.Literal {}
