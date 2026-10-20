import { proto } from "@spell-app/util"
import { P } from "$/parser"
import { classes } from "./classes.parser"
import { TypeSpecifierInstance } from "./TypeSpecifierInstance"

/**
 * `outline_specifier_instance` rule:  `a new foundation with ...` --
 * a property's starting value, in a type's outline body (epic `outline-spell` P19).
 * - e.g. `- its clubs is a new foundation with name = clubs, symbol = "♣️"`
 * - The outline twin of `has ... as a new ...` (`type_specifier_instance`):
 *   the same starting value, made once per thing, and the property's type is the new thing's.
 */
export class OutlineSpecifierInstance extends TypeSpecifierInstance {
  @proto static alias = "outline_specifier"

  /** Quick test:  `a new` or `an new` first, as every outline specifier is tried on every body line. */
  test(_scope: P.Scope, tokens: P.Token[], start = 0) {
    const article = tokens[start] as P.Token | undefined
    return !!article?.matchesLiteral(["a", "an"]) && !!tokens[start + 1]?.matchesLiteral("new")
  }
}
classes.addRule(OutlineSpecifierInstance, {
  syntax: "({new_list}|{new_thing})",
  tests: [
    {
      tests: [
        ["a new thing", "new Thing()"],
        ["a new thing with a=1, b = true", "new Thing({ a: 1, b: true })"]
      ]
    }
  ]
})
