import { getDerived } from "#spell-util"
import { P } from "#parser"
// Import directly, NOT through the `#spell-core` barrel:  the parser MUST NOT load `spellCore` itself -- each
// runner runs its own copy.  See `spellRuntime.ts`.
import { SPELL_BASE_TYPES } from "#spell-core/spellCore.types"
import { SP } from "~/languages/spell"

// Registers `RulexParser` on `P.Parser.rulexParser` -- MUST load before any rule with a `syntax:` string.
import "#parser/rulex"

/**
 * `P.Parser` subclass for the spell language.
 * - Holds spell's `tokenizer` (double-quote strings only, `LEADING_ONLY` whitespace so indentation stays
 *   significant) plus a `tokenize()` override that re-groups tokens into indented blocks for the `"block"`
 *   rule.
 * - `SpellParser.rootScope` is the single shared root every project/file scope descends from -- it carries
 *   spell's base types; see `getScope()` / `SpellFile.getScope()` / `SpellProject.getScope()` for how
 *   project-specific parsers `clone()` off of it.
 * - `SP.spellParser` (see `./rules`) is the actual shared instance used by both the client UI and the
 *   server's `compileFile()` (`src/server/project-utils.ts`) -- keep this class free of browser-only
 *   globals at module-evaluation time.
 */
export class SpellParser extends P.Parser {
  /**
   * Re-defines `defaultRule` as `"block"` directly on `SpellParser.prototype`.
   * - TODO: looks redundant -- `P.Parser`'s own static block already sets the same value on
   *   `Parser.prototype`, which `SpellParser` would inherit anyway.
   */
  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "block", writable: true })
  }

  /**
   * Tokenizer for spell source: double-quote strings only, keeping newlines/indents (`LEADING_ONLY`
   * whitespace policy) since block structure is significant.
   */
  get tokenizer() {
    return this.derived(
      "tokenizer",
      () =>
        new P.Tokenizer({
          // Only support double-quotes as quote symbols (so we can do contractions with single quotes)
          // TODO: backtick as alternative quote, for embedding double quotes?
          quoteSymbols: [`"`],
          // Remove "normal" whitespace (leaving newlines and indents) when parsing
          whitespacePolicy: P.WhitespacePolicy.LEADING_ONLY
        })
    )
  }

  /**
   * Register a rule class with ONLY its `syntax` + `tests` -- everything else lives on the class as `@proto static`.
   * - Why:  the class is the rule, reusable by another language's parser with its own `syntax`.
   * - TYPE-ONLY narrowing of `P.Parser.addRule()`, same behaviour.
   */
  addRule<RuleType extends P.Rule>(rule: Class<RuleType>, definition?: P.SyntaxAndTests): P.Rule | undefined
  addRule(rule: P.Rule | P.RuleConstructor, ruleName?: string | string[]): P.Rule | undefined
  addRule(
    rule: P.Rule | P.RuleConstructor,
    namesOrDefinition?: string | string[] | P.RuleDefinitionProps
  ): P.Rule | undefined {
    // Overloads hide `super`'s implementation signature -- it takes either shape, so any overload will do.
    return super.addRule(rule as Class<P.Rule>, namesOrDefinition as P.DefinitionFor<P.Rule>)
  }

  /** Without the `/*! SPELL: DECLARES` comments -- a rule's tests are about its code.  See `SpellDeclarations`. */
  normalizeTestOutput(compiled: unknown): unknown {
    return typeof compiled === "string" ? SP.SpellDeclarations.stripComments(compiled) : compiled
  }

  /**
   * Also register expressions / statements as `simple_expression` / `simple_statement`.
   * - Skips this for left-recursive rules (`rule.isLeftRecursive`): those already reference
   *   `simple_expression`/`simple_statement` in their own `syntax` to chain onto a prior expression, so
   *   adding them under those names too would let them recurse into themselves.
   */
  protected getNamesForRule(rule: P.Rule, names: string[]): string[] {
    if (rule.isLeftRecursive) return names
    const extras: string[] = []
    if (names.includes("expression")) extras.push("simple_expression")
    if (names.includes("statement")) extras.push("simple_statement")
    return [...names, ...extras]
  }

  /**
   * `rootScope` for all spellParsers -- contains base rules, types, constants.
   * - All project scopes point back to this.
   */
  /*@memoize*/
  static get rootScope(): P.RootScope {
    return getDerived(this, "rootScope", (): P.RootScope => {
      const scope = new P.RootScope({ name: "spellRoot", parser: SP.spellParser })
      // spell's built-in types -- `spellCore.BASE_TYPES`
      SPELL_BASE_TYPES.forEach((type) => scope.types.add(type))
      return scope
    })
  }

  /**
   * Return a `P.ProjectScope` with a new parser that `clone()`s this one under `moduleName`.
   * - Lets us tweak rules/etc for that scope without touching the original (e.g. shared `rootScope`).
   */
  getScope(moduleName = "ad_hoc"): P.ProjectScope {
    const parser = this.clone({ module: moduleName })
    return new P.ProjectScope({
      name: moduleName,
      parser,
      parentScope: SpellParser.rootScope
    })
  }

  /**
   * Tokenize `input`, then re-group into indented blocks when `ruleName` is `"block"` -- spell's
   * significant-whitespace block structure isn't just a flat token stream.
   */
  tokenize(input: string, ruleName: string) {
    const tokens = super.tokenize(input)
    if (!tokens) return undefined
    if (typeof input === "string" && ruleName === "block") return this.tokenizer.breakIntoIndentedBlocks(tokens)
    return tokens
  }

  /** Commit a spell statement parsed on its own -- see `SP.commitStatement()`. */
  commit(match: P.Match) {
    SP.commitStatement(match)
  }

  /** Parse one item of a block:  a nested block, or a line plus any indented body it takes. */
  parseItem(scope: P.Scope, items: P.Token[]): P.Match | undefined {
    const [first] = items
    if (first instanceof P.BlockToken) return this.getRuleOrDie("block").parse(scope, [first])
    if (first instanceof P.LineToken) return this.parse(items, "line", scope)
    return undefined
  }

  /** A top-level item is broken if it didn't parse, or has parse errors -- its own or its body's. */
  isBrokenItem(item: P.Match | undefined): boolean {
    return !item || !!SP.Block.getParseErrors(item)?.length
  }

  /** Journal mark just before a `line`'s nested body was parsed -- see `commitStatement()`. */
  getBodyMark(item: P.Match): P.JournalMark | undefined {
    return item.is(SP.BlockLine) ? item.data.bodyMark : undefined
  }

  /** Re-parse a top-level `line`'s nested body -- see `BlockLine.reparseBody()`. */
  reparseBody(item: P.Match, body: P.BlockToken): P.Match | undefined {
    return item.is(SP.BlockLine) ? item.rule.reparseBody(item, body) : undefined
  }

  /** File match from its top-level item matches, as `Block.parse()` builds it -- see `Block.assembleBlock()`. */
  assembleFile(scope: P.Scope, root: P.BlockToken, items: P.Match[]): P.Match | undefined {
    const rule = this.getRuleOrDie("block")
    return rule instanceof SP.Block ? rule.assembleBlock(scope, root, items) : undefined
  }

  /**
   * Build a `P.Match` for the `parse_error` rule, so a failed parse still produces a `Match` in the tree
   * (rather than `undefined`) -- callers can inspect/report on it, e.g. `SpellFile.parse()`'s `errors` walk.
   */
  createParseError(scope: P.Scope, tokens: P.Token[], message: string) {
    const rule = this.getRuleOrDie("parse_error")
    return new P.Match({
      scope,
      rule,
      matched: tokens,
      tokens: [...tokens],
      message
    })
  }

  /**
   * `Parser.compile()` returns `unknown` (e.g. `rulex` compiles to `Rule` objects), but spell always
   * compiles down to a javascript source string -- narrow that here so `SpellFile`/`SpellProject` compile
   * paths can rely on `string`.
   * - Throws `P.ParserError` if `super.compile()` doesn't return a string.
   */
  compile(input: string | P.Token | P.Token[], ruleName?: string, scope?: P.Scope): string {
    const result = super.compile(input, ruleName, scope)
    if (typeof result !== "string") {
      throw new P.ParserError({
        message: "compile() did not return a string",
        context: this,
        activity: "compile",
        params: { input, ruleName, scope, result }
      })
    }
    return result
  }
}
