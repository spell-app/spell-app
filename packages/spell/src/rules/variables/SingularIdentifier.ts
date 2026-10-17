import { type Plurality } from "$/util"
import { P } from "$/parser"
import { SpellIdentifier } from "./SpellIdentifier"
import { variables } from "./variables.parser"

/**
 * `singular_identifier` rule:  possibly-unknown variable identifier which MUST be singular, WITHOUT `the`
 *   -- fails on plural input.
 */
export class SingularIdentifier extends SpellIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite plural will do -- uncountable words (`"either"`) match here AND in `plural_identifier`.
    if (!match || super.getPlurality(match) === "plural") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS singular as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "singular"
  }
}
variables.addRule(SingularIdentifier, {
  tests: [
    {
      tests: [
        { title: "singular, single word", input: "thing", js: "thing" },
        { title: "singular, multi-word", input: "bank-account", js: "bankAccount" },
        { title: "uncountable, matches as singular too", input: "sheep", js: "sheep" },
        { title: "plural, single word", input: "things", js: undefined },
        { title: "plural, multi-word", input: "bank-accounts", js: undefined }
      ]
    }
  ]
})
