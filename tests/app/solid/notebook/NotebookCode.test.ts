import { describe, expect, test } from "vite-plus/test"

import { NotebookCode } from "spell-app/app/solid/notebook/NotebookCode"

/** A notebook's code views (epic `elemental-spell` P16):  html is spellx with each bare name's tag, and back. */
describe("NotebookCode", () => {
  const tags: Record<string, string> = { button: "ui-button", counter: "counter-counter", text: "ui-text" }
  const words = Object.fromEntries(Object.entries(tags).map(([word, tag]) => [tag, word]))

  test("html:  bare names as their tags, each </> naming what it closes, holes and attributes as written", () => {
    expect(NotebookCode.toHtml("<counter/>\n<button onClick={count up}>Go {its count}</>", (word) => tags[word])).toBe(
      "<counter-counter/>\n<ui-button onClick={count up}>Go {its count}</ui-button>"
    )
    expect(NotebookCode.toHtml("<ui-label>a < b</ui-label>", (word) => tags[word])).toBe("<ui-label>a < b</ui-label>")
  })

  test("back to spellx:  each tag a bare name gives, that name;  anything else as written", () => {
    expect(
      NotebookCode.toSpellx('<ui-button primary="">Go</ui-button><ui-label>x</ui-label>', (tag) => words[tag])
    ).toBe('<button primary="">Go</button><ui-label>x</ui-label>')
  })
})
