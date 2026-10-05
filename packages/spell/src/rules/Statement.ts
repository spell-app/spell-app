import { P } from "$/parser"
// Import directly to avoid circular import -- rules are constructed while the `SP` barrel is still loading.
import { BODY_KEYWORDS, type StatementBodySpec } from "$/spell/spell.types"
import { Block } from "./Block"

/**
 * Base class for all spell statement rules.  In spell, we generally match `statements` across the
 * entire line.
 * - An exception is statements with a BODY (like `if` or `for each`):  an inline statement at the end of
 *   the line, or a nested block of statements indented under it.
 * - A body is declared by a body keyword at the END of `syntax` -- see `BODY_KEYWORDS`, e.g.
 *   `if {condition:expression} (then|:)? {statement_body}?`.
 *   - The keyword is taken OUT of `rules`:  a body can't be matched with the rest of the syntax, as it's
 *     parsed in `match.nestedScope`, which needs the statement's match to exist first.
 *   - `parse()` then parses an inline body;  `commitStatement()` parses a nested one.
 */
export class SpellStatement<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends P.Sequence<Groups, MatchData> {
  /** What we take as a body, from the body keyword which ended our `syntax`.  `undefined` => no body. */
  declare bodySpec: StatementBodySpec | undefined
  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: SpellStatementProps

  /** SIDE EFFECT:  moves a trailing body keyword out of `rules` into `bodySpec`. */
  constructor(props: SpellStatementProps) {
    super(props)
    if (!this.bodySpec) this.extractBodySpecFromRules()
  }

  /**
   * If `rules` ends with a body keyword (or a choice of them), move it into `bodySpec` -- see `BODY_KEYWORDS`.
   * - SIDE EFFECT: sets `rules` / `bodySpec`.  Only call before the rule is frozen, i.e. from the constructor.
   */
  protected extractBodySpecFromRules() {
    const last = this.rules.at(-1)
    const keywords = last instanceof P.Subrule ? [last] : last instanceof P.Choice ? last.rules : []
    const specs = keywords.map((keyword) => (keyword instanceof P.Subrule ? BODY_KEYWORDS[keyword.rule] : undefined))
    if (!last || !specs.length || specs.some((spec) => !spec)) return
    this.rules = this.rules.slice(0, -1)
    this.bodySpec = Object.assign({ syntaxRule: last }, ...specs) as StatementBodySpec
  }

  /**
   * Parse the statement itself -- assume comment was already popped off the end.
   * - If we take an inline body, attempt to parse the rest of the line as that.
   * - `BlockLine.parse()` will worry about extra stuff at the end of the statement.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const statement = super.parse(scope, tokens)
    if (!statement) return undefined

    const unparsed = tokens.slice(statement.length)
    const inlineAs = this.bodySpec?.inlineAs
    if (inlineAs && unparsed.length) this.parseInlineStatement(statement, unparsed, inlineAs)

    return statement
  }

  /**
   * Attempt to parse `unparsed` tokens from end of the line as our inline body, in `statement.nestedScope`.
   * - Returns inline statement match if successful.
   * - SIDE EFFECT: on success, adds it to `statement.groups` as `body`,
   *   and records it as `statement.data.body` -- see `getBody()`.
   * - NEVER calls `mutateScope()` here:  we may be one of several candidates for the line.
   *   `commitStatement()` does that for the winner only.
   */
  parseInlineStatement(statement: P.Match, unparsed: P.Token[], parseAs: string): P.Match | undefined {
    // NOTE: `Scope.parse()` is typed for string input only; call `parser.parse()` directly
    // (exactly what `Scope.parse()` would do internally) so we can pass tokens instead.
    const { nestedScope } = statement
    const inlineStatement = nestedScope.parser?.parse(unparsed, parseAs, nestedScope)
    if (inlineStatement) {
      statement.addMatch(inlineStatement, "body")
      statement.data.body = inlineStatement
    }
    return inlineStatement
  }

  /**
   * Body of `match`, if any:  its inline statement OR its nested block.
   * - Set by `parseInlineStatement()` / `parseNestedBlock()`.  Given both (an error), the nested block.
   * - Read THIS, not `match.groups.body` -- that's an array when given both, and a rule's syntax
   *   could name its own group `body`.
   */
  getBody(match: { data: P.AnyMatchData }): P.Match | undefined {
    return match.data.body as P.Match | undefined
  }

  /**
   * Attempt to parse `nestedBlock` as our nested body, if we take one.
   * - Returns the nested body match if successful.
   * - `bodySpec.nestedAs` ~== `"block"` => parses the whole nested block via `statement.nestedScope` and marks
   *   the result `enclose`d (wrapped in `{}` when compiled).  Otherwise, only a single-line nested block
   *   can be parsed, as `nestedAs` directly (e.g. an `expression`).
   * - SIDE EFFECT: on success, adds it to `statement.groups` as `body`,
   *   and records it as `statement.data.body` -- see `getBody()`.
   * - NOTE: this will throw if rule does not implement `getNestedScopeForMatch`.
   */
  parseNestedBlock(statement: P.Match, nestedBlock: P.BlockToken): P.Match | undefined {
    const parseAs = this.bodySpec?.nestedAs
    if (!parseAs) return undefined
    let result: P.Match | undefined
    if (parseAs === "block") {
      const { nestedScope } = statement
      result = nestedScope.parser?.parse([nestedBlock], "block", nestedScope)
      // wrap output in braces
      if (result?.is(Block)) result.data.enclose = true
    } else {
      // if parsing as anything else, we can only handle a single line
      if (nestedBlock.tokens.length > 1) return undefined
      // get line to process, minus leading whitespace
      // TODO: remove comment????
      const first = nestedBlock.tokens[0]
      // Only a `LineToken` (not a nested `BlockToken`) can be parsed as a single rule here.
      if (!(first instanceof P.LineToken)) return undefined
      const { tokens } = first
      // TODO: `statement.scope` or `statement.nestedScope` ???
      const { scope } = statement
      result = scope.parser?.parse(tokens, parseAs, scope)
      // forget it if we didn't parse the entire line
      if (result?.length !== tokens.length) return undefined
    }
    if (result) {
      statement.addMatch(result, "body")
      statement.data.body = result
    }
    return result
  }

  /** Our syntax's groups, plus `body` if we take one. */
  getGroupSpecEntries(): P.GroupSpecEntry[] {
    const entries = super.getGroupSpecEntries()
    if (this.bodySpec) entries.push({ name: "body", optional: true, array: false })
    return entries
  }

  /** Echo our syntax back out as rulex, INCLUDING the body keyword we took out of `rules`. */
  toRulexSyntax() {
    const { matchGroup, optional } = this.getRulexFlags()
    const rules = P.joinRulex([...this.rules, this.bodySpec?.syntaxRule].filter((rule): rule is P.Rule => !!rule))
    if (optional || matchGroup) return `(${matchGroup}${rules})${optional}`
    return `${rules}${optional}`
  }
}

/**
 * Props bag accepted by `SpellStatement`.
 * - Declare a body with a body keyword at the end of `syntax`, NOT here -- see `BODY_KEYWORDS`.
 */
export type SpellStatementProps = Prettify<
  P.SequenceProps & {
    bodySpec?: StatementBodySpec
  }
>

////////////////
// ## Committing a line's winning statement
////////////////

/**
 * Lock in a line's WINNING `statement`, in order:
 * - `mutateScope()` on it, then on each inline statement inside it, outermost first
 * - if it takes a nested body and `nextItem` is a `BlockToken`:
 *   - `bodyMark` in the parser's journal, if it has one, so incremental parsing can re-parse just the body
 *     -- see `P.IncrementalParse`
 *   - parse the body in its nested scope
 * - NOTE: this is the ONLY place a parsed statement changes scope.  Candidates which lose the line
 *   never do, so their types / rules / variables can't leak.  Call it for any statement you parse on
 *   its own and keep, e.g. a JSX `on...` handler.
 */
export function commitStatement(statement: P.Match, nextItem?: P.Token): CommittedStatement {
  statement.rule.mutateScope(statement)
  mutateScopeForInlineStatements(statement)

  const committed: CommittedStatement = {}
  if (statement.rule instanceof SpellStatement && statement.rule.bodySpec && nextItem instanceof P.BlockToken) {
    committed.bodyMark = statement.scope.parser?.journal?.mark()
    committed.body = statement.rule.parseNestedBlock(statement, nextItem)
  }

  return committed
}

/** What `commitStatement()` did about a nested body. */
export type CommittedStatement = {
  /** Nested body's match, if one parsed. */
  body?: P.Match
  /** Journal mark just before the nested body was parsed, if there's a journal. */
  bodyMark?: P.JournalMark
}

/**
 * Call `mutateScope()` on every inline statement in `match` (its own, then those inside it), outermost first.
 * - Found by rule TYPE:  any `SpellStatement` match's `getBody()`, never by group name.
 * - Walks the whole match tree, as expressions can have them too, e.g. `list_filter`'s `where` clause.
 * - NEVER walks into a `Block`:  a nested block's lines were each committed by their own `BlockLine`,
 *   so doing them again would apply their scope changes twice.  (`mutateScope()` on the `Block` match
 *   itself is a no-op.)
 */
function mutateScopeForInlineStatements(match: P.Match) {
  if (match.is(Block)) return
  const body = match.rule instanceof SpellStatement ? match.rule.getBody(match) : undefined
  if (body && !body.is(Block)) body.rule.mutateScope(body)
  for (const item of match.matched) {
    if (item instanceof P.Match) mutateScopeForInlineStatements(item)
  }
}
