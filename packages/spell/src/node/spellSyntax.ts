import { readdirSync, readFileSync } from "fs"
import { join, relative, resolve } from "path"
import { parseSync } from "vite-plus"

import { P } from "$/parser"
import { PY } from "$/py"
import { core } from "$/core"
import { spellParser } from "$/spell"

/**
 * The spell syntax table:  every rule class of the base spell language, what it's for, each syntax it's registered
 * with, and what an example of each compiles to in each writer.
 * - Written to `spellSyntax.json`, at the package's root, by `yarn gen:syntax` (`writeSpellSyntax.ts`).
 *   - `spellSyntax.test.ts` fails when that file and the rules differ.
 *   - The spell syntax guide draws it (`guides/spell-syntax/spell-syntax.html`),
 *     from the checkout serving the page, so each branch shows its own rules.
 * - One row per rule CLASS, by module (the folder it's registered from, `rules/math/` ...):
 *   - a class registered once per syntax (`AssignmentStatement`) is one row, with each syntax
 *   - a class `specialize()`d into several rules (`Negatable`:  `is`, `can` ...) is one row, with each rule name
 *   - INTERNAL:  a rule class in `src/rules/` that's never registered itself, e.g. a base class (`SpellStatement`)
 *   - in a module, its internal rows first (by name), then its registered ones (in registration order)
 * - Each syntax's example:  the first input of its own tests that compiles (`examplesOf()`).
 *   - Each writer writes it as its rule test would:  `js` and `ts` are what the rule's tests expect, once they pass.
 *   - Comments are left out of the example and of what the writers write (`withoutComments()`).
 * - The aliases:  the other rule names it answers to, e.g. `expression` (`@proto static alias`).
 * - The purpose:  the class docstring's first sentence, without its "`is_gt_lt` rule:" lead.
 * - NODE-ONLY:  reads the rule files' source, for their docstrings.  NOT in the barrel.
 */
export function spellSyntax(parser: P.Parser = spellParser): SpellSyntaxData {
  const sources = classSources()
  const registered = registeredClasses(parser)
  const ancestors = ancestorClasses(registered)
  const modules = new Map<string, SpellSyntaxRule[]>()
  const rowFor = (module: string) => modules.get(module) ?? modules.set(module, []).get(module)!
  for (const [ruleClass, rules] of registered) {
    const source = sources.get(ruleClass.name)
    rowFor(rules[0]!.module ?? MODULE_OF_STRUCTURAL_RULES).push({
      className: ruleClass.name,
      ruleNames: unique(rules.map((rule) => rule.name ?? "")).filter(Boolean),
      internal: false,
      ...where(source),
      purpose: purposeOf(source?.docstring),
      syntaxes: syntaxesOf(parser, rules),
      aliases: aliasesOf(rules.map((rule) => rule.alias))
    })
  }
  const known = new Set([...registered.keys()].map((ruleClass) => ruleClass.name))
  for (const source of internalClasses(sources, ancestors)) {
    if (known.has(source.className)) continue
    rowFor(source.module).push({
      className: source.className,
      ruleNames: [],
      internal: true,
      ...where(source),
      purpose: purposeOf(source.docstring),
      syntaxes: [],
      aliases: aliasesOf([(ancestors.get(source.className) as typeof P.Rule | undefined)?.alias])
    })
  }
  return {
    about: ABOUT,
    modules: [...modules].map(([module, rules]) => ({
      module,
      rules: [...sortedInternal(rules), ...rules.filter((rule) => !rule.internal)]
    }))
  }
}

////////////////
// ## The rules
////////////////

/**
 * Every rule class `parser` registered, with its registrations, in registration order.
 * - A `specialize()`d class counts as the class it was specialized from (`Negatable`, not `is`).
 */
function registeredClasses(parser: P.Parser): Map<P.RuleClass, P.Rule[]> {
  const classes = new Map<P.RuleClass, P.Rule[]>()
  const seen = new Set<P.Rule>()
  for (const entry of Object.values(parser.rules)) {
    for (const rule of entry instanceof P.Group ? entry.rules : [entry]) {
      if (seen.has(rule)) continue
      seen.add(rule)
      const ruleClass = baseClassOf(rule.constructor as P.RuleClass)
      const rules = classes.get(ruleClass) ?? classes.set(ruleClass, []).get(ruleClass)!
      rules.push(rule)
    }
  }
  return classes
}

/** `ruleClass`, or the class it was `specialize()`d from. */
function baseClassOf(ruleClass: P.RuleClass): P.RuleClass {
  let found = ruleClass
  while (Object.hasOwn(found, "specializedFrom") && found.specializedFrom) found = found.specializedFrom
  return found
}

/** Every registered class and each class it extends, short of `P.Rule` itself, by name. */
function ancestorClasses(registered: Map<P.RuleClass, P.Rule[]>): Map<string, P.RuleClass> {
  const ancestors = new Map<string, P.RuleClass>()
  for (const ruleClass of registered.keys()) {
    for (let each: unknown = ruleClass; typeof each === "function" && each !== P.Rule;) {
      if (!ancestors.has(each.name)) ancestors.set(each.name, each as P.RuleClass)
      each = Object.getPrototypeOf(each)
    }
  }
  return ancestors
}

/**
 * The rule classes in `src/rules/` nobody registers:  base classes of registered ones (`InfixOperatorSuffix`),
 * and rule classes made while parsing (`DynamicMethodRule`).
 * - A class counts as a rule class when it extends one:  a registered class, one of their `ancestors`, a parser rule
 *   class (`P.Sequence`), or, in turn, another class found here.
 */
function internalClasses(sources: Map<string, ClassSource>, ancestors: Map<string, P.RuleClass>): ClassSource[] {
  const ruleClassNames = new Set(ancestors.keys())
  const isParserRule = (name: string) => {
    const value = (P as Record<string, unknown>)[name]
    return typeof value === "function" && (value === P.Rule || value.prototype instanceof P.Rule)
  }
  const found = new Map<string, ClassSource>()
  for (let isGrowing = true; isGrowing;) {
    isGrowing = false
    for (const source of sources.values()) {
      if (found.has(source.className) || !source.superClass) continue
      const superClass = source.superClass.replace(/^P\./, "")
      const extendsRule =
        ruleClassNames.has(source.className) ||
        ruleClassNames.has(superClass) ||
        found.has(superClass) ||
        (source.superClass.startsWith("P.") && isParserRule(superClass))
      if (!extendsRule) continue
      found.set(source.className, source)
      isGrowing = true
    }
  }
  return [...found.values()]
}

/** `rules`'s internal rows, by class name:  they go first. */
function sortedInternal(rules: SpellSyntaxRule[]): SpellSyntaxRule[] {
  return rules.filter((rule) => rule.internal).sort((a, b) => a.className.localeCompare(b.className))
}

/**
 * Each rule's `alias` (a name, a list of them, or none) as one list, without repeats:  `["statement", "expression"]`.
 */
function aliasesOf(aliases: (string | string[] | undefined)[]): string[] {
  return unique(aliases.flat().filter((alias): alias is string => !!alias))
}

////////////////
// ## The syntaxes, and an example of each in each writer
////////////////

/**
 * Each syntax `rules` are registered with, in registration order, each with its example.
 * - a syntax registered twice (two groups, say) is one, with the first example either gives
 * - a registration with no syntax of its own (a token's, matched by its code) still shows its example
 */
function syntaxesOf(parser: P.Parser, rules: P.Rule[]): SpellSyntaxForm[] {
  const forms = new Map<string, SpellSyntaxForm>()
  for (const rule of rules) {
    const key = rule.syntax ?? ""
    if (forms.get(key)?.example) continue
    const form = { ...(rule.syntax ? { syntax: rule.syntax } : {}), ...examplesOf(parser, rule) }
    if (!forms.has(key) || form.example) forms.set(key, form)
  }
  return [...forms.values()].filter((form) => form.syntax || form.example)
}

/**
 * The first input of `rule`'s own tests that compiles, and what each writer writes for it;  `{}` when none does.
 * - Blank and skipped tests don't count, as in the rule tests themselves (`unitTestModuleRules()`).
 * - Nor does a test of what must NOT compile:  its `js` is `undefined`, or a parse error.
 * - Comments left out of the input shown, and of each writer's output (`withoutComments()`):
 *   it's compiled as the test has it.
 */
function examplesOf(parser: P.Parser, rule: P.Rule): Pick<SpellSyntaxForm, "example" | "outputs"> {
  for (const block of rule.tests ?? []) {
    if (block.skip) continue
    const test = block.tests
      .map(P.normalizeRuleTest)
      .find(
        ({ skip, input, js }) =>
          !skip && input !== "" && js !== undefined && !(typeof js === "string" && PARSE_ERROR.test(js))
      )
    if (!test) continue
    const compileAs = block.compileAs ?? rule.name
    if (!compileAs) continue
    return {
      example: withoutComments(test.input, "spell"),
      outputs: writeExample(parser, test.input, compileAs, block.beforeEach)
    }
  }
  return {}
}

/**
 * `input` parsed as `ruleName` in a fresh scope, and written by each writer:  `{ js, ts, py }`.
 * - As the rule tests do (`unitTestModuleRules()`'s `compileMatch()`):  the runtime reset, `beforeEach` run,
 *   the match committed, each writer seeing it as the whole project, the output normalized.
 * - Python:  a rule with no tree compiles ITSELF, in javascript, so it has no Python of its own.
 * - A writer that throws:  `{ error }`, its message.
 * - REFACTOR:
 *   one `P.Parser.writeRuleTest(input, ruleName, { beforeEach, writers })` for this, `compileMatch()` and `testRules()`.
 */
function writeExample(
  parser: P.Parser,
  input: string,
  ruleName: string,
  beforeEach?: (scope: P.Scope) => void
): SpellSyntaxOutputs {
  core.resetRuntime()
  const scope = parser.getScope(`syntax_${ruleName}`)
  beforeEach?.(scope)
  let match: P.Match | undefined
  try {
    match = scope.parse(input, ruleName)
    if (match) parser.commit(match)
  } catch (error) {
    const failed = { error: `doesn't parse:  ${(error as Error).message}` }
    return { js: failed, ts: failed, py: failed }
  }
  if (!match) {
    const failed = { error: `doesn't parse as \`${ruleName}\`` }
    return { js: failed, ts: failed, py: failed }
  }
  const parsed = match
  const write = (writer: P.ProgramWriter, language: CodeLanguage): SpellSyntaxOutput => {
    try {
      return { code: withoutComments(codeOf(parser.normalizeTestOutput(writer.writeMatch(parsed))), language) }
    } catch (error) {
      return { error: firstLine((error as Error).message) }
    }
  }
  return {
    js: write(P.JSWriter.instance, "js"),
    ts: write(P.TSWriter.instance, "js"),
    py: parsed.rule.getAST ? write(PY.PyWriter.instance, "py") : { error: NO_PYTHON }
  }
}

/** What a writer wrote, as text:  lines joined, a number or `true` as it reads;  nothing written:  `""`. */
function codeOf(written: unknown): string {
  if (written === undefined || written === null) return ""
  if (Array.isArray(written)) return written.map(codeOf).join("\n")
  return typeof written === "object" ? JSON.stringify(written) : String(written as string | number | boolean)
}

/**
 * `code` without its comments, e.g. a class's docstring the TypeScript writer writes, or `/* spell: type unknown *\/`.
 * - `language`:  which comments and quotes it has
 *   - `js` (javascript and TypeScript):  `// ...` and `/* ... *\/`;  quotes `"`, `'` and `` ` ``
 *   - `py`:  `# ...`;  quotes `"""`, `'''`, `"` and `'`
 *   - `spell`:  `// ...` and `/* ... *\/`;  quotes `"` only, as `isn't` is no quote
 * - what's quoted is never a comment:  `"http://..."` stays
 * - a line left blank by it goes;  blank lines left in a row, one;  spaces at a line's end, none
 * - a comment that's ALL there is stays:  the comment rule's own example, `// foo`
 */
export function withoutComments(code: string, language: CodeLanguage): string {
  const stripped = commentsBlanked(code, language).split("\n")
  const lines = code.split("\n").flatMap((line, i) => {
    const kept = stripped[i]!.trimEnd()
    return kept || !line.trim() ? [kept] : []
  })
  const text = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "")
  return text || code
}

/** `code` with each comment removed, its line breaks kept:  line `i` of the result is line `i` of `code`. */
function commentsBlanked(code: string, language: CodeLanguage): string {
  const { line, block, quotes } = COMMENT_SYNTAX[language]
  let out = ""
  for (let i = 0; i < code.length;) {
    if (code.startsWith(line, i)) {
      while (i < code.length && code[i] !== "\n") i++
      continue
    }
    if (block && code.startsWith(block[0], i)) {
      const end = code.indexOf(block[1], i + block[0].length)
      let stop = end < 0 ? code.length : end + block[1].length
      out += code.slice(i, stop).replace(/[^\n]/g, "")
      // a comment between two words:  one space left between them, not two
      if (out.endsWith(" ") && code[stop] === " ") stop++
      i = stop
      continue
    }
    const quote = quotes.find((each) => code.startsWith(each, i))
    if (quote) {
      let stop = i + quote.length
      while (stop < code.length && !code.startsWith(quote, stop)) stop += code[stop] === "\\" ? 2 : 1
      stop = Math.min(code.length, stop + quote.length)
      out += code.slice(i, stop)
      i = stop
      continue
    }
    out += code[i]
    i++
  }
  return out
}

////////////////
// ## The rule files' source
////////////////

/**
 * Every class declared in `src/rules/` (tests left out), by name:  its file, line, docstring, what it extends.
 * - Read with oxc, the parser Vite+ ships, as `P.RuleTestSource` reads rule tests.
 */
function classSources(): Map<string, ClassSource> {
  const sources = new Map<string, ClassSource>()
  for (const file of ruleFiles(RULES_DIR)) {
    const text = readFileSync(file, "utf8")
    const { program, comments } = parseSync(file, text, { lang: "ts" })
    const docs = (comments as Comment[]).filter((comment) => comment.type === "Block" && comment.value.startsWith("*"))
    for (const statement of program.body as SourceNode[]) {
      const declaration = (statement.declaration as SourceNode | undefined) ?? statement
      if (declaration.type !== "ClassDeclaration") continue
      const className = (declaration.id as { name: string }).name
      // the docstring right above it:  nothing but white space between
      const docstring = docs.find(
        (comment) => comment.end <= statement.start && /^\s*$/.test(text.slice(comment.end, statement.start))
      )
      sources.set(className, {
        className,
        file: relative(REPO_ROOT, file),
        line: text.slice(0, declaration.start).split("\n").length,
        module: moduleOfFile(file),
        docstring: docstring && docstringText(docstring.value),
        superClass: superClassName(declaration.superClass as SourceNode | null)
      })
    }
  }
  return sources
}

/** `.ts` files under `folder`, tests and types files left out, in a stable order. */
function ruleFiles(folder: string): string[] {
  return (readdirSync(folder, { recursive: true }) as string[])
    .filter((path) => /\.ts$/.test(path) && !/\.(test|types|d)\.ts$/.test(path) && !path.includes("__snapshots__"))
    .sort()
    .map((path) => join(folder, path))
}

/** The module a rule file is in:  its folder under `src/rules/`;  a file right in it:  the structural rules'. */
function moduleOfFile(file: string): string {
  const [folder, ...rest] = relative(RULES_DIR, file).split("/")
  return rest.length ? folder! : MODULE_OF_STRUCTURAL_RULES
}

/** `superClass`'s name as written:  `SpellExpression`, `P.Sequence`;  a generic's arguments left off. */
function superClassName(superClass: SourceNode | null): string | undefined {
  if (!superClass) return undefined
  if (superClass.type === "Identifier") return superClass.name as string
  if (superClass.type === "MemberExpression") {
    const object = superClassName(superClass.object as SourceNode)
    const property = (superClass.property as { name?: string }).name
    return object && property ? `${object}.${property}` : undefined
  }
  return undefined
}

/** A `/** ... *\/` comment's text:  each line's leading `*` gone. */
function docstringText(value: string): string {
  return value
    .split("\n")
    .map((line) => line.replace(/^\s*\*+ ?/, ""))
    .join("\n")
    .trim()
}

/** `source`'s file and line, for the row. */
function where(source: ClassSource | undefined): Pick<SpellSyntaxRule, "file" | "line"> {
  return source ? { file: source.file, line: source.line } : {}
}

/**
 * The first sentence of a class docstring, in plain words:  its lead (before any bullet), the rule's name gone.
 * - `` `is_gt_lt` rule:  `is greater than` ... `` => `` `is greater than` ... ``
 * - A banner's title line (`### Name`) is skipped.
 * - none:  `""`
 */
export function purposeOf(docstring: string | undefined): string {
  if (!docstring) return ""
  const lead = docstring
    .split(/\n\s*[-*] /)[0]!
    .split("\n")
    .filter((line) => !/^#+ /.test(line.trim()) && !/^\*+$/.test(line.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(RULE_LEAD, "")
  // "e.g." and its kin end no sentence:  their periods hidden while splitting
  const sentence = lead.replace(/\b(e\.g|i\.e|etc)\./g, `$1${NOT_A_STOP}`).split(/(?<=[.!?])\s+(?=[A-Z`(])/)[0] ?? ""
  const plain = sentence
    .replaceAll(NOT_A_STOP, ".")
    .replace(/(?<!\.):$/, ".")
    .replace(/\.:$/, ".")
    .trim()
  return plain ? plain[0]!.toUpperCase() + plain.slice(1) : ""
}

/** `values` without repeats, in first-seen order. */
function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

/** `text`'s first line. */
function firstLine(text: string): string {
  return text.split("\n")[0]!.trim()
}

/** The file `yarn gen:syntax` writes, at the package's root. */
export const SPELL_SYNTAX_FILE = "spellSyntax.json"

/** The checkout's root:  file paths in the data are from here. */
const REPO_ROOT = resolve(import.meta.dirname, "../../../..")

/** Where spell's rule modules live. */
const RULES_DIR = resolve(import.meta.dirname, "../rules")

/** The module of the rules `rules/index.ts` registers itself (`block`, `line` ...):  the parser's own. */
const MODULE_OF_STRUCTURAL_RULES = "spell"

/** A docstring's lead naming its rules:  "`is_gt_lt` rule:", "`if` / `else` rules:". */
const RULE_LEAD = /^(`[^`]+`(\s*(\/|,|and)\s*`[^`]+`)*\s+rules?\s*(--|:)\s*)/

/** Stands in for an abbreviation's period while `purposeOf()` splits sentences:  a private-use character. */
const NOT_A_STOP = ""

/** A rule test's `js` saying its input doesn't parse:  no example. */
const PARSE_ERROR = /PARSE ERROR/

/** Why a rule has no Python:  it writes itself, not through a writer. */
const NO_PYTHON = "writes itself, in javascript:  no Python writer"

/** Each language's comments and quotes (longest quote first), for `withoutComments()`. */
const COMMENT_SYNTAX: Record<CodeLanguage, { line: string; block?: [string, string]; quotes: string[] }> = {
  js: { line: "//", block: ["/*", "*/"], quotes: ["`", '"', "'"] },
  py: { line: "#", quotes: ['"""', "'''", '"', "'"] },
  spell: { line: "//", block: ["/*", "*/"], quotes: ['"'] }
}

/** The file's own note, first in it. */
const ABOUT =
  "GENERATED by `yarn gen:syntax` in packages/spell (src/node/writeSpellSyntax.ts):  never edit.  Drawn by guides/spell-syntax/spell-syntax.html."

////////////////
// ## Types
////////////////

/** What `spellSyntax()` returns, and `spellSyntax.json` holds. */
export type SpellSyntaxData = {
  /** The file's own note:  generated, by what. */
  about: string
  /** Each module, in the order its rules were registered. */
  modules: SpellSyntaxModule[]
}

/** One module's rules:  its internal classes by name, then its registered ones in registration order. */
export type SpellSyntaxModule = {
  /** The module's name, e.g. `math`:  its folder in `src/rules/`. */
  module: string
  /** Its rows. */
  rules: SpellSyntaxRule[]
}

/** One rule class's row. */
export type SpellSyntaxRule = {
  /** The class's name, e.g. `IsGtLt`. */
  className: string
  /** The rule names it's registered as, e.g. `["is_gt_lt"]`;  `Negatable`:  `["is", "can", ...]`;  internal:  none. */
  ruleNames: string[]
  /** Not registered itself:  a base class, or a rule made while parsing. */
  internal: boolean
  /** Its file, from the checkout's root;  unknown:  left out. */
  file?: string
  /** Its class declaration's line in `file`. */
  line?: number
  /** One sentence:  what it's for, from its docstring;  none:  `""`. */
  purpose: string
  /** Each syntax it's registered with, in registration order, with an example of it;  internal:  none. */
  syntaxes: SpellSyntaxForm[]
  /** The other rule names it answers to, its `alias`, e.g. `["expression"]`;  none:  `[]`. */
  aliases: string[]
}

/** One syntax of a rule, and an example of it from its tests. */
export type SpellSyntaxForm = {
  /**
   * The syntax as registered, e.g. `{thing:expression} is less than {other:expression}`;
   * left out for a rule its code matches (a token's).
   */
  syntax?: string
  /** The example:  the first input of its tests that compiles, comments left out;  none:  left out. */
  example?: string
  /** What each writer writes for the example, comments left out. */
  outputs?: SpellSyntaxOutputs
}

/** What the javascript, TypeScript and Python writers write for an example. */
export type SpellSyntaxOutputs = Record<"js" | "ts" | "py", SpellSyntaxOutput>

/** One writer's output:  its code, or why there's none. */
export type SpellSyntaxOutput = { code: string } | { error: string }

/** The languages `withoutComments()` reads:  `js` is javascript and TypeScript. */
export type CodeLanguage = "js" | "py" | "spell"

/** A class declared in a rule file -- see `classSources()`. */
type ClassSource = {
  className: string
  /** From the checkout's root. */
  file: string
  line: number
  /** Its folder under `src/rules/`. */
  module: string
  docstring: string | undefined
  /** What it extends, as written. */
  superClass: string | undefined
}

/** A comment, as oxc gives it. */
type Comment = { type: "Line" | "Block"; value: string; start: number; end: number }

/** A node of oxc's syntax tree:  ESTree, with offsets. */
type SourceNode = { type: string; start: number; end: number; [key: string]: unknown }
