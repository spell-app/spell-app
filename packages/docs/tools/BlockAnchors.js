/**
 * BLOCK ANCHORS:  where a COMMENT sits on its page (epic `airplane`, P11).
 * - A comment is Owen's, on one MAJOR BLOCK of a docs page or plan doc (`BLOCK_KINDS`):
 *   - a docs page's:  a section, a table, an aside, a code block, a message, a set of cards or steps, a top-level list
 *   - a plan doc's:  an item, a phase's field, the summary, Overview prose, and its tables, asides and code
 *   - or the whole page (`PAGE_ANCHOR`)
 * - Its ANCHOR finds that block again, also after the page changed:
 *   - the block's own `id`, when it has one (every section and plan item has)
 *   - else the nearest CONTAINER's id (a section, a phase, an Overview part:  `CONTAINERS`), the block's kind and its
 *     place among that container's blocks of that kind:  `memory#table-2`, the second table of section `memory`;
 *     `p3#field-2`, phase 3's second field;  `page#list-1` before the first section
 *   - plus an EXCERPT, its first words (`excerptOf()`):  a block that moved within the page is found by them
 *     (`findBlock()`)
 * - A comment on SELECTED TEXT keeps the text (`quote`) and where it starts in its block's text (`offset`,
 *   `offsetIn()`), so it's found again, and highlighted, even where the block says it twice (`quoteIn()`)
 * - Plain DOM, no globals:  the docs runtime runs it on the live page (`_assets/spell-doc-runtime.js`,
 *   "Comments"), the tests on linkedom.  The comments themselves:  `CommentList` (`$/epics/tool/CommentList`).
 */

/**
 * The major blocks of a page, by kind:  `[kind, selector]`, the first match naming an element's kind.
 * - only the OUTERMOST counts:  a table in an aside is the aside's, a list in a plan item the item's;
 *   docs sections nest, so every one counts
 */
export const BLOCK_KINDS = [
  ["section", "ui-section"],
  ["item", "epic-item"],
  ["field", "epic-field"],
  ["summary", "epic-summary"],
  ["prose", "epic-section > p, epic-overview > p"],
  ["table", "ui-table, table"],
  ["aside", "ui-accordion.spell-aside, epic-aside"],
  ["code", "ui-accordion.spell-code, ui-code, epic-code, pre"],
  ["message", "ui-message"],
  ["cards", "ui-cards"],
  ["steps", "ui-steps"],
  ["list", "ui-list, ul, ol"]
]

/** What a block's anchor counts from:  the nearest of these with an id (docs sections, plan doc parts). */
export const CONTAINERS = "ui-section[id], epic-overview[id], epic-section[id], epic-phase[id]"

/** The anchor of a comment on the whole page;  its block is the sticky page header (`pageHeadIn()`). */
export const PAGE_ANCHOR = "page"

/** How much of a block's text its excerpt keeps, in characters. */
export const EXCERPT_LENGTH = 80

/** Any major block. */
const ANY_BLOCK = BLOCK_KINDS.map(([, selector]) => selector).join(", ")

/** A block that holds its own blocks:  every kind but a docs section. */
const OUTER_BLOCK = BLOCK_KINDS.filter(([kind]) => kind !== "section")
  .map(([, selector]) => selector)
  .join(", ")

/** Not the page's own content:  its header, notes, what the runtime adds (comments, bullhorns ...). */
const NOT_CONTENT = "spell-notes, [data-spell-added], .spell-page-head, ui-sticky.spell-h1, nav, footer"

/** A plan doc's parts that aren't its text:  the log, commits, the plan changes box's copies. */
const NOT_PLAN_TEXT = "epic-event, epic-commit, epic-updated[slot], [slot='status']"

/** A positional anchor:  `<container id | page>#<kind>-<n>`. */
const POSITIONAL = /^(.+)#([a-z][a-z-]*)-(\d+)$/

/** `element`'s block kind (`table` ...), or `undefined` when it isn't one of `BLOCK_KINDS`. */
export function kindOf(element) {
  return BLOCK_KINDS.find(([, selector]) => element.matches(selector))?.[0]
}

/** The major blocks inside `main`, in page order. */
export function blocksIn(main) {
  return Array.from(main.querySelectorAll(ANY_BLOCK)).filter((element) => {
    if (element.closest(NOT_CONTENT) || element.closest(NOT_PLAN_TEXT)) return false
    const outer = element.parentElement?.closest(OUTER_BLOCK)
    return !outer || !main.contains(outer)
  })
}

/** The block `node` is in (a text node too):  the innermost of `blocks` holding it;  `null` for none. */
export function blockAround(node, blocks) {
  const inside = new Set(blocks)
  for (let at = node.nodeType === 1 ? node : node.parentElement; at; at = at.parentElement)
    if (inside.has(at)) return at
  return null
}

/** The sticky page header in `main` (`ui-sticky.spell-h1`, else `.spell-page-head`):  where page comments go. */
export function pageHeadIn(main) {
  return main.querySelector("ui-sticky.spell-h1") ?? main.querySelector(".spell-page-head")
}

/** The nearest container with an id around `block` (never `block` itself), inside `main`;  `null` for none. */
export function sectionOf(block, main) {
  const section = block.parentElement?.closest(CONTAINERS)
  return section && main.contains(section) ? section : null
}

/**
 * `block`'s anchor:  its `id`, else `<container id | page>#<kind>-<n>` (the module's header).
 * - `blocks`:  `blocksIn(main)`, when the caller has them
 */
export function anchorOf(block, main, blocks = blocksIn(main)) {
  if (block.id) return block.id
  const kind = kindOf(block)
  const section = sectionOf(block, main)
  const peers = blocks.filter((each) => kindOf(each) === kind && sectionOf(each, main) === section)
  return `${section?.id ?? PAGE_ANCHOR}#${kind}-${peers.indexOf(block) + 1}`
}

/** `block`'s excerpt:  a section's or item's title, else the first `EXCERPT_LENGTH` characters of its text. */
export function excerptOf(block) {
  if (block.matches("ui-section, epic-item, epic-section, epic-phase")) return sectionTitle(block)
  // trimmed after the cut:  the server keeps it trimmed, and a space left at the end would never match again
  return textOf(block).slice(0, EXCERPT_LENGTH).trim()
}

/**
 * A section's (or plan part's) title, as a reader sees it (`2. Memory`):
 * its `header` or `title`, or its `slot="header"` / `slot="title"` text.
 */
export function sectionTitle(section) {
  const slotted = Array.from(section.children).find((child) => /^(header|title)$/.test(child.getAttribute("slot")))
  return squash(section.getAttribute("header") ?? section.getAttribute("title") ?? slotted?.textContent ?? "")
}

/**
 * The block a comment is on:  `{ block, exact }`.
 * - `anchor`, `excerpt`:  as saved with the comment
 * - an id:  that element;  `page`:  the page header
 * - a position:  the block there, when its excerpt still matches;  else the block of that kind with that excerpt,
 *   in its container first, then anywhere (it moved);  else the block there anyway (its text changed);
 *   else its container
 * - `exact`:  false when it fell back past the first choice:  the comment may be about something else now
 * - `block` `null`:  nowhere left to put it;  the runtime shows it under the page header
 */
export function findBlock(main, { anchor, excerpt = "" }, blocks = blocksIn(main)) {
  if (anchor === PAGE_ANCHOR) return { block: pageHeadIn(main), exact: true }
  const document = main.ownerDocument
  const positional = POSITIONAL.exec(anchor)
  if (!positional) {
    const element = document.getElementById(anchor)
    return element && main.contains(element) ? { block: element, exact: true } : { block: null, exact: false }
  }
  const [, sectionId, kind, n] = positional
  const section = sectionId === PAGE_ANCHOR ? null : document.getElementById(sectionId)
  const ofKind = blocks.filter((each) => kindOf(each) === kind)
  const peers = ofKind.filter((each) => sectionOf(each, main) === section)
  const there = peers[Number(n) - 1]
  const same = (each) => Boolean(excerpt) && excerptOf(each) === excerpt
  if (there && (!excerpt || same(there))) return { block: there, exact: true }
  const moved = peers.find(same) ?? ofKind.find(same) ?? there
  if (moved) return { block: moved, exact: false }
  return { block: section && main.contains(section) ? section : null, exact: false }
}

/** The id a link to `anchor`'s block lands on:  the block's or its container's;  `""` for the page. */
export function targetOf(anchor) {
  const id = anchor.split("#")[0]
  return id === PAGE_ANCHOR ? "" : id
}

////////////////
// ## Text and quotes
////////////////

/**
 * `block`'s text as a comment reads it:  white space squashed, a space between elements' texts (a table's cells),
 * what the runtime added left out (`NOT_CONTENT`:  comments, bullhorns).
 */
export function textOf(block) {
  return squash(
    textRuns(block)
      .map((run) => run.text)
      .join("")
  )
}

/**
 * Where text position `node` / `offset` (a selection's start) falls in `block`'s text (`textOf()`), in characters;
 * 0 when it isn't in it.
 */
export function offsetIn(block, node, offset) {
  let before = ""
  for (const run of textRuns(block)) {
    if (run.node === node) return squash(`${before}${run.text.slice(0, offset)}x`).length - 1
    before += run.text
  }
  return 0
}

/**
 * Where `quote` is in `block`:  `{ start: [node, offset], end: [node, offset] }` for a DOM range, or `null`.
 * - white space matched loosely (a run of it is one space);  of several copies, the one nearest `offset`
 */
export function quoteIn(block, quote, offset = 0) {
  const wanted = squash(quote)
  if (!wanted) return null
  // the block's text squashed, each character's node and offset beside it
  const chars = []
  let space = true
  for (const run of textRuns(block))
    for (let at = 0; at < run.text.length; at++) {
      const isSpace = /\s/.test(run.text[at])
      if (isSpace && space) continue
      chars.push({ char: isSpace ? " " : run.text[at], node: run.node, at })
      space = isSpace
    }
  const text = chars.map((each) => each.char).join("")
  let best = -1
  for (let found = text.indexOf(wanted); found >= 0; found = text.indexOf(wanted, found + 1))
    if (best < 0 || Math.abs(found - offset) < Math.abs(best - offset)) best = found
  if (best < 0) return null
  const first = chars[best]
  const last = chars[best + wanted.length - 1]
  return { start: [first.node, first.at], end: [last.node, last.at + 1] }
}

/** `block`'s text nodes, in order:  `{ node, text }`, a space after each element's;  added content skipped. */
function textRuns(block) {
  const runs = []
  const walk = (node) => {
    if (node.nodeType === 3) return runs.push({ node, text: node.textContent })
    if (node.nodeType !== 1 || (node !== block && node.matches(NOT_CONTENT))) return
    for (const child of node.childNodes) walk(child)
    runs.push({ node: null, text: " " })
  }
  walk(block)
  return runs
}

/** `text` with runs of white space as one space, trimmed. */
function squash(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
}
