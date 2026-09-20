import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"

/**
 * Fallback rule matched (via `scope.parser.parse(tokens, "parse_error", scope)`) over tokens that no other
 * rule could make sense of -- always "succeeds" so callers such as `BlockLine`/`Block`/`JSX` can keep an
 * un-parseable chunk of input as an inline error node instead of aborting the whole parse.
 * - `SpellParser.createParseError()` builds one directly (with a custom `message`) rather than parsing.
 */
export class ParseError extends P.Rule {
  /** Eat all of `tokens` unconditionally -- never fails. */
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

  /** Build the `AST.ParseError` node, using `match.message` if set, else a generic "don't understand" message. */
  getAST(match: P.Match): AST.ParseError {
    return new AST.ParseError(match, {
      value: match.message || `Don't understand "${match.inputText}"`
    })
  }
}
SpellParser.Rules.ParseError = ParseError
