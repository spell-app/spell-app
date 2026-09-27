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
  /** On a `line` match:  its statement, if one parsed -- see `BlockLine.reparseBody()`. */
  statement?: P.Match
  /** On a `line` match with a nested body:  where that body's errors start in `errors`. */
  bodyErrorsAt?: number
  /** On a `line` match with a nested body:  journal mark just before the body was parsed, if journaled. */
  bodyMark?: P.JournalMark
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
    const items: (P.LineToken | P.BlockToken)[] = [...block.tokens]
    while (items.length) {
      // a nested block, or a line plus any indented body it takes -- see `SpellParser.parseItem()`
      const match = scope.parser?.parseItem(scope, items)
      if (match) {
        matched.push(match)
        // pop the matched items off of the list
        items.splice(0, match.length)
      } else {
        console.warn("Block.parse(): Got unproductive item", items[0])
        items.shift()
      }
    }
    return this.assembleBlock(scope, block, matched)
  }

  /**
   * Build the match for `block` once its items are parsed, collecting their parse errors into `data.errors`.
   * - `matched` is one match per item:  a line (with any body it took), or a nested block.
   * - Returns `undefined` if no items matched.
   * - `parse()` ends with this, and so does an incremental re-parse -- see `SpellParser.assembleFile()`.
   */
  assembleBlock(scope: P.Scope, block: P.BlockToken, matched: P.Match[]): P.MatchFor<this> | undefined {
    if (matched.length === 0) return undefined
    const result: P.MatchFor<this> = new P.Match({
      rule: this,
      matched,
      scope,
      tokens: [block]
    })
    const errors = matched.flatMap((match) => getParseErrors(match) ?? [])
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
