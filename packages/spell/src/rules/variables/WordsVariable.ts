import { variables } from "./variables.parser"
import { Variable } from "./Variable"

/**
 * `words_variable` rule:  a variable of several words, known or not, e.g. `the start pile` (epic page `outline-spell`, P26).
 * - What `set start pile to ...` declares:  see `words_assignment`.
 * - See `words_identifier`.
 */
export class WordsVariable extends Variable {}
variables.addRule(WordsVariable, {
  syntax: "the? {identifier:words_identifier}",
  tests: [{ tests: [["the start pile", "startPile"]] }]
})
