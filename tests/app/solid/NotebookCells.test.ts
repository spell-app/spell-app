import { describe, expect, test } from "vite-plus/test"

import { NotebookCells, type ChunkCell } from "spell-app/app/solid/NotebookCells"

/** A small `.spellx` file:  prose, two properties, an alias and an action, in one view. */
const CARD = [
  `<spell-view "card">`,
  `\tA card has a suit.`,
  ``,
  `\t<property "suit" one-of="clubs, hearts" alias="is a (suit)" />`,
  `\t<property "color" one-of="red, black">`,
  `\t\tred if it is a heart`,
  `\t\tblack otherwise`,
  `\t</property>`,
  `\t<alias "is red">if its color is red</>`,
  `\t<action "turn it over">`,
  `\t\tprint "turned"`,
  `\t</action>`,
  `</spell-view>`,
  ``
].join("\n")

/** The chunk cell titled `title`. */
function chunk(text: string, title: string): ChunkCell {
  const found = NotebookCells.of(text, "/Card.spellx").find((cell) => cell.kind === "chunk" && cell.title === title)
  if (!found || found.kind !== "chunk") throw new Error(`no chunk ${title}`)
  return found
}

describe("NotebookCells.of()", () => {
  test("a template, then its prose and chunks in order", () => {
    const cells = NotebookCells.of(CARD, "/Card.spellx")
    expect(cells.map((cell) => (cell.kind === "chunk" ? `${cell.type} ${cell.title}` : "prose"))).toEqual([
      "view card",
      "prose",
      "property suit",
      "property color",
      "alias is red",
      "action turn it over"
    ])
  })

  test("a chunk's code has its indent taken off", () => {
    expect(chunk(CARD, "color").code).toBe(
      `<property "color" one-of="red, black">\n\tred if it is a heart\n\tblack otherwise\n</property>`
    )
  })

  test("a property's form fields", () => {
    expect(chunk(CARD, "suit").property).toMatchObject({
      name: "suit",
      oneOf: "clubs, hearts",
      aliases: ["is a (suit)"]
    })
  })
})

describe("edits", () => {
  test("withCode() changes only the chunk, its indent put back", () => {
    const cell = chunk(CARD, "turn it over")
    const text = NotebookCells.withCode(CARD, cell, `<action "turn it over">\n\tprint "flipped"\n</action>`)
    expect(text).toBe(CARD.replace(`print "turned"`, `print "flipped"`))
  })

  test("moved() swaps a chunk with the one before it, prose left in place", () => {
    const cells = NotebookCells.of(CARD, "/Card.spellx")
    const text = NotebookCells.moved(CARD, cells, chunk(CARD, "color"), "up")
    const titles = NotebookCells.of(text, "/Card.spellx").flatMap((cell) => (cell.kind === "chunk" ? [cell.title] : []))
    expect(titles).toEqual(["card", "color", "suit", "is red", "turn it over"])
    expect(text).toContain("A card has a suit.")
  })

  test("moved() past the end leaves the text alone", () => {
    const cells = NotebookCells.of(CARD, "/Card.spellx")
    expect(NotebookCells.moved(CARD, cells, chunk(CARD, "turn it over"), "down")).toBe(CARD)
  })

  test("withProperty() rewrites the head, the body untouched", () => {
    const cell = chunk(CARD, "color")
    const text = NotebookCells.withProperty(CARD, cell, {
      name: "colour",
      oneOf: "red, black, green",
      aliases: ["is (colour)", ""]
    })
    expect(text).toContain(
      `<property "colour" one-of="red, black, green" alias="is (colour)">\n\t\tred if it is a heart`
    )
    expect(chunk(text, "colour").property?.aliases).toEqual(["is (colour)"])
  })

  test("withProperty() in Spanish writes the file's words", () => {
    const carta = `<encanto-vista "carta">\n\t<propiedad "palo" uno-de="oros, copas" />\n</encanto-vista>\n`
    const cell = NotebookCells.of(carta, "/Carta.es.spellx").find(
      (each): each is ChunkCell => each.kind === "chunk" && each.title === "palo"
    )!
    const text = NotebookCells.withProperty(carta, cell, {
      name: "palo",
      oneOf: "oros, copas, espadas",
      aliases: ["es de (palo)"]
    })
    expect(text).toContain(`<propiedad "palo" uno-de="oros, copas, espadas" frase="es de (palo)" />`)
  })
})
