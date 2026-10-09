/**
 * Tests of `PageNotes`:  notes written into a page's source, edited, answered, and carried over a regenerated part.
 * - every edit splices the source:  the bytes around the note stay as they were
 * - `oxfmt` (`AS.formatHTML()`) leaves a formatted page with notes in it formatted
 */
import { describe, expect, test } from "vite-plus/test"

import { AS } from "$/assembler"

import { NotesError, PageNotes, htmlOf } from "./PageNotes.js"

/** When the notes are written:  2026-10-10 14:02, local. */
const NOW = new Date(2026, 9, 10, 14, 2)

/** A small docs page, formatted as `vp fmt` leaves it. */
const PAGE = `<!doctype html>
<html lang="en">
  <head>
    <title>Test page</title>
  </head>
  <body class="spell-doc-page">
    <div class="spell-doc">
      <main class="spell-doc-main">
        <!-- a comment with <ui-section id="model"> in it is not a section -->
        <ui-sticky class="spell-h1"
          ><header class="spell-page-head"><h1>Test page</h1></header></ui-sticky
        >
        <p class="lede">What this settles.</p>
        <ui-section id="model" header="1. The model" sticky collapsible dividing collapsed>
          <p>Body.</p>
          <ui-section id="inner" header="Inner" sticky collapsible dividing collapsed>
            <p>Inner body.</p>
          </ui-section>
        </ui-section>
        <ui-section id="later" header="2. Later" sticky collapsible dividing collapsed>
          <p>More.</p>
        </ui-section>
      </main>
    </div>
  </body>
</html>
`

/** `PAGE` with `edit` made on its notes;  returns the notes and the result. */
function edited<T>(edit: (notes: PageNotes) => T, html = PAGE) {
  const notes = new PageNotes(html)
  const result = edit(notes)
  return { notes, result, html: notes.html }
}

////////////////
// ## Adding
////////////////

describe("PageNotes.add()", () => {
  test("writes a group at the END of the section, and changes NO other byte", () => {
    const { html, result } = edited((notes) => notes.add("model", "Why a store?", NOW))
    expect(result).toBe("n1")
    expect(html).toBe(
      PAGE.replace(
        `            <p>Inner body.</p>
          </ui-section>
`,
        `            <p>Inner body.</p>
          </ui-section>
          <spell-notes for="model">
            <spell-note id="n1" status="new" at="2026-10-10 14:02">
              <p>Why a store?</p>
            </spell-note>
          </spell-notes>
`
      )
    )
  })

  test("a second note joins the section's group;  ids count up across the page", () => {
    const { html } = edited((notes) => {
      notes.add("inner", "one", NOW)
      notes.add("later", "two", NOW)
      return notes.add("inner", "three", NOW)
    })
    const notes = new PageNotes(html).notes()
    expect(notes.map((note) => [note.id, note.for, note.label, note.text])).toEqual([
      ["n1", "inner", "Inner", "one"],
      ["n3", "inner", "Inner", "three"],
      ["n2", "later", "2. Later", "two"]
    ])
    expect(html.match(/<spell-notes /g)).toHaveLength(2)
  })

  test("a page note goes right after the sticky page header, at its indent", () => {
    const { html } = edited((notes) => notes.add("page", "The whole page", NOW))
    expect(html).toContain(`></ui-sticky
        >
        <spell-notes for="page">
          <spell-note id="n1" status="new" at="2026-10-10 14:02">
            <p>The whole page</p>
          </spell-note>
        </spell-notes>
        <p class="lede">`)
    expect(new PageNotes(html).notes()[0]).toMatchObject({ for: "page", label: "the page" })
  })

  test("text:  paragraphs at blank lines, a newline a <br />, backticks code, markup escaped", () => {
    expect(htmlOf("one\ntwo\n\n`a < b` & c")).toEqual(["<p>one<br />two</p>", "<p><code>a &lt; b</code> &amp; c</p>"])
    const { html } = edited((notes) => notes.add("later", "one\ntwo\n\n`a < b` & c", NOW))
    expect(new PageNotes(html).notes()[0]?.text).toBe("one\ntwo\n\n`a < b` & c")
  })

  test("refuses blank text, a section that isn't there, and a section only a comment names", () => {
    expect(() => new PageNotes(PAGE).add("model", "  \n ", NOW)).toThrow(NotesError)
    expect(() => new PageNotes(PAGE).add("nowhere", "x", NOW)).toThrow(/no section "nowhere"/)
    const commented = PAGE.replace('<ui-section id="model" header', '<ui-section id="model2" header')
    expect(() => new PageNotes(commented).add("model", "x", NOW)).toThrow(/no section "model"/)
  })

  test("a formatted page stays formatted:  oxfmt only wraps a long note", async () => {
    const long = "A long note ".repeat(20).trim()
    const { html } = edited((notes) => {
      notes.add("model", "short", NOW)
      notes.add("page", "page note", NOW)
      return notes.add("later", long, NOW)
    })
    const squash = (text: string) => text.replace(/\s+/g, " ").replace(/> | </g, (match) => match.trim())
    expect(squash(await AS.formatHTML("page.html", html))).toBe(squash(html))
    const short = edited((notes) => notes.add("model", "short", NOW)).html
    expect(await AS.formatHTML("page.html", short)).toBe(short)
  })
})

////////////////
// ## Edit, delete
////////////////

describe("PageNotes.edit() / remove()", () => {
  test("edit replaces the text;  remove takes the note, then its emptied group, back to the page as it was", () => {
    const { notes } = edited((notes) => {
      notes.add("model", "first", NOW)
      notes.add("model", "second", NOW)
    })
    notes.edit("n2", "second, better\n\nand more")
    expect(notes.notes().map((note) => note.text)).toEqual(["first", "second, better\n\nand more"])
    notes.remove("n1")
    expect(notes.notes().map((note) => note.id)).toEqual(["n2"])
    notes.remove("n2")
    expect(notes.html).toBe(PAGE)
  })

  test("only while the note is new (409);  a missing note is a 404", () => {
    const { notes } = edited((notes) => notes.add("model", "first", NOW))
    notes.answer("n1", "<p>Because.</p>", NOW)
    expect(() => notes.edit("n1", "x")).toThrow(/n1 is answered/)
    expect(() => notes.remove("n1")).toThrow(expect.objectContaining({ status: 409 }))
    expect(() => notes.remove("n9")).toThrow(expect.objectContaining({ status: 404 }))
    expect(() => notes.remove("x")).toThrow(/isn't a note id/)
  })
})

////////////////
// ## Answer, done
////////////////

describe("PageNotes.answer() / setStatus()", () => {
  test("a reply goes under the note, indented, and the note is answered;  done after", () => {
    const { notes } = edited((notes) => notes.add("model", "Why?", NOW))
    notes.answer("n1", "<p>\n  Because\n  of this.\n</p>\n", new Date(2026, 9, 11, 9, 12))
    expect(notes.html).toContain(`            <spell-note id="n1" status="answered" at="2026-10-10 14:02">
              <p>Why?</p>
              <spell-note-reply by="Claude" at="2026-10-11 09:12">
                <p>
                  Because
                  of this.
                </p>
              </spell-note-reply>
            </spell-note>`)
    expect(notes.notes()).toEqual([])
    expect(notes.notes({ all: true })[0]).toMatchObject({
      status: "answered",
      text: "Why?",
      replies: [{ by: "Claude", at: "2026-10-11 09:12", text: "Because of this." }]
    })
    notes.setStatus("n1", "done")
    expect(notes.notes({ all: true })[0]?.status).toBe("done")
    expect(() => notes.setStatus("n1", "gone")).toThrow(/new \/ answered \/ done/)
    expect(() => notes.answer("n1", "  ")).toThrow(/needs some text/)
  })
})

////////////////
// ## Regenerated parts
////////////////

describe("PageNotes.carryOver()", () => {
  /** what `index.js` writes between its markers:  one section, unformatted */
  const REGION = `<ui-section id="epics" header="Epics" sticky collapsible dividing>
<ui-cards></ui-cards>
</ui-section>`

  test("puts each group back into its section;  a group whose section went is kept at the end", () => {
    const before = `
        <ui-section id="epics" header="Epics" sticky collapsible dividing>
          <ui-cards>old</ui-cards>
          <spell-notes for="epics">
            <spell-note id="n1" status="new" at="2026-10-10 14:02">
              <p>Sort these?</p>
            </spell-note>
          </spell-notes>
        </ui-section>
        <ui-section id="gone" header="Gone">
          <spell-notes for="gone">
            <spell-note id="n2" status="new" at="2026-10-10 14:03"><p>Lost?</p></spell-note>
          </spell-notes>
        </ui-section>
`
    const after = PageNotes.carryOver(before, REGION)
    expect(after).toBe(`<ui-section id="epics" header="Epics" sticky collapsible dividing>
<ui-cards></ui-cards>
  <spell-notes for="epics">
    <spell-note id="n1" status="new" at="2026-10-10 14:02">
      <p>Sort these?</p>
    </spell-note>
  </spell-notes>
</ui-section>
<spell-notes for="gone">
  <spell-note id="n2" status="new" at="2026-10-10 14:03"><p>Lost?</p></spell-note>
</spell-notes>`)
    expect(new PageNotes(after).notes().map((note) => [note.id, note.for])).toEqual([
      ["n1", "epics"],
      ["n2", "gone"]
    ])
  })

  test("no notes before:  the new part as is", () => {
    expect(PageNotes.carryOver('<ui-section id="epics"></ui-section>', REGION)).toBe(REGION)
  })
})
