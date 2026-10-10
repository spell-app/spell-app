import { CustomError, pluralize, singularize, typeCase } from "$/util"
import type { P } from "$/parser"

export type { RulexParser } from "$/parser/rulex/RulexParser"

// ## Patterns

/** Alpha-numeric word, including dashes or underscores. */
export const ALPHANUMERIC_WORD_WITH_DASHES = /^[a-zA-Z][\w-]*$/

// ## Datatypes

/**
 * What an expression IS, in spell's words, e.g. `text`, `number`, `choice`, `list of cards`, `Card`.
 * - Built-in types:  lowercase -- see `BUILT_IN_TYPES`.
 * - A user's type:  by its `TypeScope` name, e.g. `Card`.
 * - A list of something says so:  `list of cards` -- see `listOf()` / `itemTypeOf()`.
 * - `undefined` ~== unknown, which is compatible with everything:  nothing stops parsing for want of a type.
 * - ONE vocabulary, the runtime's too:  `spellCore.typeOf()` says `text` for a string, `choice` for a boolean.
 * - Other ways to write a type, e.g. `string`, `boolean` or `array`, are the language's,
 *   accepted only where a user WRITES them -- see `typeName()`.
 */
export type Datatype = string

/**
 * Spell's built-in types, by their datatype, with each one's super-type.
 * - The root scope has a `TypeScope` for each -- see `SpellParser.rootScope`.
 * - Their members, e.g. `the length of the name`, are spell's:  in its `BUILT_IN_TYPE_TABLE`,
 *   loaded into these `TypeScope`s.  The parser only knows their names.
 * - NOTE: `list`, `thing` and `app` are runtime classes too (`List`, `Thing`, `App`),
 *   which compiled code names in Type_Case.  The rest are plain javascript values.
 */
export const BUILT_IN_TYPES: Record<Datatype, Datatype | undefined> = {
  text: undefined,
  number: undefined,
  integer: "number",
  character: "text",
  // yes or no:  a javascript boolean -- NOT `one of red, black`, a property's list of values
  choice: undefined,
  date: undefined,
  list: undefined,
  thing: undefined,
  app: "thing",
  nothing: undefined
}

/**
 * Built-in types which are classes at runtime, so compiled code names them in Type_Case, e.g. `extends List`.
 * - Every other built-in is a plain javascript value, named in spell's words, e.g. `isOfType(x, 'text')`.
 */
export const BUILT_IN_CLASSES: Datatype[] = ["list", "thing", "app"]

/**
 * Datatype for a type name as a user WROTE it -- THE one normaliser.
 * - `typeWords`:  the language's own ways to write each built-in type,
 *   e.g. spell's `SP.TYPE_WORDS`, where `string` => `text` and `yes or no` => `choice`
 * - Without them, only a datatype's own name:  `text`, `numbers`, `list of cards`.
 * - Plurals are singularized before lookup, e.g. `numbers` => `number`.
 * - A list of something:  `list of cards` / `array of Card` => `list of cards`,
 *   when its first word names a `list` -- see `listOf()`.
 * - Anything else is a user's type, Type_Case and singular, as its `TypeScope` is named:  `cards` => `Card`.
 * - NOTE: a language wraps this with its vocabulary, e.g. `SP.typeName()`:  the parser knows no language's words.
 */
export function typeName(written: string, typeWords: TypeWords = {}): Datatype {
  const words = `${written}`.trim().replace(/\s+/g, " ")
  const items = /^(\S+) of (.+)$/i.exec(words)
  if (items && builtInTypeWritten(items[1]!, typeWords) === "list") return listOf(typeName(items[2]!, typeWords))
  return builtInTypeWritten(words, typeWords) ?? typeCase(words)
}

/**
 * How a language lets a user WRITE its built-in types:  lowercased and singular => datatype.
 * - e.g. `{ string: "text", "yes or no": "choice", array: "list" }`
 * - See `typeName()`.
 */
export type TypeWords = Record<string, Datatype>

/** Built-in datatype `written` names, by `typeWords` or its own name -- `undefined` if it names none. */
function builtInTypeWritten(written: string, typeWords: TypeWords): Datatype | undefined {
  const lower = written.toLowerCase()
  const singular = singularize(lower)
  const ownName = isBuiltInType(lower) ? lower : isBuiltInType(singular) ? singular : undefined
  return typeWords[lower] ?? typeWords[singular] ?? ownName
}

/** Is `datatype` one of spell's built-in types, e.g. `text` or `list` -- NOT `list of cards`, nor a user's type? */
export function isBuiltInType(datatype: Datatype | undefined): boolean {
  return datatype !== undefined && Object.hasOwn(BUILT_IN_TYPES, datatype)
}

/**
 * Is `datatype` a plain VALUE -- a built-in which isn't a runtime class, e.g. `text`, `number`, `choice`?
 * - A method on one can't be an instance method:  there's no class to put it on.
 */
export function isValueType(datatype: Datatype | undefined): boolean {
  return isBuiltInType(datatype) && !BUILT_IN_CLASSES.includes(datatype!)
}

/** Datatype of a list holding `itemType`s, e.g. `Card` => `list of cards`, `number` => `list of numbers`. */
export function listOf(itemType: Datatype): Datatype {
  return `list of ${pluralize(itemType.toLowerCase())}`
}

/**
 * What a `list of X` datatype holds, e.g. `list of cards` => `Card` -- `undefined` for any other datatype.
 * - Only from the WORDS:  a user's list type, e.g. `Deck`, says what it holds on its `TypeScope`, `itemType`.
 * - Use `scope.getItemType()` for either.
 */
export function itemTypeOf(datatype: Datatype | undefined): Datatype | undefined {
  const match = datatype && /^list of (.+)$/.exec(datatype)
  return match ? typeName(match[1]!) : undefined
}

// ## Match groups & data

/**
 * Widest possible `match.groups` shape -- constraint and default for a RULE's `Groups` type argument.
 * - MUST stay the top type:  `Rule<Props, X>` is only assignable to bare `P.Rule` if `X` is assignable to this,
 *   and inside a generic rule class TypeScript can't prove anything narrower about unresolved `GroupsFor<...>`.
 * - NOTE: by convention groups only ever hold `Match | Match[]` -- what the syntax matched.  Bare `P.Match`
 *   defaults to `P.MatchGroups`, which says so.  Anything a rule works out for itself goes in `match.data`.
 */
export type AnyGroups = Record<string, unknown>

/**
 * Widest possible `match.data` shape -- default `MatchData` for bare `P.Rule` and `P.Match`.
 * - Rules declare what they stash, e.g. `{ constant?: P.ScopeConstant }`;  readers narrow with `match.is(rule)`.
 */
export type AnyMatchData = Record<string, unknown>

/**
 * Object type for `match.groups` from a spec of group names separated by `|`.
 * - `name` => required
 * - `name?` => optional, e.g. for `{name:rule}?` or name missing from some `syntax` variant
 * - `name[]` / `name[]?` => array of values, for a name which appears more than once in one sequence
 * - e.g. `GroupsFor<"type|property|specifier?">` ~== `{ type: Match; property: Match; specifier?: Match }`
 * - Pass `ValueType` to override, e.g. `GroupsFor<"props", P.ASTVariableExpression[]>`.
 * - NOTE: lists / repeats are a SINGLE `Match` -- repeated items are in its `.items`.
 */
export type GroupsFor<Spec extends string, ValueType = P.Match> = Prettify<
  {
    [Key in SplitString<Spec, "|"> as Key extends `${string}?` ? never : GroupName<Key>]: GroupValue<Key, ValueType>
  } & {
    [Key in SplitString<Spec, "|"> as Key extends `${string}?` ? GroupName<Key> : never]?: GroupValue<Key, ValueType>
  }
>

/** Group name from one `GroupsFor` spec entry, minus `[]` / `?` adornments. */
type GroupName<Key> = Key extends `${infer Name}[]?`
  ? Name
  : Key extends `${infer Name}[]`
    ? Name
    : Key extends `${infer Name}?`
      ? Name
      : Key

/** Group value from one `GroupsFor` spec entry:  array if adorned with `[]`. */
type GroupValue<Key, ValueType> = Key extends `${string}[]` | `${string}[]?` ? ValueType[] : ValueType

/**
 * Resolve a rule's `Groups` type argument, which may be:
 * - `GroupsFor` spec string, e.g. `"lhs|rhs?"`
 * - explicit object type, for shapes a flat spec can't say, e.g. a group whose value is itself a typed `Match`
 * - NOTE: tuple-wrapped so `never` resolves to `{}` (no groups) rather than distributing to `never`.
 */
export type ResolveGroups<Groups extends string | AnyGroups> = [Groups] extends [string]
  ? GroupsFor<Groups & string>
  : Extract<Groups, AnyGroups>

/**
 * `Match` type produced by `RuleType`, with its `groups` and `data` shapes.
 * - Use `P.MatchFor<this>` for `match` params of rule hooks (`getAST()`, `mutateScope()` etc).
 * - Constraint is structural (just those type-only members) rather than `P.Rule<any, any, any>`:
 *   inside a generic rule class, `this` has unresolved `Groups` which won't match `any`-instantiated `Rule`.
 */
export type MatchFor<RuleType extends RuleTypeArgs> = P.Match<RuleType["Groups"], RuleType["MatchData"]>

/** Type-only members of `P.Rule` which re-publish its type arguments -- see `MatchFor`, `Rule.Groups`. */
export type RuleTypeArgs = { readonly Groups: AnyGroups; readonly MatchData: AnyMatchData }

// ## Journal -- see `ParseJournal`

/** One change to shared parse state which a `ParseJournal` can take back, and put back again. */
export type JournalChange = {
  /** Put state back to how it was before the change. */
  undo: () => void
  /** Make the change again, e.g. after `undo()`. */
  redo: () => void
}

/** Point in a `ParseJournal` to rewind to -- from `journal.mark()`, compared by identity. */
export type JournalMark = { readonly isMark: true }

/** Anything in a `ParseJournal`. */
export type JournalEntry = JournalChange | JournalMark

// ## AST casts

// TODO: review `MatchGroups` / `GroupsFor` to add an optional AST type per group, so most `asAST()` / `matchAST()`
//  casts go away.  The syntax already says which rule a group is parsed as, e.g. `{number:expression}`,
//  and in spell an `expression` always builds a `P.ASTExpression`.  Needs a per-language table of rule name
//  => AST type, plus `Match` generic on its AST type.

/**
 * Narrow `node` to concrete AST subclass `T`.
 * - `Match.AST` is typed generically as `ASTNode | undefined`, as `Rule.getAST()`'s return type isn't
 *   parameterized per rule.  Only the referenced rule's semantics (which we know, writing the rule) say
 *   which concrete node comes back -- this asserts that, since it's not statically checkable.
 * - NOTE: also asserts `node` is defined.  Use `matchAST()` for an optional match.
 */
export function asAST<T extends P.ASTNode>(node: P.ASTNode | undefined): T {
  return node as T
}

/**
 * `match.AST`, narrowed to concrete AST subclass `T` (default `ASTExpression`) -- see `asAST()`.
 * - `undefined` in => `undefined` out, e.g. for an optional group.
 */
export function matchAST<T extends P.ASTNode = P.ASTExpression>(match: P.Match): T
export function matchAST<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined
export function matchAST<T extends P.ASTNode = P.ASTExpression>(match: P.Match | undefined): T | undefined {
  return match?.AST as T | undefined
}

// ## Expecting -- see `Expectations`

/**
 * Something a half-typed statement could go on with -- see `Parser.expectedAfter()`.
 * - Recorded where a rule ran out of tokens:  what it was waiting for, and where that sits.
 */
export type Expectation = {
  /** Rule that could come next, e.g. a `Literal`, a `Subrule` (`{type}`), a `Choice`, a `Repeat`. */
  rule: P.Rule
  /** `Sequence` it's a child of, if any -- e.g. for the REST of a method's syntax, or which argument is next. */
  sequence?: P.Sequence
  /** Its index in `sequence.rules`. */
  index?: number
  /** How many `Sequence`s deep, `0` for the rule parsed:  shallower ~== more relevant. */
  depth: number
  /**
   * Only EXTENDS something already complete, e.g. an operator after `x`, which is a whole expression already.
   * - NOT what the statement still needs, e.g. `to` after `set x`.
   */
  continues: boolean
  /**
   * NOT what comes next:  the tokens ran out partway THROUGH `rule`, e.g. an argument of a method call being
   * typed.  For signature help -- completion skips these.
   */
  within: boolean
}

// ## Errors

/** Error we'll throw when setting up / executing parser. */
export class ParserError extends CustomError {}

// ## Testing

/**
 * One failed rule test, as collected in `TestResults.failed`.
 * - `ruleName` -- rule under test, `undefined` for an anonymous rule.
 * - `input` -- input text that was tested.
 * - `expected` -- expected output.
 * - `result` -- actual result (or thrown error) we got instead.
 */
export type FailedRuleTest = { ruleName: string | undefined; input: string; expected: unknown; result: unknown }

/** Results of running `testRules()` (or one leg of `speedTest()`) across a set of rules. */
export type TestResults = {
  /** Number of tests that passed. */
  pass: number
  /** Number of tests that failed. */
  fail: number
  /** Failed tests, with expected vs. actual result. */
  failed: FailedRuleTest[]
  /** Total time taken, in msec. */
  time: number
}

/** Results of `Parser.speedTest()` -- `TestResults` minus `time`, plus timing stats across repeated runs. */
export type SpeedTestResults = Omit<TestResults, "time"> & {
  /** Time of first (cold, warm-up) run, in msec. */
  initialTime: number
  /** Average time across warmed-up runs, in msec. */
  average: number
  /** Fastest warmed-up run, in msec. */
  min: number
  /** Slowest warmed-up run, in msec. */
  max: number
}

/**
 * A single rule test:  an `[input, js, ts?]` tuple, or an object with the same, `{ input, js, ts }`.
 * - `input`:  what's parsed, as the block's `compileAs` rule;  an array is its lines.
 * - `js`:  what the javascript writer writes for it, `P.JSWriter`;  `undefined` if it mustn't parse.
 * - `ts`:  what the TypeScript writer writes, `P.TSWriter` -- left out where it's the same as `js`.
 *   `BLESS_RULE_TESTS=1` writes it in:  see `unitTestModuleRules()`.
 * - `js` / `ts` as an array:  its lines.
 */
export type RuleTest =
  | [input: string | string[], js: unknown, ts?: unknown]
  | { title?: string; input: string | string[]; js: unknown; ts?: unknown; skip?: boolean }

/** Block of rule tests, optionally compiled as a different rule (`compileAs`). */
export type RuleTestBlock = {
  /** Optional label for this block of tests, e.g. shown in debug output. */
  title?: string
  /** Rule name to compile as, if different from rule under test.  Defaults to that rule's name. */
  compileAs?: string
  /** Set `true` to skip this whole block. */
  skip?: boolean
  /** TODO: not read anywhere in `Parser.testRules()` -- looks unused. */
  showAll?: boolean
  /** Run before each test, e.g. to seed scope `variables`/`constants`. */
  beforeEach?: (scope: P.Scope) => void
  /** Tests to run for this block. */
  tests: RuleTest[]
}

/** Array of `RuleTestBlock`s, e.g. `rule.tests`. */
export type RuleTests = RuleTestBlock[]

/**
 * Normalize a `RuleTest` tuple or object to a consistent object, joining array `input` / `js` / `ts` with newlines.
 * - `ts` left out:  the same as `js`.
 */
export function normalizeRuleTest(test: RuleTest) {
  const {
    input,
    js,
    ts = js,
    skip = false,
    title
  } = Array.isArray(test) ? { input: test[0], js: test[1], ts: test[2], skip: false, title: undefined } : test
  return { input: joinLines(input), js: joinLines(js), ts: joinLines(ts), skip, title }
}

/** `value`'s lines joined with newlines, if it's an array;  else as is. */
function joinLines(value: string | string[]): string
function joinLines(value: unknown): unknown
function joinLines(value: unknown): unknown {
  return Array.isArray(value) ? value.join("\n") : value
}
