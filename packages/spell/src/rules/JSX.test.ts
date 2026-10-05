import { describe, test, expect } from "vite-plus/test"
import { unitTestModuleRules } from "$/spell/test"
import { P } from "$/parser"
import { spellParser } from "$/spell"
import { spellCore } from "$/core"
import type { JSXMatchData } from "./JSX"

describe("testing spell module JSX", () => {
  unitTestModuleRules(spellParser, "JSX", spellCore.resetRuntime)

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
