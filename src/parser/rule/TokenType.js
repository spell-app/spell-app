import Rule from "./Rule"
import { Match } from "../all"

// Abstract rule for matching tokens of a particular type (Token constructor)
Rule.TokenType = class tokenType extends Rule {
  testAtStart(scope, tokens, start = 0) {
    return tokens[start] instanceof this.tokenType
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
}
