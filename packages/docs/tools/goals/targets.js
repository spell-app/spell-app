/**
 * Goal sets, preferences and targets:  what `spell/motivation/G1` means, for every goals tool.
 * - A goals folder holds `goals.preferences.json5`, a home page (`index.html`) and one folder per goal SET:
 *   `<set>/index.html` (its contents page, `body[data-set]`) and one folder per TOPIC,
 *   `<set>/<topic>/<topic>.html` (for people) beside `<set>/<topic>/<topic>.md` (for agents).
 * - A TARGET names a set, a topic, or one place on a page:  `[set/]topic[/anchor]`
 *   - set:  may be left out when the preferences name an active set (`activeSet`)
 *   - topic:  its folder (`spell-ui`) or its short name (`spell/ui`, `AI`), any case
 *   - anchor:  an item (`G1`, `q3`), a thought (`T2`), or a section's id (`questions`, `now`);  a set's own page
 *     takes section anchors too (`spell/arc`)
 * - Pure reads:  nothing here writes, except `setPreference()`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import JSON5 from "json5"

/**
 * The project root:  what the page server serves, and where Claude sessions start.
 * - this file is `packages/docs/tools/goals/targets.js`:  four folders up
 */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")
/**
 * The goals folder:  `GOALS_DIR` when set (`spell goals` sets it to the folder it found), else `<ROOT>/goals`.
 * - content only (pages, preferences)
 * - NEVER found relative to the tools:  it may be a symlink into a peer content repo
 */
export const GOALS = process.env.GOALS_DIR ? resolve(process.env.GOALS_DIR) : join(ROOT, "goals")
/** The preferences file. */
export const PREFERENCES = join(GOALS, "goals.preferences.json5")

/** Preferences when the file leaves something out. */
const DEFAULTS = {
  activeSet: "",
  server: { port: 4747 },
  browser: "Google Chrome",
  terminal: "Terminal",
  claude: { command: "claude", args: [] },
  horizons: { now: "Now", next: "Next", someday: "Someday" }
}

/** An item's or thought's id:  a kind letter, then a number. */
export const ITEM_ID = /^[gidqrwt]\d+$/i

////////////////
// ## Preferences
////////////////

/** The preferences, over the defaults.  A missing file is all defaults. */
export function preferences() {
  const text = existsSync(PREFERENCES) ? readFileSync(PREFERENCES, "utf8") : "{}"
  return merge(DEFAULTS, JSON5.parse(text))
}

/**
 * Set top-level preference `key` to the string `value`, keeping the file's comments and layout.
 * - SIDE EFFECT:  writes `goals.preferences.json5` (makes it if missing)
 */
export function setPreference(key, value) {
  let text = existsSync(PREFERENCES) ? readFileSync(PREFERENCES, "utf8") : "{\n}\n"
  const line = new RegExp(`^(\\s*)${key}\\s*:\\s*("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|[^,\\n]*)`, "m")
  if (line.test(text)) text = text.replace(line, (_, indent) => `${indent}${key}: ${JSON.stringify(value)}`)
  else text = text.replace("{", `{\n  ${key}: ${JSON.stringify(value)},`)
  writeFileSync(PREFERENCES, text)
}

/** `base` with `over` merged in, objects deeply, everything else replaced. */
function merge(base, over) {
  const out = { ...base }
  for (const [key, value] of Object.entries(over ?? {})) {
    const isObject = value && typeof value === "object" && !Array.isArray(value)
    out[key] = isObject && base[key] && typeof base[key] === "object" ? merge(base[key], value) : value
  }
  return out
}

////////////////
// ## Sets and topics
////////////////

/**
 * Every goal set:  `{ name, dir, index, title, description }`, by name.
 * - a set is a folder (not `_` or `.`) with an `index.html` whose `<body>` has `data-set`
 */
export function goalSets() {
  if (!existsSync(GOALS)) return []
  return folders(GOALS)
    .map((name) => ({ name, dir: join(GOALS, name), index: join(GOALS, name, "index.html") }))
    .filter((set) => existsSync(set.index) && /<body[^>]*\sdata-set=/.test(readFileSync(set.index, "utf8")))
    .map((set) => ({ ...set, ...headOf(set.index) }))
}

/** Every topic of `set` (a name):  `{ name, short, file, notes }`, by name. */
export function topicsOf(set) {
  const dir = join(GOALS, set)
  if (!existsSync(dir)) return []
  return folders(dir)
    .map((name) => ({ name, file: join(dir, name, `${name}.html`), notes: join(dir, name, `${name}.md`) }))
    .filter((topic) => existsSync(topic.file))
    .map((topic) => ({ ...topic, short: attribute(readFileSync(topic.file, "utf8"), "data-short") || topic.name }))
}

/** Folder names in `dir` that aren't `_` or `.` folders, sorted. */
function folders(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[_.]/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
}

/** A page's `<title>` and description, read cheaply. */
function headOf(file) {
  const html = readFileSync(file, "utf8")
  return {
    title: html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "",
    description: decode(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? "")
  }
}

/** Value of `<body>`'s attribute `name`, read cheaply. */
function attribute(html, name) {
  return decode(html.match(new RegExp(`<body[^>]*\\s${name}="([^"]*)"`))?.[1] ?? "")
}

/** HTML entities a title or attribute may carry. */
function decode(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

////////////////
// ## Targets
////////////////

/** A target that can't be resolved;  `choices` are what the person could have meant (sets, topics, anchors). */
export class TargetError extends Error {
  constructor(message, choices = []) {
    super(message)
    this.choices = choices
  }
}

/**
 * What `text` names, as a `Target`.
 * - no set in `text` and no active set:  throws a `TargetError` whose `choices` are the sets, so a skill can ask
 * - the set may be left out even when a topic shares its name:  the explicit reading wins, then the active set's
 */
export function resolveTarget(text = "", prefs = preferences()) {
  const raw = String(text)
    .trim()
    .replace(/^\/+|\/+$/g, "")
  const sets = goalSets()
  const names = sets.map((set) => set.name)
  if (!sets.length) throw new TargetError(`no goal sets in ${relative(process.cwd(), GOALS) || "."}`)
  const active = names.includes(prefs.activeSet) ? prefs.activeSet : names.length === 1 ? names[0] : ""
  const parts = raw ? raw.split("/") : []
  const named = names.find((name) => name.toLowerCase() === parts[0]?.toLowerCase())
  const failures = []
  for (const [set, rest] of [named && [named, parts.slice(1)], active && [active, parts]].filter(Boolean)) {
    try {
      return within(set, rest)
    } catch (error) {
      if (!(error instanceof TargetError)) throw error
      failures.push(error)
    }
  }
  if (failures.length) throw failures[0]
  throw new TargetError(
    raw ? `which goal set has "${raw}"?` : "which goal set?",
    names.map((name) => `${name}${raw ? `/${raw}` : ""}`)
  )
}

/** The target `rest` names inside `set`. */
function within(set, rest) {
  const setPage = join(GOALS, set, "index.html")
  if (!rest.length) return target({ set, kind: "set", file: setPage })
  const topics = topicsOf(set)
  for (let take = rest.length; take >= 1; take--) {
    const name = rest.slice(0, take).join("/").toLowerCase()
    const topic = topics.find((it) => aliases(it).includes(name))
    if (!topic) continue
    const anchorText = rest.slice(take).join("/")
    if (!anchorText) return target({ set, topic: topic.name, kind: "topic", file: topic.file, notes: topic.notes })
    return target({ set, topic: topic.name, file: topic.file, notes: topic.notes, ...anchor(topic.file, anchorText) })
  }
  // a section of the set's own page, e.g. `spell/arc`
  if (rest.length === 1 && existsSync(setPage) && hasId(readFileSync(setPage, "utf8"), rest[0]))
    return target({ set, kind: "section", anchor: rest[0], file: setPage })
  throw new TargetError(
    `no topic "${rest.join("/")}" in goal set ${set}`,
    topics.map((topic) => `${set}/${topic.name}`)
  )
}

/** A topic's names:  folder, short name, and the short name with `/` as `-`, lower-cased. */
function aliases(topic) {
  const short = topic.short.toLowerCase()
  return [topic.name.toLowerCase(), short, short.replace(/\//g, "-")]
}

/** The anchor `text` names on the page in `file`:  `{ kind, anchor }`. */
function anchor(file, text) {
  const html = readFileSync(file, "utf8")
  const id = ITEM_ID.test(text) ? text.toLowerCase() : text
  if (!hasId(html, id)) {
    const ids = Array.from(html.matchAll(/\sid="([a-z][\w-]*)"/g), (match) => match[1])
    throw new TargetError(`no "${text}" on ${relative(GOALS, file)}`, ids)
  }
  const kind = ITEM_ID.test(id) ? (id.startsWith("t") ? "thought" : "item") : "section"
  return { kind, anchor: id }
}

/** Whether `html` has an element with id `id`. */
function hasId(html, id) {
  return new RegExp(`\\sid="${id.replace(/[^\w-]/g, "")}"`).test(html)
}

/**
 * A resolved target.
 * - `name`:  canonical, e.g. `spell/motivation/G1` (items upper-cased, sections as they are)
 * - `path`:  the page's URL path on the goals server, from the project root, with the anchor as its hash
 */
function target({ set, topic, kind, anchor: id, file, notes }) {
  const shown = id && ITEM_ID.test(id) ? id.toUpperCase() : id
  const path = `/${relative(ROOT, file).split(sep).map(encodeURIComponent).join("/")}${id ? `#${id}` : ""}`
  return {
    set,
    topic,
    kind,
    anchor: id,
    file,
    notes,
    path,
    name: [set, topic, shown].filter(Boolean).join("/")
  }
}
