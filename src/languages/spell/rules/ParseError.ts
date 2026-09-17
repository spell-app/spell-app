import { Match, Rule } from "~/parser"
import type { AnyMatch } from "~/parser/Match"
import type { Scope } from "~/parser/scope/Scope"
import type { Token } from "~/parser/tokenizer/Tokens"
import { SpellParser, AST } from "~/languages/spell"

// Parser error representation in parser output.
export class ParseError extends Rule {
  // Eat all of the tokens.
  parse(scope: Scope, tokens: Token[]): Match {
    return new Match({
      scope,
      rule: this,
      matched: tokens,
      tokens: [...tokens]
    })
  }

  compile(match: AnyMatch): unknown {
    // `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly,
    // but `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
    return match.AST?.compile()
  }

  getAST(match: Match): AST.ParseError {
    return new AST.ParseError(match, {
      value: match.message || `Don't understand "${match.inputText}"`
    })
  }
}
SpellParser.Rules.ParseError = ParseError
