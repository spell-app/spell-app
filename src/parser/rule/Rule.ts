//  # Parser Rules
//

import { Derivative } from "~/util/Derivative"
import { TestLocation } from "~/parser/constants"
import type { Token } from "~/parser/tokenizer/Tokens"
import type { Match, MatchGroups } from "~/parser/Match"
import type { Scope } from "~/parser/scope/Scope"

// Re-export Scope
export type { Scope } from "~/parser/scope/Scope"

export type RuleProps = {
  module?: string
  name?: string
  description?: string
  alias?: string | string[]
  datatype?: string
  syntax?: string | string[]
  precedence?: number
  testRule?: Rule
  testLocation?: TestLocation
  tests?: RuleTests
  scope?: Scope

  argument?: string
  optional?: boolean
  isEscaped?: boolean
}

export type RuleTests = Array<any>

/** Syntax flags for outputting a rule in rulex syntax. */
export type SyntaxFlags = {
  testLocation: string
  argument: string
  optional: string
}

/**
 * # Rule base class
 * Rules can be as simple as a string `Keyword` or a complex sequence of recursive rules.
 *
 *  Parse a rule with `rule.parse(scope, tokens)`.
 *  - If **successful**, it will return a new `Match()` object.
 *  - If **unsuccessful**, it will return `undefined`
 *
 * The `match` object links the tokens actually matched with the matched rule, and has properties:
 *    - `match.rule`        : pointer back to the matched rule.
 *    - `match.scope`       : the scope in which the rule was matched.
 *    - `match.matched`     : array of *significant* tokens that were actually matched.
 *    - `match.input`       : array of all tokens that were consumed.
 *    - `match.value`       : the "value" of the match, which is rule-specific.
 *    ... and other rule-specific values.
 *
 *  To output the result of a match, use `match.compile()` which calls `rule.compile()`
 *  to actually generate the output.
 */
export abstract class Rule<Props extends RuleProps = RuleProps> extends Derivative {
  /** ---------------
   * ## Properties
   *  --------------- */
  /** Name of source file this rule was defined in. */
  declare module: string | undefined
  /** Rule name, must be unique if defined. */
  declare name: string | undefined
  /** Description of this rule. */
  declare description: string | undefined
  /** Name aliases -- indicates this rules works a part of collections such as `expression` or `statement`. */
  declare alias: string | string[] | undefined
  /** Precedence of this rule, used to distinguish between ambiguous matches.  Default = 0. */
  declare precedence: number
  /** Datatype which rule result represents, e.g. `string`, `number`, custom type. */
  declare datatype: string | undefined
  /** Rulex syntax string(s) used to define this rule. */
  declare syntax: string | string[] | undefined
  /** Test rule to use to quickly determine if this rule can be matched. */
  declare testRule: Rule | undefined
  /** Test location to use to determine if this rule can be matched. */
  declare testLocation: TestLocation | undefined
  /** Name for this rule in `match.groups`. */
  // REFACTOR: `groupName`
  declare argument: string | undefined
  /** Whether this rule is optional. */
  declare optional: boolean | undefined
  /** Tests for this rule. */
  declare tests: RuleTests | undefined
  /** Scope of this rule. */
  // TODO: why is this needed?
  declare scope: Scope | undefined

  // Define properties on prototype to keep instances as small as possible
  // and so that `Object.keys()` only returns properties defined in the instance.
  static {
    Object.defineProperty(this.prototype, "module", { writable: true })
    Object.defineProperty(this.prototype, "name", { writable: true })
    Object.defineProperty(this.prototype, "description", { writable: true })
    Object.defineProperty(this.prototype, "alias", { writable: true })
    Object.defineProperty(this.prototype, "precedence", { value: 0, writable: true })
    Object.defineProperty(this.prototype, "datatype", { writable: true })
    Object.defineProperty(this.prototype, "syntax", { writable: true })
    Object.defineProperty(this.prototype, "testRule", { writable: true })
    Object.defineProperty(this.prototype, "testLocation", { writable: true })
    Object.defineProperty(this.prototype, "argument", { writable: true })
    Object.defineProperty(this.prototype, "optional", { writable: true })
    Object.defineProperty(this.prototype, "tests", { writable: true })
    Object.defineProperty(this.prototype, "scope", { writable: true })
  }

  // props: Record<string,any>
  constructor(props?: Props) {
    super()
    if (props) Object.assign(this, props)
  }

  /** Return a clone of this rule (same constructor, all public properties). */
  clone() {
    const constructor = this.constructor as new (props?: any) => typeof this
    return new constructor(this)
  }

  /** Return array of `names` for this rule:  its `.name` + any `.alias`es. */
  get names() {
    let { alias = [] } = this
    if (typeof alias === "string") alias = [alias]
    return [this.name, ...alias].filter((it) => it !== undefined)
  }

  ////////////////////
  // ## Parsing methods -- implement these in your subclasses!
  ////////////////////

  /**
   * Attempt to match this rule at the start of `tokens`.
   * - If successful, returns a `Match` object which you can use to `compile()` the results.
   * - If unsuccessful, returns `undefined`.
   */
  abstract parse(scope: Scope, tokens: Token[]): Match | undefined

  /**
   * Output javascript source for this rule passed a successful `match` generated by it.
   * You may want to look at `match.matched` or `match.results`, etc.
   */
  abstract compile(match: Match): string

  ////////////////////
  // ## Quick testing methods
  ////////////////////

  /**
   * Test to see if this rule is matched in `tokens`.
   *
   * You shouldn't override this, override `testAtStart()` instead,
   * or just provide a `testRule`.
   *
   * - By default, we respect our `testLocation` parameter to test
   *   either at the beginning of the tokens or anywhere in the run.
   * - Pass in specific `testLocation` to override the `testLocation` at runtime.
   */
  test(scope: Scope, tokens: Token[], testLocation = this.testLocation): boolean | undefined {
    if (!tokens.length) return false
    if (this.testRule) return this.testRule.test(scope, tokens, testLocation)

    if (testLocation === TestLocation.ANYWHERE) return this.testAnywhere(scope, tokens)
    return this.testAtStart(scope, tokens, 0)
  }

  /**
   * Test to see if there is ANY WAY that we can be found
   * starting at `start` position of `tokens`.
   *
   * This is used to exit quickly if there is no chance of success,
   * and is especially useful for rules which call themselves recursively.
   *
   * Returns:
   *  - `true` if the rule MIGHT be matched.
   *  - `false` if there is NO WAY the rule can be matched.
   *  - `undefined` if not determinstic (eg: no way to tell quickly).
   */
  testAtStart(scope: Scope, tokens: Token[], start = 0): boolean | undefined {
    if (start >= tokens.length) return false
    if (this.testRule) return this.testRule.testAtStart(scope, tokens, start)
    return undefined
  }

  /**
   * Test if this rule is matched anywhere in the tokens
   * by exhaustively testing at each start position.
   *
   * - This might be less efficient than just trying to match the rule itself!
   */
  testAnywhere(scope: Scope, tokens: Token[]): boolean | undefined {
    let undefinedFound = false
    for (let start = 0, last = tokens.length; start < last; start++) {
      const result = this.testAtStart(scope, tokens, start)
      if (result) return true
      if (result === undefined) undefinedFound = true
    }
    if (undefinedFound) return undefined
    return false
  }

  ////////////////////
  // ## Match groups
  ////////////////////

  getGroupsForMatch(match: Match) {
    return match.addMatchedToGroups({}, [match])
  }

  ////////////////////
  // ## Rulex syntax
  ////////////////////

  /**
   * We attempt to merge literals or sequences together when creating rules.
   * We can only do that for rules that are not "adorned" with argument, etc.
   * - Note that `optional` doesn't matter in this case, because we can merge
   *   optional and non-optional rules.
   */
  // DEPRECATED
  get isAdorned() {
    return !!(this.argument || this.testLocation)
  }

  // Return syntax string for this rule (doesn't apply to all rule types).
  // The base implementation takes care of the "adornments" and returns an object with:
  //  `{ testLocation, argument, optional }`
  getSyntaxFlags(): SyntaxFlags {
    const { testLocation, argument, optional } = this
    return {
      testLocation: testLocation === TestLocation.AT_START ? "…" : testLocation === TestLocation.ANYWHERE ? "^" : "",
      argument: argument ? ":" : "",
      optional: optional ? "?" : ""
    }
  }
}
