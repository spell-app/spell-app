import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * `Block`s are generally the root entity that we parse in spell -- a top-level construct, e.g. used to
 * parse an entire file.
 * - Composed of `block_lines` and nested `blocks`, and correspond roughly to a `Scope`
 *   (see `parser/scope/Scope`).
 */

export class Block extends P.Rule<P.RuleProps, never, BlockMatchData> {
  /** Registered as `block` -- class name isn't rule case. */
  static ruleName = "block"

  /**
   * Parse errors collected on a `block` or `line` match, if any.
   * - Static, for a match you can't narrow with `match.is()`, e.g. `Block` can't import `BlockLine` without a cycle.
   */
  static getParseErrors(match: P.Match): P.Match[] | undefined {
    return (match as P.Match<P.MatchGroups, BlockMatchData>).data.errors
  }

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
    const errors = matched.flatMap((match) => Block.getParseErrors(match) ?? [])
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

  /**
   * Build `P.ASTStatementBlock` (wrapped in `{}`) if `match.enclose`, else a plain `P.ASTStatementGroup`.
   * - A declaration's docstring (see `getDocComments()`) compiles as ONE `/** ... *\/` just above it,
   *   instead of its `//` lines.
   * - A statement which declares something gets its `/*! SPELL: DECLARES {...} *\/` comment BELOW any
   *   docstring, right on its code -- see `SP.SpellDeclarations.commentFor()`.
   * - A declaring line's docstring, comment and code are ONE `P.ASTStatementGroup`, so they move together:
   *   each class member moves into its class's body, if that's in this block -- see `SP.hoistClassMembers()`.
   * - A `##` heading followed by a regular comment compiles as a banner -- see `P.ASTBannerComment`.
   * - A heading at a FILE's top level also says so as the program runs, just above its own lines:
   *   `spellCore.heading("set up all piles")` -- so the Thing Explorer knows which heading's code made each
   *   thing.  See `P.ASTHeadingInvocation`.
   */
  getAST(match: P.MatchFor<this>): P.ASTStatementBlock | P.ASTStatementGroup {
    const docs = this.getDocComments(match)
    const docComments = new Set([...docs.values()].flatMap((doc) => doc.comments))
    const statements: SP.HoistableStatement[] = []
    const isFileTop = !match.data.enclose && match.scope instanceof P.FileScope
    match.matched.forEach((item, index) => {
      // `Block.parse()` only ever pushes `Match`es onto `matched`, each a `line` / nested `block` whose rule
      // returns a statement-shaped node -- not statically representable.
      if (!(item instanceof P.Match)) return
      const heading = isFileTop ? this.headingText(item) : undefined
      if (heading) statements.push(new P.ASTHeadingInvocation(item, { heading }))
      if (this.isBannerHeading(item, match.matched[index + 1])) {
        statements.push(new P.ASTBannerComment(item, { value: this.commentText(this.commentOnlyLine(item)!) }))
        return
      }
      const statement = this.statementOf(item)
      const declarations = statement && SP.SpellDeclarations.commentFor(statement)
      const doc = statement && docs.get(statement)
      if (!doc) {
        // a comment-only line that's part of a docstring compiles with its statement, below
        const comment = this.commentOnlyLine(item)
        if (comment && docComments.has(comment)) return
        if (!declarations) statements.push(item.AST as P.ASTStatement)
        else if (item.AST) statements.push(new P.ASTStatementGroup(item, { statements: [declarations, item.AST] }))
        else statements.push(declarations)
        return
      }
      // docstring first, then what it declares right on top of its code
      const declaring: SP.HoistableStatement[] = [new P.ASTDocComment(item, { lines: doc.lines })]
      if (declarations) declaring.push(declarations)
      // the line, without a docstring comment at its end
      for (const it of item.matched) {
        if (!(it instanceof P.Match) || docComments.has(it)) continue
        if (it.AST) declaring.push(it.AST as P.ASTStatement)
      }
      statements.push(new P.ASTStatementGroup(item, { statements: declaring }))
    })
    const [hoisted] = SP.hoistClassMembers([statements])
    if (match.data.enclose) return new P.ASTStatementBlock(match, { statements: hoisted })
    return new P.ASTStatementGroup(match, { statements: hoisted })
  }

  ////////////////
  // ## Docstrings
  ////////////////

  /**
   * Docstring of each statement in `block` that DECLARES something (see `Rule.getDeclaration()`), by statement:
   * - the comment-only lines directly above its line, with no blank line between
   * - a `##` section heading ends it:  it's the docstring only if it's DIRECTLY above, e.g. `## Game bits`,
   *   and nothing above a heading joins -- `## Cards` then `// a playing card` documents with just the second
   * - else the comment at the end of its own line
   * - Read when asked, from the lines as they are now:  NOT stored while parsing, as an incremental parse
   *   re-parses an edited comment line on its own, which would leave a stored docstring stale.
   * - Only `block`'s own lines -- ask each nested block for its own.
   */
  getDocComments(block: P.Match): Map<P.Match, DocComment> {
    const docs = new Map<P.Match, DocComment>()
    block.matched.forEach((item, index) => {
      const statement = item instanceof P.Match ? this.statementOf(item) : undefined
      if (!statement || !statement.rule.getDeclaration(statement)) return
      const above: P.Match[] = []
      for (let before = index - 1; before >= 0; before--) {
        const comment = this.commentOnlyLine(block.matched[before])
        if (!comment) break
        if (this.isHeading(comment)) {
          if (above.length === 0) above.push(comment)
          break
        }
        above.unshift(comment)
      }
      const onLine = (item as P.Match).matched.find((it) => this.isComment(it))
      const comments = above.length ? above : onLine ? [onLine as P.Match] : []
      if (comments.length) docs.set(statement, { lines: comments.map((it) => this.commentText(it)), comments })
    })
    return docs
  }

  /**
   * Is `item` a `##` section heading line followed directly by a comment-only line that isn't one?
   * - Compiles as a banner, NOT as part of a docstring -- see `getAST()`.
   */
  private isBannerHeading(item: P.Match | P.Token | undefined, next: P.Match | P.Token | undefined): boolean {
    const heading = this.commentOnlyLine(item)
    const following = this.commentOnlyLine(next)
    return !!heading && this.isHeading(heading) && !!following && !this.isHeading(following)
  }

  /** `item`'s statement, if it's a `line` with one. */
  private statementOf(item: P.Match): P.Match | undefined {
    const { statement } = (item as P.Match<P.MatchGroups, BlockMatchData>).data
    return statement instanceof P.Match ? statement : undefined
  }

  /** `item`'s comment, if it's a line holding nothing else. */
  private commentOnlyLine(item: P.Match | P.Token | undefined): P.Match | undefined {
    if (!(item instanceof P.Match) || item.matched.length !== 1) return undefined
    const [only] = item.matched
    return only instanceof P.Match && this.isComment(only) ? only : undefined
  }

  /** Is `item` a comment's match? */
  private isComment(item: P.Match | P.Token): boolean {
    return item instanceof P.Match && item.tokens.length === 1 && item.tokens[0] instanceof P.CommentToken
  }

  /** Is `comment` a section heading -- `#`, `##`, `###` ...? */
  private isHeading(comment: P.Match): boolean {
    return (comment.tokens[0] as P.CommentToken).commentSymbol.startsWith("#")
  }

  /** Text of `item`, if it's a heading's line -- `undefined` for any other, or one with no text, e.g. `#####`. */
  private headingText(item: P.Match): string | undefined {
    const comment = this.commentOnlyLine(item)
    return (comment && this.isHeading(comment) && this.commentText(comment).trim()) || undefined
  }

  /** Text of `comment`, without its comment symbol. */
  private commentText(comment: P.Match): string {
    return (comment.tokens[0] as P.CommentToken).value
  }
}

/** A statement's docstring -- see `Block.getDocComments()`. */
export type DocComment = {
  /** Its lines of text, without comment symbols. */
  lines: string[]
  /** Comment matches it came from. */
  comments: P.Match[]
}

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
  /** On a `line` match:  what its statement's `mutateScopeAfterBody()` recorded, if anything. */
  afterBody?: string
}
