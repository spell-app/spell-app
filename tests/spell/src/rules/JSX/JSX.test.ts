import { describe, test, expect } from "vite-plus/test"
import { parseSpellProject, unitTestModuleRules } from "$/spell/test"
import { P } from "$/parser"
import { PY } from "$/py"
import { SP, spellParser } from "$/spell"
import { core } from "$/core"
import type { JSXMatchData } from "$/spell/rules/JSX/JSX.shared"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX", core.resetRuntime)

  test("a dotted tag is reported with the block's parse errors", () => {
    const scope = spellParser.getScope("jsx-dotted-tag")
    const block = scope.parse("print <UI.Form/>", "block")!
    const errors = (block.data as { errors?: P.Match[] }).errors ?? []
    expect(errors.map((error) => error.message)).toEqual([
      "<UI.Form> isn't an element:  write Spell UI's own tag, e.g. <ui-form>"
    ])
  })

  test("a markdown hole that doesn't read is reported with the block's parse errors;  a real one isn't", () => {
    const scope = spellParser.getScope("jsx-markdown-hole")
    const block = scope.parse("set foo to 1\nprint <markdown>\n\t{foo} and {foo bar baz}\n</markdown>", "block")!
    const errors = (block.data as { errors?: P.Match[] }).errors ?? []
    expect(errors.map((error) => error.message)).toEqual([
      `Don't understand "{foo bar baz}" in <markdown>:  a hole is spell, e.g. {the score of the game};  write \\{ for a brace`
    ])
  })

  describe("`{...}` contents sit at their file positions", () => {
    test("a parse error inside `{...}` starts where its text is", () => {
      const scope = spellParser.getScope("jsx-error-offset")
      const text = "set foo to 1\nprint <div>{foo bar}</div>"
      const block = scope.parse(text, "block")!
      const error = findData(block, "error")!
      expect(error.start).toBe(text.indexOf("foo bar"))
      expect(error.line).toBe(1)
      expect(error.char).toBe("print <div>{".length)
    })

    test("an expression inside `{ ... }` skips the whitespace `trim()` dropped", () => {
      const scope = spellParser.getScope("jsx-expression-offset")
      const text = "set foo to 1\nprint <div>{  foo }</div>"
      const block = scope.parse(text, "block")!
      const expression = findData(block, "expression")!
      expect(expression.start).toBe(text.indexOf("foo }"))
      expect(expression.end).toBe(text.indexOf("foo }") + 3)
    })

    test("tokens after a newline inside `{...}` get the later line", () => {
      const scope = spellParser.getScope("jsx-multiline-offset")
      const text = "print <div foo={\n1 + \n\t2\n\t}/>"
      const block = scope.parse(text, "block")!
      const expression = findData(block, "expression")!
      const two = expression.tokens.find((token) => token.value === 2)!
      expect(two.start).toBe(text.indexOf("2"))
      expect(two.line).toBe(2)
      expect(two.ch).toBe(1)
    })

    test("the inner tokens hang off the JSX expression token, so the tokenizer's walker reaches them", () => {
      const scope = spellParser.getScope("jsx-inner-tokens")
      const text = "set foo to 1\nprint <div>{foo}</div>"
      const block = scope.parse(text, "block")!
      const expression = findData(block, "expression")!
      const reached: P.Token[] = []
      P.Tokenizer.forEachToken(block.tokens, (token) => void reached.push(token))
      expect(reached).toContain(expression.tokens[0])
    })
  })
})

describe("a drawing of several elements side by side:  a fragment", () => {
  const CARD = ["a card is a thing", "to draw a card:"]
  const BOTH = ["  draw() {", "    return [", '      h("a", "A"),', '      h("b", "B")', "    ]", "  }"]

  test("`<>...</>` in a `to draw`:  a list in javascript and Python, as is in TypeScript", () => {
    const lines = [...CARD, "\treturn <>", "\t\t<a>A</a>", "\t\t<b>B</b>", "\t</>"]
    expect(compiled(lines)).toContain(BOTH.join("\n"))
    expect(compiled(lines, SP.TARGETS["ts/solid"]!.writer)).toContain(
      ["    return (", "      <>", "        <a>A</a>", "        <b>B</b>", "      </>", "    )"].join("\n")
    )
    expect(compiled(lines, SP.TARGETS.py!.writer)).toContain('return [h("a", "A"), h("b", "B")]')
    // Python's page draws as javascript does
    expect(compiled(lines, PY.ElementsWriter.instance)).toContain(BOTH.join("\n"))
  })

  test("elements one after another are ONE implicit fragment, as if wrapped in `<>...</>`", () => {
    const explicit = drawOf([...CARD, "\treturn <>", "\t\t<a>A</a>", "\t\t<b>B</b>", "\t</>"])
    expect(explicit).toBe(BOTH.join("\n").trimStart())
    // on the next line, as far in;  further in;  on the same line
    for (const second of ["\t<b>B</b>", "\t\t<b>B</b>"]) {
      expect(drawOf([...CARD, "\treturn <a>A</a>", second])).toBe(explicit)
    }
    expect(drawOf([...CARD, "\treturn <a>A</a> <b>B</b>"])).toBe(explicit)
    // each element on several lines
    expect(drawOf([...CARD, "\treturn <a>", "\t\tA", "\t</a>", "\t<b>", "\t\tB", "\t</b>"])).toBe(explicit)
  })

  test("a less indented element, or one after a blank line, is NOT part of it", () => {
    const lessIndented = [...CARD, "\tif 1 is 2", "\t\treturn <a>A</a>", "\t<b>B</b>"]
    expect(errorsOf(lessIndented)).toEqual(['5:1 Don\'t understand "<b>B</b>"'])
    const afterBlank = [...CARD, "\treturn <a>A</a>", "", "\t<b>B</b>"]
    expect(errorsOf(afterBlank)).toEqual(['5:1 Don\'t understand "<b>B</b>"'])
  })

  test("the fragment's tokens are all reached by the tokenizer's walker, its `</>` too", () => {
    const scope = spellParser.getScope("jsx-fragment-tokens")
    const block = scope.parse("print <><a/></>", "block")!
    const reached: P.Token[] = []
    P.Tokenizer.forEachToken(block.tokens, (token) => void reached.push(token))
    expect(reached.some((token) => token instanceof P.JSXFragmentToken)).toBe(true)
    expect(reached.some((token) => token instanceof P.JSXEndTagToken && token.tagName === "")).toBe(true)
  })
})

/** `lines` as one file, compiled by `writer` (javascript by default). */
function compiled(lines: string[], writer: P.ProgramWriter = P.JSWriter.instance): string {
  const [file] = parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }]).files
  if (file!.errors.length) throw new Error(`parse errors:\n${file!.errors.join("\n")}`)
  return String(writer.writeMatch(file!.match))
}

/** The card's `draw()` in `lines` compiled:  from `draw() {` to its `}`, without the declarations around it. */
function drawOf(lines: string[]): string {
  const js = compiled(lines)
  const start = js.indexOf("draw() {")
  return js.slice(start, js.indexOf("\n  }", start) + 4)
}

/** The parse errors of `lines`, as one file. */
function errorsOf(lines: string[]): string[] {
  return parseSpellProject([{ path: "/test.spell", contents: lines.join("\n") }]).files[0]!.errors
}

/**
 * First match at or below `match` whose `data[key]` is a match -- e.g. the `expression` parsed out of JSX `{...}`.
 * - Looks through `matched` and through the `attributes` / `children` matches a `jsxElement` keeps in `data`.
 */
function findData(match: P.Match, key: "expression" | "error" | "statement"): P.Match | undefined {
  const data = match.data as JSXMatchData
  const found = data[key]
  if (found instanceof P.Match) return found
  const below = [...match.matched, ...(data.attributes ?? []), ...(data.children ?? [])]
  for (const child of below) {
    if (!(child instanceof P.Match)) continue
    const result = findData(child, key)
    if (result) return result
  }
  return undefined
}
