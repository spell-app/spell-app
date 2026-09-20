import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"

/**
 * Base class for all spell statement rules.  In spell, we generally match `statements` across the
 * entire line.
 * - An exception is "inline block" statements (like `if` or `forEach`), where the statement might have
 *   an inline statement at the end, or might have a nested block of statements.
 * - Access this as `SpellParser.Rules.Statement`.
 */
export class SpellStatement extends P.Sequence {
  /** Should we attempt to parse an `inlineStatement` at the end of this statement's line? */
  declare wantsInlineStatement: boolean
  /** Rule name to parse the `inlineStatement` as. */
  declare parseInlineStatementAs: string
  /** Should we attempt to parse a `nestedBlock` following this statement's line? */
  declare wantsNestedBlock: boolean
  /** Rule name to parse the `nestedBlock` as. */
  declare parseNestedBlockAs: string

  static {
    Object.defineProperty(this.prototype, "wantsInlineStatement", { value: false, writable: true })
    Object.defineProperty(this.prototype, "parseInlineStatementAs", { value: "statement", writable: true })
    Object.defineProperty(this.prototype, "wantsNestedBlock", { value: false, writable: true })
    Object.defineProperty(this.prototype, "parseNestedBlockAs", { value: "block", writable: true })
  }

  /**
   * Parse the statement itself -- assume comment was already popped off the end.
   * - If `this.wantsInlineStatement`, attempt to parse that and push onto the match.
   * - `BlockLine.parse()` will worry about extra stuff at the end of the statement.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const statement = super.parse(scope, tokens)
    if (!statement) return undefined

    // Attempt to parse any remaining tokens as an inlineStatement if necessary
    const unparsed = tokens.slice(statement.length)
    if (this.wantsInlineStatement && unparsed.length) {
      this.parseInlineStatement(statement, unparsed, this.parseInlineStatementAs)
    }

    return statement
  }

  /**
   * If a parsed `statement` match `.wantsInlineStatement`, attempt to parse `unparsed` tokens from the
   * end of the input line.
   * - Returns `inlineStatement` match if successful.
   * - SIDE EFFECT: on success, adds the `inlineStatement` match to `statement.groups` and calls
   *   `mutateScope()` on it so any variables/rules/etc it declares are initialized.
   */
  parseInlineStatement(
    statement: P.Match,
    unparsed: P.Token[],
    parseAs: string = this.parseInlineStatementAs
  ): P.Match | undefined {
    // NOTE: `Scope.parse()` is typed for string input only; call `parser.parse()` directly
    // (exactly what `Scope.parse()` would do internally) so we can pass tokens instead.
    const { nestedScope } = statement
    const inlineStatement = nestedScope.parser?.parse(unparsed, parseAs, nestedScope)
    if (inlineStatement) {
      statement.addMatch(inlineStatement, "inlineStatement")
      // Call `mutateScope()` to initialize any variables/rules/etc
      inlineStatement.rule.mutateScope(inlineStatement)
    }
    return inlineStatement
  }

  /**
   * If a parsed `statement` match `.wantsNestedBlock`, attempt to parse `nestedBlock` from
   * `block.contents`.
   * - Returns `nestedBlock` match if successful.
   * - When `parseAs` ~== `"block"`, parses the whole nested block via `statement.nestedScope` and marks
   *   the result `enclose`d (wrapped in `{}` when compiled).  Otherwise, only a single-line nested block
   *   can be parsed, as `parseAs` directly (e.g. an `expression`).
   * - SIDE EFFECT: on success, adds the `nestedBlock` match to `statement.groups`.
   * - TODO: complain if we also have an inlineStatement???
   * - NOTE: this will throw if rule does not implement `getNestedScopeForMatch`.
   */
  parseNestedBlock(
    statement: P.Match,
    nestedBlock: P.Tokens.Block,
    parseAs: string = this.parseNestedBlockAs
  ): P.Match | undefined {
    let result: P.Match | undefined
    if (parseAs === "block") {
      const { nestedScope } = statement
      result = nestedScope.parser?.parse([nestedBlock], "block", nestedScope)
      // wrap output in braces
      if (result) result.enclose = true
    } else {
      // if parsing as anything else, we can only handle a single line
      if (nestedBlock.tokens.length > 1) return undefined
      // get line to process, minus leading whitespace
      // TODO: remove comment????
      const first = nestedBlock.tokens[0]
      // Only a `Line` (not a nested `Block`) can be parsed as a single rule here.
      if (!(first instanceof P.Tokens.Line)) return undefined
      const { tokens } = first
      // TODO: `statement.scope` or `statement.nestedScope` ???
      const { scope } = statement
      result = scope.parser?.parse(tokens, parseAs, scope)
      // forget it if we didn't parse the entire line
      if (result?.length !== tokens.length) return undefined
    }
    if (result) statement.addMatch(result, "nestedBlock")
    return result
  }
}
SpellParser.Rules.Statement = SpellStatement
