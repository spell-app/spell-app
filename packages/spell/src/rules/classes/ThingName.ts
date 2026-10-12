import { proto } from "$/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"

/**
 * `thing_name` rule:  the name of one thing, written bare after its type (epic `drawable-thing` P19).
 * - e.g. `T1` in `tableau T1`
 * - One word starting with a capital letter:  `T1`, `Stock`, `North-Pile`.
 * - Why a capital:
 *   so `tableau T1` can't be read where a lowercase word means something else, e.g. `turn card over`.
 *   - A name in lowercase is written in quotes instead:  `foundation "clubs"`.
 * - Its AST is the name as text, e.g. `"T1"`.
 */
export class ThingName extends P.Pattern {
  @proto static matchGroup = "name"
  @proto static pattern = /^[A-Z][\w-]*$/

  getAST(match: P.MatchFor<this>): P.ASTStringLiteral {
    return new P.ASTStringLiteral(match, { value: `${match.value}`, quote: '"' })
  }
}
classes.addRule(ThingName, {
  tests: [
    {
      tests: [
        ["T1", '"T1"'],
        ["North-Pile", '"North-Pile"'],
        { title: "lowercase:  quote it instead", input: "stock", js: undefined }
      ]
    }
  ]
})
