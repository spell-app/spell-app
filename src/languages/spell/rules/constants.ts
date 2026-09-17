//
//  # Rules for constants, variables, type names, etc
//
import { P, AST } from "~/parser"
import { SpellParser } from "~/languages/spell"
import { identifierBlacklist } from "./identifier-blacklist"
import "./match-fields.B"

export class SpellConstant extends P.Rules.Pattern {
  static {
    Object.defineProperty(this.prototype, "name", { value: "constant", writable: true })
    // Alpha-numeric word, including dashes or underscores.
    Object.defineProperty(this.prototype, "pattern", { value: P.ALPHANUMERIC_WORD_WITH_DASHES, writable: true })
    Object.defineProperty(this.prototype, "blacklist", { value: identifierBlacklist, writable: true })
  }

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    if (!match) return undefined
    match.constant = scope.constants?.get(match.value)
    return match
  }

  getAST(match: P.Match): AST.ConstantExpression {
    const name: string = match.constant ? match.constant.name : match.value
    const scopeConst = match.constant || match.scope.constants?.get(name)
    return new AST.ConstantExpression(match, {
      name,
      output: (scopeConst || new P.ScopeConstant(name)).toString(),
      constant: scopeConst
    })
  }
}
SpellParser.Rules.Constant = SpellConstant

export const constants = new SpellParser({
  module: "constants",
  rules: [
    // A possibly-unknown constant.
    // `match.constant` will be the existing ScopeConstant if one already exists.
    {
      name: "constant",
      constructor: class constant extends SpellConstant {},
      tests: [
        {
          tests: [
            { title: "single word", input: "red", output: "'red'" },
            { title: "multi-word", input: "orangish-red", output: "'orangish-red'" },
            { title: "blacklisted word", input: "if", output: undefined }
          ]
        }
      ]
    },

    // A known single-word constant.
    // Note that this is defined as an "expression".
    {
      name: "known_constant",
      alias: "expression",
      constructor: class known_constant extends SpellConstant {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (!match || !match.constant) return undefined
          return match
        }
      },
      tests: [
        {
          compileAs: "known_constant", // TODO: to "expression"
          beforeEach(scope: P.Scope) {
            // `Scope.constants` is typed narrowly (`IndexedList<ScopeConstant>`); the concrete `RootScope`
            // accepts a plain name string or `ScopeConstantProps` too -- see report.
            const { constants } = scope as P.RootScope
            constants.add("red")
            constants.add({ name: "green", output: "#00FF00" })
          },
          tests: [
            { title: "known constant", input: "red", output: "'red'" },
            { title: "known constant w/specific value", input: "green", output: "#00FF00" },
            { title: "unknown constant", input: "missing", output: undefined }
          ]
        }
      ]
    }
  ]
})
