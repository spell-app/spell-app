import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { Definitions, type EpicData, type EpicTag } from "$/epics/definitions"
import { Markup, type MarkupProblem } from "$/epics/markup"

////////////////
// ## Fixtures
////////////////

/** One element's worth of data per tag, every attribute it has set:  what round-trips. */
const SAMPLES: { [T in EpicTag]: EpicData<T> } = {
  "epic-page": {
    epic: "epic-components",
    title: "Epic Components",
    branch: "epic-components",
    worktree: "/Users/owen/www/spell-app/spell-app/.claude/worktrees/epic-components",
    started: "2026-10-06",
    updated: "2026-10-07",
    future: true,
    bedtime: "P3-P6",
    recentSince: "2026-10-06T22:56:42-04:00",
    repo: "https://github.com/spell-app/spell-app"
  },
  "epic-overview": { id: "overview", estimate: "4h-5h in all, 2h left" },
  "epic-section": {
    id: "o1",
    kind: "overview-part",
    title: "Structure",
    source: "parts/o1.html",
    partIds: "o1-a o1-b"
  },
  "epic-phase": {
    id: "p2",
    title: "Review Buttons",
    status: "done",
    estimate: "3-4h",
    source: "parts/p2.html",
    partIds: "p2-notes",
    commits: true
  },
  "epic-field": { name: "to-review" },
  "epic-updated": { at: "2026-10-06 14:30", phase: 3 },
  "epic-item": {
    id: "q1",
    title: "Which colour names?",
    status: "decided",
    state: "old",
    changed: "2026-10-06T09:28:23-04:00",
    phase: 2,
    answered: true,
    reviewed: "2026-10-06",
    reviewAs: "approve",
    deferred: "2026-10-05",
    queued: "2026-10-06",
    work: "Skip short sections",
    working: true,
    bedtime: true,
    source: "parts/q1.html",
    partIds: "d1",
    commits: true
  },
  "epic-choices": { chosen: "A" },
  "epic-option": { letter: "A", title: "A named palette", recommended: true },
  "epic-answer": { id: "d1", title: "Named palette" },
  "epic-more": {},
  "epic-reply": { from: "Owen", at: "2026-10-06 10:42", re: "revisit soon" },
  "epic-original": {},
  "epic-version": { asOf: "2026-10-04 20:49" },
  "epic-commit": { sha: "82d5106c165cbebf3922fd97793798e41f1b2760" },
  "epic-event": { at: "2026-10-06T08:12-04:00", icon: "pen to square" },
  "epic-update": { phase: 2 }
}

/** A fresh linkedom document. */
function blankDocument(): Document {
  return parseHTML("<!doctype html><html><body></body></html>").document as unknown as Document
}

/** `html`, parsed into a linkedom document's body. */
function documentOf(html: string): Document {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document as unknown as Document
}

/** A small plan doc using every element, built through `Markup`, in `document`'s body;  returns its page. */
function planDoc(document: Document): Element {
  const make = <T extends EpicTag>(tag: T, data: EpicData<T>, children?: Parameters<typeof Markup.element>[3]) =>
    Markup.element(document, tag, data, children)
  const page = make("epic-page", { epic: "demo", title: "Demo", repo: "https://github.com/spell-app/spell-app" }, [
    '<a slot="durable" href="../../guides/demo.html">Demo</a>',
    make("epic-overview", { id: "overview" }, [
      '<p slot="summary">Two sentences.</p>',
      '<blockquote slot="prompt"><p>Build it.</p></blockquote>',
      make("epic-section", { id: "o1", kind: "overview-part" }, [
        '<span slot="title">The <code>x</code> API</span>',
        "<p>The substance.</p>",
        '<h4 id="o1-detail">Detail</h4>'
      ])
    ]),
    make("epic-section", { id: "phases", kind: "phases" }, [
      make("epic-phase", { id: "p1", title: "Saved Replies", status: "done", estimate: "2h" }, [
        make("epic-field", { name: "symptom" }, "notes get lost"),
        make("epic-field", { name: "changes" }, "notes are saved"),
        make("epic-updated", { at: "2026-10-06 14:30", phase: 1 }, "<p>moved the box</p>"),
        make("epic-field", { name: "goal" }, "<ul><li>nothing lost</li></ul>"),
        make("epic-field", { name: "done" }, "<ul><li>saved</li></ul>"),
        make("epic-commit", { sha: "82d5106" }, "saves notes"),
        make("epic-field", { name: "files" }, "<code>x.ts</code>"),
        make("epic-field", { name: "verify" }, "type, reload"),
        make("epic-field", { name: "to-review" }, '<a href="#j1">J1</a>')
      ])
    ]),
    make("epic-section", { id: "decisions", kind: "questions" }, [
      make("epic-item", { id: "q1", title: "Which colour names?", status: "decided", answered: true }, [
        "<p>Which colour names should windows take?</p>",
        make("epic-update", { phase: 1 }),
        make("epic-choices", { chosen: "A" }, [
          make("epic-option", { letter: "A", title: "A named palette", recommended: true }, "<ul><li>short</li></ul>"),
          make("epic-option", { letter: "B", title: "Any CSS colour" }, "<ul><li>free</li></ul>")
        ]),
        make("epic-answer", { id: "d1", title: "Named palette" }, "<p>Named.</p>"),
        make("epic-more", {}, "<p>More.</p>"),
        make("epic-reply", { from: "Owen", at: "2026-10-06 10:42" }, "<p>Agreed.</p>"),
        make("epic-original", {}, [make("epic-version", {}, "<p>As first asked.</p>")]),
        make("epic-commit", { sha: "08683b6" }, "names the palette")
      ])
    ]),
    make("epic-section", { id: "judgements", kind: "judgements" }, [
      make("epic-item", { id: "j1", title: "Kept the old ids", status: "open", phase: 1 }, [
        '<p>Chose X. <epic-update phase="1"></epic-update></p>'
      ])
    ]),
    make("epic-section", { id: "log", kind: "log" }, [
      make("epic-event", { at: "2026-10-06T08:12-04:00" }, "plan doc created")
    ])
  ])
  document.body.append(page)
  return page
}

/** `problems`' kinds and where, for a short `toEqual()`. */
function summary(problems: MarkupProblem[]): string[] {
  return problems.map((problem) => `${problem.kind}:  ${problem.where}`)
}

////////////////
// ## Writing and reading
////////////////

describe("Markup.element() / read()", () => {
  test("EVERY element round-trips:  data in, the same data back", () => {
    const document = blankDocument()
    for (const tag of Definitions.tags) {
      const data = SAMPLES[tag]
      const element = Markup.element(document, tag, data as never)
      expect(element.localName).toBe(tag)
      expect(Markup.read(element), tag).toEqual(data)
    }
  })

  test("EVERY element round-trips through HTML text, as a doc on disk does", () => {
    const document = blankDocument()
    const html = Definitions.tags.map((tag) => Markup.element(document, tag, SAMPLES[tag] as never).outerHTML).join("")
    const reread = documentOf(html)
    for (const tag of Definitions.tags) expect(Markup.read(reread.querySelector(tag)!), tag).toEqual(SAMPLES[tag])
  })

  test("writes data as attributes:  kebab names, booleans as presence, numbers as digits, in VOCABULARY order", () => {
    const element = Markup.element(blankDocument(), "epic-item", {
      reviewAs: "todo",
      answered: true,
      phase: 3,
      status: "open",
      title: "Which browser first?",
      id: "q3"
    })
    expect(element.outerHTML).toBe(
      '<epic-item id="q3" title="Which browser first?" status="open" phase="3" answered="" review-as="todo"></epic-item>'
    )
  })

  test("appends children:  strings as MARKUP, nodes as they are", () => {
    const document = blankDocument()
    const text = document.createTextNode("<b>not markup</b>")
    const element = Markup.element(document, "epic-reply", {}, ["<p>a <b>reply</b></p>", text])
    expect(element.innerHTML).toBe("<p>a <b>reply</b></p>&lt;b&gt;not markup&lt;/b&gt;")
  })

  test("reads Spell UI's boolean spellings and leaves absent attributes OUT", () => {
    const element = documentOf(
      '<epic-item id="q1" status="open" answered="no" working="yes"></epic-item>'
    ).querySelector("epic-item")!
    expect(Markup.read<"epic-item">(element)).toEqual({ id: "q1", status: "open", answered: false, working: true })
  })

  test("throws for a required attribute missing;  an `or slot` one may come as a slotted child", () => {
    const document = blankDocument()
    expect(() => Markup.element(document, "epic-item", { id: "q1", status: "open" } as never)).toThrow(
      /<epic-item> needs `title`/
    )
    const item = Markup.element(document, "epic-item", { id: "q1", status: "open" } as never, [
      '<span slot="title">The <code>x</code> API</span>'
    ])
    expect(item.querySelector("[slot=title] code")!.textContent).toBe("x")
  })

  test("throws for a tag that isn't ours", () => {
    expect(() => Markup.element(blankDocument(), "epic-nope" as EpicTag, {} as never)).toThrow(/isn't an epic element/)
    expect(() => Markup.read(blankDocument().createElement("p"))).toThrow(TypeError)
  })
})

describe("Markup.set()", () => {
  /** A fresh `<epic-item id="q1" ...>`. */
  function item(): Element {
    return Markup.element(blankDocument(), "epic-item", { id: "q1", title: "One line", status: "open", phase: 2 })
  }

  test("sets, changes and removes attributes:  `undefined` / `false` remove one", () => {
    const element = Markup.set<"epic-item">(item(), { status: "decided", answered: true, phase: undefined })
    expect(Markup.read(element)).toEqual({ id: "q1", title: "One line", status: "decided", answered: true })
    Markup.set<"epic-item">(element, { answered: false })
    expect(element.hasAttribute("answered")).toBe(false)
  })

  test("keeps a parsed element's attributes in vocabulary order, others after", () => {
    const html = '<epic-item class="x" status="open" id="q1" title="One line"></epic-item>'
    const element = documentOf(html).querySelector("epic-item")!
    Markup.set<"epic-item">(element, { reviewed: "2026-10-07" })
    expect(element.outerHTML).toBe(
      '<epic-item id="q1" title="One line" status="open" reviewed="2026-10-07" class="x"></epic-item>'
    )
  })

  test("throws for an unknown attribute, a bad value or the wrong type -- and changes NOTHING", () => {
    const element = item()
    const before = element.outerHTML
    expect(() => Markup.set(element, { status: "decided", color: "red" } as never)).toThrow(
      /<epic-item> has no attribute `color`;  it takes:  id, title, status/
    )
    expect(() => Markup.set<"epic-item">(element, { status: "closed" as never })).toThrow(/isn't one of its values/)
    expect(() => Markup.set<"epic-item">(element, { reviewed: "yesterday" })).toThrow(/isn't a well-formed date/)
    expect(() => Markup.set<"epic-item">(element, { phase: "2" as never })).toThrow(/takes a number/)
    expect(() => Markup.set<"epic-item">(element, { id: "x1" })).toThrow(/isn't a well-formed item id/)
    expect(element.outerHTML).toBe(before)
  })
})

////////////////
// ## Checking
////////////////

describe("Markup.validate()", () => {
  test("a doc using every element, made through `Markup`, has NO problems -- also once written and read back", () => {
    const document = blankDocument()
    planDoc(document)
    expect(summary(Markup.validate(document))).toEqual([])
    expect(summary(Markup.validate(documentOf(document.body.innerHTML)))).toEqual([])
  })

  test("reports unknown tags and attributes, bad values and missing attributes", () => {
    const document = documentOf(`
      <epic-page epic="demo" title="Demo"><epic-overview id="overview"></epic-overview>
        <epic-section id="decisions" kind="questions">
          <epic-item id="q1" status="maybe" data-status="open" title="x"></epic-item>
          <epic-item id="q2"></epic-item>
          <epic-nope></epic-nope>
        </epic-section>
      </epic-page>`)
    expect(summary(Markup.validate(document))).toEqual([
      'bad value:  <epic-item id="q1">',
      'unknown attribute:  <epic-item id="q1">',
      'missing attribute:  <epic-item id="q2">',
      'missing attribute:  <epic-item id="q2">',
      "unknown tag:  <epic-nope>"
    ])
  })

  test("reports a child its parent doesn't allow, out of order, too many or too few", () => {
    const document = documentOf(`
      <epic-page epic="demo" title="Demo">
        <epic-section id="phases" kind="phases">
          <epic-phase id="p1" title="One" status="todo">
            <epic-field name="goal">g</epic-field>
            <epic-field name="symptom">s</epic-field>
          </epic-phase>
          <epic-item id="q1" title="x" status="open"></epic-item>
        </epic-section>
        <epic-section id="decisions" kind="questions">
          <epic-item id="q2" title="y" status="decided">
            <epic-answer>one</epic-answer><epic-answer>two</epic-answer>
            <epic-choices></epic-choices>
          </epic-item>
        </epic-section>
      </epic-page>`)
    expect(summary(Markup.validate(document))).toEqual([
      'out of order:  <epic-field name="symptom">',
      'not allowed here:  <epic-item id="q1">',
      "too many:  <epic-answer>",
      "out of order:  <epic-choices>",
      "too few:  <epic-choices>",
      "too few:  <epic-page>"
    ])
  })

  test("reports an epic element inside prose, unless it's a `flow` one (`<epic-update>`)", () => {
    const document = documentOf(`
      <epic-page epic="demo" title="Demo"><epic-overview id="overview"></epic-overview>
        <epic-section id="todos" kind="todos">
          <epic-item id="t1" title="x" status="open">
            <p>Text <epic-update phase="2"></epic-update> and <epic-reply>no</epic-reply></p>
          </epic-item>
        </epic-section>
      </epic-page>`)
    expect(summary(Markup.validate(document))).toEqual(["not allowed here:  <epic-reply>"])
  })

  test("reports fixed section ids, item letters in the wrong section, a `chosen` no option has, duplicate ids", () => {
    const document = documentOf(`
      <epic-page epic="demo" title="Demo">
        <epic-overview id="overview"><epic-section id="intro" kind="overview-part"></epic-section></epic-overview>
        <epic-section id="questions" kind="questions">
          <epic-item id="j1" title="x" status="open">
            <epic-choices chosen="C"><epic-option letter="A" title="a"></epic-option></epic-choices>
          </epic-item>
          <epic-item id="q1" title="y" status="open"><h4 id="q1">again</h4></epic-item>
        </epic-section>
      </epic-page>`)
    expect(summary(Markup.validate(document))).toEqual([
      'wrong id:  <epic-section id="intro">',
      'missing attribute:  <epic-section id="intro">',
      'wrong id:  <epic-section id="questions">',
      'wrong id:  <epic-item id="j1">',
      "bad value:  <epic-choices>",
      'duplicate id:  <h4 id="q1">'
    ])
  })

  test("reports an epic element outside `<epic-page>`;  a part's body checks `as` its host", () => {
    const part = documentOf(`<!-- parts/q7.html -->
      <p>the question</p><epic-choices><epic-option letter="A" title="a"></epic-option></epic-choices>`)
    expect(summary(Markup.validate(part))).toEqual(["not allowed here:  <epic-choices>"])
    expect(summary(Markup.validate(part.body, { as: "epic-item" }))).toEqual([])

    const log = documentOf(`<epic-item id="q1" title="x" status="open"></epic-item>`)
    const host = documentOf(`<epic-section id="log" kind="log"></epic-section>`).body.firstElementChild!
    expect(summary(Markup.validate(log.body, { as: host }))).toEqual(['not allowed here:  <epic-item id="q1">'])
  })

  test("checks a single element as itself", () => {
    const item = documentOf(`<epic-item id="q1" title="x" status="open"><p>ok</p></epic-item>`).body.firstElementChild!
    expect(Markup.validate(item)).toEqual([])
    item.setAttribute("state", "red")
    expect(Markup.validate(item)).toMatchObject([
      { kind: "bad value", where: '<epic-item id="q1">', message: expect.stringMatching(/`state="red"` isn't one/) }
    ])
  })
})
