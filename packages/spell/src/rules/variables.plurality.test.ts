import { describe, test, expect } from "vite-plus/test"
import { spellParser } from "$/spell"
import { variable, SpellIdentifier } from "./variables"

/** Plurality of `input` parsed as `ruleName`, asked the way other rules would ask. */
function pluralityOf(input: string, ruleName: string) {
  const scope = spellParser.getScope("test_plurality")
  if (ruleName === "known_variable") scope.variables.add(input.replace(/^the /, ""))
  const match = scope.parse(input, ruleName)
  if (match?.is(variable)) return match.rule.getPlurality(match)
  if (match?.is(SpellIdentifier)) return match.rule.getPlurality(match)
  return undefined
}

describe("getPlurality()", () => {
  test.each([
    ["thing", "identifier", "singular"],
    ["things", "identifier", "plural"],
    ["sheep", "identifier", "either"],
    ["the things", "variable", "plural"],
    ["the thing", "known_variable", "singular"],
    ["sheep", "singular_identifier", "singular"],
    ["sheep", "plural_identifier", "plural"]
  ])("'%s' as %s is %s", (input, ruleName, expected) => {
    expect(pluralityOf(input, ruleName)).toBe(expected)
  })
})
