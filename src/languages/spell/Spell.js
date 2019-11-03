//
//  ## Spell langugage Module root.
//
import { DebugLevel, Module, Parser, Tokenizer, WhitespacePolicy, addDebugMethods, proto } from "./all.js"

export const Spell = {
  // Create a logger set to `warn`
  logger: addDebugMethods({}, "spell", DebugLevel.WARN),

  // Add language-specific rules here, e.g. `Spell.Rule.Statement`
  Rule: {},

  // Parser constructor for the spell lanugage.
  Parser: class SpellParser extends Parser {
    // Name of our default rule to parse if calling `parser.parse(text)`.
    @proto defaultRule = "block"

    @proto tokenizer = new Tokenizer({
      // Remove "normal" whitespace (leaving newlines and indents) when parsing
      whitespacePolicy: WhitespacePolicy.LEADING_ONLY
    })

    // Return a scope with a new parser which depends on this parser.
    // This lets us update rules/etc as desired without affecting the original parser.
    // DOCME
    getScope(moduleName = this.module || "ad_hoc") {
      // Make sure `Object`, `Thing` and `List` types are defined for all modules
      // TODO: this is hacky, better way to do it???
      if (!Spell.rootScope) {
        Spell.rootScope = new Module({ name: "spellRoot", types: ["Object", "Thing", "List"] })
      }

      const parser = this.clone({ module })
      return new Module({ name: moduleName, parser, scope: Spell.rootScope })
    }

    // If we're tokenizing "block", parse them into blocks.
    tokenize(text, ruleName) {
      const tokens = super.tokenize(text)
      if (ruleName === "block") return this.tokenizer.breakIntoBlocks(tokens)
      return tokens
    }
  }
}
