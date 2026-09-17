import { getDerived } from "~/util"
import { P } from "~/parser"
import { spellParser } from "~/languages/spell"
import { spellCore } from "~/spellCore"
import type { SpellRuleRegistry } from "./rules/registry"

export class SpellParser extends P.Parser {
  /** Registry of language-specific rule classes, populated by the modules in `./rules`. Debug aid only. */
  static Rules: Partial<SpellRuleRegistry> = {}

  static {
    Object.defineProperty(this.prototype, "defaultRule", { value: "block", writable: true })
  }

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

  /** Override `addRule` to also add to `simple_expression` or `simple_statement` as necessary. */
  addRule(rule: P.Rule, names: string | string[]) {
    if (Array.isArray(names) && !rule["isLeftRecursive"]) {
      if (names.includes("expression")) names.push("simple_expression")
      if (names.includes("statement")) names.push("simple_statement")
    }
    return super.addRule(rule, names)
  }

  /**
   * `rootScope` for all spellParsers -- contains base rules, types, constants.
   * All project scopes will point back to this.
   */
  /*@memoize*/
  static get rootScope() {
    return getDerived(this, "rootScope", () => {
      const scope = new P.RootScope({ name: "spellRoot", parser: spellParser })
      // Add all BASE_TYPES defined in `spellCore`.
      // See: `src/spellCore/classes/index.ts`
      spellCore.BASE_TYPES.forEach((type) => scope.types.add(type))
      return scope
    })
  }

  // Return a scope with a new parser which depends on this parser.
  // This lets us update rules/etc as desired without affecting the original parser.
  // DOCME
  getScope(moduleName = "ad_hoc") {
    const parser = this.clone({ module: moduleName })
    return new P.ProjectScope({
      name: moduleName,
      parser,
      parentScope: SpellParser.rootScope
    })
  }

  // If we're tokenizing "block", parse them into blocks.
  tokenize(input: string, ruleName: string) {
    const tokens = super.tokenize(input)
    if (!tokens) return undefined
    if (typeof input === "string" && ruleName === "block") return this.tokenizer.breakIntoIndentedBlocks(tokens)
    return tokens
  }

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
   * `Parser.compile()` returns `unknown` (e.g. `rulex` compiles to `Rule` objects),
   * but spell always compiles down to a javascript source string.
   * Narrow that here so `SpellFile`/`SpellProject` compile paths can rely on `string`.
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
