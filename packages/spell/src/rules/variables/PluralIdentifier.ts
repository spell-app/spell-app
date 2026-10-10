import { type Plurality } from "$/util"
import { P } from "$/parser"
import { SpellIdentifier } from "./SpellIdentifier"
import { variables } from "./variables.parser"

/**
 * `plural_identifier` rule:  possibly-unknown variable identifier which MUST be plural, WITHOUT `the`
 *   -- fails on singular input.
 */
export class PluralIdentifier extends SpellIdentifier {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    // Anything but a definite singular will do -- uncountable words (`"either"`) match here AND in `singular_identifier`.
    if (!match || super.getPlurality(match) === "singular") return undefined
    return match
  }

  /** Whatever the word, a match of ours IS plural as far as anyone downstream is concerned. */
  getPlurality(_match: P.MatchFor<this>): Plurality {
    return "plural"
  }
}
variables.addRule(PluralIdentifier, {
  tests: [
    {
      tests: [
        { title: "uncountable, matches as plural too", input: "sheep", js: "sheep" },
        { title: "plural, single word", input: "things", js: "things" },
        { title: "plural, multi-word", input: "bank-accounts", js: "bankAccounts" },
        { title: "singular, single word", input: "thing", js: undefined },
        { title: "singular, multi-word", input: "bank-account", js: undefined }
      ]
    }
  ]
})
