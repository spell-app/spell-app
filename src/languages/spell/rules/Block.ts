import { P } from "~/parser"

/**
 * `Block`s are generally the root entity that we parse in spell -- a top-level construct, e.g. used to
 * parse an entire file.
 * - Composed of `block_lines` and nested `blocks`, and correspond roughly to a `Scope`
 *   (see `parser/scope/Scope`).
 */
/**
 * What `block` and `line` rules stash on their matches.
 * - Shared by `Block` and `BlockLine` because errors bubble up through both.
 */
export type BlockMatchData = {
  /** Parse errors found while parsing this block / line, including those from nested blocks. */
  errors?: P.Match[]
  /** Set on a `block` match by `SpellStatement.parseNestedBlock()` so it compiles wrapped in `{}`. */
  enclose?: boolean
}

/**
 * Parse errors collected on a `block` or `line` match, if any.
 * - Use where you can't narrow with `match.is()`, e.g. `Block` can't import `BlockLine` without a cycle.
 */
export function getParseErrors(match: P.Match): P.Match[] | undefined {
  return (match as P.Match<P.MatchGroups, BlockMatchData>).data.errors
}

export class Block extends P.Rule<P.RuleProps, never, BlockMatchData> {
  /**
   * Recurse into nested `BlockToken`s, parsing each `LineToken` as `"line"` (via `BlockLine`).
   * - SIDE EFFECT: `console.warn`s (rather than throwing) on unproductive items, then skips past them --
   *   parsing tries to make progress through the whole file even when individual lines are broken.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!tokens.length) return undefined
    if (tokens.length !== 1) console.warn(`Block.parse(): unexpectedly got ${tokens.length} tokens:`, tokens)

    const block = tokens[0]!
    if (!(block instanceof P.BlockToken)) {
      console.warn("parseBlock: got non-block", block)
      return undefined
    }

    // build up matches for individual items
    const matched: P.Match[] = []
    const errors: P.Match[] = []
    const items: (P.LineToken | P.BlockToken)[] = [...block.tokens]
    while (items.length) {
      let match: P.Match | undefined
      const first = items[0]!
      // recurse for nested block
      if (first instanceof P.BlockToken) {
        match = this.parse(scope, [first])
      }
      // process Line as "line" -- a statement with optional comment, etc.
      else if (first instanceof P.LineToken) {
        // NOTE: `Scope.parse()` is typed for string input only; call `parser.parse()` directly
        // (exactly what `Scope.parse()` would do internally) so we can pass tokens instead.
        match = scope.parser?.parse(items, "line", scope)
      } else {
        console.warn("Block.parse(): Don't know what to do with token", first)
      }

      if (match) {
        matched.push(match)
        // Bubble up errors from the line / nested block.
        errors.push(...(getParseErrors(match) ?? []))
        // pop the matched items off of the list
        items.splice(0, match.length)
      } else {
        console.warn("Block.parse(): Got unproductive item", items[0])
        items.shift()
      }
    }
    // Forget it if we didn't match anything
    if (matched.length === 0) return undefined

    const result: P.MatchFor<this> = new P.Match({
      rule: this,
      matched,
      scope,
      tokens: [block]
    })
    if (errors.length) result.data.errors = errors
    return result
  }

  /**
   * `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly, but
   * `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
   */
  compile(match: P.MatchFor<this>): unknown {
    return match.AST?.compile()
  }

  /** Build `P.ASTStatementBlock` (wrapped in `{}`) if `match.enclose`, else a plain `P.ASTStatementGroup`. */
  getAST(match: P.MatchFor<this>): P.ASTStatementBlock | P.ASTStatementGroup {
    // `Block.parse()` only ever pushes `Match`es (never raw `Token`s) onto `matched`,
    // and each of those is itself a `line`/nested `block` match whose rule always
    // implements `getAST()` returning a statement-shaped node -- not staticaly representable.
    const statements = match.matched
      .filter((item): item is P.Match => item instanceof P.Match)
      .map((item) => item.AST) as Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine>
    if (match.data.enclose) return new P.ASTStatementBlock(match, { statements })
    return new P.ASTStatementGroup(match, { statements })
  }
}
