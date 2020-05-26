import { proto } from "~/util"
import { Match } from "~/parser"
import { Rule } from "."

// Abstract rule to match a single literal value.
// `rule.literal` is either:
//    - string to match, or
//    - array of strings, any of which will work.
//
// NOTE: Don't use this -- use `Rule.Keyword` or `Rule.Literal` instead!
export class Literal extends Rule {
  @proto name = "Literal"
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
      value: tokens[0].value,
      input: [tokens[0]],
      length: 1,
      scope
    })
  }

  compile(match) {
    return match.value
  }

  toSyntax() {
    const { testLocation, argument, optional } = this.getSyntaxFlags()
    const isVariable = Array.isArray(this.literal)
    let literalString = this.literal
    if (isVariable) literalString = this.literal.join("|")
    else if (this.isEscaped) literalString = `\\${this.literal}`

    const wrapInParens = isVariable || argument || (this.isEscaped && optional)
    if (wrapInParens) return `${testLocation}(${argument}${literalString})${optional}`
    return `${testLocation}${literalString}${optional}`
  }
}

// Syntactic sugar for composing rules.
export class Keyword extends Literal {
  @proto name = "Keyword"
}
export class Symbol extends Literal {
  @proto name = "Symbol"
}
