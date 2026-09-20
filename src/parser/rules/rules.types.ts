import type { P } from "~/parser"

// ## Rules

/** Constructor for a `Rule` subclass. */
export type RuleConstructor = Class<P.Rule>

/**
 * Props bag accepted by `parser.defineRule()`.
 * - `constructor` is the `Rule` subclass to instantiate (inferred from `syntax`/`pattern`/etc if not provided).
 * - `syntax` is rulex syntax string(s), or objects with `syntax` + overrides for that variant.
 * - Rule-subclass-specific props (e.g. `wantsInlineStatement`) are allowed and passed through to the constructor.
 */
export type RuleDefinition = Prettify<
  Omit<P.RuleProps, "syntax" | "tests" | "testRule"> & {
    /**
     * `Function` is included because every object literal already has `Object` as its `constructor`.
     * - NOTE: bare `Function` is deliberate here -- this is a dynamic boundary, not a known signature.
     */
    constructor?: RuleConstructor | Function
    /** Set to `true` to skip this rule, e.g. if it's not working. */
    skip?: boolean
    /** Rulex syntax string(s), or objects with `syntax` + overrides for that variant. */
    syntax?: string | Array<string | RuleDefinition>
    /** Test rule, or rulex syntax string which will be compiled into one. */
    testRule?: P.Rule | string
    /** Regular expression for `Pattern` rules. */
    pattern?: RegExp
    /** Map of `{ matched: compiled }` to return `compiled` value for `matched` string, for `Pattern` rules. */
    VALUE_MAP?: Record<string, unknown>
    /** Array of strings as blacklist for `Pattern` rules. */
    blacklist?: IdentifierBlacklist | string[]
    /** Single literal string (or alternatives) to match, for `Keyword` / `Symbol` rules. */
    literal?: string | string[]
    /** Sequential literal strings to match, for `Keywords` / `Symbols` rules. */
    literals?: Array<string | string[] | LiteralMatcher>
    /** Token type to match, for `TokenType` rules. */
    tokenType?: P.TokenConstructor
    /** Name (or instance) of rule to delegate to, for `Subrule` rules. */
    rule?: P.Rule | string
    /** Rules to match in sequence / as choices, for `Sequence` / `Choice` rules. */
    rules?: P.Rule[]
    /** Tests for this rule. */
    tests?: P.RuleTestBlock[]
    /** Rule-subclass-specific props (e.g. `wantsInlineStatement`) are allowed and passed through to constructor. */
    [subclassProp: string]: unknown
  }
>

/** Anything `parser.defineRule()` accepts. */
export type RuleInput = P.Rule | RuleConstructor | RuleDefinition

/** Map of `{ ruleName: rule }`. */
export type RuleMap = Record<string, P.Rule>

/** Syntax flags for outputting a rule in rulex syntax. */
export type SyntaxFlags = {
  /** `…` for `AT_START`, `^` for `ANYWHERE`, or `""`. */
  testLocation: string
  /** `:` if rule has an `argument`, else `""`. */
  argument: string
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
