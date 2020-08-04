import { Match, Rule } from "~/parser"
import { SpellParser, AST } from "~/languages/spell"

// Parser error representation in parser output.
export const ParseError = class parse_error extends Rule {
  // Eat all of the tokens.
  parse(scope, tokens) {
    return new Match({
      scope,
      rule: this,
      matched: tokens,
      input: [...tokens],
      length: tokens.length
    })
  }

  getAST(match) {
    return new AST.ParseError(match, {
      value: match.message || `Don't understand "${match.inputText}"`
    })
  }
}
SpellParser.Rule.ParseError = ParseError

/** Add `spellParser.createParseError()` method. */
Object.defineProperty(SpellParser.prototype, "createParseError", {
  value(scope, tokens, message) {
    const rule = this.getRuleOrDie("parse_error")
    return new Match({
      scope,
      rule,
      matched: tokens,
      input: [...tokens],
      length: tokens.length,
      message
    })
  }
})
