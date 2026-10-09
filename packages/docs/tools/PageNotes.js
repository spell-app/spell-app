/**
 * PAGE NOTES:  notes Owen leaves on a docs page for Claude, written INTO the page's HTML, and Claude's replies under
 * them (epic `airplane`, P3).
 * - Pure:  a page's source in (`new PageNotes(html)`), edits on that text, the text out (`html`).
 *   No files, no clock unless passed one.
 * - Who uses it:
 *   - `notesRoutes.ts`, the page server's notes routes:  the bubbles on a page add, edit and delete notes
 *   - `notes.ts` (`spell dev notes`):  Claude lists them, answers them, marks them done
 *   - `index.js`:  carries the notes over when it regenerates a list page (`PageNotes.carryOver()`)
 * - Edits SPLICE the source:  every byte outside the note stays as it was, so the page's diff shows only the note.
 * - Plain node JS, no `$/` imports:  `index.js` runs under plain `node`.
 *
 * The markup, at the end of the section it's about (or, for the whole page, right after the sticky page header):
 *
 *     <spell-notes for="model">
 *       <spell-note id="n3" status="new" at="2026-10-10 14:02">
 *         <p>Owen's note:  a paragraph per blank-line-separated block, `backticks` as code.</p>
 *         <spell-note-reply by="Claude" at="2026-10-11 09:12">
 *           <p>Claude's answer:  any HTML.</p>
 *         </spell-note-reply>
 *       </spell-note>
 *     </spell-notes>
 *
 * - `<spell-notes for>`:  the `<ui-section>`'s `id`, or `page` for the whole page;  one group per section
 * - `<spell-note>`:  `id` `n<N>`, unique on the page;  `status` `new` (Claude hasn't seen it), `answered` (a reply
 *   is under it), `done`;  `at`, local time
 * - `<spell-note-reply>`:  Claude's, `by` and `at`;  several are fine
 * - Plain markup, no element behind it:  the docs runtime (`_assets/spell-doc-runtime.js`, "Page notes") draws it
 *   as a folded card and adds the bubbles;  `spell-doc.css` styles it.  From `file://` it reads the same, minus the
 *   bubbles.
 */
import { parseHTML } from "linkedom"

/** What a note's `status` may be. */
export const NOTE_STATUSES = ["new", "answered", "done"]

/** `for` of the whole page's notes. */
export const PAGE_ANCHOR = "page"

/** A note's id:  `n` and a number. */
const NOTE_ID = /^n\d+$/

/** Any start tag:  its name and attributes (values may hold `>`). */
const START_TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/

/** One attribute in a start tag:  name, then a quoted or bare value, if any. */
const ATTRIBUTE = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

/** What the scanner blanks out first:  comments, and the text of elements whose content isn't markup. */
const OPAQUE = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b[^>]*>[\s\S]*?<\/\1\s*>/gi

/****************
 * ### `NotesError`
 * A problem the person should see as a message, not a stack trace:  a bad page, anchor, id or status.
 * - `status`:  the HTTP status the page server answers with (400 bad input, 404 no such note, 409 not now)
 ****************/
export class NotesError extends Error {
  /** HTTP status for the page server;  400 unless the cause says otherwise. */
  get status() {
    return this.cause?.status ?? 400
  }
}
NotesError.prototype.name = "NotesError"

/****************
 * ### `PageNotes`
 * A page's source, and the note edits made to it.
 * - every edit re-scans the source:  a page holds a few notes at most, and a scan is a few ms
 * - throws `NotesError` for a missing note, section or page header, or a note that can't change now
 ****************/
export class PageNotes {
  /** - `html`:  the page's source, as read from its file */
  constructor(html) {
    /** the page's source, edited in place */
    this.html = html
  }

  ////////////////
  // ## Reading
  ////////////////

  /**
   * The notes on the page, in page order;  `new` ones only unless `all`.
   * - each:  `{ id, for, label, status, at, text, replies: [{ by, at, text }] }`
   * - `for`:  the section's id, or `page`;  `label`:  its title for a reader (`1. The model`, `the page`)
   * - `text`:  the note as plain text, as typed (`textOf()`)
   */
  notes({ all = false } = {}) {
    if (!this.html.includes("<spell-note")) return []
    const { document } = parseHTML(this.html)
    return Array.from(document.querySelectorAll("spell-note"), (note) => {
      const anchor = note.closest("spell-notes")?.getAttribute("for") ?? PAGE_ANCHOR
      return {
        id: note.id,
        for: anchor,
        label: labelOf(document, anchor),
        status: note.getAttribute("status") ?? "new",
        at: note.getAttribute("at") ?? "",
        text: textOf(note),
        replies: Array.from(note.querySelectorAll(":scope > spell-note-reply"), (reply) => ({
          by: reply.getAttribute("by") ?? "Claude",
          at: reply.getAttribute("at") ?? "",
          text: textOf(reply)
        }))
      }
    }).filter((note) => all || note.status === "new")
  }

  /** Ids of the page's `<ui-section>`s, which a note may be `for`. */
  sectionIds() {
    return this.elements("ui-section")
      .map((element) => element.attributes.id)
      .filter(Boolean)
  }

  ////////////////
  // ## Owen's edits (the page's bubbles)
  ////////////////

  /**
   * Add a note `for` a section (its `id`) or the whole page (`page`);  returns its id (`n3`).
   * - into the section's group, made at the end of the section on first use;  the page's right after the sticky
   *   page header
   * - `text`:  plain text (`htmlOf()`);  blank:  throws
   * - `now`:  its `at`, local time
   */
  add(anchor, text, now = new Date()) {
    const body = htmlOf(text)
    const id = `n${this.lastNumber() + 1}`
    const note = [`<spell-note id="${id}" status="new" at="${stamp(now)}">`, ...indent(body), "</spell-note>"]
    const group = this.group(anchor)
    if (group) this.insertBefore(group.closeStart, note)
    else this.placeGroup(anchor, [`<spell-notes for="${attr(anchor)}">`, ...indent(note), "</spell-notes>"])
    return id
  }

  /**
   * Replace note `id`'s text with `text` (plain text, `htmlOf()`).
   * - only while it's `new`:  once Claude has answered, a change would be a new note
   */
  edit(id, text) {
    const note = this.unseen(id)
    const pad = indentOf(this.html, note.start)
    const lines = indent(htmlOf(text)).map((line) => `\n${pad}${line}`)
    this.splice(note.openEnd, note.closeStart, `${lines.join("")}\n${pad}`)
  }

  /**
   * Delete note `id`;  its group too when it was the last.
   * - only while it's `new`
   */
  remove(id) {
    const note = this.unseen(id)
    const group = this.groupAround(note)
    const others = group ? this.elements("spell-note", group).length : 0
    const [start, end] = others > 1 || !group ? [note.start, note.end] : [group.start, group.end]
    this.cutLines(start, end)
  }

  ////////////////
  // ## Claude's edits (`spell dev notes`)
  ////////////////

  /**
   * Put Claude's reply under note `id`, and mark it `answered`.
   * - `html`:  the reply's markup, as is (a `<p>` or more);  blank:  throws
   * - after any replies already there;  `now`:  its `at`
   */
  answer(id, html, now = new Date()) {
    const markup = String(html ?? "").trim()
    if (!markup) throw new NotesError("a reply needs some text")
    const note = this.note(id)
    const reply = [
      `<spell-note-reply by="Claude" at="${stamp(now)}">`,
      ...indent(dedent(markup).split("\n")),
      "</spell-note-reply>"
    ]
    this.insertBefore(note.closeStart, reply)
    this.setStatus(id, "answered")
  }

  /** Set note `id`'s `status` (`NOTE_STATUSES`). */
  setStatus(id, status) {
    if (!NOTE_STATUSES.includes(status))
      throw new NotesError(`a note's status is ${NOTE_STATUSES.join(" / ")}, not "${status}"`)
    const note = this.note(id)
    const open = this.html.slice(note.start, note.openEnd)
    const next = /\sstatus="[^"]*"/.test(open)
      ? open.replace(/(\sstatus=")[^"]*"/, `$1${status}"`)
      : open.replace(/>$/, ` status="${status}">`)
    this.splice(note.start, note.openEnd, next)
  }

  ////////////////
  // ## Regenerated pages
  ////////////////

  /**
   * `after` (a page's regenerated part, e.g. what `index.js` writes between its markers) with the note groups of
   * `before` (that part as it was) carried over.
   * - each group goes back into the section it's `for`;  a section that's gone:  at the end, still `for` it, so no
   *   note is ever lost
   * - indented to fit;  the caller formats the page after (`tidy()`)
   */
  static carryOver(before, after) {
    const old = new PageNotes(before)
    const groups = old.elements("spell-notes")
    if (!groups.length) return after
    const page = new PageNotes(after)
    for (const group of groups) {
      const lines = unindent(before.slice(group.start, group.end), indentOf(before, group.start)).split("\n")
      const section = page.elements("ui-section").find((each) => each.attributes.id === group.attributes.for)
      if (section) page.insertBefore(section.closeStart, lines)
      else page.html = `${page.html.replace(/\s*$/, "")}\n${lines.join("\n")}`
    }
    return page.html
  }

  ////////////////
  // ## Finding notes and groups
  ////////////////

  /** Note `id`;  throws if the page has none, or several. */
  note(id) {
    if (!NOTE_ID.test(String(id))) throw new NotesError(`"${id}" isn't a note id:  n1, n2 ...`)
    const found = this.elements("spell-note").filter((each) => each.attributes.id === id)
    if (!found.length) throw new NotesError(`no note ${id} on this page`, { cause: { status: 404 } })
    if (found.length > 1) throw new NotesError(`${found.length} notes with id ${id}:  ids must be unique`)
    return found[0]
  }

  /** Note `id`, while it's `new`;  throws once it isn't. */
  unseen(id) {
    const note = this.note(id)
    const status = note.attributes.status ?? "new"
    if (status !== "new")
      throw new NotesError(`note ${id} is ${status}:  Claude has seen it, so add a new note instead`, {
        cause: { status: 409 }
      })
    return note
  }

  /** The group of notes `for` `anchor`, if the page has one. */
  group(anchor) {
    return this.elements("spell-notes").find((each) => (each.attributes.for ?? PAGE_ANCHOR) === anchor)
  }

  /** The group holding `note`. */
  groupAround(note) {
    return this.elements("spell-notes").find((group) => group.start < note.start && note.end <= group.end)
  }

  /** The highest note number on the page (any `id="n<N>"`, so a new one never collides);  0 for none. */
  lastNumber() {
    const numbers = Array.from(this.html.matchAll(/\sid="n(\d+)"/g), (match) => Number(match[1]))
    return Math.max(0, ...numbers)
  }

  /**
   * Make the group `lines` for `anchor`:  at the end of that section, or right after the page header.
   * - the page header:  the sticky `<ui-sticky class="spell-h1">`, else the `<h1>`, else the start of `<main>`
   * - throws when there's no such section, or nowhere for a page note
   */
  placeGroup(anchor, lines) {
    if (anchor !== PAGE_ANCHOR) {
      const sections = this.elements("ui-section").filter((each) => each.attributes.id === anchor)
      if (!sections.length) throw new NotesError(`no section "${anchor}" on this page`)
      if (sections.length > 1) throw new NotesError(`${sections.length} sections with id "${anchor}"`)
      return this.insertBefore(sections[0].closeStart, lines)
    }
    const header =
      this.elements("ui-sticky").find((each) => /(^|\s)spell-h1(\s|$)/.test(each.attributes.class ?? "")) ??
      this.elements("h1")[0]
    if (header) return this.insertAfter(header.start, header.end, lines)
    const main = this.elements("main")[0]
    if (!main) throw new NotesError("no page header, h1 or <main> on this page to put a note under")
    this.insertAfter(main.start, main.openEnd, indent(lines))
  }

  ////////////////
  // ## Scanning and splicing
  ////////////////

  /**
   * The `tag` elements in the page (or inside element `within`), in source order:
   * `{ tag, attributes, start, openEnd, closeStart, end }` (offsets in `html`).
   * - comments, scripts, styles and `<title>` are skipped (`OPAQUE`):  a tag written in a comment isn't one
   * - an element with no end tag ends where its start tag does
   */
  elements(tag, within) {
    const source = blank(this.html)
    const found = []
    const tags = new RegExp(START_TAG.source, "g")
    tags.lastIndex = within ? within.openEnd : 0
    const limit = within ? within.closeStart : source.length
    for (let match; (match = tags.exec(source)) && match.index < limit;) {
      if (match[1].toLowerCase() !== tag) continue
      const start = match.index
      const openEnd = start + match[0].length
      const close = closeOf(source, tag, openEnd)
      found.push({
        tag,
        attributes: attributesOf(match[2]),
        start,
        openEnd,
        closeStart: close?.start ?? openEnd,
        end: close?.end ?? openEnd
      })
    }
    return found
  }

  /** Replace `html` from `start` to `end` with `text`. */
  splice(start, end, text) {
    this.html = this.html.slice(0, start) + text + this.html.slice(end)
  }

  /**
   * Insert `lines` just before an end tag at `closeStart`, one level deeper than it.
   * - the end tag alone on its line (formatted pages):  the lines go on lines of their own above it
   */
  insertBefore(closeStart, lines) {
    const lineStart = this.html.lastIndexOf("\n", closeStart - 1) + 1
    const before = this.html.slice(lineStart, closeStart)
    const pad = indentOf(this.html, closeStart)
    if (/^[ \t]*$/.test(before))
      return this.splice(lineStart, lineStart, lines.map((line) => `${pad}  ${line}\n`).join(""))
    this.splice(closeStart, closeStart, `${lines.map((line) => `\n${pad}  ${line}`).join("")}\n${pad}`)
  }

  /** Insert `lines` right after the element from `start` to `end`, at its indent, on lines of their own. */
  insertAfter(start, end, lines) {
    const pad = indentOf(this.html, start)
    this.splice(end, end, lines.map((line) => `\n${pad}${line}`).join(""))
  }

  /** Remove `start` to `end`;  the whole lines, when nothing else is on them. */
  cutLines(start, end) {
    const lineStart = this.html.lastIndexOf("\n", start - 1) + 1
    const lineEnd = this.html.indexOf("\n", end)
    const wholeLines =
      /^[ \t]*$/.test(this.html.slice(lineStart, start)) &&
      /^[ \t]*$/.test(this.html.slice(end, lineEnd < 0 ? undefined : lineEnd))
    if (wholeLines) this.splice(lineStart, lineEnd < 0 ? this.html.length : lineEnd + 1, "")
    else this.splice(start, end, "")
  }
}

////////////////
// ## Text and markup
////////////////

/**
 * Plain text as a note's markup lines:  a `<p>` per block (blocks split at blank lines), a single newline a
 * `<br />`, `backticked` runs `<code>`.
 * - throws on blank text
 */
export function htmlOf(text) {
  const words = String(text ?? "").trim()
  if (!words) throw new NotesError("a note needs some text")
  return words
    .split(/\n[ \t]*\n\s*/)
    .map((block) => `<p>${inline(block.trim()).replace(/[ \t]*\n[ \t]*/g, "<br />")}</p>`)
}

/**
 * A note's (or reply's) text as typed:  its paragraphs split by blank lines, `<br>` a newline, `<code>` in backticks.
 * - its replies are left out;  white space as the browser would show it
 * - the page's runtime does the same in the browser, to fill the edit box (`spell-doc-runtime.js` `noteText()`)
 */
export function textOf(element) {
  const blocks = []
  for (const child of element.childNodes) {
    if (child.nodeType === 1 && child.localName === "spell-note-reply") continue
    const text = child.nodeType === 1 ? inlineText(child) : child.textContent
    if (text.trim()) blocks.push(text.trim())
  }
  return blocks.join("\n\n")
}

/** Inline text of `node`:  `<br>` a newline, `<code>` in backticks, runs of white space one space. */
function inlineText(node) {
  if (node.nodeType === 3) return node.textContent.replace(/\s+/g, " ")
  if (node.nodeType !== 1) return ""
  if (node.localName === "br") return "\n"
  const inner = Array.from(node.childNodes, inlineText).join("")
  return node.localName === "code" ? `\`${inner}\`` : inner
}

/** What `anchor` is, for a reader:  its section's title (`1. The model`), or `the page`. */
function labelOf(document, anchor) {
  if (anchor === PAGE_ANCHOR) return "the page"
  const section = document.getElementById(anchor)
  if (!section) return anchor
  const header = section.getAttribute("header") ?? section.querySelector(':scope > [slot="header"]')?.textContent
  return header?.replace(/\s+/g, " ").trim() || anchor
}

/** `date` as a note's `at`:  local `YYYY-MM-DD HH:MM`. */
export function stamp(date = new Date()) {
  const two = (value) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`
}

/** `lines`, each two spaces deeper. */
function indent(lines) {
  return lines.map((line) => (line ? `  ${line}` : line))
}

/** `text` without the indent all its (non-blank) lines share:  a reply's markup, from a file. */
function dedent(text) {
  const pads = text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => /^[ \t]*/.exec(line)[0].length)
  const cut = Math.min(...pads)
  return text
    .split("\n")
    .map((line) => line.slice(cut))
    .join("\n")
}

/**
 * A slice of the page starting at a tag (so its first line has no indent), its later lines without `pad`, the
 * indent of the line it started on.
 */
function unindent(text, pad) {
  return text
    .split("\n")
    .map((line, at) => (at && line.startsWith(pad) ? line.slice(pad.length) : line))
    .join("\n")
}

/** The indent of the line `offset` is on. */
function indentOf(html, offset) {
  const lineStart = html.lastIndexOf("\n", offset - 1) + 1
  return /^[ \t]*/.exec(html.slice(lineStart))[0]
}

/** `html` with comments and opaque elements' text blanked to spaces (`OPAQUE`):  every offset stays the same. */
function blank(html) {
  return html.replace(OPAQUE, (match) => match.replace(/[^\n]/g, " "))
}

/** The end tag closing a `tag` element whose start tag ends at `from`:  `{ start, end }`, or `undefined`. */
function closeOf(source, tag, from) {
  const tags = new RegExp(`<(/?)${tag}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi")
  tags.lastIndex = from
  let depth = 1
  for (let match; (match = tags.exec(source));) {
    depth += match[1] ? -1 : 1
    if (!depth) return { start: match.index, end: match.index + match[0].length }
  }
  return undefined
}

/** A start tag's attributes, by name:  a bare one is `""`. */
function attributesOf(text) {
  const attributes = {}
  for (const match of text.matchAll(ATTRIBUTE))
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ""
  return attributes
}

/** Escape for HTML text, with `backticked` runs as `<code>`. */
function inline(value) {
  return text(value).replace(/`([^`]+)`/g, "<code>$1</code>")
}

/** Escape for HTML text. */
function text(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Escape for a double-quoted attribute. */
function attr(value) {
  return text(value).replace(/"/g, "&quot;")
}
