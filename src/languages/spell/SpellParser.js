import { proto, memoize } from "~/util"
import { ProjectScope, Parser, Tokenizer, WhitespacePolicy } from "~/parser"
import { spellParser } from "~/languages/spell"

export class SpellParser extends Parser {
  /** Add language-specific top-level rules to this object. */
  static Rule = {}

  // Name of the module in which we were defined.
  @proto module = undefined

  // Name of our default rule to parse if calling `parser.parse(text)`.
  @proto defaultRule = "block"

  @proto tokenizer = new Tokenizer({
    // Only support double-quotes as quote symbols (so we can do contractions with single quotes)
    quoteSymbols: [`"`],
    // Remove "normal" whitespace (leaving newlines and indents) when parsing
    whitespacePolicy: WhitespacePolicy.LEADING_ONLY
  })

  @memoize
  static get rootScope() {
    const scope = new ProjectScope({ name: "spellRoot", parser: spellParser })
    scope.types.add("Object")
    scope.types.add("Thing")
    scope.types.add("Drawable")
    scope.types.add("App")
    scope.types.add("List")
    return scope
  }
  // Return a scope with a new parser which depends on this parser.
  // This lets us update rules/etc as desired without affecting the original parser.
  // DOCME
  getScope(moduleName = "ad_hoc") {
    const parser = this.clone({ module: moduleName })
    return new ProjectScope({
      name: moduleName,
      parser,
      scope: SpellParser.rootScope
    })
  }

  // If we're tokenizing "block", parse them into blocks.
  tokenize(input, ruleName) {
    const tokens = super.tokenize(input)
    if (typeof input === "string" && ruleName === "block") return this.tokenizer.breakIntoBlocks(tokens)
    return tokens
  }
}
