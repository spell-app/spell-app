/**
 * A goals page as a document, and every edit the goals tools make to one:  items, thoughts, status, history.
 * - Pure:  HTML in (`GoalsPage.parse()`), changes on the parsed document, HTML out (`toString()`).  No files, no
 *   clock unless passed one.  `goals.js` does the reading, locking and writing;  `server.js` reuses the same edits.
 * - Markup and rules:  `goals/AGENTS.md`.  Item lists and their chips are `plan-doc.css`'s;  the rest is
 *   `packages/docs/tools/_assets/goals.css`.
 */
import { parseHTML } from "linkedom"

import { serialize } from "../pages.js"

/** Item kind -> its id prefix (`q3`), shown upper-cased (`Q3`). */
export const KINDS = {
  goal: { prefix: "g" },
  idea: { prefix: "i" },
  question: { prefix: "q" },
  risk: { prefix: "r" },
  decision: { prefix: "d" },
  work: { prefix: "w" }
}

/** Goal horizons -> the list they go in. */
export const HORIZONS = ["now", "next", "someday"]

/** Topic status -> its label text, color, and the line after it. */
export const STATUS = {
  draft: { label: "draft", color: "grey", note: "first pass, not yet talked through" },
  dialog: { label: "in dialog", color: "orange", note: "being talked through" },
  agreed: { label: "agreed", color: "green", note: "direction agreed, notes ready for agents" },
  building: { label: "building", color: "blue", note: "work under way" },
  shipped: { label: "shipped", color: "violet", note: "done for now" }
}

/** Accents a page may take:  UI's hues. */
export const ACCENTS = [
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "teal",
  "blue",
  "violet",
  "purple",
  "pink",
  "brown",
  "grey"
]

/** A problem the person should see as a message, not a stack trace. */
export class GoalsError extends Error {}

/****************
 * ### `GoalsPage`
 * A parsed goals page -- a topic, a set's contents page, or the home page -- and the edits made to it.
 * - topic-only edits (items, status) need `<body data-topic>`;  thoughts and history work on any page that has
 *   the markup
 ****************/
export class GoalsPage {
  /**
   * - `document`:  linkedom (or browser) document of the page
   * - `now`:  when edits happen (a `Date`):  history and thought dates, and "updated", in LOCAL time
   */
  constructor(document, now = new Date()) {
    this.document = document
    this.now = now
  }

  /** `GoalsPage` of HTML text. */
  static parse(html, now) {
    return new GoalsPage(parseHTML(html).document, now)
  }

  /** `now`'s date, `YYYY-MM-DD`. */
  get today() {
    return isoDate(this.now)
  }

  /** The page as HTML text, ready to write. */
  toString() {
    return serialize(this.document)
  }

  /**
   * What a contents page shows for this page.
   * - from `<body data-*>`, `<title>`, the description meta and "updated"
   */
  get meta() {
    const body = this.document.body
    return {
      set: body.getAttribute("data-set") ?? "",
      name: body.getAttribute("data-topic") ?? "",
      short: body.getAttribute("data-short") || body.getAttribute("data-topic") || "",
      n: Number(body.getAttribute("data-n")) || 0,
      icon: body.getAttribute("data-icon") ?? "",
      accent: body.getAttribute("data-accent") ?? "violet",
      status: body.getAttribute("data-status") ?? "draft",
      title: this.document.querySelector("title")?.textContent.trim() ?? "",
      description: this.document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      updated: this.document.querySelector("time.goals-updated")?.textContent.trim() ?? ""
    }
  }

  ////////////////
  // ## Items
  ////////////////

  /**
   * Append a `kind` item titled `title`;  returns its id (`q3`).
   * - ids count per kind across the page:  `G1`-`G3` may sit in three horizon lists
   * - `horizon`:  goals only, `now` (default) / `next` / `someday`
   * - `note`:  a short muted line after the title
   * - `tag`:  a tiny label after the title, e.g. who it waits on
   * - `details`:  HTML for a collapsed "details" panel
   */
  addItem(kind, title, { horizon, note, tag, details } = {}) {
    const spec = KINDS[kind]
    if (!spec) throw new GoalsError(`kind must be ${Object.keys(KINDS).join(" / ")}, not "${kind}"`)
    if (kind !== "goal" && horizon) throw new GoalsError("--horizon is for goals only")
    const where = kind === "goal" ? `[data-horizon="${horizon ?? "now"}"]` : ""
    if (kind === "goal" && !HORIZONS.includes(horizon ?? "now"))
      throw new GoalsError(`horizon must be ${HORIZONS.join(" / ")}, not "${horizon}"`)
    const list = this.require(`ol.plan-items[data-kind="${kind}"]${where}`)
    const id = `${spec.prefix}${this.nextNumber(kind)}`
    const li = this.element("li", { id, "data-status": "open" })
    li.innerHTML =
      `<a class="plan-id" href="#${id}">${id.toUpperCase()}</a> <span class="plan-title">${inline(title)}</span>` +
      (tag ? ` <ui-label size="mini" basic>${text(tag)}</ui-label>` : "") +
      (note ? ` <span class="goals-note">${inline(note)}</span>` : "") +
      (details
        ? `<ui-accordion class="spell-aside" styled><ui-title>details</ui-title><ui-content>${details}</ui-content></ui-accordion>`
        : "")
    list.append(li)
    return id
  }

  /** Next free number for `kind`'s ids, across every list of that kind. */
  nextNumber(kind) {
    const { prefix } = KINDS[kind]
    const taken = this.items(kind).map((item) => Number(item.id.slice(prefix.length)) || 0)
    return Math.max(0, ...taken) + 1
  }

  /**
   * Set item `id` open or done;  done items stay, struck through.  Returns its title.
   * - a decision "done" is one that no longer holds:  say why in the history
   */
  setItem(id, status) {
    if (status !== "open" && status !== "done") throw new GoalsError("item status must be open / done")
    const li = this.document.getElementById(id.toLowerCase())
    if (!li?.closest("ol.plan-items")) throw new GoalsError(`no item "${id}"`)
    li.setAttribute("data-status", status)
    return li.querySelector(".plan-title")?.textContent.trim() ?? id
  }

  /** Items of `kind`, in page order:  `{ id, title, status, horizon }`. */
  items(kind) {
    return Array.from(this.document.querySelectorAll(`ol.plan-items[data-kind="${kind}"] > li`), (li) => ({
      id: li.id,
      title: li.querySelector(".plan-title")?.textContent.trim() ?? "",
      status: li.getAttribute("data-status") ?? "open",
      horizon: li.parentElement?.getAttribute("data-horizon") ?? undefined
    }))
  }

  /** Open items of `kind`. */
  open(kind) {
    return this.items(kind).filter((item) => item.status === "open")
  }

  ////////////////
  // ## Thoughts
  ////////////////

  /**
   * Add a thought for Claude to digest later;  returns its id (`t3`).
   * - `anchor`:  where it belongs:  an item id (`q3`), a section's heading id (`questions`, `now`), or nothing for
   *   the page as a whole
   * - kept in a `<ul class="goals-thoughts" data-for="...">`, made on first use:  in the item (before its folded
   *   details), right under the section's heading, or right under the hero
   * - `text`:  plain text;  blank lines become paragraphs, backticks code
   */
  addThought(anchor, thought) {
    const words = String(thought ?? "").trim()
    if (!words) throw new GoalsError("a thought needs some text")
    const list = this.thoughtList(anchor ? anchor.toLowerCase() : "page")
    const taken = this.thoughts({ all: true }).map((it) => Number(it.id.slice(1)) || 0)
    const id = `t${Math.max(0, ...taken) + 1}`
    const li = this.element("li", { id, class: "goals-thought", "data-status": "new" })
    li.innerHTML =
      `<span class="goals-thought-icon"><ui-icon name="comment dots"></ui-icon></span> ${timeTag(this.now)} ` +
      `<span class="goals-thought-text">${paragraphs(words)}</span>`
    list.append(li)
    return id
  }

  /**
   * Mark thought `id` digested:  it stays, muted, with `result` (what came of it, e.g. "→ D2, Summary edited").
   * - `result`:  text;  item ids in it (`D2`, `Q4`) become links
   */
  digestThought(id, result) {
    const li = this.document.getElementById(id.toLowerCase())
    if (!li?.classList.contains("goals-thought")) throw new GoalsError(`no thought "${id}"`)
    li.setAttribute("data-status", "done")
    li.querySelector(":scope > .goals-thought-result")?.remove()
    if (result) {
      const span = this.element("span", { class: "goals-thought-result" })
      span.innerHTML = inline(result).replace(/\b([GIDQRW])(\d+)\b/g, (_, kind, n) => {
        const target = `${kind.toLowerCase()}${n}`
        return this.document.getElementById(target) ? `<a href="#${target}">${kind}${n}</a>` : `${kind}${n}`
      })
      li.append(" ", span)
    }
    return li.querySelector(".goals-thought-text")?.textContent.trim() ?? id
  }

  /**
   * Thoughts, in page order:  `{ id, for, label, text, date, status, result }`;  new ones only unless `all`.
   * - `for`:  the anchor (`page`, `q3`, `questions`);  `label`:  what that is, for a reader (`Q3 · Who first?`)
   */
  thoughts({ all = false } = {}) {
    return Array.from(this.document.querySelectorAll("li.goals-thought"), (li) => {
      const anchor = li.parentElement?.getAttribute("data-for") ?? "page"
      return {
        id: li.id,
        for: anchor,
        label: this.labelFor(anchor),
        text: li.querySelector(".goals-thought-text")?.textContent.trim() ?? "",
        date: li.querySelector("time")?.getAttribute("datetime") ?? "",
        status: li.getAttribute("data-status") ?? "new",
        result: li.querySelector(".goals-thought-result")?.textContent.trim() ?? ""
      }
    }).filter((thought) => all || thought.status === "new")
  }

  /** The list holding thoughts for `anchor`, made where it belongs if missing. */
  thoughtList(anchor) {
    const existing = this.document.querySelector(`ul.goals-thoughts[data-for="${anchor}"]`)
    if (existing) return existing
    const list = this.element("ul", { class: "goals-thoughts", "data-for": anchor })
    if (anchor === "page") {
      this.require("header.goals-hero").after(list)
      return list
    }
    const target = this.document.getElementById(anchor)
    if (!target) throw new GoalsError(`no "${anchor}" on this page`)
    if (target.localName === "li" && target.closest("ol.plan-items")) {
      const details = target.querySelector(":scope > ui-accordion")
      if (details) details.before(list)
      else target.append(list)
      return list
    }
    if (/^h[234]$/.test(target.localName)) {
      const sticky = target.closest("ui-sticky") ?? target
      sticky.after(list)
      return list
    }
    throw new GoalsError(`"${anchor}" is neither an item nor a section heading`)
  }

  /** What `anchor` is, for a reader:  `Q3 · Who first?`, `Questions`, `the page`. */
  labelFor(anchor) {
    if (anchor === "page") return "the page"
    const target = this.document.getElementById(anchor)
    if (!target) return anchor
    if (target.localName === "li") {
      const title = target.querySelector(".plan-title")?.textContent.trim()
      return `${anchor.toUpperCase()}${title ? ` · ${title}` : ""}`
    }
    return target.textContent.replace(/^\s*\d+\.\s*/, "").trim()
  }

  ////////////////
  // ## Status, history, stamps
  ////////////////

  /**
   * Set the topic's status:  `<body data-status>`, the hero's label and the line after it.
   * - logs the change in the history
   */
  setStatus(status) {
    const spec = STATUS[status]
    if (!spec) throw new GoalsError(`status must be ${Object.keys(STATUS).join(" / ")}, not "${status}"`)
    const before = this.meta.status
    this.document.body.setAttribute("data-status", status)
    const label = this.require("ui-label.goals-status")
    label.setAttribute("color", spec.color)
    label.textContent = spec.label
    const item = label.closest("ui-item")
    if (item) item.innerHTML = `Status: ${label.outerHTML} · ${text(spec.note)}`
    if (before !== status) this.log(`Status:  ${STATUS[before]?.label ?? before} → ${spec.label}`, "flag")
  }

  /**
   * Add an entry to the history, newest first, dated today.
   * - `icon`:  `comments` (a dialog, the default), `gavel` (a decision), `flag` (status), `pen to square` (edits),
   *   `comment dots` (thoughts digested), `robot` (agent work), `rocket` (shipped)
   */
  log(line, icon = "comments") {
    const feed = this.require("ui-feed.goals-history")
    const event = this.element("ui-event", { icon })
    event.innerHTML = `<ui-content><ui-summary>${inline(line)} <ui-date>${this.today}</ui-date></ui-summary></ui-content>`
    feed.prepend(event)
  }

  /** Stamp "updated" with today. */
  touch() {
    const updated = this.document.querySelector("time.goals-updated")
    if (updated) updated.textContent = this.today
  }

  /**
   * Links to other goals pages open in the SAME tab:  `target="_self"` on relative `.html` links without a target.
   * - the goals pages read like a website;  `tidy()`'s `doc-links.js` gives every other link a named new-tab
   *   target, but skips links that already have one
   */
  retarget() {
    for (const a of this.document.querySelectorAll("a[href]:not([target])")) {
      const href = a.getAttribute("href")
      if (!/^[a-z]+:/i.test(href) && /\.html(#.*)?$/.test(href)) a.setAttribute("target", "_self")
    }
  }

  /** Counts and open items, for `summary` and the contents pages. */
  summary() {
    return {
      ...this.meta,
      goals: this.open("goal"),
      ideas: this.open("idea"),
      questions: this.open("question"),
      risks: this.open("risk"),
      decisions: this.open("decision"),
      work: this.open("work"),
      thoughts: this.thoughts()
    }
  }

  /**
   * Structural problems, as text:  duplicate ids, `#id` links to nowhere, items and thoughts out of shape;  on a
   * topic, a bad status, accent or missing `data-*`.
   */
  check() {
    const problems = []
    const seen = new Map()
    for (const el of this.document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    for (const [id, count] of seen) if (count > 1) problems.push(`id "${id}" used ${count} times`)
    for (const a of this.document.querySelectorAll('a[href^="#"]')) {
      const id = a.getAttribute("href").slice(1)
      if (id && !seen.has(id)) problems.push(`link to missing #${id} ("${a.textContent.trim()}")`)
    }
    for (const li of this.document.querySelectorAll("li.goals-thought"))
      if (!/^t\d+$/.test(li.id)) problems.push(`thought with id "${li.id}"`)
    const { name, n, status, accent, icon } = this.meta
    if (!ACCENTS.includes(accent)) problems.push(`accent "${accent}" is not one of UI's hues`)
    if (!this.document.body.hasAttribute("data-topic")) return problems
    if (!name) problems.push("no <body data-topic>")
    if (!n) problems.push("no <body data-n>")
    if (!icon) problems.push("no <body data-icon>")
    if (!STATUS[status]) problems.push(`status "${status}" is not one of ${Object.keys(STATUS).join(" / ")}`)
    for (const [kind, { prefix }] of Object.entries(KINDS)) {
      for (const item of this.items(kind)) {
        if (!new RegExp(`^${prefix}\\d+$`).test(item.id)) problems.push(`${kind} item has id "${item.id}"`)
        if (!item.title) problems.push(`${item.id} has no .plan-title`)
      }
    }
    return problems
  }

  ////////////////
  // ## DOM helpers
  ////////////////

  /** The element matching `selector`;  throws if the page doesn't have it (not a topic page, or a broken one). */
  require(selector) {
    const found = this.document.querySelector(selector)
    if (!found) throw new GoalsError(`no ${selector} in the page:  is it a topic page?`)
    return found
  }

  /** New element with attributes. */
  element(tag, attributes = {}) {
    const el = this.document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, String(value))
    return el
  }
}

////////////////
// ## Contents pages
////////////////

/**
 * A set's contents page's generated parts, from its topics' summaries:  the topic cards and the headline numbers.
 * - written between `<!-- topics:start -->` / `<!-- topics:end -->` and `<!-- stats:start -->` /
 *   `<!-- stats:end -->`;  everything else on the page is hand-written
 * - pure:  summaries in, HTML text out
 */
export function contentsParts(topics) {
  const sorted = [...topics].sort((a, b) => a.n - b.n)
  const cards = sorted.map((topic) => {
    const status = STATUS[topic.status] ?? STATUS.draft
    // open questions always;  the rest once there are any, so a draft card stays one line
    const counts = [
      count(topic.questions.length, "question"),
      topic.decisions.length ? count(topic.decisions.length, "decision") : "",
      topic.work.length ? count(topic.work.length, "work item", "work items") : ""
    ].filter(Boolean)
    const thoughts = topic.thoughts.length
      ? ` <ui-label class="goals-new-thoughts" size="mini" basic><ui-icon name="comment dots"></ui-icon> ${topic.thoughts.length}</ui-label>`
      : ""
    return `<ui-card href="${topic.name}/${topic.name}.html" target="_self" data-accent="${topic.accent}" link>
  <ui-content>
    <div class="goals-card-top"><span class="goals-num">${topic.n}</span><ui-icon name="${attr(topic.icon)}"></ui-icon></div>
    <div class="goals-short">${text(topic.short || topic.name)}</div>
    <ui-meta>${text(topic.title)}</ui-meta>
    <ui-description>${text(topic.description)}</ui-description>
  </ui-content>
  <ui-extra><div class="goals-card-foot"><ui-label size="mini" color="${status.color}">${status.label}</ui-label> ${counts.map((c) => `<span>${c}</span>`).join(" · ")}${thoughts}</div></ui-extra>
</ui-card>`
  })
  const total = (key) => sorted.reduce((sum, topic) => sum + topic[key].length, 0)
  const agreed = sorted.filter((topic) => topic.status !== "draft" && topic.status !== "dialog").length
  return {
    topics: `<ui-cards class="goals-topics" stackable>\n${cards.join("\n")}\n</ui-cards>`,
    stats: statistics([
      [sorted.length, "topics"],
      [total("questions"), "open questions"],
      [total("decisions"), "decisions"],
      [`${agreed}/${sorted.length}`, "agreed"]
    ])
  }
}

/**
 * The home page's generated parts:  one card per goal set, and the headline numbers.
 * - `sets`:  `{ name, title, description, icon, accent, topics: [summary] }`
 */
export function homeParts(sets) {
  const cards = sets.map((set) => {
    const questions = set.topics.reduce((sum, topic) => sum + topic.questions.length, 0)
    const thoughts = set.topics.reduce((sum, topic) => sum + topic.thoughts.length, 0)
    const counts = [count(set.topics.length, "topic"), count(questions, "open question")]
    if (thoughts) counts.push(count(thoughts, "new thought"))
    return `<ui-card href="${set.name}/index.html" target="_self" data-accent="${set.accent}" link>
  <ui-content>
    <div class="goals-card-top"><span class="goals-short">${text(set.name)}</span><ui-icon name="${attr(set.icon || "bullseye")}"></ui-icon></div>
    <ui-meta>${text(set.title)}</ui-meta>
    <ui-description>${text(set.description)}</ui-description>
  </ui-content>
  <ui-extra><div class="goals-card-foot">${counts.map((c) => `<span>${c}</span>`).join(" · ")}</div></ui-extra>
</ui-card>`
  })
  const topics = sets.reduce((sum, set) => sum + set.topics.length, 0)
  const thoughts = sets.reduce((sum, set) => sum + set.topics.reduce((n, topic) => n + topic.thoughts.length, 0), 0)
  return {
    sets: `<ui-cards class="goals-topics goals-sets" stackable>\n${cards.join("\n")}\n</ui-cards>`,
    stats: statistics([
      [sets.length, sets.length === 1 ? "goal set" : "goal sets"],
      [topics, "topics"],
      [thoughts, "new thoughts"]
    ])
  }
}

/** `<ui-statistics>` of `[value, label]` pairs. */
function statistics(pairs) {
  return `<ui-statistics class="spell-stats goals-stats" size="mini">\n${pairs
    .map(([value, label]) => `<ui-statistic value="${value}" label="${label}"></ui-statistic>`)
    .join("\n")}\n</ui-statistics>`
}

/** `n thing(s)`. */
function count(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

/** Replace what's between `<!-- key:start -->` and `<!-- key:end -->` in `html` with `inner`. */
export function replaceBetween(html, key, inner) {
  const pattern = new RegExp(`(<!-- ${key}:start -->)[\\s\\S]*?(<!-- ${key}:end -->)`)
  if (!pattern.test(html)) throw new GoalsError(`no <!-- ${key}:start --> / <!-- ${key}:end --> markers`)
  return html.replace(pattern, (_, start, end) => `${start}\n${inner}\n${end}`)
}

////////////////
// ## Helpers
////////////////

/** Escape for HTML text. */
export function text(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Escape for a double-quoted attribute. */
export function attr(value) {
  return text(value).replace(/"/g, "&quot;")
}

/** Escape for HTML text, with `backticked` runs as `<code>`:  item titles and notes. */
export function inline(value) {
  return text(value).replace(/`([^`]+)`/g, "<code>$1</code>")
}

/** Plain text as HTML:  blank lines split paragraphs, single newlines become `<br>`. */
function paragraphs(value) {
  const parts = value.split(/\n\s*\n/).map((part) => inline(part.trim()).replace(/\n/g, "<br />"))
  return parts.length > 1 ? parts.map((part) => `<p>${part}</p>`).join("") : parts[0]
}

/** `date`'s local date, `YYYY-MM-DD`. */
export function isoDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** `<time>` for `date`, local:  shows `YYYY-MM-DD HH:MM`, `datetime` carries the offset. */
export function timeTag(date = new Date()) {
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  const minutes = -date.getTimezoneOffset()
  const offset = `${minutes < 0 ? "-" : "+"}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, "0")}:${String(
    Math.abs(minutes) % 60
  ).padStart(2, "0")}`
  return `<time datetime="${isoDate(date)}T${clock}${offset}">${isoDate(date)} ${clock}</time>`
}
