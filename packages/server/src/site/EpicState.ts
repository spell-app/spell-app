/**
 * An epic's STATE, the ONE rule every list and page draws it by (Owen, 2026-10-10, epic `airplane` P8):
 * - `progress` -- in progress:  phases left (or none yet), and touched lately:
 *   a Claude session running for it, or its doc updated in the last `PAUSED_DAYS` days
 * - `errors` -- every phase done, but items still need Owen (`URGENT_STATES`:  red and orange chips)
 * - `done` -- every phase done, nothing needs Owen
 * - `paused` -- phases left, and untouched for `PAUSED_DAYS` days or more, no session running
 *   (`shared-content`, open phases, nobody on it since 2026-10-06)
 * - `future` -- written down with `/epic future`, not planned yet
 *
 * Who draws it:
 * - the docs index's epic cards (`packages/docs/tools/index.js`), plain `node`:  it imports this FILE by path
 * - the page server's live cards on the Epics page (`$/server/page` `RunningEpics`), which re-mark every card
 * - `<epic-page>`'s header mark (`packages/epics`), in the browser
 * - the session titles' icons (`spell dev session icons`, `packages/cli`)
 *
 * Its position:  browser code with NO imports at all, so plain `node` loads it (types stripped),
 * the epics pack bundles it, and the server stays a leaf.
 * - NEVER give it an import, an `enum` or a parameter property:  plain `node` can't strip those.
 * - Colours and icons are the colour scheme's (`templates/epics/plan-doc.md`, "Colours"):
 *   in progress blue, errors red, done green, paused and future grey;
 *   icons from the docs bundle's `ICONS` (`packages/docs/tools/bundle-spell-ui.js`), the only ones that draw.
 */

/** Every epic state, in the order the Epics list sorts them:  what needs a look first. */
export const EPIC_STATES = ["progress", "errors", "paused", "future", "done"] as const

/** One of `EPIC_STATES`. */
export type EpicStateName = (typeof EPIC_STATES)[number]

/**
 * What an epic's state is read from:  its plan doc's skeleton, and whether a session runs for it.
 * - `phases`:  each `<epic-phase>`'s `status` (`done`, `active`, `todo`), in order
 * - `updated`:  `<epic-page updated>`, `YYYY-MM-DD`:  the plan-doc tool stamps it on every write
 * - `future`:  `<epic-page future>`
 * - `urgent`:  the ids of the items that need Owen (`URGENT_SELECTOR`), e.g. `["q3", "j12"]`
 * - `running`:  a Claude session is running for it (in its worktree, or titled for it)
 * - `active`:  the phase under way's label (`P8 · Review Polish`), for the tooltip
 */
export type EpicFacts = {
  phases: readonly string[]
  updated?: string | null
  future?: boolean
  urgent?: readonly string[]
  running?: boolean
  active?: string
}

/**
 * An epic's state, as drawn.
 * - `name`:  which state
 * - `words`:  its name in words, `in progress`
 * - `color` / `icon`:  how it's drawn (UI's colour names;  an icon of the bundle's `ICONS`)
 * - `tip`:  the tooltip:  the state, then why, e.g. `paused:  no update since 2026-10-06, 6/8 phases done`
 * - `count`:  phases done of all, `6/8`;  `""` with no phases
 */
export type EpicState = {
  name: EpicStateName
  words: string
  color: string
  icon: string
  tip: string
  count: string
}

/** Days without an update (and no session running) after which an epic with phases left is `paused`. */
export const PAUSED_DAYS = 3

/** An item's `state` that needs Owen:  `attention` (red:  needs you), `replied` (orange:  waiting for your pick). */
export const URGENT_STATES = ["attention", "replied"] as const

/** A plan doc's items that need Owen (`URGENT_STATES`), for `querySelectorAll()`. */
export const URGENT_SELECTOR = URGENT_STATES.map((state) => `epic-item[id][state="${state}"]`).join(", ")

/** How each state is drawn:  words, colour, icon. */
const LOOKS: Record<EpicStateName, { words: string; color: string; icon: string }> = {
  progress: { words: "in progress", color: "blue", icon: "circle half stroke" },
  errors: { words: "errors", color: "red", icon: "circle exclamation" },
  paused: { words: "paused", color: "grey", icon: "circle pause" },
  future: { words: "future", color: "grey", icon: "seedling" },
  done: { words: "done", color: "green", icon: "circle check" }
}

/** An urgent item's kind, by its id's letter, one and many. */
const KINDS: Record<string, readonly [string, string]> = {
  q: ["question", "questions"],
  j: ["judgement call", "judgement calls"],
  i: ["issue", "issues"],
  t: ["todo", "todos"],
  v: ["test", "tests"],
  c: ["caveat", "caveats"]
}

/**
 * Epic `facts`' state, at time `now` (`EPIC_STATES`).
 * - pure:  a test passes its own `now`
 * - "touched lately":  a session running, or `updated` less than `PAUSED_DAYS` calendar days before `now`'s;
 *   no `updated` counts as lately (nothing to go by)
 */
export function epicStateFor(facts: EpicFacts, now: Date = new Date()): EpicState {
  const { phases, updated, future = false, urgent = [], running = false, active } = facts
  const done = phases.filter((status) => status === "done").length
  const count = phases.length ? `${done}/${phases.length}` : ""
  if (future && !phases.length) return stateOf("future", "not planned yet")
  if (phases.length && done === phases.length) {
    if (urgent.length) return stateOf("errors", `every phase done, but ${urgentWords(urgent)} need you`)
    return stateOf("done", "every phase done, nothing needs you")
  }
  const idle = idleDays(updated, now)
  if (!running && idle !== undefined && idle >= PAUSED_DAYS) {
    return stateOf("paused", `no update since ${updated}${count ? `, ${count} phases done` : ", no phases yet"}`)
  }
  const why = running ? "a session is running" : updated ? `updated ${updated}` : ""
  const where = active ? `${active} under way` : phases.length ? `${count} phases done` : "planning, no phases yet"
  return stateOf("progress", why ? `${where}, ${why}` : where)

  /** State `name`, with `reason` after it in the tooltip. */
  function stateOf(name: EpicStateName, reason: string): EpicState {
    return { name, ...LOOKS[name], tip: `${LOOKS[name].words}:  ${reason}`, count }
  }
}

/**
 * `state`'s mark before an epic card's title, as HTML:
 * - in progress:  the phase count (`6/8`, or `planning`) in a small blue outlined label
 * - the rest:  its icon, in its colour
 * - the tooltip says which state, and why
 */
export function epicStateMark(state: EpicState): string {
  const tip = escape(state.tip)
  if (state.name === "progress") {
    return `<ui-label class="spell-epic-state" size="mini" color="blue" basic title="${tip}">${state.count || "planning"}</ui-label>`
  }
  return `<ui-icon class="spell-epic-state" name="${state.icon}" color="${state.color}" title="${tip}"></ui-icon>`
}

/** Urgent item `ids` in words, by kind, in `KINDS`' order:  `2 questions, 1 judgement call`. */
export function urgentWords(ids: readonly string[]): string {
  const counts = new Map<string, number>()
  for (const id of ids) {
    const letter = id[0]?.toLowerCase() ?? ""
    if (KINDS[letter]) counts.set(letter, (counts.get(letter) ?? 0) + 1)
  }
  const words = Object.keys(KINDS)
    .filter((letter) => counts.has(letter))
    .map((letter) => `${counts.get(letter)} ${KINDS[letter]![counts.get(letter) === 1 ? 0 : 1]}`)
  return words.join(", ") || `${ids.length} item${ids.length === 1 ? "" : "s"}`
}

/**
 * Whole calendar days from day `updated` (`YYYY-MM-DD`, local) to `now`'s day:  `0` the same day;
 * `undefined` without a date.
 */
export function idleDays(updated: string | null | undefined, now: Date = new Date()): number | undefined {
  const day = /^(\d{4})-(\d\d)-(\d\d)/.exec(updated ?? "")
  if (!day) return undefined
  const then = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]))
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today.getTime() - then.getTime()) / 86_400_000)
}

/** `value` for a double-quoted attribute. */
function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
