import { Match } from "~/parser"
import { Rule } from "."

// Abstract rule for matching tokens of a particular type (Token constructor)
export class TokenType extends Rule {
  testAtStart(scope, tokens, start = 0) {
    return tokens[start] instanceof this.tokenType
  }

  parse(scope, tokens) {
    if (!this.testAtStart(scope, tokens, 0)) return undefined
    return new Match({
      rule: this,
      matched: [tokens[0]],
      raw: tokens[0].raw,
      value: tokens[0].value,
      input: [tokens[0]],
      length: 1,
      scope
    })
  }

  compile(match) {
    return match.value
  }
}
