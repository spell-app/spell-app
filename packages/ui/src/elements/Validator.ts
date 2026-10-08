import { E } from "$/ui/core"

/****************
 * ### `Validator`
 * Fomantic's form validation rules (`form.js` `settings.rules`) as pure functions, with its English prompts.
 * - Why a port rather than native constraints alone:  Fomantic's rule vocabulary (`minLength[6]`, `match[password]`,
 *   `creditCard[visa,amex]`) is what `ui-form rules` and authors already speak.
 * - Output feeds `ElementInternals.setValidity(result.flags, result.message)` directly:  each rule maps to a
 *   Constraint Validation flag (`Validator.flags`), so `:invalid` / `:user-invalid` and `validity.*` just work.
 * - Rule semantics follow Fomantic exactly, quirks included (`number` accepts `""`), except where noted:
 *   - counts use the array length when the value IS an array, and `maxCount[0]` accepts an empty value
 *   - `range[a..b]` prompts interpolate `{min}` / `{max}` (Fomantic leaves them literal)
 *   - an empty range bound is open, so `minValue` / `maxValue` work (see `bounds()`)
 * - Data is `@proto static` so `UI.i18n` can swap `prompts` / `text` per instance, and a subclass can add rules.
 * - Fomantic's names stay where they're its API (`prompts`, `text`, `regExp`, `rules`, a rule's `(value, ruleValue)`);
 *   the steps rules share (`range()`, `normalize()`, `count()`:  `RuleValidator`) are ours.
 * - Library-neutral:  no DOM, no Solid;  of the core (`E`), it uses only `E.proto`, `E.suggest()`, `E.Warnings` and
 *   the folder's types.  Part of the `forms` entry:  reaches the core through the `$/ui/core` ENTRY, never its leaves
 *   (`forms.ts`).
 ****************/
export class Validator {
  /** Prompt per rule type, `{name}` ... interpolated;  see `@proto static prompts`. */
  declare prompts: Readonly<Record<string, string>>
  /** Words the prompts use;  see `@proto static text`. */
  declare text: E.ValidatorText
  /** Patterns the rules test;  see `@proto static regExp`. */
  declare regExp: E.ValidatorRegExps
  /** Card brands for `creditCard`;  see `@proto static cards`. */
  declare cards: Readonly<Record<string, E.CreditCardSpec>>
  /** Constraint Validation flag per rule;  see `@proto static flags`. */
  declare flags: E.ValidityFlagMap
  /** The rules by type;  see `@proto static rules`. */
  declare rules: Readonly<Record<string, E.RuleFunction>>

  ////////////////
  // ## Data
  ////////////////

  /** Fomantic's `settings.prompt`, verbatim.  `{name}`, `{value}`, `{ruleValue}`, `{min}`, `{max}`, `{identifier}`. */
  @E.proto static prompts: Readonly<Record<string, string>> = {
    range: "{name} must be in a range from {min} to {max}",
    maxValue: "{name} must have a maximum value of {ruleValue}",
    minValue: "{name} must have a minimum value of {ruleValue}",
    notEmpty: "{name} must have a value",
    checked: "{name} must be checked",
    email: "{name} must be a valid e-mail",
    url: "{name} must be a valid url",
    regExp: "{name} is not formatted correctly",
    integer: "{name} must be an integer",
    decimal: "{name} must be a decimal number",
    number: "{name} must be set to a number",
    is: '{name} must be "{ruleValue}"',
    isExactly: '{name} must be exactly "{ruleValue}"',
    not: '{name} cannot be set to "{ruleValue}"',
    notExactly: '{name} cannot be set to exactly "{ruleValue}"',
    contains: '{name} must contain "{ruleValue}"',
    containsExactly: '{name} must contain exactly "{ruleValue}"',
    doesntContain: '{name} cannot contain "{ruleValue}"',
    doesntContainExactly: '{name} cannot contain exactly "{ruleValue}"',
    minLength: "{name} must be at least {ruleValue} characters",
    exactLength: "{name} must be exactly {ruleValue} characters",
    maxLength: "{name} cannot be longer than {ruleValue} characters",
    size: "{name} must have a length between {min} and {max} characters",
    match: "{name} must match {ruleValue} field",
    different: "{name} must have a different value than {ruleValue} field",
    creditCard: "{name} must be a valid credit card number",
    minCount: "{name} must have at least {ruleValue} choices",
    exactCount: "{name} must have exactly {ruleValue} choices",
    maxCount: "{name} must have {ruleValue} or less choices"
  }

  /** Fomantic's `settings.text` entries prompts use. */
  @E.proto static text: E.ValidatorText = {
    and: "and",
    unspecifiedRule: "Please enter a valid value",
    unspecifiedField: "This field"
  }

  /** Fomantic's `settings.regExp`, verbatim. */
  @E.proto static regExp: E.ValidatorRegExps = {
    decimal: /^\d+\.?\d*$/,
    email: /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z]([\da-z-]*[\da-z])?(\.[\da-z]([\da-z-]*[\da-z])?)*$/i,
    integer: /^-?\d+$/,
    number: /^-?\d*(\.\d+)?$/,
    url: /(https?:\/\/(?:www\.|(?!www))[^\s.]+\.\S{2,}|www\.\S+\.\S{2,})/i,
    flags: /^\/(.*)\/(.*)?/
  }

  /** Card brands for `creditCard[visa,amex]`, from Fomantic's `rules.creditCard`. */
  @E.proto static cards: Readonly<Record<string, E.CreditCardSpec>> = {
    visa: { pattern: /^4/, length: [16] },
    amex: { pattern: /^3[47]/, length: [15] },
    mastercard: { pattern: /^5[1-5]/, length: [16] },
    discover: { pattern: /^(6011|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]|64[4-9])|65)/, length: [16] },
    unionPay: { pattern: /^(62|88)/, length: [16, 17, 18, 19] },
    jcb: { pattern: /^35(2[89]|[3-8]\d)/, length: [16] },
    maestro: { pattern: /^(5018|5020|5038|6304|6759|676[1-3])/, length: [12, 13, 14, 15, 16, 17, 18, 19] },
    dinersClub: { pattern: /^(30[0-5]|^36)/, length: [14] },
    laser: { pattern: /^(6304|670[69]|6771)/, length: [16, 17, 18, 19] },
    visaElectron: { pattern: /^(4026|417500|4508|4844|491(3|7))/, length: [16] }
  }

  /**
   * Constraint Validation flag per rule, for `ElementInternals.setValidity()`.
   * - `"auto"` rules pick by value:  type failure => `typeMismatch`, else under / over the range.
   * - Rules with no native equivalent (`is`, `match` ...) => `customError`.
   */
  @E.proto static flags: E.ValidityFlagMap = {
    notEmpty: "valueMissing",
    checked: "valueMissing",
    email: "typeMismatch",
    url: "typeMismatch",
    creditCard: "typeMismatch",
    regExp: "patternMismatch",
    minValue: "auto",
    maxValue: "auto",
    integer: "auto",
    range: "auto",
    decimal: "auto",
    number: "auto",
    minLength: "tooShort",
    maxLength: "tooLong",
    exactLength: "auto",
    size: "auto",
    minCount: "rangeUnderflow",
    maxCount: "rangeOverflow",
    exactCount: "auto",
    is: "customError",
    isExactly: "customError",
    not: "customError",
    notExactly: "customError",
    contains: "customError",
    containsExactly: "customError",
    doesntContain: "customError",
    doesntContainExactly: "customError",
    match: "customError",
    different: "customError"
  }

  /**
   * The rules, as methods called with `this` ~== the validator.
   * - `value` is normalized (see `normalize()`);  `context.raw` has the original.
   */
  @E.proto static rules: Readonly<Record<string, E.RuleFunction>> = {
    /** Not blank;  an empty array or unchecked (`false`) checkbox is blank. */
    notEmpty(value) {
      return value !== ""
    },
    /** Checkbox checked:  `true`, or any value but `""` / `"false"` (a checked checkbox's value, e.g. `on`). */
    checked(value, _, { raw }) {
      return raw === true || (raw !== false && value !== "" && value !== "false")
    },
    email(value) {
      return this.regExp.email.test(value)
    },
    url(value) {
      return this.regExp.url.test(value)
    },
    /** `regExp[/^\d+$/i]`, a bare pattern `regExp[^\d+$]`, or a real `RegExp`. */
    regExp(value, pattern) {
      if (pattern instanceof RegExp) return value.match(pattern) !== null
      const text = pattern ?? ""
      const parts = this.regExp.flags.exec(text)
      return value.match(parts ? new RegExp(parts[1], parts[2] ?? "") : new RegExp(text)) !== null
    },
    minValue(value, min) {
      return this.range(value, { range: `${String(min)}..`, pattern: this.regExp.number })
    },
    maxValue(value, max) {
      return this.range(value, { range: `..${String(max)}`, pattern: this.regExp.number })
    },
    /** Integer, optionally in `integer[min..max]`. */
    integer(value, range) {
      return this.range(value, { range, pattern: this.regExp.integer })
    },
    /** Integer in `range[min..max]`. */
    range(value, range) {
      return this.range(value, { range, pattern: this.regExp.integer })
    },
    /** Unsigned decimal, optionally in range.  NOTE: Fomantic's pattern rejects negatives. */
    decimal(value, range) {
      return this.range(value, { range, pattern: this.regExp.decimal })
    },
    /** Number, optionally in range.  NOTE: Fomantic's pattern accepts `""`;  pair with `notEmpty`. */
    number(value, range) {
      return this.range(value, { range, pattern: this.regExp.number })
    },
    is(value, text) {
      return value.toLowerCase() === String(text ?? "").toLowerCase()
    },
    isExactly(value, text) {
      return value === String(text ?? "")
    },
    not(value, text) {
      return value.toLowerCase() !== String(text ?? "").toLowerCase()
    },
    notExactly(value, text) {
      return value !== String(text ?? "")
    },
    contains(value, text) {
      return value.toLowerCase().includes(String(text ?? "").toLowerCase())
    },
    containsExactly(value, text) {
      return value.includes(String(text ?? ""))
    },
    doesntContain(value, text) {
      return !value.toLowerCase().includes(String(text ?? "").toLowerCase())
    },
    doesntContainExactly(value, text) {
      return !value.includes(String(text ?? ""))
    },
    minLength(value, min) {
      return this.range(value, { range: `${String(min)}..`, pattern: this.regExp.integer, measure: "length" })
    },
    exactLength(value, length) {
      const range = `${String(length)}..${String(length)}`
      return this.range(value, { range, pattern: this.regExp.integer, measure: "length" })
    },
    maxLength(value, max) {
      return this.range(value, { range: `..${String(max)}`, pattern: this.regExp.integer, measure: "length" })
    },
    /** Length in `size[min..max]`. */
    size(value, range) {
      return this.range(value, { range, pattern: this.regExp.integer, measure: "length" })
    },
    /** Equal to field `match[other]`;  false when that field is missing. */
    match(value, other, { fieldValues }) {
      const otherValue = fieldValues?.[String(other)]
      return otherValue !== undefined && value === this.normalize(otherValue)
    },
    /** Differs from field `different[other]`;  false when that field is missing, as Fomantic. */
    different(value, other, { fieldValues }) {
      const otherValue = fieldValues?.[String(other)]
      return otherValue !== undefined && value !== this.normalize(otherValue)
    },
    /**
     * Luhn-valid card number, optionally of `creditCard[visa,mastercard]` brands.
     * - Spaces and dashes allowed;  UnionPay skips Luhn, as Fomantic.
     */
    creditCard(value, types) {
      const number = value.replace(/[\s-]/g, "")
      if (!/^\d+$/.test(number)) return false
      if (typeof types === "string" && types) {
        const brands = types.split(",").map((type) => this.cards[type.trim()])
        const known = brands.some((card) => card && card.length.includes(number.length) && card.pattern.test(number))
        if (!known) return false
      }
      const unionPay = this.cards.unionPay
      if (unionPay && unionPay.length.includes(number.length) && unionPay.pattern.test(number)) return true
      let sum = 0
      for (let index = number.length - 1, double = false; index >= 0; index--, double = !double) {
        const digit = number.charCodeAt(index) - 48
        sum += double ? LUHN_DOUBLED[digit] : digit
      }
      return sum % 10 === 0 && sum > 0
    },
    minCount(value, min, { raw }) {
      return this.count(value, raw) >= Number(min)
    },
    exactCount(value, count, { raw }) {
      return this.count(value, raw) === Number(count)
    },
    maxCount(value, max, { raw }) {
      return this.count(value, raw) <= Number(max)
    }
  }

  ////////////////
  // ## Validate
  ////////////////

  /**
   * Run `rules` against `value`;  returns every failure with its prompt and Constraint Validation flag.
   * - Rules run in order and ALL run (Fomantic's default `errorLimit: 0`).
   * - `optional` skips everything when the value is blank.
   * - SIDE EFFECT (dev only): warns about unknown rule types, with a suggestion, and skips them.
   */
  validate(
    value: E.FieldValue,
    rules: readonly E.ValidationRule[],
    options: E.ValidateOptions = {}
  ): E.ValidationResult {
    const text = this.normalize(value, options)
    const errors: E.ValidationError[] = []
    if (!(options.optional && text === "")) {
      const context: E.RuleContext = { raw: value, fieldValues: options.fieldValues }
      for (const rule of rules) {
        const parsed = this.parseRule(rule)
        const test = this.rules[parsed.type]
        if (!test) {
          const guess = E.suggest(parsed.type, Object.keys(this.rules))
          E.Warnings.devWarn(
            "Validator",
            `unknown rule ${JSON.stringify(parsed.type)}${guess ? `;  did you mean "${guess}"?` : ""}`
          )
          continue
        }
        if (test.call(this, text, parsed.value, context)) continue
        errors.push({
          type: parsed.type,
          ruleValue: parsed.value,
          message: this.prompt(parsed, text, options),
          flag: this.flagFor(parsed, text, value)
        })
      }
    }
    const flags: ValidityStateFlags = {}
    for (const error of errors) flags[error.flag] = true
    return { valid: errors.length === 0, errors, flags, message: errors[0]?.message ?? "" }
  }

  /**
   * True if `value` passes the single `rule`, e.g. `validator.test("minLength[6]", "secret")`.
   * - Unknown rules pass.
   */
  test(rule: E.ValidationRule, value: E.FieldValue, fieldValues?: E.ValidateOptions["fieldValues"]): boolean {
    return this.validate(value, [rule], { fieldValues }).valid
  }

  /**
   * `"minLength[6]"` => `{ type: "minLength", value: "6" }`;  objects keep their `prompt`.
   * - Bracket runs from the FIRST `[` to the final `]`, so `regExp[/^[a-z]+$/]` keeps its inner brackets.
   * - An object's own `value` wins over a bracket in its `type`.
   */
  parseRule(rule: E.ValidationRule): E.ParsedRule {
    const source = typeof rule === "string" ? rule : rule.type
    const bracket = source.indexOf("[")
    const hasBracket = bracket > 0 && source.endsWith("]")
    const type = hasBracket ? source.slice(0, bracket) : source
    const bracketValue = hasBracket ? source.slice(bracket + 1, -1) : undefined
    if (typeof rule === "string") return { type, value: bracketValue }
    return { type, value: rule.value ?? bracketValue, prompt: rule.prompt }
  }

  /**
   * Interpolated message for a failed `rule`, as Fomantic's `get.prompt()`.
   * - `{name}` => label, `{identifier}` => name, `{value}` => the value, `{ruleValue}` => the bracket.
   * - Ranges (`integer[1..10]`) append Fomantic's range suffix to the default prompt:
   *   "Age must be an integer and must be in a range from 1 to 10".
   * - `match` / `different` name the OTHER field by its label.
   */
  prompt(rule: E.ParsedRule, value: string, options: E.ValidateOptions = {}): string {
    const { prompts, text } = this
    const ruleValue = rule.value === undefined ? "" : String(rule.value)
    let prompt =
      typeof rule.prompt === "function"
        ? rule.prompt(value)
        : (rule.prompt ?? prompts[rule.type] ?? text.unspecifiedRule)
    if (ruleValue.includes("..") && RANGE_PROMPT_RULES.has(rule.type)) {
      const [min, max] = ruleValue.split("..", 2)
      if (!rule.prompt && RANGE_SUFFIX_RULES.has(rule.type)) {
        const suffix =
          min === ""
            ? prompts.maxValue.replaceAll("{ruleValue}", "{max}")
            : max === ""
              ? prompts.minValue.replaceAll("{ruleValue}", "{min}")
              : prompts.range
        prompt += suffix.replaceAll("{name}", ` ${text.and}`)
      }
      prompt = prompt.replaceAll("{min}", min).replaceAll("{max}", max)
    }
    if (ruleValue && (rule.type === "match" || rule.type === "different")) {
      prompt = prompt.replaceAll("{ruleValue}", options.fieldLabels?.[ruleValue] ?? ruleValue)
    }
    return prompt
      .replaceAll("{value}", value)
      .replaceAll("{name}", options.label ?? options.name ?? text.unspecifiedField)
      .replaceAll("{identifier}", options.name ?? "")
      .replaceAll("{ruleValue}", ruleValue)
  }

  ////////////////
  // ## Rule helpers
  ////////////////

  /**
   * `value` (or, `measure: "length"`, its length) matches `pattern` and lies within `range` (`"min..max"`, `"n"`,
   * `"..max"`):  Fomantic's `rules.range()`, as a shared step.
   * - Ours:  Fomantic's takes `(value, range, regExp, testLength)`, a positional boolean;  rules call this one
   *   with a `RangeTest`.
   * - Bounds that don't match `pattern` are ignored, as Fomantic.
   */
  range(value: string, { range, pattern, measure = "value" }: E.RangeTest): boolean {
    const bounds = this.bounds(range, pattern)
    const subject = measure === "length" ? String(value.length) : value
    const number = Number(subject)
    return (
      pattern.test(subject) &&
      (bounds.min === undefined || number >= bounds.min) &&
      (bounds.max === undefined || number <= bounds.max)
    )
  }

  /**
   * A field value as the rules see it:  a string, trimmed unless `trim` is false (`ValidateOptions.trim`).
   * - `null` / `undefined` / `false` => `""`;  `true` => `"true"`;  arrays comma-joined.
   */
  normalize(value: E.FieldValue, { trim = true }: Pick<E.ValidateOptions, "trim"> = {}): string {
    if (value == null || value === false) return ""
    const text = typeof value === "string" ? value : Array.isArray(value) ? value.join(",") : String(value)
    return trim ? text.trim() : text
  }

  /** Number of choices:  the array's length, else comma-separated entries of `value`. */
  count(value: string, raw: E.FieldValue): number {
    if (Array.isArray(raw)) return raw.length
    return value === "" ? 0 : value.split(",").length
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Numeric `{ min, max }` of `range`;  either may be `undefined` (open-ended).
   * - An EMPTY bound is open.  Fomantic tests it against the pattern, and its `number` pattern matches `""`,
   *   so its `minValue[5]` (`"5.."`) gets `max = 0` and rejects everything positive.
   */
  private bounds(range: E.RuleValue, regExp: RegExp): { min?: number; max?: number } {
    const text = range === undefined ? "" : String(range)
    if (text === "" || text === "..") return {}
    if (!text.includes("..")) return regExp.test(text) ? { min: Number(text), max: Number(text) } : {}
    const [min, max] = text.split("..", 2)
    return {
      min: min !== "" && regExp.test(min) ? Number(min) : undefined,
      max: max !== "" && regExp.test(max) ? Number(max) : undefined
    }
  }

  /** Constraint Validation flag for a failed `rule`, resolving `"auto"` from the value. */
  private flagFor(rule: E.ParsedRule, value: string, raw: E.FieldValue): E.ValidityFlag {
    const flag = this.flags[rule.type] ?? "customError"
    if (flag !== "auto") return flag
    switch (rule.type) {
      case "exactLength":
        return value.length < Number(rule.value) ? "tooShort" : "tooLong"
      case "size":
        return value.length < (this.bounds(rule.value, this.regExp.integer).min ?? 0) ? "tooShort" : "tooLong"
      case "exactCount":
        return this.count(value, raw) < Number(rule.value) ? "rangeUnderflow" : "rangeOverflow"
      case "minValue":
        return this.regExp.number.test(value) ? "rangeUnderflow" : "typeMismatch"
      case "maxValue":
        return this.regExp.number.test(value) ? "rangeOverflow" : "typeMismatch"
    }
    const pattern =
      rule.type === "decimal" ? this.regExp.decimal : rule.type === "number" ? this.regExp.number : this.regExp.integer
    if (!pattern.test(value)) return "typeMismatch"
    return Number(value) < (this.bounds(rule.value, pattern).min ?? -Infinity) ? "rangeUnderflow" : "rangeOverflow"
  }
}

/** Rules whose `{min}` / `{max}` come from a `min..max` bracket.  Fomantic's. */
const RANGE_PROMPT_RULES: ReadonlySet<string> = new Set(["integer", "decimal", "number", "size", "range"])

/** Rules whose default prompt gets Fomantic's range suffix appended. */
const RANGE_SUFFIX_RULES: ReadonlySet<string> = new Set(["integer", "decimal", "number"])

/** Luhn:  digit => doubled digit's digit sum. */
const LUHN_DOUBLED: readonly number[] = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
