import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { type FieldValue, Validator } from "$/ui/elements"

afterEach(() => {
  vi.restoreAllMocks()
})

const validator = new Validator()

/** `[rule, value, passes]` rows, one or more per rule. */
const CASES: [string, FieldValue, boolean][] = [
  ["notEmpty", "x", true],
  ["notEmpty", "  ", false],
  ["notEmpty", "", false],
  ["notEmpty", null, false],
  ["notEmpty", [], false],
  ["notEmpty", ["a"], true],
  ["notEmpty", false, false],
  ["notEmpty", 0, true],
  ["checked", true, true],
  ["checked", false, false],
  ["checked", "on", true],
  ["checked", "", false],
  ["email", "owen@example.com", true],
  ["email", "owen@", false],
  ["url", "https://example.com/x", true],
  ["url", "www.example.com", true],
  ["url", "example", false],
  ["regExp[/^[a-z]+$/i]", "Hello", true],
  ["regExp[/^[a-z]+$/]", "Hello", false],
  ["regExp[^\\d{3}$]", "123", true],
  ["minValue[5]", "5", true],
  ["minValue[5]", "4.9", false],
  ["maxValue[5]", "-10", true],
  ["maxValue[5]", "6", false],
  ["integer", "-12", true],
  ["integer", "1.5", false],
  ["integer[1..10]", "10", true],
  ["integer[1..10]", "11", false],
  ["integer[..0]", "-3", true],
  ["range[1..3]", "2", true],
  ["range[1..3]", "4", false],
  ["decimal", "1.25", true],
  ["decimal", "-1.25", false],
  ["decimal", "abc", false],
  ["number", "-0.5", true],
  ["number", "", true],
  ["number", "1e3", false],
  ["number[0..1]", "2", false],
  ["is[Dog]", "dog", true],
  ["is[Dog]", "cat", false],
  ["isExactly[Dog]", "dog", false],
  ["isExactly[Dog]", "Dog", true],
  ["not[Dog]", "DOG", false],
  ["not[Dog]", "cat", true],
  ["notExactly[Dog]", "dog", true],
  ["notExactly[Dog]", "Dog", false],
  ["contains[ell]", "HELLO", true],
  ["contains[x]", "hello", false],
  ["containsExactly[ell]", "HELLO", false],
  ["containsExactly[ell]", "hello", true],
  ["doesntContain[ELL]", "hello", false],
  ["doesntContain[x]", "hello", true],
  ["doesntContainExactly[ELL]", "hello", true],
  ["doesntContainExactly[ell]", "hello", false],
  ["minLength[3]", "abc", true],
  ["minLength[3]", "ab", false],
  ["exactLength[3]", "abc", true],
  ["exactLength[3]", "abcd", false],
  ["maxLength[3]", "abc", true],
  ["maxLength[3]", "abcd", false],
  ["size[2..4]", "abc", true],
  ["size[2..4]", "a", false],
  ["size[2..4]", "abcde", false],
  ["minCount[2]", ["a", "b"], true],
  ["minCount[2]", "a", false],
  ["minCount[2]", "a,b,c", true],
  ["exactCount[2]", ["a", "b"], true],
  ["exactCount[2]", ["a"], false],
  ["exactCount[0]", "", true],
  ["maxCount[2]", ["a", "b", "c"], false],
  ["maxCount[2]", "a,b", true],
  ["maxCount[0]", [], true],
  ["creditCard", "4111 1111 1111 1111", true],
  ["creditCard", "4111-1111-1111-1112", false],
  ["creditCard", "378282246310005", true],
  ["creditCard", "", false],
  ["creditCard", "abcd", false],
  ["creditCard[visa]", "4111111111111111", true],
  ["creditCard[amex]", "4111111111111111", false],
  ["creditCard[visa,amex]", "378282246310005", true],
  ["creditCard[unionPay]", "6200000000000000", true]
]

describe("Validator rules", () => {
  it.each(CASES)("%s on %j => %j", (rule, value, passes) => {
    expect(validator.test(rule, value)).toBe(passes)
  })

  it("covers every built-in rule", () => {
    const tested = new Set(CASES.map(([rule]) => validator.parseRule(rule).type))
    tested.add("match").add("different")
    expect([...tested].sort()).toEqual(Object.keys(validator.rules).sort())
  })

  it("accepts a real RegExp", () => {
    expect(validator.test({ type: "regExp", value: /^a/g }, "abc")).toBe(true)
    expect(validator.test({ type: "regExp", value: /^a/g }, "abc")).toBe(true)
  })
})

describe("Validator cross-field rules", () => {
  const fieldValues = { password: "secret", empty: "" }

  it("match compares with another field", () => {
    expect(validator.test("match[password]", "secret", fieldValues)).toBe(true)
    expect(validator.test("match[password]", " secret ", fieldValues)).toBe(true)
    expect(validator.test("match[password]", "other", fieldValues)).toBe(false)
    expect(validator.test("match[missing]", "secret", fieldValues)).toBe(false)
  })

  it("different compares with another field", () => {
    expect(validator.test("different[password]", "other", fieldValues)).toBe(true)
    expect(validator.test("different[password]", "secret", fieldValues)).toBe(false)
    expect(validator.test("different[missing]", "other", fieldValues)).toBe(false)
  })

  it("names the other field by its label", () => {
    const result = validator.validate("x", ["match[password]"], {
      label: "Confirm",
      fieldValues,
      fieldLabels: { password: "Password" }
    })
    expect(result.message).toBe("Confirm must match Password field")
  })
})

describe("Validator.parseRule()", () => {
  it("splits type and bracket", () => {
    expect(validator.parseRule("minLength[6]")).toEqual({ type: "minLength", value: "6" })
    expect(validator.parseRule("email")).toEqual({ type: "email", value: undefined })
    expect(validator.parseRule("regExp[/^[a-z]+$/]")).toEqual({ type: "regExp", value: "/^[a-z]+$/" })
  })

  it("keeps an object's prompt and value", () => {
    expect(validator.parseRule({ type: "minLength[6]", prompt: "Too short" })).toEqual({
      type: "minLength",
      value: "6",
      prompt: "Too short"
    })
    expect(validator.parseRule({ type: "maxLength", value: "3" })).toEqual({
      type: "maxLength",
      value: "3",
      prompt: undefined
    })
  })
})

describe("Validator.validate()", () => {
  it("is valid with empty flags and message", () => {
    expect(validator.validate("abc", ["notEmpty", "minLength[2]"])).toEqual({
      valid: true,
      errors: [],
      flags: {},
      message: ""
    })
  })

  it("reports every failure with Fomantic's prompts", () => {
    const result = validator.validate("", ["notEmpty", "email", "minLength[6]"], { name: "email", label: "E-mail" })
    expect(result.valid).toBe(false)
    expect(result.errors.map((error) => error.message)).toEqual([
      "E-mail must have a value",
      "E-mail must be a valid e-mail",
      "E-mail must be at least 6 characters"
    ])
    expect(result.message).toBe("E-mail must have a value")
    expect(result.flags).toEqual({ valueMissing: true, typeMismatch: true, tooShort: true })
  })

  it("falls back to the name, then 'This field'", () => {
    expect(validator.validate("", ["notEmpty"], { name: "age" }).message).toBe("age must have a value")
    expect(validator.validate("", ["notEmpty"]).message).toBe("This field must have a value")
  })

  it("appends Fomantic's range suffix to type prompts", () => {
    expect(validator.validate("11", ["integer[1..10]"], { label: "Age" }).message).toBe(
      "Age must be an integer and must be in a range from 1 to 10"
    )
    expect(validator.validate("x", ["integer[..10]"], { label: "Age" }).message).toBe(
      "Age must be an integer and must have a maximum value of 10"
    )
    expect(validator.validate("x", ["decimal[2..]"], { label: "Age" }).message).toBe(
      "Age must be a decimal number and must have a minimum value of 2"
    )
    expect(validator.validate("a", ["size[2..4]"], { label: "Code" }).message).toBe(
      "Code must have a length between 2 and 4 characters"
    )
    expect(validator.validate("9", ["range[1..3]"], { label: "Pick" }).message).toBe(
      "Pick must be in a range from 1 to 3"
    )
  })

  it("interpolates {value}, {ruleValue} and {identifier} in custom prompts", () => {
    const result = validator.validate(
      "cat",
      [{ type: "is[dog]", prompt: "{identifier}: {value} is not {ruleValue}" }],
      {
        name: "pet"
      }
    )
    expect(result.message).toBe("pet: cat is not dog")
    const fn = validator.validate("cat", [{ type: "is[dog]", prompt: (value) => `no ${value}` }])
    expect(fn.message).toBe("no cat")
  })

  it("skips blank optional fields", () => {
    expect(validator.validate("  ", ["email"], { optional: true }).valid).toBe(true)
    expect(validator.validate("x", ["email"], { optional: true }).valid).toBe(false)
  })

  it("trims unless told not to", () => {
    expect(validator.validate(" abc ", ["exactLength[3]"]).valid).toBe(true)
    expect(validator.validate(" abc ", ["exactLength[3]"], { trim: false }).valid).toBe(false)
  })

  it("warns about unknown rules and skips them", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(validator.validate("", ["notEmty"]).valid).toBe(true)
    expect(warn).toHaveBeenCalledWith('[@spell-app/ui] Validator: unknown rule "notEmty", did you mean "notEmpty"?')
  })
})

describe("Validator Constraint Validation flags", () => {
  it.each<[string, FieldValue, keyof ValidityStateFlags]>([
    ["notEmpty", "", "valueMissing"],
    ["checked", false, "valueMissing"],
    ["email", "x", "typeMismatch"],
    ["url", "x", "typeMismatch"],
    ["creditCard", "1234", "typeMismatch"],
    ["regExp[/^a/]", "b", "patternMismatch"],
    ["minLength[3]", "a", "tooShort"],
    ["maxLength[1]", "ab", "tooLong"],
    ["exactLength[3]", "ab", "tooShort"],
    ["exactLength[3]", "abcd", "tooLong"],
    ["size[2..3]", "a", "tooShort"],
    ["size[2..3]", "abcd", "tooLong"],
    ["minValue[5]", "4", "rangeUnderflow"],
    ["minValue[5]", "x", "typeMismatch"],
    ["maxValue[5]", "6", "rangeOverflow"],
    ["integer", "1.5", "typeMismatch"],
    ["integer[1..10]", "0", "rangeUnderflow"],
    ["integer[1..10]", "11", "rangeOverflow"],
    ["range[1..3]", "4", "rangeOverflow"],
    ["decimal[1..2]", "0.5", "rangeUnderflow"],
    ["number[..2]", "3", "rangeOverflow"],
    ["minCount[2]", ["a"], "rangeUnderflow"],
    ["maxCount[1]", ["a", "b"], "rangeOverflow"],
    ["exactCount[2]", ["a"], "rangeUnderflow"],
    ["exactCount[2]", ["a", "b", "c"], "rangeOverflow"],
    ["is[x]", "y", "customError"],
    ["contains[x]", "y", "customError"]
  ])("%s on %j => %s", (rule, value, flag) => {
    expect(validator.validate(value, [rule]).flags).toEqual({ [flag]: true })
  })

  it("feeds ElementInternals.setValidity()", () => {
    /** Form-associated element to prove the result shape is accepted as is. */
    class Field extends HTMLElement {
      static formAssociated = true
      internals = this.attachInternals()
    }
    customElements.define("validator-test-field", Field)
    const field = new Field()
    const invalid = validator.validate("", ["notEmpty"], { label: "Name" })
    field.internals.setValidity(invalid.flags, invalid.message)
    expect(field.internals.validity.valueMissing).toBe(true)
    expect(field.internals.validationMessage).toBe("Name must have a value")
    const valid = validator.validate("x", ["notEmpty"])
    field.internals.setValidity(valid.flags, valid.message)
    expect(field.internals.validity.valid).toBe(true)
  })
})

describe("Validator overrides", () => {
  it("lets an instance swap prompts without touching the prototype", () => {
    const spanish = new Validator()
    spanish.prompts = { ...spanish.prompts, notEmpty: "{name} debe tener un valor" }
    spanish.text = { ...spanish.text, unspecifiedField: "Este campo" }
    expect(spanish.validate("", ["notEmpty"]).message).toBe("Este campo debe tener un valor")
    expect(validator.validate("", ["notEmpty"]).message).toBe("This field must have a value")
  })

  it("lets a subclass add rules", () => {
    class Custom extends Validator {}
    const custom = new Custom()
    custom.rules = { ...custom.rules, even: (value) => Number(value) % 2 === 0 }
    custom.prompts = { ...custom.prompts, even: "{name} must be even" }
    expect(custom.validate("3", ["even"], { label: "N" }).message).toBe("N must be even")
  })
})
