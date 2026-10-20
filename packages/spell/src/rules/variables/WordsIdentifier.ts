import { NONE } from "$/util"
import { P } from "$/parser"
import { SpellIdentifier } from "./SpellIdentifier"
import { variables } from "./variables.parser"

/** Most words a name may have:  `cards still to move` would be 4. */
const MAX_WORDS = 4

/**
 * `words_identifier` rule:  a variable's name of several words, e.g. `start pile` (epic page `outline-spell`, P26).
 * - The same variable as its dashed name:  `start pile` and `start-pile` are both `start_pile`, `startPile` compiled.
 * - 2 to 4 plain words, up to a structural one (`to`, `of`, `is` ...):  `set start pile to ...` names `start pile`.
 *   - So a name can't hold one:  `cards-to-move` is written `moving cards`.
 * - The longest run of words a variable in scope goes by, else the whole run:
 *   `variable` declares the whole run (`set test card to ...`), `known_variable` reads a known one.
 */
export class WordsIdentifier extends SpellIdentifier {
  /** Quick test:  two words, at least. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return super.test(scope, tokens, start) && super.test(scope, tokens, start + 1)
  }

  /** The words, as one name -- see the class docstring. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    let run = 0
    while (run < MAX_WORDS && super.test(scope, tokens, run)) run++
    if (run < 2) return undefined
    const nameOf = (count: number) => this.mapValue<string>(WordsIdentifier.wordsOf(tokens, count))
    let length = run
    for (let count = run; count >= 2; count--) {
      if (scope.variables?.get(nameOf(count))) {
        length = count
        break
      }
    }
    const taken = tokens.slice(0, length)
    const raw = WordsIdentifier.wordsOf(tokens, length)
    const match: P.MatchFor<this> = new P.Match({
      rule: this,
      matched: taken,
      raw,
      value: nameOf(length),
      tokens: taken,
      scope
    })
    match.data.scopeVar = scope.variables?.get(match.value) ?? NONE
    return match
  }

  /** The first `count` of `tokens`' words, a space between each. */
  static wordsOf(tokens: P.Token[], count: number): string {
    return tokens
      .slice(0, count)
      .map((token) => `${token.value}`)
      .join(" ")
  }
}
variables.addRule(WordsIdentifier, {
  tests: [
    {
      tests: [
        ["start pile", "startPile"],
        ["anything changed", "anythingChanged"],
        ["pile", undefined],
        ["name of", undefined]
      ]
    }
  ]
})
