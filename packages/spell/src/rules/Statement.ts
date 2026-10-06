import { NONE, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
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
  /**
   * `true`:  used INSIDE an expression, our LAST slot -- a trailing `{x:expression}` -- takes an `operand` instead,
   * so it stops before an operator.
   * - As a statement it keeps the whole expression:
   *   - `notify x + y` => `notify(x + y)`, but `if double x is 4` => `double(x) == 4`
   *   - `wait for x is 1` => `await (x == 1)`, but `if wait for x is 1` => `(await x) == 1`
   * - Only for a rule aliased both `statement` and `expression`:
   *   `SpellParser.addRule()` registers it as the statement, plus a twin of it as the expression.
   *   See `SpellParser.addStatementAndOperand()`.
   */
  declare operandInExpressions: boolean
  @proto static operandInExpressions = false
  /**
   * `true`:  a nested block body compiles FLAT -- its statements beside ours, in the block holding us, NOT
   * wrapped in `{}` -- e.g. an outline-style type's bulleted body, `a card is a thing where:`.
   * - So its members are hoisted into the class like any top-level line's (`SP.hoistClassMembers()`).
   * - `parseNestedBlock()` leaves the body un-`enclose`d;  `Block.getAST()` splices its statements in after ours.
   */
  declare flatBody: boolean
  @proto static flatBody = false
  /**
   * In the expression twin `operandInExpressions` makes:  the statement rule it's the twin of,
   * the one `scope.addRule()` recorded.  See `SpellStatement.statementRuleOf()`.
   */
  declare statementRule: P.Rule | undefined
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
   * A `parse_error` match in place of statement `match`, saying why spell won't take it,
   * e.g. a property declared on a built-in type.
   * - For a `parse()` which understood what it read, but mustn't accept it:  return this, NOT `undefined`,
   *   so the error says why, instead of "Don't understand ...".
   * - `BlockLine` reports it as its line's error, and commits nothing:  the line compiles to the error.
   * - It competes with `match`'s priority (`P.Match.priority`):  a plainer rule which merely fits the same words
   *   can't take the line instead, e.g. `quoted_type_expression` taking `it "is a suit"` as an empty method.
   */
  static refuse(match: P.Match, message: string): P.Match {
    const { scope, tokens, rule } = match
    return new P.Match({
      scope,
      rule: scope.getRuleOrDie("parse_error"),
      matched: tokens,
      tokens: [...tokens],
      message,
      priority: rule.priority
    })
  }

  /**
   * `match`, a statement declaring `property` on `type` -- or, when `type` is one of spell's BUILT-IN types,
   * e.g. `text` or `thing`, a parse error saying it can't be (plan doc caveat C9).
   * - e.g. `the length of a text is: ...`
   * - Why:  a built-in type's `P.TypeScope` is the shared root scope's, which every project parses against
   *   and no project's journal records.  A property there would leak into every other project,
   *   and outlive its edit.  Its members are spell's own, in `SP.BUILT_IN_TYPE_TABLE`.
   * - A METHOD of a built-in type is fine:  its record goes in the project's `methods` -- see `MethodDefinition`.
   * - A lookup:  call it WHILE PARSING, e.g. from `define_property_has.parse()`.
   */
  static refuseBuiltInType(match: P.Match, type: P.Match, property: P.Match | undefined): P.Match {
    if (!SP.isBuiltInTypeScope(match.scope.types?.get(`${type.value}`))) return match
    const words = property ? `"${property.raw}"` : "a property"
    const typeName = SP.typeName(`${type.value}`)
    return SpellStatement.refuse(
      match,
      `Can't add ${words} to ${typeName}:  it's built in, and every project shares it`
    )
  }

  /**
   * `match`, a statement adding to `type` -- or, when spell knows NO type of that name, a parse error saying so,
   * e.g. `the color of a suit is ...` with no `suit` declared anywhere in the project.
   * - Why:  it'd compile against a class nobody defines, `Suit.prototype`, and throw when run
   *   (was `agents/SUSPECTED-BUGS.md`;  plan doc `outline-spell`, P2).
   * - A type declared further down is known:  every declaration is stubbed before a project parses.
   * - A lookup:  call it WHILE PARSING.
   */
  static refuseUnknownType(match: P.Match, type: P.Match): P.Match {
    const { scopeType } = type.data as { scopeType?: unknown }
    if (scopeType !== NONE) return match
    return SpellStatement.refuse(match, `There's no type "${type.raw}":  declare it, e.g. "a ${type.raw} is a thing"`)
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
   *   the result `enclose`d (wrapped in `{}` when compiled), unless we're `flatBody`.  Otherwise, only a single-line nested block
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
      // wrap output in braces -- or not, see `flatBody`
      if (result?.is(Block) && !this.flatBody) result.data.enclose = true
    } else {
      // if parsing as anything else, we can only handle a single line
      if (nestedBlock.tokens.length > 1) return undefined
      // get line to process, minus leading whitespace
      // TODO: remove comment????
      const first = nestedBlock.tokens[0]
      // Only a `LineToken` (not a nested `BlockToken`) can be parsed as a single rule here.
      if (!(first instanceof P.LineToken)) return undefined
      const { tokens } = first
      // the body's scope, as an inline body's (`parseInlineStatement()`):  e.g. `draw_side`'s markup, where `[rank]`
      // is the card's.  The same as `statement.scope` for a rule with no scope of its own, e.g. `return`
      const { nestedScope } = statement
      result = nestedScope.parser?.parse(tokens, parseAs, nestedScope)
      // forget it if we didn't parse the entire line
      if (result?.length !== tokens.length) return undefined
    }
    if (result) {
      statement.addMatch(result, "body")
      statement.data.body = result
    }
    return result
  }

  /**
   * SIDE EFFECT hook:  change scope once our BODY has parsed, e.g. a method records what it returns.
   * - Run by `commitStatement()`, after `mutateScope()` and the body.  Default:  nothing.
   * - Returns what it recorded, as a string, if anything:  `BlockLine.reparseBody()` compares it,
   *   so an edit to the body which changes it re-parses what follows.
   */
  mutateScopeFromBody(_match: P.Match): string | undefined {
    return undefined
  }

  /**
   * `match`, an outline body's line, as the sentence style would say it -- what editors show as "Reads as"
   * (plan doc `outline-spell`, Q1:  hover teaches the long form).  `undefined` for any other line.
   * - Default:  a line whose subject (its `type` group) is the body's `it` / `its`, with the subject spelled out:
   *   - `it has a deck` => `a card has a deck`
   *   - `its "color" is red if ...` => `the "color" of a card is red if ...`
   * - Override where the sentence style says it differently, e.g. `define_property_has`'s `has ... as ...`.
   * - Its FIRST line only:  a body stays as written.
   */
  getLongForm(match: P.Match): string | undefined {
    const { subject, property } = SpellStatement.subjectOf(match)
    const typeWords = SpellStatement.subjectWords(match)
    if (!subject || !typeWords) return undefined
    const text = SpellStatement.firstLineOf(match)
    const at = subject.start! - match.start!
    const after = text.slice(at + subject.inputText.trimEnd().length).trimStart()
    if (/^it$/i.test(subject.inputText.trim())) return `${text.slice(0, at)}a ${typeWords} ${after}`
    // `its <property> ...` => `the <property> of a <type> ...`
    const propertyText = property?.inputText.trimEnd()
    if (!propertyText || !after.startsWith(propertyText)) return undefined
    return `${text.slice(0, at)}the ${propertyText} of a ${typeWords}${after.slice(propertyText.length)}`
  }

  /**
   * The words for the type an outline body is about, e.g. `card`, if `match`'s subject is that body's `it` / `its`
   * -- else `undefined`.  See `getLongForm()`.
   */
  static subjectWords(match: P.Match): string | undefined {
    const { subject } = SpellStatement.subjectOf(match)
    if (!subject || !P.SubjectScope.of(match.scope) || !/^its?$/i.test(subject.inputText.trim())) return undefined
    return `${subject.raw}`
  }

  /**
   * `match`'s subject and property:  its `type` and `property` groups, or its `type_property`'s, e.g.
   * `property_value_either`'s `its "color"`.
   */
  static subjectOf(match: P.Match): { subject?: P.Match; property?: P.Match } {
    type Groups = { type?: P.Match; property?: P.Match; type_property?: P.Match }
    const groups = match.groups as Groups
    const holder = groups.type ? groups : ((groups.type_property?.groups as Groups | undefined) ?? groups)
    return { subject: holder.type, property: holder.property }
  }

  /** `match`'s source text, up to the end of its first line. */
  static firstLineOf(match: P.Match): string {
    return match.inputText.split("\n")[0]!.trimEnd()
  }

  /**
   * If `match` RETURNS from the method it's in, e.g. `return the card`:  `{ value }`, the returned expression's match.
   * - `value` is `undefined` for a bare `return`.
   * - `undefined` if it doesn't return.  See `getReturnedDatatype()`.
   * - Default:  it doesn't.  `return_statement` overrides.
   */
  getReturnValue(_match: P.Match): { value: P.Match | undefined } | undefined {
    return undefined
  }

  /**
   * What our body RETURNS, e.g. `Card` for a body whose every `return` returns a card -- `undefined` if unknown.
   * - An inline EXPRESSION body (`the value of a card is its rank`):  that expression's datatype.
   * - Otherwise its `return` statements' (`getReturnValue()`), wherever they are, e.g. inside an `if`.
   *   - But NOT inside a body with a method scope of its own, e.g. a loop's:
   *     that compiles to a callback, whose `return` is its own.
   *   - All the same => that;  none, or any other mix => unknown.  A bare `return` is `nothing`.
   * - Reads ONLY matches:  call it once the body has parsed, e.g. from `mutateScopeFromBody()`.
   */
  getReturnedDatatype(match: P.Match): P.Datatype | undefined {
    const body = this.getBody(match)
    if (!body) return undefined
    if (!body.is(Block) && this.bodySpec?.inlineAs === "expression") return body.datatype
    const returned = new Set<P.Datatype | undefined>()
    visit(body)
    return returned.size === 1 ? [...returned][0] : undefined

    /** Note the datatype of each `return` in `item`, a block, line or statement. */
    function visit(item: P.Match | undefined) {
      if (!item) return
      if (item.is(Block)) {
        for (const child of item.matched) if (child instanceof P.Match) visit(child)
        return
      }
      const statement = item.rule instanceof SpellStatement ? item : (item.data as { statement?: P.Match }).statement
      if (!(statement?.rule instanceof SpellStatement)) return
      const result = statement.rule.getReturnValue(statement)
      if (result) returned.add(result.value ? result.value.datatype : "nothing")
      // a callback's `return`s are its own
      else if (!(statement.nestedScope instanceof P.MethodScope)) visit(statement.rule.getBody(statement))
    }
  }

  /**
   * The rule `rule` stands for:  the statement rule, if it's that rule's expression twin
   * (see `operandInExpressions`) -- else `rule` itself.
   * - e.g. for editors, mapping a call back to the method's `P.ScopeRule`
   */
  static statementRuleOf(rule: P.Rule): P.Rule {
    return (rule instanceof SpellStatement && rule.statementRule) || rule
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
 * - `mutateScopeFromBody()` on it, e.g. a method records what its body returns
 * - NOTE: this is the ONLY place a parsed statement changes scope.  Candidates which lose the line
 *   never do, so their types / rules / variables can't leak.  Call it for any statement you parse on
 *   its own and keep, e.g. a JSX `on...` handler.
 */
export function commitStatement(statement: P.Match, nextItem?: P.Token): CommittedStatement {
  statement.rule.mutateScope(statement)
  mutateScopeForInlineStatements(statement)

  const committed: CommittedStatement = {}
  if (!(statement.rule instanceof SpellStatement)) return committed
  if (statement.rule.bodySpec && nextItem instanceof P.BlockToken) {
    committed.bodyMark = statement.scope.parser?.journal?.mark()
    committed.body = statement.rule.parseNestedBlock(statement, nextItem)
  }
  committed.fromBody = statement.rule.mutateScopeFromBody(statement)
  return committed
}

/** What `commitStatement()` did about a nested body. */
export type CommittedStatement = {
  /** Nested body's match, if one parsed. */
  body?: P.Match
  /** Journal mark just before the nested body was parsed, if there's a journal. */
  bodyMark?: P.JournalMark
  /** What `mutateScopeFromBody()` recorded, if anything. */
  fromBody?: string
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
