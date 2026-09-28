import type { P } from "~/parser"

// ## Rules

/** Constructor for a `Rule` subclass. */
export type RuleConstructor = Class<P.Rule>

/**
 * What `parser.addRule(RuleClass, definition)` accepts for any rule:  constructor props, except that
 * - `syntax` may be an array => one rule instance per variant
 * - `skip: true` registers nothing, e.g. for a rule which isn't working yet
 * - `name` defaults to the class name
 */
export type RuleDefinitionProps = Omit<P.RuleProps, "syntax"> & {
  syntax?: string | string[]
  skip?: boolean
}

/**
 * `RuleDefinitionProps` for a specific rule class, so its own props (e.g. `pattern`, `blacklist`) are
 * checked too -- a typo is a compile error.
 * - All optional:  structure normally comes from `syntax`, not from e.g. `rules`.
 */
export type DefinitionFor<RuleType extends { readonly Props: P.RuleProps }> = Prettify<
  Omit<Partial<RuleType["Props"]>, "syntax"> & RuleDefinitionProps
>

/**
 * ALL a rule class is registered with when the class holds everything else as `@proto static`.
 * - Why:  the class is the rule, reusable by another language's parser with its own `syntax`.
 * - Not per-class like `DefinitionFor`:  `syntax` / `tests` mean the same for every rule.
 * - Used by `scope.addRule()` and `SpellParser.addRule()`.
 */
export type SyntaxAndTests = Pick<RuleDefinitionProps, "syntax" | "tests">

/**
 * One rule registered on a SCOPE while parsing:  the rule CLASS plus the definition it was registered with.
 * - Stored as a pair (rather than the built `Rule`) because that is what re-registering it elsewhere needs --
 *   e.g. exporting a method defined in one file to another file which imports it, via
 *   `otherScope.addRule(entry.rule, entry.definition)`.  A built rule is frozen and already bound to a name.
 */
export type ScopeRule = {
  /** Name the rule registered under -- the `ScopeList` keys on this. */
  name: string
  /** Rule class, typically a closure over the match which caused it. */
  rule: RuleConstructor
  /** Definition it was registered with -- just `{ syntax }`, the rest is on `rule` as `@proto static`. */
  definition: SyntaxAndTests
  /** Match whose `mutateScope()` registered it, e.g. the method definition -- for go-to-definition etc. */
  declaredBy?: P.Match
  /** Built rule instance(s) `parser.addRule()` made, so a call-site `match.rule` can be traced back here. */
  instances?: P.Rule[]
}

/** Anything `parser.addRule()` accepts:  a rule class (the normal way) or a ready-made instance. */
export type RuleInput = P.Rule | RuleConstructor

/** Map of `{ ruleName: rule }`. */
export type RuleMap = Record<string, P.Rule>

/**
 * What committing a rule's match changes in scope -- see `Rule.getScopeChanges()`.  `undefined` => nothing.
 * - `"internal"`:  nothing parsed AFTER it can see the change:
 *   - its OWN `match.scope`, e.g. `set x to 1` adds a variable there, so a method body's changes stay in that body
 *   - or a record only editors read, e.g. a getter's property on its type -- see `property_value_getter`
 * - `"global"`:  reaches the project, e.g. types, constants or rules, so re-parsing it can change how
 *   anything after it parses -- even in other files.
 */
export type ScopeChanges = "internal" | "global"

// ## Declarations

/**
 * What a rule's matches DECLARE, for editors' symbol lists -- a rule's `@proto static declares`.
 * - Each value is a GROUP name, dotted to reach into that group's own groups, e.g. `type_property.property`.
 * - See `Rule.getDeclaration()`, which a rule overrides for what a spec can't say.
 */
export type DeclaresSpec = {
  /** What's declared. */
  kind: DeclarationKind
  /** Group holding the declared name, e.g. `type` for `a card is a thing`. */
  name: string
  /** Group holding the type a property or method belongs to, e.g. `type` for `a card has a suit`. */
  of?: string
  /** Group whose text says more about it, e.g. `superType` for `a card is a thing`. */
  detail?: string
}

/** Kind of thing a statement can declare -- see `DeclaresSpec`. */
export type DeclarationKind = "type" | "property" | "method" | "function" | "variable" | "event"

/** One thing a match declares, as `Rule.getDeclaration()` reports it.  Names are the source text, as written. */
export type Declaration = {
  /** What's declared. */
  kind: DeclarationKind
  /** Declared name, e.g. `card`. */
  name: string
  /** Match holding the name, e.g. to select it in an editor. */
  nameMatch: P.Match
  /** Type a property or method belongs to, e.g. `cards`. */
  of?: string
  /** More about it, e.g. the javascript method name. */
  detail?: string
}

// ## Highlighting

/**
 * How an editor should colour the tokens a rule's matches hold directly -- a rule's `@proto static highlightAs`.
 * - Named for the Language Server Protocol's standard semantic token types, so editor themes already colour them.
 * - Only a match's OWN tokens:  a `Sequence`'s words come from the literal rules inside it.
 */
export type HighlightKind =
  | "keyword"
  | "operator"
  | "variable"
  | "parameter"
  | "type"
  | "enumMember"
  | "function"
  | "property"
  | "number"
  | "string"
  | "comment"

/** Syntax flags for outputting a rule in rulex syntax. */
export type SyntaxFlags = {
  /** `<matchGroup>:` if rule has a `matchGroup`, else `""`. */
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
