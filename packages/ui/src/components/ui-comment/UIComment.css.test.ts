import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { commentVocabulary } from "./UIComment.en"
import { commentsVocabulary } from "./UIComments.en"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"
import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"
import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"
import commentCSS from "./UIComment.css?inline"
import commentRaw from "./UIComment.css?raw"

/**
 * `UIComment.css` on its own, before any element exists:  the sheet's source rules, and the computed styles of the
 * light-DOM class-grammar examples -- lists, comments (`.ui.comments .comment`), threads and static parts.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt what a page showing the static examples needs. */
function adopt() {
  Sheets.adopt([...foundationCSS, buttonCSS, segmentCSS, commentCSS, partsCSS])
}

/** Render example `name`;  returns its root. */
function example(name: string): HTMLElement {
  adopt()
  return Fixture.render(`<div style="width: 1000px">${EXAMPLES[`./examples/${name}.html`]!}</div>`)
}

/** The first comment list in the section whose `<h4>` says `title`. */
function listIn(root: Element, title: string): HTMLElement {
  const section = [...root.querySelectorAll("section")].find(
    (element) => element.querySelector("h4")?.textContent === title
  )
  if (!section) throw new Error(`no section "${title}"`)
  return section.querySelector<HTMLElement>(".ui.comments")!
}

/** Computed style of `element`. */
function style(element: Element): CSSStyleDeclaration {
  return getComputedStyle(element)
}

////////////////
// ## Source
////////////////

describe("UIComment.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(commentRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(commentRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(commentRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("comment"))).toBe(true)
  })

  it("parses with replaceSync, keeping the thread rules and the threaded query", () => {
    for (const css of [commentCSS, commentRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(15)
      expect(selectors.some((selector) => selector.includes(":host(:state(in-comment)) > .comments"))).toBe(true)
      expect(css).toMatch(/@container style\(--_comments-threaded: ?1\)/)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = commentRaw + colorsCSS
    for (const vocabulary of [commentsVocabulary, commentVocabulary])
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIComment.css examples", () => {
  it.each(Object.keys(EXAMPLES))("lays out every visible comment in %s", (path) => {
    adopt()
    const root = Fixture.render(`<div style="width: 1000px">${EXAMPLES[path]!}</div>`)
    const comments = [...root.querySelectorAll<HTMLElement>(".ui.comments .comment")].filter(
      (comment) => !comment.closest(".collapsed")
    )
    expect(comments.length).toBeGreaterThan(0)
    for (const comment of comments) expect(comment.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it("caps the list at 650px;  puts the content beside a 2.5em avatar", () => {
    const list = listIn(example("types"), "Comments")
    expect(list.getBoundingClientRect().width).toBe(650)
    const comment = list.querySelector(".comment")!
    expect(comment.querySelector(".avatar")!.getBoundingClientRect().width).toBe(40)
    expect(style(comment.querySelector(".content")!).marginLeft).toBe("56px")
  })

  it("indents a thread;  a threaded list draws its line", () => {
    const thread = listIn(example("types"), "Comments").querySelector(".comment > .comments")!
    expect(style(thread).paddingLeft).toBe("16px")
    expect(style(thread).boxShadow).toBe("none")
    const threaded = listIn(example("variations"), "Threaded").querySelector(".comment > .comments")!
    expect(style(threaded).boxShadow).not.toBe("none")
    expect(style(threaded).paddingTop).toBe("48px")
  })

  it("hides minimal actions, a collapsed thread;  inverts;  fades a disabled comment", () => {
    const root = example("variations")
    expect(style(listIn(root, "Minimal").querySelector(".actions")!).opacity).toBe("0")
    expect(style(listIn(root, "Collapsed thread").querySelector(".collapsed.comments")!).display).toBe("none")
    expect(style(listIn(root, "Inverted")).colorScheme).toBe("dark")
    const disabled = listIn(example("states"), "Disabled comment").querySelector(".disabled.comment")!
    expect(Number(style(disabled).opacity)).toBeLessThan(1)
  })

  it("spaces the reply form below the list", () => {
    const reply = listIn(example("types"), "Comments").querySelector(":scope > .reply")!
    expect(style(reply).marginTop).toBe("16px")
  })
})

////////////////
// ## Tokens
////////////////

describe("UIComment.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, commentCSS])
    const root = Fixture.render(
      `<div style="--ui-comments-max-width: 300px"><div class="ui comments"><div class="comment">x</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.comments")!).maxWidth).toBe("300px")
  })
})
