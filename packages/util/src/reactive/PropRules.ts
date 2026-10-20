/**
 * PROP RULES:  what a prop's value must be, beyond its type -- "its title must not be empty" (epic `property-editor`
 * P9).
 * - Written in spell on the type, compiled into its class's schema:  `declareProp("title", { rules: [...] })`, or
 *   `Card.declareRules("title", [...])` for a rule on a line of its own.
 * - Each rule is Fomantic's object form, as Spell UI's form checks read it (`ui`'s `Validator`):
 *   `{ type: "minLength", value: "3", prompt: "Make it longer" }`.  So a form drawn for the type checks the same rules,
 *   in its own words.
 * - Here:  whether a value keeps them, for a setter's WARNING (never a refusal), and what to say when it doesn't.
 * - GENERIC, as the rest of `$/util/reactive`:  no lodash, nothing spell-specific.
 */

/** The rules a prop may have, by Fomantic's names. */
export const PropRuleTypes = [
  "empty",
  "regExp",
  "minLength",
  "maxLength",
  "range",
  "minValue",
  "maxValue",
  "email",
  "url"
] as const
export type PropRuleType = (typeof PropRuleTypes)[number]

/**
 * One rule of a prop, in Fomantic's object form.
 * - `type`:  which rule;  `empty` means "must NOT be empty", as Fomantic's does
 * - `value`:  its setting, as text:  `"3"` for a length, `"1..5"` for a range, `"/^\d+$/"` for a pattern
 * - `prompt`:  what to say when it's broken, in place of the rule's own words
 */
export type PropRule = {
  type: PropRuleType
  value?: string
  prompt?: string
}

/**
 * The first of `rules` that `value` breaks, else `undefined`.
 * - An empty value (`undefined`, `null`, `""`, an empty list) breaks only `empty`:  "must not be empty" is what says a
 *   value is required, so the others pass it, as a form's checks do.
 * - Lengths count a list's items, else the text's characters;  numbers are read from text too (`"7"`).
 */
export function brokenRule(value: unknown, rules: readonly PropRule[] | undefined): PropRule | undefined {
  return rules?.find((rule) => !keepsRule(value, rule))
}

/**
 * What a setter warns when `property` breaks `rule`, before the value:  `title must not be empty`, or with its own
 * words, `title:  Write it like 1.2.3`.
 */
export function ruleWarning(property: string, rule: PropRule): string {
  return rule.prompt ? `${property}:  ${rule.prompt}` : `${property} ${ruleText(rule)}`
}

/**
 * What `rule` asks for, in English:  `must not be empty`, `must be at least 3 letters long`.
 * - Its `prompt` when it has one.
 * - Spell's own words, so a warning reads as the rule was written.
 */
export function ruleText(rule: PropRule): string {
  if (rule.prompt) return rule.prompt
  const [min, max] = (rule.value ?? "").split("..")
  switch (rule.type) {
    case "empty":
      return "must not be empty"
    case "regExp":
      return `must match ${rule.value}`
    case "minLength":
      return `must be at least ${rule.value} letters long`
    case "maxLength":
      return `must be at most ${rule.value} letters long`
    case "range":
      return `must be between ${min} and ${max}`
    case "minValue":
      return `must be at least ${rule.value}`
    case "maxValue":
      return `must be at most ${rule.value}`
    case "email":
      return "must be an email"
    case "url":
      return "must be a url"
  }
}

/**
 * Pattern `text` as a `RegExp`:  `"/^\d+$/i"`, or a bare `"^\d+$"`.
 * - `undefined` for one that isn't a pattern, which then passes everything:  a typo in a rule never breaks a program.
 */
export function rulePattern(text: string | undefined): RegExp | undefined {
  if (!text) return undefined
  const slashed = /^\/(.*)\/([a-z]*)$/s.exec(text)
  try {
    return slashed ? new RegExp(slashed[1]!, slashed[2]) : new RegExp(text)
  } catch {
    return undefined
  }
}

////////////////
// ## Helpers
////////////////

/** Does `value` keep `rule`?  See `brokenRule()`. */
function keepsRule(value: unknown, rule: PropRule): boolean {
  if (isEmpty(value)) return rule.type !== "empty"
  const text = Array.isArray(value) ? "" : String(value)
  switch (rule.type) {
    case "empty":
      return true
    case "regExp":
      return rulePattern(rule.value)?.test(text) ?? true
    case "minLength":
      return lengthOf(value) >= Number(rule.value)
    case "maxLength":
      return lengthOf(value) <= Number(rule.value)
    case "range": {
      const [min, max] = (rule.value ?? "").split("..")
      return inRange(text, min, max)
    }
    case "minValue":
      return inRange(text, rule.value, undefined)
    case "maxValue":
      return inRange(text, undefined, rule.value)
    case "email":
      return EMAIL.test(text)
    case "url":
      return URL_PATTERN.test(text)
  }
}

/** Nothing to check:  `undefined`, `null`, blank text, an empty list. */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (Array.isArray(value)) return value.length === 0
  return typeof value === "string" && value.trim() === ""
}

/** A list's items, else its text's characters. */
function lengthOf(value: unknown): number {
  return Array.isArray(value) ? value.length : String(value).length
}

/** Is `text` a number from `min` to `max`, both included?  A bound left blank is open. */
function inRange(text: string, min: string | undefined, max: string | undefined): boolean {
  const number = Number(text)
  if (text.trim() === "" || Number.isNaN(number)) return false
  if (min !== undefined && min !== "" && number < Number(min)) return false
  if (max !== undefined && max !== "" && number > Number(max)) return false
  return true
}

/** An email address, as Fomantic's `email` rule reads one. */
const EMAIL = /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z]([\da-z-]*[\da-z])?(\.[\da-z]([\da-z-]*[\da-z])?)*$/i

/** A web address, as Fomantic's `url` rule reads one. */
const URL_PATTERN = /(https?:\/\/(?:www\.|(?!www))[^\s.]+\.\S{2,}|www\.\S+\.\S{2,})/i
