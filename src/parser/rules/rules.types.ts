import type { P } from "~/parser"

////////////////
// ## Rules
////////////////

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
    // `Function` is included because every object literal already has `Object` as its `constructor`.
    // NOTE: bare `Function` is deliberate here -- this is a dynamic boundary, not a known signature.
    constructor?: RuleConstructor | Function
    skip?: boolean
    syntax?: string | Array<string | RuleDefinition>
    /** Test rule, or rulex syntax string which will be compiled into one. */
    testRule?: P.Rule | string
    pattern?: RegExp
    VALUE_MAP?: Record<string, unknown>
    blacklist?: IdentifierBlacklist | string[]
    literal?: string | string[]
    literals?: Array<string | string[] | LiteralMatcher>
    tokenType?: P.TokenConstructor
    rule?: P.Rule | string
    rules?: P.Rule[]
    tests?: P.RuleTestBlock[]
    [subclassProp: string]: unknown
  }
>

/** Anything `parser.defineRule()` accepts. */
export type RuleInput = P.Rule | RuleConstructor | RuleDefinition

/** Map of `{ ruleName: rule }`. */
export type RuleMap = Record<string, P.Rule>

/** Syntax flags for outputting a rule in rulex syntax. */
export type SyntaxFlags = {
  testLocation: string
  argument: string
  optional: string
}

/**
 * Blacklist of common english words which may not be used as single-word identifiers.
 */
export type IdentifierBlacklist = Record<string, true | 1>

// ### Literal rules
////////////////

export type LiteralProps = Prettify<
  P.RuleProps & {
    literal: string | string[]
    isEscaped?: boolean
  }
>

export type LiteralMatcher = { literal: string | string[]; optional?: boolean }

export type LiteralsProps = Prettify<
  P.RuleProps & {
    literals: Array<string | string[] | LiteralMatcher>
  }
>
