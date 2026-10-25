import { readFileSync } from "fs"
import { describe, expect, test } from "vite-plus/test"

import { NotebookPageCells } from "spell-app/app/solid/notebook/NotebookPageCells"

/** The Counter notebook, `@spell/notebooks/Counter`, as committed. */
const COUNTER = readFileSync(
  new URL("../../../../spaces/@spell/notebooks/Counter/Counter.spellx", import.meta.url),
  "utf8"
)

/**
 * A notebook's page's cells, and the edits it makes (epic `elemental-spell` P16):  every edit changes only what it's
 * about, the rest of the file byte for byte.
 */
describe("NotebookPageCells", () => {
  const model = NotebookPageCells.of(COUNTER, "/Counter.spellx")!

  test("its cells, in order:  prose split at each ## heading, its template, what it draws", () => {
    expect(model.name).toBe("counter notebook")
    expect(model.locked).toBe(false)
    expect(model.cells.map(({ kind, heading, title, name }) => ({ kind, heading, title, name }))).toEqual([
      { kind: "prose", heading: undefined, title: "A counter", name: undefined },
      { kind: "template", heading: undefined, title: undefined, name: "counter" },
      { kind: "prose", heading: "Try it", title: undefined, name: undefined },
      { kind: "drawing", heading: undefined, title: undefined, name: "one counter" },
      { kind: "prose", heading: "Two of them", title: undefined, name: undefined },
      { kind: "drawing", heading: undefined, title: undefined, name: "" }
    ])
    // a drawing's examples, however deep:  the section's
    expect(model.cells[5]!.examples!.map((example) => [example.name, example.body.code])).toEqual([
      ["two counters", "<counter/>\n<counter/>"]
    ])
  })

  test("an edit changes only its cell's span, its indent put back on every line", () => {
    const template = model.cells[1]!
    const edited = NotebookPageCells.withCode(COUNTER, template, template.code.replace("Clicked", "Pressed"))
    expect(edited).toBe(COUNTER.replace("Clicked", "Pressed"))
    const example = model.cells[3]!.examples![0]!
    expect(NotebookPageCells.withCode(COUNTER, example.body, "<counter/>\n<counter/>")).toBe(
      COUNTER.replace(
        '\t<example "one counter">\n\t\t<counter/>\n',
        '\t<example "one counter">\n\t\t<counter/>\n\t\t<counter/>\n'
      )
    )
  })

  test("move up, then down:  back as it was;  delete, add and lock", () => {
    const moved = NotebookPageCells.moved(COUNTER, model.cells, 3, "up")
    expect(moved.indexOf('<example "one counter">')).toBeLessThan(moved.indexOf("## Try it"))
    const back = NotebookPageCells.of(moved, "/Counter.spellx")!
    expect(NotebookPageCells.moved(moved, back.cells, 2, "down")).toBe(COUNTER)

    const deleted = NotebookPageCells.deleted(COUNTER, model.cells[3]!)
    expect(deleted).not.toContain("one counter")
    expect(deleted).toContain("\t## Try it\n\n\t## Two of them")

    const { text, start } = NotebookPageCells.inserted(COUNTER, model, model.cells[2], "Some text.")
    expect(text).toContain("\t## Try it\n\n\tSome text.\n")
    expect(text.slice(start, start + 10)).toBe("Some text.")

    const locked = NotebookPageCells.withLock(COUNTER, model, true)
    expect(locked.split("\n")[0]).toBe('<spell-notebook "counter notebook" locked>')
    const relocked = NotebookPageCells.of(locked, "/Counter.spellx")!
    expect(relocked.locked).toBe(true)
    expect(NotebookPageCells.withLock(locked, relocked, false)).toBe(COUNTER)
  })

  test("a template's groups:  each one's members together, under its name and description", () => {
    const text = [
      '<spell-notebook "cards">',
      '\t<spell-view "card">',
      '\t\t<group "direction" description="Face up or face down"/>',
      '\t\t<property "direction" one-of="up, down"/>',
      '\t\t<action "turn it over">set its direction to up</>',
      "\t</spell-view>",
      "</spell-notebook>",
      ""
    ].join("\n")
    const [template] = NotebookPageCells.of(text, "/Cards.spellx")!.cells
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
