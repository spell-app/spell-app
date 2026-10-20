import { P } from "$/parser"
import { KnownVariable } from "./KnownVariable"
import { variables } from "./variables.parser"

/**
 * `known_words_variable` rule:  a known variable of several words, read, e.g. `start pile`, `the test card`
 * (epic page `outline-spell`, P26).
 * - An expression, as `known_variable` is:  only once something declared it, e.g. `set start pile to ...`.
 * - See `words_identifier`.
 */
export class KnownWordsVariable extends KnownVariable {
  /**
   * Quick test:  2 to 4 words, after an optional `the`, a known variable goes by.
   * - It's an expression, so it's tried at almost every word:  the lookups are cheaper than a parse.
   */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    const first = tokens[start]?.matchesLiteral("the") ? start + 1 : start
    const words: string[] = []
    for (let index = first; index < first + 4 && index < tokens.length; index++) {
      words.push(`${tokens[index]!.value}`.toLowerCase())
      if (words.length >= 2 && scope.variables?.get(words.join("_"))) return true
    }
    return false
  }
}
variables.addRule(KnownWordsVariable, {
  syntax: "the? {identifier:words_identifier}",
  tests: [
    {
      compileAs: "known_words_variable",
      beforeEach(scope: P.Scope) {
        scope.variables?.add("start_pile")
      },
      tests: [
        ["start pile", "startPile"],
        ["the start pile", "startPile"],
        ["end pile", undefined]
      ]
    }
  ]
})
