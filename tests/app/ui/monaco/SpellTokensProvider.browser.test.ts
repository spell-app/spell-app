import { describe, test, expect, beforeAll } from "vite-plus/test"

import { monaco } from "spell-app/app/ui/monaco/monaco"
import { SpellMonaco } from "spell-app/app/ui/monaco/SpellMonaco"
import { SpellTokensProvider } from "spell-app/app/ui/monaco/SpellTokensProvider"

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

/**
 * A `.spellx` file colours by its own tokenizer:  each tag line as its code-spell twin, its tag's own words around it.
 * - The lines are Solitaire's `Card` in spellx, the examples test's fixture (`tests/spell/__spellx__/`).
 */
describe("SpellTokensProvider.forSpellx()", () => {
  const codeSpell = new SpellTokensProvider()
  const spellx = SpellTokensProvider.forSpellx()

  /** Each line's tokens as `"text" scope`, carrying the state from line to line. */
  function colour(lines: string[], provider: SpellTokensProvider): string[][] {
    let state = provider.getInitialState()
    return lines.map((line) => {
      const { tokens, endState } = provider.tokenize(line, state)
      state = endState
      return tokens
        .map((token, index) => [line.slice(token.startIndex, tokens[index + 1]?.startIndex), token.scopes] as const)
        .filter(([text, scopes]) => text.trim() && scopes)
        .map(([text, scopes]) => `${JSON.stringify(text.trim())} ${scopes}`)
    })
  }

  test("a .spellx file is Monaco's spellx language;  a .spell file stays spell", () => {
    expect(SpellMonaco.languageForPath("/@spell/examples/Solitaire/Card.spellx")).toBe("spellx")
    expect(SpellMonaco.languageForPath("/@spell/examples/Solitaire/Card.spell")).toBe("spell")
  })

  test("a tag line:  its word a keyword, its name a string, its values as its twin's words", () => {
    const [, property] = colour(
      ['<spell-view "card">', '\t<property "rank" one-of="ace, 2 ... 10, jack, queen, king" />'],
      spellx
    )
    expect(property).toEqual([
      '"<" delimiter',
      '"property" keyword',
      '"\\"rank\\"" string',
      '"one-of" attribute.name',
      '"=\\"" delimiter',
      '"ace" identifier',
      '"," operator',
      '"2" number',
      '"..." operator',
      '"10" number',
      '"," operator',
      '"jack" identifier',
      '"," operator',
      '"queen" identifier',
      '"," operator',
      '"king" identifier',
      '"\\" />" delimiter'
    ])
  })

  test("a tag with its body on its line, and a comment after its closer", () => {
    const [, alias] = colour(
      ['<spell-view "card">', '\t<alias "is a face card">if its rank is jack</>\t// a face card'],
      spellx
    )
    expect(alias).toEqual([
      '"<" delimiter',
      '"alias" keyword',
      '"\\"is a face card\\"" string',
      '">" delimiter',
      '"if" identifier',
      '"its" identifier',
      '"rank" identifier',
      '"is" identifier',
      '"jack" identifier',
      '"</>" delimiter',
      '"// a face card" comment'
    ])
  })

  test("a tag's body is spell, and the lines after its closer are tags again", () => {
    const [, , body, close, after] = colour(
      [
        '<spell-view "card">',
        '\t<property "color">',
        "\t\tred if its suit is diamonds",
        "\t</property>",
        '\t<alias "is red" />'
      ],
      spellx
    )
    expect(body).toEqual([
      '"red" identifier',
      '"if" identifier',
      '"its" identifier',
      '"suit" identifier',
      '"is" identifier',
      '"diamonds" identifier'
    ])
    expect(close).toEqual(['"</property>" delimiter'])
    expect(after).toContain('"alias" keyword')
  })

  test("a .spell file's colours don't change", () => {
    const lines = [
      "a card is a thing",
      '\tits "rank" is one of ace, 2 ... 10, jack, queen, king  // ranks',
      "\t# card suit"
    ]
    expect(colour(lines, codeSpell)).toEqual([
      ['"a" identifier', '"card" identifier', '"is" identifier', '"a" identifier', '"thing" identifier'],
      [
        '"its" identifier',
        '"\\"rank\\"" string',
        '"is" identifier',
        '"one" identifier',
        '"of" identifier',
        '"ace" identifier',
        '"," operator',
        '"2" number',
        '"." operator',
        '"." operator',
        '"." operator',
        '"10" number',
        '"," operator',
        '"jack" identifier',
        '"," operator',
        '"queen" identifier',
        '"," operator',
        '"king" identifier',
        '"// ranks" comment'
      ],
      ['"# card suit" comment.header']
    ])
  })
})
