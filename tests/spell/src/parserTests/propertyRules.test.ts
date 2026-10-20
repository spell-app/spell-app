import { describe, expect, test } from "vite-plus/test"

import { parseSpellProject } from "$/spell/test"

/**
 * PROPERTY RULES (epic `property-editor` P9):  what a property's value must be, beyond its type, said on its type.
 * - Three places, the same rules:
 *   - a line of its own (`property_must`)
 *   - the property's own line (`, which must ...`)
 *   - indented under it (`property_body_must`)
 *   - `as a url` / `as an email` bring one too
 * - Each lands in two places:
 *   - the class's schema:  `declareProp(..., { rules })` or `declareRules()`
 *   - the property's record, which its declarations write out
 */
describe("property rules", () => {
  test("a line of its own:  `Card.declareRules(...)` after the class, and on the property's record", () => {
    const { compiled, rulesOf } = parse([
      "a card is a thing where:",
      "\t- it has a title as text",
      "\t- its title must not be empty",
      '\t- title must match "^[A-Z]" with suggestion "Start with a capital"'
    ])
    expect(compiled).toContain('Card.declareRules("title", [{ type: "empty" }])')
    expect(compiled).toContain(
      'Card.declareRules("title", [{ type: "regExp", value: "/^[A-Z]/", prompt: "Start with a capital" }])'
    )
    expect(rulesOf("Card", "title")).toEqual([
      { type: "empty" },
      { type: "regExp", value: "/^[A-Z]/", prompt: "Start with a capital" }
    ])
  })

  test("on the property's line, and indented under it:  in its declaration", () => {
    const { compiled, rulesOf } = parse([
      "a card is a thing where:",
      "\t- it has a name as text, which must be at most 40 letters long",
      "\t- it has a rating as a number",
      "\t\t- it must be between 1 and 5",
      '\t\t- must be at least 2, saying "Two or more"'
    ])
    expect(compiled).toContain(
      'this.declareProp("name", { type: "text", rules: [{ type: "maxLength", value: "40" }] })'
    )
    expect(rulesOf("Card", "rating")).toEqual([
      { type: "range", value: "1..5" },
      { type: "minValue", value: "2", prompt: "Two or more" }
    ])
    // the comment above it says the rules under it, a line each
    expect(compiled).toContain(["  // - it has a rating as a number", "  //   - it must be between 1 and 5"].join("\n"))
  })

  test("every rule word", () => {
    const { rulesOf } = parse([
      "a person is a thing where:",
      "\t- it has a name as text",
      "\t\t- it must not be empty",
      "\t\t- it must be at least 2 letters long",
      "\t- it has an age as a number",
      "\t\t- it must be at least 0",
      "\t\t- it must be at most 120",
      "\t- it has a contact as text, which must be an email",
      "\t- it has a site as text, which must be a url"
    ])
    expect(rulesOf("Person", "name")).toEqual([{ type: "empty" }, { type: "minLength", value: "2" }])
    expect(rulesOf("Person", "age")).toEqual([
      { type: "minValue", value: "0" },
      { type: "maxValue", value: "120" }
    ])
    expect(rulesOf("Person", "contact")).toEqual([{ type: "email" }])
    expect(rulesOf("Person", "site")).toEqual([{ type: "url" }])
  })

  test("`as a url` / `as an email`:  text, with the rule", () => {
    const { compiled, rulesOf } = parse([
      "a person is a thing where:",
      "\t- it has a homepage as a url",
      "\t- its email is an email"
    ])
    expect(compiled).toContain('this.declareProp("homepage", { type: "text", rules: [{ type: "url" }] })')
    expect(rulesOf("Person", "email")).toEqual([{ type: "email" }])
  })

  test("a rule for a property its type doesn't declare (above it):  a warning", () => {
    const { warnings } = parse(["a card is a thing where:", "\t- its title must not be empty"])
    expect(warnings.join("\n")).toContain('Declare "title" above its rule')
  })
})

/** `lines`, a file, parsed and compiled -- with its warnings, and each property's rules as its record holds them. */
function parse(lines: string[]) {
  const { files } = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }])
  const [file] = files
  if (file!.errors.length) throw new Error(`parse errors:\n${JSON.stringify(file!.errors, null, 2)}`)
  return {
    compiled: file!.compiled,
    warnings: file!.warnings.map(String),
    rulesOf: (type: string, property: string) => file!.scope.types?.get(type)?.variables.get(property)?.rules
  }
}
