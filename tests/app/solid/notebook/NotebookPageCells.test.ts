import { readFileSync } from "fs"
import { describe, expect, test } from "vite-plus/test"

import { NotebookPageCells } from "spell-app/app/solid/notebook/NotebookPageCells"

/**
 * The Counter notebook, written in markdown:  its `#` title, its `##` sections and their text.
 * - Its counter is the Counter example's, which its project imports:  so it has no template cell of its own.
 */
const COUNTER = [
  '<spell-notebook "counter notebook">',
  "\t# Counter",
  "\tA button that counts its clicks.",
  "",
  "\t## Counter",
  "\tA counter starts at 0, and adds one each time it's clicked.",
  '\t<example "One counter">',
  "\t\t<counter/>",
  "\t</example>",
  "",
  "\t## Several counters",
  "\tEach counter keeps its own count:  clicking one leaves the others alone.",
  "\t<section>",
  '\t\t<example "Two counters">',
  "\t\t\t<counter/>",
  "\t\t\t<counter/>",
  "\t\t</example>",
  '\t\t<text color="grey">Click either one.</text>',
  "\t</section>",
  "</spell-notebook>",
  ""
].join("\n")

/** The Counter notebook, `@spell/notebooks/Counter`, as committed:  its title and sections written as tags. */
const TAGGED = readFileSync(
  new URL("../../../../spaces/@spell/notebooks/Counter/Counter.spellx", import.meta.url),
  "utf8"
)

/** A notebook with a template of its own, a card:  for the template cell's edits and groups. */
const CARDS = [
  '<spell-notebook "cards">',
  '\t<spell-view "card">',
  '\t\t<group "direction" description="Face up or face down"/>',
  '\t\t<property "direction" one-of="up, down"/>',
  '\t\t<action "turn it over">set its direction to up</>',
  "\t</spell-view>",
  "</spell-notebook>",
  ""
].join("\n")

/**
 * A notebook's page's cells, and the edits it makes (epic `elemental-spell` P16):  every edit changes only what it's
 * about, the rest of the file byte for byte.
 */
describe("NotebookPageCells", () => {
  const model = NotebookPageCells.of(COUNTER, "/Counter.spellx")!

  test("its cells, in order:  prose split at each ## heading, what it draws", () => {
    expect(model.name).toBe("counter notebook")
    expect(model.locked).toBe(false)
    expect(model.cells.map(({ kind, heading, title, name }) => ({ kind, heading, title, name }))).toEqual([
      { kind: "prose", heading: undefined, title: "Counter", name: undefined },
      { kind: "prose", heading: "Counter", title: undefined, name: undefined },
      { kind: "drawing", heading: undefined, title: undefined, name: "One counter" },
      { kind: "prose", heading: "Several counters", title: undefined, name: undefined },
      { kind: "drawing", heading: undefined, title: undefined, name: "" }
    ])
    // a drawing's examples, however deep:  the section's
    expect(model.cells[4]!.examples!.map((example) => [example.name, example.body.code])).toEqual([
      ["Two counters", "<counter/>\n<counter/>"]
    ])
  })

  test("an edit changes only its cell's span, its indent put back on every line", () => {
    const [template] = NotebookPageCells.of(CARDS, "/Cards.spellx")!.cells
    const edited = NotebookPageCells.withCode(CARDS, template!, template!.code.replace("to up", "to down"))
    expect(edited).toBe(CARDS.replace("to up", "to down"))
    const example = model.cells[2]!.examples![0]!
    expect(NotebookPageCells.withCode(COUNTER, example.body, "<counter/>\n<counter/>")).toBe(
      COUNTER.replace(
        '\t<example "One counter">\n\t\t<counter/>\n',
        '\t<example "One counter">\n\t\t<counter/>\n\t\t<counter/>\n'
      )
    )
  })

  test("an example that's one `<html>` block:  its body is what's inside the block, and an edit lands there (P18)", () => {
    const text = [
      '<spell-notebook "avatar examples">',
      '\t<example description="A comment\'s avatar.">',
      "\t\t<html>",
      "\t\t\t<ui-comment>",
      '\t\t\t\t<ui-avatar src="elliot.jpg"></ui-avatar>',
      "\t\t\t</ui-comment>",
      "\t\t</html>",
      "\t</example>",
      "</spell-notebook>",
      ""
    ].join("\n")
    const [example] = NotebookPageCells.of(text, "/Examples.spellx")!.cells[0]!.examples!
    expect(example).toMatchObject({ name: "", html: true })
    expect(example!.body.code).toBe('<ui-comment>\n\t<ui-avatar src="elliot.jpg"></ui-avatar>\n</ui-comment>')
    const edited = NotebookPageCells.withCode(text, example!.body, "<ui-comment>\n\t<code>hi</code>\n</ui-comment>")
    expect(edited).toBe(text.replace('<ui-avatar src="elliot.jpg"></ui-avatar>', "<code>hi</code>"))
  })

  test("move up, then down:  back as it was;  delete, add and lock", () => {
    const moved = NotebookPageCells.moved(COUNTER, model.cells, 2, "up")
    expect(moved.indexOf('<example "One counter">')).toBeLessThan(moved.indexOf("## Counter"))
    const back = NotebookPageCells.of(moved, "/Counter.spellx")!
    expect(NotebookPageCells.moved(moved, back.cells, 1, "down")).toBe(COUNTER)

    const deleted = NotebookPageCells.deleted(COUNTER, model.cells[2]!)
    expect(deleted).not.toContain("One counter")
    expect(deleted).toContain(
      "\t## Counter\n\tA counter starts at 0, and adds one each time it's clicked.\n\n\t## Several counters"
    )

    const { text, start } = NotebookPageCells.inserted(COUNTER, model, model.cells[1], "Some text.")
    expect(text).toContain("it's clicked.\n\n\tSome text.\n")
    expect(text.slice(start, start + 10)).toBe("Some text.")

    const locked = NotebookPageCells.withLock(COUNTER, model, true)
    expect(locked.split("\n")[0]).toBe('<spell-notebook "counter notebook" locked>')
    const relocked = NotebookPageCells.of(locked, "/Counter.spellx")!
    expect(relocked.locked).toBe(true)
    expect(NotebookPageCells.withLock(locked, relocked, false)).toBe(COUNTER)
  })

  test('written as tags:  the title\'s `<header level="1">`, each `<section label>`, each `<text>` before an example', () => {
    const tagged = NotebookPageCells.of(TAGGED, "/Counter.spellx")!
    const cells = tagged.cells.map(({ kind, heading, title, lead, name, description }) =>
      Object.fromEntries(Object.entries({ kind, heading, title, lead, name, description }).filter(([, v]) => v))
    )
    expect(cells).toEqual([
      { kind: "heading", title: "Counter", lead: "A button that counts its clicks." },
      { kind: "heading", heading: "Counter" },
      { kind: "drawing", description: "A counter starts at 0, and adds one each time it's clicked." },
      { kind: "drawing", name: "One counter" },
      { kind: "heading", heading: "Several counters" },
      { kind: "drawing", description: "Each counter keeps its own count:  clicking one leaves the others alone." },
      { kind: "drawing", name: "Two counters" },
      { kind: "drawing", description: "Click either one." }
    ])
    // a section's cell is its opening tag;  deleting it takes the section whole
    const several = tagged.cells[4]!
    expect(several.code).toBe('<section label="Several counters">')
    const deleted = NotebookPageCells.deleted(TAGGED, several)
    expect(deleted).not.toContain("Two counters")
    expect(deleted).toContain("\t</section>\n</spell-notebook>")
    // no move across a section's opening tag:  the tags would nest wrongly
    expect(NotebookPageCells.moved(TAGGED, tagged.cells, 2, "up")).toBe(TAGGED)
    // a cell added after a section's opening tag:  its first, one indent in
    const { text } = NotebookPageCells.inserted(TAGGED, tagged, several, "<text>Hi</text>")
    expect(text).toContain('<section label="Several counters">\n\n\t\t<text>Hi</text>\n')
  })

  test("a template's groups:  each one's members together, under its name and description", () => {
    const [template] = NotebookPageCells.of(CARDS, "/Cards.spellx")!.cells
    expect(template!.groups).toEqual([
      { name: "direction", description: "Face up or face down", members: ["direction", "turn it over"] }
    ])
  })

  test("in Spanish, locked is bloqueado", () => {
    const text = '<encanto-cuaderno "cuaderno">\n\t# Hola\n</encanto-cuaderno>\n'
    const spanish = NotebookPageCells.of(text, "/Cuaderno.es.spellx")!
    expect(NotebookPageCells.withLock(text, spanish, true).split("\n")[0]).toBe(
      '<encanto-cuaderno "cuaderno" bloqueado>'
    )
  })
})
