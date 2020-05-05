import { Match, Rule, SpellParser, Tokenizer, AST } from ".."

// Parser error representation in parser output.
SpellParser.Rule.ParseError = class parse_error extends Rule {
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
      message: `UNABLE TO PARSE: "${Tokenizer.join(match.matched)}"`
    })
  }
}
