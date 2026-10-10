/**
 * A rule module's source file, read for its rule tests, and rewritten in place:
 * how `BLESS_RULE_TESTS=1` writes each test's `js` and `ts` into the source (see `unitTestModuleRules()`).
 * - NODE-ONLY, test-only:  it reads and writes files.
 *   `unitTestModuleRules()` loads it only when blessing, so a plain test run never does.
 * - Knows no language:  it finds tests by their shape, the `P.RuleTest`s in any `tests: [...]` array.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { parseSync } from "vite-plus"

/****************
 * ### `RuleTestSource`
 * One source file's rule tests:  each `[input, js, ts?]` tuple or `{ input, js, ts }` object in a `tests: [...]`.
 * - `bless()` sets each test's `js` and `ts` to what the writers wrote;  its `ts`
 *   left out where it's the same as its `js`.
 * - `renameOutputs()` renames the old `output:` key to `js:`.
 * - Edits are text edits at the test's place in the file:  everything else stays as written.
 *   `vp fmt` tidies them after.
 ****************/
export class RuleTestSource {
  /** Text edits waiting for `save()`. */
  private edits: TextEdit[] = []

  constructor(
    /** The file, on disk. */
    readonly path: string,
    /** Its text as read. */
    readonly text: string
  ) {}

  /** The source file at `path`, read from disk. */
  static load(path: string): RuleTestSource {
    return new RuleTestSource(path, readFileSync(path, "utf8"))
  }

  /** A test's key:  its input and `js`, lines joined, which together say which test it is. */
  static keyOf(input: string, js: unknown): string {
    return `${input}\u0000${typeof js === "string" ? js : String(js)}`
  }

  /**
   * Every rule test in the file, in order.
   * - A tuple:  an array in a `tests: [...]` whose first item is text, e.g. `["2 ... 4", "[2, 3, 4]"]`.
   * - An object:  one with an `input`, e.g. `{ title, input, js }`.
   * - throws if the file doesn't parse
   */
  get tests(): SourceTest[] {
    const { program, errors } = parseSync(this.path, this.text, { lang: "ts" })
    if (errors.length) throw new SyntaxError(`RuleTestSource:  can't parse ${this.path}:  ${errors[0]!.message}`)
    const found: SourceTest[] = []
    walk(program as unknown as SourceNode, (node) => {
      if (node.type !== "Property" || propertyName(node) !== "tests") return
      const list = node.value as SourceNode
      if (list.type !== "ArrayExpression") return
      for (const item of list.elements as SourceNode[]) {
        const test = item && sourceTestFor(item)
        if (test) found.push(test)
      }
    })
    return found
  }

  /** Rename each object test's `output:` to `js:`.  Returns `this`. */
  renameOutputs(): this {
    for (const { output } of this.tests) {
      if (output) this.edits.push({ start: output.key.start, end: output.key.end, text: "js" })
    }
    return this
  }

  /**
   * Set each test's `js` and `ts` to `blessed`'s, found by its `input` and old `js`:  `ts` left out where it's the
   * same as `js`.
   * - Returns what it couldn't bless, as warnings:  `blessed` gave two different values for one test,
   *   or one which can't be written as a literal (an error a writer threw).
   * - A test `blessed` doesn't name is left as it is.
   */
  bless(blessed: BlessedTest[]): string[] {
    const warnings: string[] = []
    const byKey = new Map<string, Array<{ js: unknown; ts: unknown }>>()
    for (const { input, js, writtenJs, ts } of blessed) {
      const values = byKey.get(RuleTestSource.keyOf(input, js)) ?? []
      if (!values.some((it) => it.js === writtenJs && it.ts === ts)) values.push({ js: writtenJs, ts })
      byKey.set(RuleTestSource.keyOf(input, js), values)
    }
    for (const test of this.tests) {
      const values = byKey.get(RuleTestSource.keyOf(test.input, test.js))
      if (!values) continue
      if (values.length > 1) {
        warnings.push(`${this.path}:  '${test.input}' compiles to ${values.length} different outputs:  left as is`)
        continue
      }
      const [{ js, ts }] = values as [{ js: unknown; ts: unknown }]
      if (!isWritable(js)) {
        warnings.push(`${this.path}:  '${test.input}':  js is ${String(js)}, not a literal:  left as is`)
        continue
      }
      if (js !== test.js) this.setJs(test, literalFor(js))
      if (ts === js) this.removeTs(test)
      else if (test.ts && ts === test.tsValue) continue
      else if (isWritable(ts)) this.setTs(test, literalFor(ts))
      else warnings.push(`${this.path}:  '${test.input}':  ts is ${String(ts)}, not a literal:  left as is`)
    }
    return warnings
  }

  /** Our text with our edits made, last first, so earlier offsets still hold. */
  get edited(): string {
    let text = this.text
    for (const { start, end, text: replacement } of [...this.edits].sort((a, b) => b.start - a.start)) {
      text = text.slice(0, start) + replacement + text.slice(end)
    }
    return text
  }

  /** Write our edits to disk.  Returns whether anything changed. */
  save(): boolean {
    const { edited } = this
    if (edited === this.text) return false
    writeFileSync(this.path, edited)
    return true
  }

  /** `test` without its `ts`, if it has one. */
  private removeTs({ ts, previous }: SourceTest) {
    if (ts && previous) this.edits.push({ start: previous.end, end: ts.end, text: "" })
  }

  /** `test` with its `js` set to `literal`. */
  private setJs({ jsNode, isTuple }: SourceTest, literal: string) {
    const value = isTuple ? jsNode : (jsNode.value as SourceNode)
    this.edits.push({ start: value.start, end: value.end, text: literal })
  }

  /** `test` with `ts` set to `literal`:  its own `ts` replaced, or a new one after its `js`. */
  private setTs({ ts, jsNode, isTuple }: SourceTest, literal: string) {
    const value = ts && (isTuple ? ts : (ts.value as SourceNode))
    if (value) {
      if (this.text.slice(value.start, value.end) !== literal) {
        this.edits.push({ start: value.start, end: value.end, text: literal })
      }
    } else this.edits.push({ start: jsNode.end, end: jsNode.end, text: isTuple ? `, ${literal}` : `, ts: ${literal}` })
  }
}

/** One rule test found in a source file -- see `RuleTestSource.tests`. */
export type SourceTest = {
  /** Its input, lines joined, as `P.normalizeRuleTest()` has it. */
  input: string
  /** Its `js`, lines joined:  `undefined` if it says so. */
  js: unknown
  /** `[input, js, ts?]`, else `{ input, js, ts }`. */
  isTuple: boolean
  /** Its `js` value's node (tuple), or its `js:` / `output:` property's (object):  a new `ts` goes after it. */
  jsNode: SourceNode
  /** An object test's `output:` property, not yet renamed `js:`. */
  output: (SourceNode & { key: SourceNode }) | undefined
  /** Its `ts` value's node (tuple), or its `ts:` property's (object), if it has one. */
  ts: SourceNode | undefined
  /** Its `ts`, lines joined, if it has one. */
  tsValue: unknown
  /** What comes before `ts`:  removing `ts` removes from here. */
  previous: SourceNode | undefined
}

/** What a writer wrote for one rule test -- see `RuleTestSource.bless()`. */
export type BlessedTest = {
  /** Its input, lines joined. */
  input: string
  /** Its `js`, as the test says, lines joined. */
  js: unknown
  /** What the javascript writer wrote. */
  writtenJs: unknown
  /** What the TypeScript writer wrote. */
  ts: unknown
}

/** A node of the source's syntax tree, as `parseSync()` gives it:  ESTree, with offsets. */
type SourceNode = { type: string; start: number; end: number; [key: string]: unknown }

/** Replace `start` ... `end` of the text with `text`. */
type TextEdit = { start: number; end: number; text: string }

/** Not a value we can read from source, e.g. a variable. */
const UNREADABLE = Symbol("unreadable")

/** `item` of a `tests: [...]`, if it's a rule test. */
function sourceTestFor(item: SourceNode): SourceTest | undefined {
  if (item.type === "ArrayExpression") {
    const [input, js, ts] = item.elements as SourceNode[]
    const inputValue = input && readValue(input)
    if (!js || !isText(inputValue)) return undefined
    return {
      input: joinLines(inputValue) as string,
      js: joinLines(readValue(js)),
      isTuple: true,
      jsNode: js,
      output: undefined,
      ts,
      tsValue: ts && joinLines(readValue(ts)),
      previous: js
    }
  }
  if (item.type !== "ObjectExpression") return undefined
  const properties = (item.properties as SourceNode[]).filter((it) => it.type === "Property")
  const named = (name: string) => properties.find((it) => propertyName(it) === name)
  const input = named("input")
  const inputValue = input && readValue(input.value as SourceNode)
  const js = named("js") ?? named("output")
  if (!js || !isText(inputValue)) return undefined
  const ts = named("ts")
  return {
    input: joinLines(inputValue) as string,
    js: joinLines(readValue(js.value as SourceNode)),
    isTuple: false,
    jsNode: js,
    output: propertyName(js) === "output" ? (js as SourceNode & { key: SourceNode }) : undefined,
    ts,
    tsValue: ts && joinLines(readValue(ts.value as SourceNode)),
    previous: ts && properties[properties.indexOf(ts) - 1]
  }
}

/** What `node` says, if it's a literal:  text, a number, `undefined`, an array of them;  else `UNREADABLE`. */
function readValue(node: SourceNode): unknown {
  switch (node.type) {
    case "Literal":
      return node.value instanceof RegExp ? UNREADABLE : node.value
    case "TemplateLiteral": {
      const quasis = node.quasis as Array<{ value: { cooked: string } }>
      return (node.expressions as unknown[]).length ? UNREADABLE : quasis[0]!.value.cooked
    }
    case "ArrayExpression": {
      const values = (node.elements as SourceNode[]).map((it) => (it ? readValue(it) : UNREADABLE))
      return values.includes(UNREADABLE) ? UNREADABLE : values
    }
    case "Identifier":
      return node.name === "undefined" ? undefined : UNREADABLE
    case "UnaryExpression": {
      const value = readValue(node.argument as SourceNode)
      return node.operator === "-" && typeof value === "number" ? -value : UNREADABLE
    }
    default:
      return UNREADABLE
  }
}

/** Is `value` text, or lines of it? */
function isText(value: unknown): value is string | string[] {
  return typeof value === "string" || (Array.isArray(value) && value.every((it) => typeof it === "string"))
}

/** Can `value` be written as a literal in source? */
function isWritable(value: unknown): boolean {
  return value === undefined || ["string", "number", "boolean"].includes(typeof value)
}

/** `value` as source:  text as a string, or an array of its lines if it has several. */
function literalFor(value: unknown): string {
  if (typeof value !== "string") return String(value)
  const lines = value.split("\n")
  return lines.length > 1 ? `[${lines.map((it) => JSON.stringify(it)).join(", ")}]` : JSON.stringify(value)
}

/** `value`'s lines joined with newlines, if it's an array;  else as is -- as `P.normalizeRuleTest()` does. */
function joinLines(value: unknown): unknown {
  return Array.isArray(value) ? value.join("\n") : value
}

/** A property's key, if it's a plain name or a string, e.g. `tests`. */
function propertyName(property: SourceNode): string | undefined {
  const key = property.key as SourceNode
  if (key.type === "Identifier") return key.name as string
  return key.type === "Literal" && typeof key.value === "string" ? key.value : undefined
}

/** Call `visit` for `node` and every node inside it. */
function walk(node: SourceNode, visit: (node: SourceNode) => void) {
  visit(node)
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const it of value) if (isNode(it)) walk(it, visit)
    } else if (isNode(value)) walk(value, visit)
  }
}

/** Is `value` a syntax tree node? */
function isNode(value: unknown): value is SourceNode {
  return typeof value === "object" && value !== null && typeof (value as SourceNode).type === "string"
}
