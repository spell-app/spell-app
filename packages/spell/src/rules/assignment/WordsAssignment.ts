import { assignment } from "./assignment.parser"
import { AssignmentStatement } from "./AssignmentStatement"

/**
 * `words_assignment` rule:  `set start pile to ...` -- sets, or declares, a variable of several words
 * (epic page `outline-spell`, P26).
 * - The same as `set start-pile to ...`:  see `assignment` and `words_identifier`.
 * - Read after as those words:  `if start pile is the stock`, `add test card to start pile`.
 */
export class WordsAssignment extends AssignmentStatement {}
assignment.addRule(WordsAssignment, {
  syntax: "set {thing:words_variable} to {value:expression}",
  tests: [
    {
      compileAs: "block",
      tests: [
        {
          title: "a new variable",
          input: "set start pile to yes",
          js: "export const startPile = true",
          ts: "export const startPile: boolean = true"
        }
      ]
    }
  ]
})
