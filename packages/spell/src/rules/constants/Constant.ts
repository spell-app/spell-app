import { constants } from "./constants.parser"
import { SpellConstant } from "./SpellConstant"

/**
 * `constant` rule:  possibly-unknown constant identifier.
 * - `match.data.scopeConstant` will be the existing `ScopeConstant` if one already exists.
 * - Compiles to a quoted string literal of its own name when unknown, e.g. `red` => `'red'`.
 */
export class Constant extends SpellConstant {}
constants.addRule(Constant, {
  tests: [
    {
      tests: [
        { title: "single word", input: "red", js: "'red'", ts: '"red"' },
        { title: "multi-word", input: "orangish-red", js: "'orangish-red'", ts: '"orangish-red"' },
        { title: "blacklisted word", input: "if", js: undefined }
      ]
    }
  ]
})
