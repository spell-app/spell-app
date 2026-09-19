import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"

// Parser error representation in parser output.
export class ParseError extends P.Rule {
  // Eat all of the tokens.
  parse(scope: P.Scope, tokens: P.Token[]): P.Match {
    return new P.Match({
      scope,
      rule: this,
      matched: tokens,
      tokens: [...tokens]
    })
  }

  compile(match: P.AnyMatch): unknown {
    // `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly,
    // but `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
    return match.AST?.compile()
  }

  getAST(match: P.Match): AST.ParseError {
    return new AST.ParseError(match, {
      value: match.message || `Don't understand "${match.inputText}"`
    })
  }
}
SpellParser.Rules.ParseError = ParseError
