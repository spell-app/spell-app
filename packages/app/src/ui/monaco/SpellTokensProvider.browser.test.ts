import { describe, test, expect, beforeAll } from "vite-plus/test"

import { monaco } from "./monaco"
import { SpellTokensProvider } from "./SpellTokensProvider"

/**
 * Spell's instant colouring, line by line as Monaco asks for it:  each line starts in the state the last one ended in.
 * - In a browser:  Monaco needs the DOM.
 */
describe("SpellTokensProvider", () => {
  const provider = new SpellTokensProvider()

  /** Each line's tokens as `"text" scope`, carrying the state from line to line. */
  function colour(lines: string[]): string[][] {
    let state = provider.getInitialState()
    return lines.map((line) => {
      const { tokens, endState } = provider.tokenize(line, state)
      state = endState
      return tokens
        .map((token, index) => [line.slice(token.startIndex, tokens[index + 1]?.startIndex), token.scopes] as const)
        .filter(([text, scopes]) => text.trim() && scopes)
        .map(([text, scopes]) => `${JSON.stringify(text)} ${scopes}`)
    })
  }

  // Monaco's CSS and markdown colouring load lazily
  beforeAll(() => Promise.all([monaco.editor.colorize("", "css", {}), monaco.editor.colorize("", "markdown", {})]))

  test("spell lines colour by their tokens", () => {
    expect(colour(['set x to "hi" // greet'])).toEqual([
      ['"set" identifier', '"x" identifier', '"to" identifier', '"\\"hi\\"" string', '"// greet" comment']
    ])
  })

  test("a <css> block colours as CSS, and spell picks up after </css>", () => {
    const [open, css, close, after] = colour(["\t<css>", "\t\t.red { color: red }", "\t</css>", "set x to 3"])
    expect(open).toEqual(['"<" delimiter', '"css" tag', '">" delimiter'])
    expect(css!.slice(0, 3)).toEqual(['".red" tag.css', '"{" delimiter.bracket.css', '"color:" attribute.name.css'])
    expect(close).toEqual(['"</" delimiter', '"css" tag', '">" delimiter'])
    expect(after).toContain('"3" number')
  })

  test("a <markdown> block colours as markdown, indented in a drawing, and spell picks up after it", () => {
    const [open, heading, bold, close, after] = colour([
      "\t\t<markdown>",
      "\t\t\t## Klondike",
      "\t\t\tBuild each pile **down**",
      "\t\t</markdown>",
      "set x to 3"
    ])
    expect(open).toEqual(['"<" delimiter', '"markdown" tag', '">" delimiter'])
    expect(heading).toEqual(['"## Klondike" keyword.md'])
    expect(bold).toContain('"**down**" strong.md')
    expect(close).toEqual(['"</" delimiter', '"markdown" tag', '">" delimiter'])
    expect(after).toContain('"3" number')
  })
})
