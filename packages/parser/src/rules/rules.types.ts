import type { P } from "$/parser"

// ## Rules

/** Constructor for a `Rule` subclass. */
export type RuleConstructor = Class<P.Rule>

/** A `Rule` subclass with `P.Rule`'s own statics, e.g. to `specialize()` it or ask what it was specialized from. */
export type RuleClass = RuleConstructor &
  Pick<typeof P.Rule, "ruleName" | "specialize" | "specializedFrom" | "specializedWith" | "declarationProps">

/**
 * What `parser.addRule(RuleClass, definition)` accepts for any rule:  constructor props, plus
 * - `skip: true` registers nothing, e.g. for a rule which isn't working yet
 * - `name` defaults to the class name
 * - NOTE: ONE `syntax`.  A rule with several calls `addRule()` once per syntax, each with its own `tests`.
 */
export type RuleDefinitionProps = P.RuleProps & {
  skip?: boolean
}

/**
 * `RuleDefinitionProps` for a specific rule class, so its own props (e.g. `pattern`, `blacklist`) are
 * checked too -- a typo is a compile error.
 * - All optional:  structure normally comes from `syntax`, not from e.g. `rules`.
 */
export type DefinitionFor<RuleType extends { readonly Props: P.RuleProps }> = Prettify<
  Partial<RuleType["Props"]> & RuleDefinitionProps
>

// ## Rulex

/** Symbols rulex reads as its own syntax:  a literal one is written escaped, `\(`. */
export const RULEX_SPECIALS = ["?", "*", "+", "(", ")", "[", "]", "{", "}", "|", ":", "\\"]

/** `literal` as rulex syntax:  escaped when it's one of `RULEX_SPECIALS` (`(` => `\(`). */
export function escapeRulex(literal: string) {
  return RULEX_SPECIALS.includes(literal) ? `\\${literal}` : literal
}

/**
 * What rulex writes before a part with `spacing`, so a rule prints back as it was written (`compile()` reads it
 * back the same).
 * - `none` => nothing, touching (`{a}{b}`, `--`)
 * - `one` / `some` => `{space}` / `{spaces}`
 * - unset => one space (`{a} {b}`:  may space)
 */
export function rulexSpacing(spacing: Spacing | undefined) {
  if (spacing === "none") return ""
  if (spacing === "one") return "{space}"
  if (spacing === "some") return "{spaces}"
  return " "
}

/** `rules` as one rulex sequence, each spaced from the one before as its `spacing` says (`rulexSpacing()`). */
export function joinRulex(rules: P.Rule[]) {
  return rules.map((rule, index) => (index ? rulexSpacing(rule.spacing) : "") + rule.toRulexSyntax()).join("")
}

// ## Spacing

/**
 * What may sit between the previous token and a rule's first token -- see `Rule.spacing`.
 * - `none`:  nothing, they touch (`**`, `](`)
 * - `one`:  exactly one space (rulex `{space}`)
 * - `some`:  one or more spaces / tabs (rulex `{spaces}`)
 * - unset:  anything, as before rulex knew about spacing
 */
export type Spacing = "none" | "one" | "some"

/**
 * Does the whitespace after `previous` satisfy `spacing`?
 * - Reads `previous.whitespace`, which the tokenizer fills when it drops inline whitespace (`LEADING_ONLY` /
 *   `NONE`):  a tokenizer that keeps whitespace TOKENS (`ALL`) leaves it empty, so `spacing` can't see them.
 * - No `previous` (start of input) or no `spacing`:  always `true`.
 */
export function spacingAllows(previous: P.Token | undefined, spacing: Spacing | undefined) {
  if (!spacing || !previous) return true
  const whitespace = previous.whitespace ?? ""
  if (spacing === "none") return whitespace === ""
  if (spacing === "one") return whitespace === " "
  return /^[ \t]+$/.test(whitespace)
}

/**
 * What `P.Rule.specialize()` puts on a rule class:  `ruleName`, plus any of the rule's own `Props`.
 * - `Props`, not the instance's fields:  what a constructor ACCEPTS, e.g. raw `literals` word arrays.
 * - MUST be plain data (JSON-able) -- a project's declarations write these out and rebuild the rule from them.
 */
export type RuleStatics<RuleType extends { readonly Props: P.RuleProps } = P.Rule> = {
  ruleName?: string
} & Partial<RuleType["Props"]>

/**
 * What rule class `T`'s `specialize()` takes:  its `ruleName` + `Props` -- see `RuleStatics`.
 * - Unless `T` overrides `specialize()` to take a minimal set, which it names in a TYPE-ONLY static,
 *   e.g. `DynamicMethodRule`'s `declare static readonly SpecializeWith: { output: string; ... }`.
 */
export type SpecializeWith<T extends AbstractClass<P.Rule>> = T extends { readonly SpecializeWith: infer With }
  ? With
  : RuleStatics<InstanceType<T>>

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
  /** Rule class, typically `specialize()`d from a named class with plain-data statics -- see `P.Rule.specialize()`. */
  rule: RuleConstructor
  /** Definition it was registered with -- just `{ syntax }`, the rest is on `rule` as `@proto static`. */
  definition: SyntaxAndTests
  /** Match whose `mutateScope()` registered it, e.g. the method definition -- for go-to-definition etc. */
  declaredBy?: P.Match
  /**
   * What its statement declared, if it was IMPORTED -- loaded from another project's compiled declarations,
   * so there's no `declaredBy`.  Editors read this in its place.
   */
  declared?: ImportedRuleDeclared
  /** Built rule instance `parser.addRule()` made, so a call-site `match.rule` can be traced back here. */
  instance?: P.Rule
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

/**
 * Where an IMPORTED scope record was declared, in its own project's sources -- its `declaredAt`.
 * - Editors read it where there's no `declaredBy`:  the record was loaded from another project's compiled
 *   declarations, not parsed here.  See `SP.SpellDeclarations.load()`.
 * - NOTE: that project's sources may not be there, e.g. a library shipped compiled.
 */
export type DeclaredAt = {
  /** Full path of its file, e.g. `@system:library:cards/Card.spell`. */
  path: string
  /** Character offset in that file where its declaring statement starts. */
  start: number
  /** Character offset where that statement ends. */
  end: number
}

/**
 * What an IMPORTED rule's statement declared -- its `P.ScopeRule.declared`, read in place of a `declaredBy`.
 * - See `SP.SpellDeclarations.load()`.
 */
export type ImportedRuleDeclared = {
  /** Type it's on, e.g. `Card` -- or a top-level function's own name, e.g. `play_fizzbuzz`. */
  owner: string
  /**
   * What its statement declared, as its rule's `getDeclaration()` said -- bar `nameMatch`:  there's no match.
   * - `of` is Type_Case, e.g. `Card`, where `getDeclaration()` gives source text, e.g. `cards`.
   */
  declaration?: Omit<Declaration, "nameMatch">
  /** Where its statement was, if written down. */
  declaredAt?: DeclaredAt
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
    /** Match any case (rulex `/i`) -- see `Literal.caseInsensitive`. */
    caseInsensitive?: boolean
  }
>

/** One matcher within `Literals.literals` -- a literal (or alternatives) plus whether it's optional. */
export type LiteralMatcher = {
  literal: string | string[]
  optional?: boolean
  /** What may sit between the previous matched token and this one -- see `Spacing`. */
  spacing?: Spacing
}

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
