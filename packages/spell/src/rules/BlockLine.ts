import { P } from "$/parser"
import { SP } from "$/spell"
import { SpellStatement, commitStatement } from "./Statement"
import { Block, type BlockMatchData } from "./Block"
import { SpellJSX } from "./JSX"

/**
 * Blank line, compiling to `P.ASTBlankLine` -- generic `P.BlankLine` has no `getAST()` of its own,
 * and spell always converts to AST before compiling.
 * - Subclass rather than patching `P.BlankLine.prototype`, which would change it for every language.
 */
export class blank_line extends P.BlankLine {
  getAST(match: P.MatchFor<this>) {
    return new P.ASTBlankLine(match)
  }
}

/**
 * Parse a single `LineToken` in a `BlockToken` as:
 * - a `statement`
 * - an optional `comment` at the end of the line
 * - if the statement takes a nested body and the next item in `lines` is a `BlockToken`, we'll let the
 *   statement attempt to parse that next line as well -- see `commitStatement()`.
 */
export class BlockLine extends P.Rule<P.RuleProps, never, BlockMatchData> {
  /** Registered as `line` -- class name isn't rule case. */
  static ruleName = "line"

  /**
   * SIDE EFFECT: calls `statement.rule.mutateScope()` on the parsed statement (and on any nested block's
   * errors are folded in too), so a locked-in statement can e.g. add variables to `scope` as it's parsed.
   */
  parse(scope: P.Scope, lines: P.Token[]): P.Match | undefined {
    const line = lines[0]
    if (!line) return undefined
    const matched: (P.Match | P.Token)[] = []
    const errors: P.Match[] = []
    const tokensMatched: P.Token[] = [line]
    let lineStatement: P.Match | undefined
    let lineBodyMark: P.JournalMark | undefined
    let afterBody: string | undefined
    let bodyErrorsAt: number | undefined
    if (!(line instanceof P.LineToken)) {
      console.warn("BlockLine.parse(): got non-line", line)
      return undefined
    }
    const { tokens } = line
    // Blank line
    if (tokens.length === 0) {
      // NOTE: `line.leading` (the fallback in the original code) is a plain `string`, not a `Token` --
      // pushing it into `matched`/`tokens` below would fail `Match`'s own runtime assertions, so this
      // dynamic fallback was already dead code; only `line.newline` is ever a usable `Token` here.
      const token = line.newline
      if (token) {
        matched.push(
          new P.Match({
            rule: scope.getRuleOrDie("blank_line"),
            matched: [token],
            tokens: [token],
            scope
          })
        )
      }
    }
    // parse as a `statement` with optional `comment`
    else {
      const start = 0
      let end = tokens.length

      // pop comment (which will be a single token) off of the end if found
      const last = tokens[tokens.length - 1]!
      const comment = scope.parser?.parse([last], "comment", scope)
      if (comment) {
        end -= 1
        // add comment BEFORE statement
        matched.push(comment)
      }

      // parse the statement (which may parse an inline body as well)
      const unparsed = tokens.slice(start, end)
      const statement = scope.parser?.parse(unparsed, "statement", scope)
      if (statement) {
        lineStatement = statement
        matched.push(statement)
        unparsed.splice(0, statement.length)
      }

      // add anything unparsed at the end as a parse error
      if (unparsed.length) {
        const error = scope.parser?.parse(unparsed, "parse_error", scope)
        if (error) {
          errors.push(error)
          matched.push(error)
        }
      }

      if (statement) {
        // Errors inside JSX `{...}` -- reported here, but compiled where they are, so NOT added to `matched`.
        errors.push(...SpellJSX.parseErrorsIn(statement))

        const nextItem = lines[1]
        const inlineBody = statement.rule instanceof SpellStatement ? statement.rule.getBody(statement) : undefined
        const committed = commitStatement(statement, nextItem)
        const nestedBlockMatch = committed.body
        lineBodyMark = committed.bodyMark
        afterBody = committed.afterBody
        if (nestedBlockMatch) {
          // add any errors in the nestedBlock to `errors`
          bodyErrorsAt = errors.length
          if (nestedBlockMatch.is(Block) && nestedBlockMatch.data.errors) errors.push(...nestedBlockMatch.data.errors)
          // add the nestedBlock to `tokensMatched` to account for it in the output
          tokensMatched.push(nextItem!)
        }

        // Add parse error if we got both an inline body and a nested one
        if (inlineBody && nestedBlockMatch) {
          const error = SP.spellParser.createParseError(
            scope,
            [line, nextItem].filter((item): item is P.Token => item !== undefined),
            "Got both inline statement and nested block"
          )
          errors.push(error)
          matched.push(error)
        }
      }
    }
    const result: P.MatchFor<this> = new P.Match({
      rule: this,
      matched,
      tokens: tokensMatched,
      scope
    })
    if (errors.length) result.data.errors = errors
    if (lineStatement) result.data.statement = lineStatement
    if (bodyErrorsAt !== undefined) result.data.bodyErrorsAt = bodyErrorsAt
    if (lineBodyMark) result.data.bodyMark = lineBodyMark
    if (afterBody !== undefined) result.data.afterBody = afterBody
    return result
  }

  /**
   * Re-parse ONLY the nested body of `line` from `blockToken`, keeping its header statement's match -- and so the
   * scope changes that made -- as they are.  See `P.IncrementalParse`.
   * - Returns a new `line` match, or `undefined` if that's not safe, so caller does a full parse:
   *   - no statement, or its body isn't an indented block of statements
   *   - body shares the header's scope, so its variables land outside it
   *   - old or new body `changesGlobalScope()`, e.g. declares a type or a method
   *   - what the statement records once its body has parsed changed, e.g. the type a method returns:  later lines
   *     may read it -- see `SpellStatement.mutateScopeAfterBody()`
   * - The new body gets a FRESH nested scope:  we re-parse on a clone of the statement, without its old body.
   */
  reparseBody(line: P.MatchFor<this>, blockToken: P.BlockToken): P.Match | undefined {
    const { statement, bodyErrorsAt } = line.data
    if (!statement || !(statement.rule instanceof SpellStatement) || bodyErrorsAt === undefined) return undefined
    const oldBody = statement.rule.getBody(statement)
    if (!oldBody?.is(Block) || line.tokens[1] !== oldBody.tokens[0]) return undefined
    if (statement.nestedScope === statement.scope || P.IncrementalParse.changesGlobalScope(oldBody)) return undefined

    // Statement without its old body, re-bodied.
    const bodyTokens = new Set(oldBody.tokens)
    const header = statement.clone({
      matched: statement.matched.filter((item) => item !== oldBody),
      tokens: statement.tokens.filter((token) => !bodyTokens.has(token))
    })
    header.data.body = undefined
    const newBody = statement.rule.parseNestedBlock(header, blockToken)
    if (!newBody?.is(Block) || P.IncrementalParse.changesGlobalScope(newBody)) return undefined
    const afterBody = statement.rule.mutateScopeAfterBody(header)
    if (afterBody !== line.data.afterBody) return undefined

    // Swap the old body's errors for the new body's, in place.
    const errors = [...(line.data.errors ?? [])]
    errors.splice(bodyErrorsAt, oldBody.data.errors?.length ?? 0, ...(newBody.data.errors ?? []))
    const result = line.clone({
      matched: line.matched.map((item) => (item === statement ? header : item)),
      tokens: [line.tokens[0]!, blockToken]
    })
    result.data.statement = header
    result.data.errors = errors.length ? errors : undefined
    result.data.afterBody = afterBody
    return result
  }

  /**
   * `Match.compile()` always prefers `getAST()` (below) over calling `rule.compile()` directly, but
   * `Rule.compile()` is abstract, so provide the equivalent fallback for completeness.
   */
  compile(match: P.MatchFor<this>): unknown {
    return match.AST?.compile()
  }

  /** If only one matched item (statement, comment, or blank line), return its AST directly; else group them. */
  getAST(match: P.MatchFor<this>): P.ASTNode {
    // ???  If only one matched item, return it by itself
    const first = match.matched[0]
    if (match.matched.length === 1 && first instanceof P.Match) return first.AST!
    // otherwise
    return new P.ASTStatementGroup(match, {
      // `match.matched` here is always `Match`es (never raw `Token`s) -- not staticaly representable.
      statements: match.matched
        .filter((item): item is P.Match => item instanceof P.Match)
        .map((item) => item.AST) as Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine>
    })
  }
}
