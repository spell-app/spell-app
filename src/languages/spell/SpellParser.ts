import { getDerived } from "~/util"
import { P } from "~/parser"
import { spellCore } from "~/spellCore"
import { SP } from "~/languages/spell"
import type { SpellRuleRegistry } from "./rules/registry"

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
  /** Registry of language-specific rule classes, populated by the modules in `./rules`. Debug aid only. */
  static Rules = {} as SpellRuleRegistry

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
   * Override `addRule` to also add to `simple_expression` or `simple_statement` as necessary.
   * - Skips this for left-recursive rules (`rule.isLeftRecursive`): those already reference
   *   `simple_expression`/`simple_statement` in their own `syntax` to chain onto a prior expression, so
   *   adding them under those names too would let them recurse into themselves.
   */
  addRule(rule: P.Rule, names: string | string[]) {
    if (Array.isArray(names) && !rule["isLeftRecursive"]) {
      if (names.includes("expression")) names.push("simple_expression")
      if (names.includes("statement")) names.push("simple_statement")
    }
    return super.addRule(rule, names)
  }

  /**
   * `rootScope` for all spellParsers -- contains base rules, types, constants.
   * - All project scopes point back to this.
   */
  /*@memoize*/
  static get rootScope(): P.RootScope {
    return getDerived(this, "rootScope", (): P.RootScope => {
      const scope = new P.RootScope({ name: "spellRoot", parser: SP.spellParser })
      // Add all BASE_TYPES defined in `spellCore`.
      // See: `src/spellCore/classes/index.ts`
      spellCore.BASE_TYPES.forEach((type) => scope.types.add(type))
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
