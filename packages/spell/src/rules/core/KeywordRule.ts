import { assert, proto } from "$/util"
import { P } from "$/parser"
import { core } from "./core.parser"

/**
 * `keyword` rule:  single alphanumeric word used as a keyword, e.g. in a method definition.
 * - e.g. `abc`
 * - Case is not a factor, but it must start with a letter.
 * - Class named `KeywordRule`, not `Keyword`, which would read as the parser's `P.Keyword`.
 */
export class KeywordRule extends P.Pattern {
  static ruleName = "keyword"
  @proto static pattern = /^[a-zA-Z][\w-]*$/

  /** Converts dashes to underscores when compiling, so `abc-def` outputs as valid JS identifier `abc_def`. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }

  getAST(match: P.MatchFor<this>): P.ASTKeywordLiteral {
    const { value, raw } = match
    return new P.ASTKeywordLiteral(match, { value: assert.string(value), raw })
  }
}
core.addRule(KeywordRule, {
  tests: [
    {
      title: "correctly matches words",
      tests: [
        ["abc", "abc"],
        ["abc-def", "abc_def"],
        ["abc_def", "abc_def"],
        ["abc01", "abc01"],
        ["abc-def_01", "abc_def_01"]
      ]
    },
    {
      title: "doesn't match things that aren't words",
      tests: [
        ["$asda", undefined],
        ["(asda)", undefined] // TODO... ???
      ]
    }
  ]
})
