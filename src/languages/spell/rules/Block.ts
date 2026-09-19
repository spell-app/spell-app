import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import "./match-fields.A"

// `Blocks` are generally the root entity that we parse in spell.
//  This is a top-level construct, e.g. used to parse an entire file.
//
//  They are composed of `block_lines` and nested `blocks`,
//  and correspond roughly to a `Scope` (see `parser/scope/Scope`).
export class Block extends P.Rule {
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!tokens.length) return undefined
    if (tokens.length !== 1) console.warn(`Block.parse(): unexpectedly got ${tokens.length} tokens:`, tokens)

    const block = tokens[0]!
    if (!(block instanceof P.Tokens.Block)) {
      console.warn("parseBlock: got non-block", block)
      return undefined
    }

    // build up matches for individual items
    const matched: P.Match[] = []
    const errors: P.Match[] = []
    const items: (P.Tokens.Line | P.Tokens.Block)[] = [...block.tokens]
    while (items.length) {
      let match: P.Match | undefined
      const first = items[0]!
      // recurse for nested block
      if (first instanceof P.Tokens.Block) {
        match = this.parse(scope, [first])
      }
      // process Line as "line" -- a statement with optional comment, etc.
      else if (first instanceof P.Tokens.Line) {
        // NOTE: `Scope.parse()` is typed for string input only; call `parser.parse()` directly
        // (exactly what `Scope.parse()` would do internally) so we can pass tokens instead.
        match = scope.parser?.parse(items, "line", scope)
      } else {
        console.warn("Block.parse(): Don't know what to do with token", first)
      }

      if (match) {
        matched.push(match)
        if (match.errors) errors.push(...match.errors)
        // pop the matched items off of the list
        items.splice(0, match.length)
      } else {
        console.warn("Block.parse(): Got unproductive item", items[0])
        items.shift()
      }
    }
    // Forget it if we didn't match anything
    if (matched.length === 0) return undefined

    const result = new P.Match({
      rule: this,
      matched,
      scope,
      tokens: [block]
    })
    // `errors` is an ad-hoc field (see `match-fields.a.ts`), not part of `MatchProps`.
    if (errors.length) result.errors = errors
    return result
  }

  compile(match: P.AnyMatch): unknown {
    // `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly,
    // but `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
    return match.AST?.compile()
  }

  getAST(match: P.Match): AST.StatementBlock | AST.StatementGroup {
    // `Block.parse()` only ever pushes `Match`es (never raw `Token`s) onto `matched`,
    // and each of those is itself a `line`/nested `block` match whose rule always
    // implements `getAST()` returning a statement-shaped node -- not staticaly representable.
    const statements = match.matched
      .filter((item): item is P.Match => item instanceof P.Match)
      .map((item) => item.AST) as Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine>
    if (match.enclose) return new AST.StatementBlock(match, { statements })
    return new AST.StatementGroup(match, { statements })
  }
}
SpellParser.Rules.Block = Block
