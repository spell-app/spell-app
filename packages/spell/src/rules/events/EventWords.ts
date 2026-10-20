import { P } from "$/parser"
import { SpellIdentifier } from "$/spell/rules/variables"
import { events } from "./events.parser"

/** Most words an event's name may have. */
const MAX_WORDS = 4

/**
 * `event_words` rule:  an event's name of several words, e.g. `card click` (epic page `outline-spell`, P26).
 * - The same event as its dashed name:  `on card click` hears `fire event card-click`, and the other way round.
 * - 2 to 4 plain words, up to a structural one, e.g. `with` in `on card click with a card`.
 * - One word stays a `keyword`, as `on start` always was.
 */
export class EventWords extends SpellIdentifier {
  /** Quick test:  two words, at least. */
  test(scope: P.Scope, tokens: P.Token[], start = 0) {
    return super.test(scope, tokens, start) && super.test(scope, tokens, start + 1)
  }

  /** The words, dashed:  `card click` is `card-click`, as a one-word event name is written. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    let length = 0
    while (length < MAX_WORDS && super.test(scope, tokens, length)) length++
    if (length < 2) return undefined
    const taken = tokens.slice(0, length)
    const name = taken.map((token) => `${token.value}`).join("-")
    return new P.Match({ rule: this, matched: taken, raw: name, value: name, tokens: taken, scope })
  }
}
events.addRule(EventWords)
