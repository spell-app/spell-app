import { types } from "./types.parser"
import { SpellType } from "./SpellType"

/**
 * `type` rule:  possibly-unknown type identifier, singular or plural, e.g. `thing` or `things` => `Thing`.
 */
export class Type extends SpellType {}
types.addRule(Type, {
  tests: [
    {
      tests: [
        { title: "lower case", input: "thing", js: "Thing" },
        { title: "upper case", input: "Thing", js: "Thing" },
        { title: "multi-word, lower case", input: "bank-account", js: "Bank_Account" },
        { title: "multi-word, mixed case", input: "Bank-account", js: "Bank_Account" },
        { title: "multi-word, upper case", input: "Bank-Account", js: "Bank_Account" },
        { title: "blacklisted word", input: "if", js: undefined }
      ]
    }
  ]
})
