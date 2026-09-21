import type { P } from "~/parser"

// ## Rules

/** Constructor for a `Rule` subclass. */
export type RuleConstructor = Class<P.Rule>

/** One variant of a rule class's `static syntax`, with its own quick `testRule` if needed. */
export type RuleSyntaxVariant = { syntax?: string; testRule?: P.Rule | string }

/** Anything `parser.addRule()` accepts:  a rule class (the normal way) or a ready-made instance. */
export type RuleInput = P.Rule | RuleConstructor

/** Map of `{ ruleName: rule }`. */
export type RuleMap = Record<string, P.Rule>

/** Syntax flags for outputting a rule in rulex syntax. */
export type SyntaxFlags = {
  /** `…` for `AT_START`, `^` for `ANYWHERE`, or `""`. */
  testLocation: string
  /** `:` if rule has an `matchGroup`, else `""`. */
  matchGroup: string
  /** `?` if rule is `optional`, else `""`. */
  optional: string
}

/**
 * Blacklist of common english words which may not be used as single-word identifiers.
 */
export type IdentifierBlacklist = Record<string, true | 1>

// ### Literal rules

/** Props bag accepted by `Literal`'s constructor. */
export type LiteralProps = Prettify<
  P.RuleProps & {
    /** Literal string or array of literal strings to match. */
    literal: string | string[]
    /** Whether the literal must be escaped when converting to rulex syntax. */
    isEscaped?: boolean
  }
>

/** One matcher within `Literals.literals` -- a literal (or alternatives) plus whether it's optional. */
export type LiteralMatcher = { literal: string | string[]; optional?: boolean }

/** Props bag accepted by `Literals`'s constructor. */
export type LiteralsProps = Prettify<
  P.RuleProps & {
    /** Array of literals (or matchers) to match in sequence. */
    literals: Array<string | string[] | LiteralMatcher>
  }
>

/** Copy of `props` without `undefined` values, so they don't clobber defaults when spread. */
export function definedOnly<T extends Record<string, unknown>>(props: T): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as Partial<T>
}

// ### Group specs

/**
 * One group a rule's structure will produce in `match.groups` -- see `Rule.groupSpec`.
 * - `optional` -- may be missing, e.g. `{name:rule}?`, or only in some variants / choices
 * - `array` -- name appears more than once in same sequence, so value is `Match[]`
 */
export type GroupSpecEntry = { name: string; optional: boolean; array: boolean }

/**
 * Combine entries contributed by rules matched ONE AFTER ANOTHER, e.g. children of a `Sequence`.
 * - Repeated name becomes `array`, and is only `optional` if every appearance is.
 */
export function concatGroupSpecs(...specs: GroupSpecEntry[][]): GroupSpecEntry[] {
  const entries = new Map<string, GroupSpecEntry>()
  for (const entry of specs.flat()) {
    const existing = entries.get(entry.name)
    if (!existing) entries.set(entry.name, { ...entry })
    else entries.set(entry.name, { name: entry.name, array: true, optional: existing.optional && entry.optional })
  }
  return [...entries.values()]
}

/**
 * Combine entries for ALTERNATIVES, e.g. `syntax` variants of one rule, or branches of a `Choice`.
 * - Name is only required if required in EVERY alternative.
 */
export function mergeGroupSpecs(...specs: GroupSpecEntry[][]): GroupSpecEntry[] {
  const entries = new Map<string, GroupSpecEntry>()
  for (const entry of specs.flat()) {
    const existing = entries.get(entry.name)
    const inAll = specs.every((spec) => spec.some((it) => it.name === entry.name && !it.optional))
    entries.set(entry.name, { name: entry.name, array: entry.array || !!existing?.array, optional: !inAll })
  }
  return [...entries.values()]
}

/** Entries as a `P.GroupsFor` spec string, e.g. `"type|property|specifier?"`. */
export function stringifyGroupSpec(entries: GroupSpecEntry[]): string {
  return entries.map(({ name, optional, array }) => `${name}${array ? "[]" : ""}${optional ? "?" : ""}`).join("|")
}
