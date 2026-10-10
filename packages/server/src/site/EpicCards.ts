/**
 * The Epics page's cards (`epics/index.html`), drawn alike by everything that writes them
 * (epic `airplane` P8, Owen 2026-10-10:  "Divide the epics cards into groups - favorites - active - planning -
 * urgent stuff to do - done done.  Within those bins, sort alphabetically"):
 * - five GROUPS, in `EPIC_GROUPS`' order, each under a small heading with its count (`epicGroupsHtml()`):
 *   - Favorites:  the epics Owen starred, whatever their state;  a starred epic shows ONLY here
 *   - Active:  phases left, in progress or paused (a paused one keeps its grey mark)
 *   - Planning:  future epics, and epics still being planned (no phases yet)
 *   - Urgent:  every phase done, items waiting on Owen (the `errors` state)
 *   - Done:  every phase done, nothing waiting
 *   - alphabetical by title within each;  an empty group is in the markup, `hidden`
 * - each card (`epicCardHtml()`):  the state's mark and the linked title, description, meta line;
 *   a STAR at its top right (`epicStarHtml()`:  click to star / unstar, the docs runtime's "Favorite epics");
 *   the date it was last worked on at its bottom right, without the year (`epicWorkedHtml()`:  `10/9`)
 * - favourites are stored in ONE shared file, `FAVORITES_FILE` (`["airplane", "spell-element"]`):
 *   the page server's route writes it (`packages/epics/src/tool/epicRoutes.ts`), every checkout reads it
 *
 * Who draws them:
 * - the docs index (`packages/docs/tools/index.js`), plain `node`:  it imports this FILE by path
 * - the page server (`$/server/page` `RunningEpics`), which adds the running epics' cards, re-marks every card
 *   and regroups them by the favourites as it serves the page
 * - the docs runtime moves a card between groups when its star is clicked (plain DOM:  it reads `data-group`)
 *
 * Its position:  browser-safe, and imports ONLY `./EpicState.ts`, by its file name (plain `node` resolves nothing
 * else).  NEVER another import, an `enum` or a parameter property:  plain `node` can't strip those.
 */
import { epicStateFor, epicStateMark, type EpicFacts, type EpicState } from "./EpicState.ts"

/** The Epics page's groups, in the page's order. */
export const EPIC_GROUPS = ["favorites", "active", "planning", "urgent", "done"] as const

/** One of `EPIC_GROUPS`. */
export type EpicGroupName = (typeof EPIC_GROUPS)[number]

/** Where the favourites are kept, from a checkout's root:  a JSON list of epic names (shared content). */
export const FAVORITES_FILE = "epics/favorites.json"

/** The Epics page's own markers around its groups:  the page server rewrites what's between (`RunningEpics`). */
export const EPIC_CARDS_START = "<!-- running-epics -->"
export const EPIC_CARDS_END = "<!-- running-epics:end -->"

/** How each group's heading reads:  its title and icon (an icon of the docs bundle's `ICONS`). */
const GROUP_LOOKS: Record<EpicGroupName, { title: string; icon: string }> = {
  favorites: { title: "Favorites", icon: "star" },
  active: { title: "Active", icon: "circle half stroke" },
  planning: { title: "Planning", icon: "seedling" },
  urgent: { title: "Urgent", icon: "circle exclamation" },
  done: { title: "Done", icon: "circle check" }
}

/**
 * One epic's card, as `epicCardHtml()` draws it.
 * - `name`:  the epic (its folder);  `title`:  its plan doc's title, without `Epic: `
 * - `href` / `target`:  the link to its plan doc
 * - `description`:  its `<meta name="description">`, if any
 * - `meta`:  the meta line, as text:  `P8 · Review Polish · epics/airplane/airplane.plan.html`
 * - `facts`:  what its state is read from (`EpicState`)
 * - `worked`:  when it was last worked on (`lastWorked()`), if known
 * - `favorite`:  Owen starred it
 */
export type EpicCard = {
  name: string
  title: string
  href: string
  target?: string
  description?: string
  meta: string
  facts: EpicFacts
  worked?: Date
  favorite?: boolean
}

/** A card's markup, with what `epicGroupsHtml()` places it by:  its group (favourites already decided), its title. */
export type PlacedCard = { group: EpicGroupName; title: string; html: string }

/**
 * The group an epic shows in when it isn't a favourite, from its state:
 * errors are Urgent, done is Done, future is Planning;
 * in progress or paused is Active with phases, Planning without (`state.count` is `""` with no phases).
 */
export function epicGroupFor(state: EpicState): Exclude<EpicGroupName, "favorites"> {
  if (state.name === "errors") return "urgent"
  if (state.name === "done") return "done"
  if (state.name === "future" || !state.count) return "planning"
  return "active"
}

/**
 * Epic `card`'s markup on the Epics page, as of `now`, with where it goes.
 * - `id="epic-<name>"`:  a live update of the page matches the card by it, wherever it moved
 * - `data-epic`:  its name;  `data-title`:  what the groups sort by;  `data-group`:  its group when not a favourite
 * - `data-status`:  `done` or `open`, so the section counts it and its filter steps through them
 * - `data-phases`, `data-updated`, `data-urgent`, `data-future`:  what its state is read from, so the page server
 *   marks it again as it serves the page;  `data-worked`:  its last-worked moment
 */
export function epicCardHtml(card: EpicCard, now: Date = new Date()): PlacedCard {
  const { name, title, facts, worked, favorite = false } = card
  const state = epicStateFor(facts, now)
  const group = epicGroupFor(state)
  const data =
    ` data-epic="${attr(name)}" data-title="${attr(title)}" data-group="${group}"` +
    ` data-status="${state.name === "done" ? "done" : "open"}"` +
    ` data-phases="${attr(facts.phases.join(" "))}"` +
    (facts.updated ? ` data-updated="${attr(facts.updated)}"` : "") +
    (facts.urgent?.length ? ` data-urgent="${attr(facts.urgent.join(" "))}"` : "") +
    (facts.future ? " data-future" : "") +
    (worked ? ` data-worked="${isoLocal(worked)}"` : "")
  const target = card.target ? ` target="${attr(card.target)}"` : ""
  const html =
    `<ui-card id="epic-${attr(name)}"${data}><ui-content>\n` +
    `<ui-header>${epicStateMark(state)} <a href="${attr(card.href)}"${target}>${text(title)}</a></ui-header>\n` +
    (card.description ? `<ui-description>${text(card.description)}</ui-description>\n` : "") +
    `<ui-meta>${text(card.meta)}</ui-meta>\n` +
    `</ui-content>${epicStarHtml(name, favorite)}${worked ? epicWorkedHtml(worked) : ""}</ui-card>`
  return { group: favorite ? "favorites" : group, title, html }
}

/**
 * The cards in their groups, as the Epics page shows them:  each group a `div.spell-epic-group[data-group]`
 * holding its heading (title, count) and a `ui-cards.spell-epics` of its cards, alphabetical by title.
 * - every group is written, an empty one `hidden`:  the runtime moves a card into it when it's starred
 */
export function epicGroupsHtml(cards: readonly PlacedCard[]): string {
  return EPIC_GROUPS.map((group) => {
    // `filter()` makes a new array, so sorting it in place leaves `cards` alone (no `toSorted()`:  every package that
    // type-checks this file must know it, and `cli`'s target doesn't)
    const mine = cards.filter((card) => card.group === group).sort((a, b) => byTitle(a.title, b.title))
    const { title, icon } = GROUP_LOOKS[group]
    return (
      `<div class="spell-epic-group" data-group="${group}"${mine.length ? "" : " hidden"}>\n` +
      `<div class="spell-epic-group-title" role="heading" aria-level="3"><ui-icon name="${icon}"></ui-icon> ${title} ` +
      `<span class="spell-epic-group-count">${mine.length}</span></div>\n` +
      `<ui-cards class="spell-grid spell-epics" stackable>\n${mine.map((card) => card.html).join("\n")}\n</ui-cards>\n` +
      `</div>`
    )
  }).join("\n")
}

/** How the groups sort their cards:  by title, ignoring case, numbers as numbers. */
export function byTitle(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base", numeric: true })
}

/**
 * The star at a card's top right:  a button, `aria-pressed` while it's a favourite.
 * - the browser's own tooltip (`title`) and an `aria-label`:  it's an icon alone
 * - a solid star when starred, else its outline;  `spell-doc.css` colours it
 */
export function epicStarHtml(name: string, favorite: boolean): string {
  const label = favorite ? `Unstar ${name}` : `Star ${name}`
  const tip = favorite ? "A favorite:  listed first.  Click to unstar" : "Star it:  listed first, under Favorites"
  return (
    `<button type="button" class="spell-epic-star" aria-pressed="${favorite}" aria-label="${attr(label)}" ` +
    `title="${tip}"><ui-icon name="${favorite ? "star" : "star outline"}"></ui-icon></button>`
  )
}

/**
 * The last-worked date at a card's bottom right:  month and day, no year (`10/9`);
 * its `title` the full date and time, as plan docs draw dates (`10/9/26 14:34`).
 */
export function epicWorkedHtml(worked: Date): string {
  return (
    `<time class="spell-epic-worked" datetime="${isoLocal(worked)}" ` +
    `title="Last worked on ${fullDate(worked)}">${worked.getMonth() + 1}/${worked.getDate()}</time>`
  )
}

/**
 * The latest of `values`, each a date as plan docs and git write them (`readEpicDate()`);
 * `undefined` when none reads.
 * - "last worked on":  the plan doc's `updated` day, its last log line's time, its branch's last commit
 */
export function lastWorked(values: readonly (string | null | undefined)[]): Date | undefined {
  let latest: Date | undefined
  for (const value of values) {
    const date = readEpicDate(value)
    if (date && (!latest || date > latest)) latest = date
  }
  return latest
}

/** Every log line's time in plan-doc markup `html` (`<epic-event at="...">`), in the order written. */
export function eventTimesIn(html: string): string[] {
  return Array.from(html.matchAll(EVENT_TIME), (match) => match[1]!)
}

/**
 * `value` as a moment:  `2026-10-08` (local midnight), `2026-10-08 14:34` (local), or ISO with an offset
 * (`2026-10-08T14:34-04:00`, git's `%cI`);  `undefined` when it won't read.
 * - SAME reading as `PlanDates.read()` (`$/epics/dates`), which this file can't import:  change both
 */
export function readEpicDate(value: string | null | undefined): Date | undefined {
  const match = DATE.exec(value?.trim() ?? "")
  if (!match) return undefined
  const [, year, month, day, hours = "00", minutes = "00", seconds = "00", offset] = match
  const date = offset
    ? new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}${zone(offset)}`)
    : new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds))
  return isNaN(date.getTime()) ? undefined : date
}

/** The favourites file's text as a set of epic names;  empty when it isn't a JSON list.  NEVER throws. */
export function parseFavorites(json: string | undefined): Set<string> {
  try {
    const list: unknown = JSON.parse(json ?? "[]")
    return new Set(Array.isArray(list) ? list.filter((name): name is string => typeof name === "string") : [])
  } catch {
    return new Set()
  }
}

/** A log line's time:  `<epic-event at="2026-10-09T00:26-04:00">`, `$1`. */
const EVENT_TIME = /<epic-event\b[^>]*?\sat="([^"]+)"/g

/** A date as plan docs and git write it:  year, month, day, then optionally hours, minutes, seconds, offset. */
const DATE = /^(\d{4})-(\d\d)-(\d\d)(?:[T ](\d\d):(\d\d)(?::(\d\d)(?:\.\d+)?)?\s*(Z|z|[+-]\d\d:?\d\d)?)?$/

/** Offset `offset` as ISO writes it:  `Z`, `-04:00` (from `-0400` too). */
function zone(offset: string): string {
  return offset.toUpperCase() === "Z" ? "Z" : offset.replace(/^([+-]\d\d):?(\d\d)$/, "$1:$2")
}

/** `date`, local, as plan docs draw a date with its time (`PlanDates.formatDate()`):  `10/9/26 14:34`. */
function fullDate(date: Date): string {
  const two = (value: number) => String(value).padStart(2, "0")
  return (
    `${date.getMonth() + 1}/${date.getDate()}/${two(date.getFullYear() % 100)} ` +
    `${two(date.getHours())}:${two(date.getMinutes())}`
  )
}

/** `date` as local ISO with its offset, to the minute:  `2026-10-09T14:34-04:00`. */
function isoLocal(date: Date): string {
  const two = (value: number) => String(Math.floor(Math.abs(value))).padStart(2, "0")
  const offset = -date.getTimezoneOffset()
  return (
    `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}` +
    `T${two(date.getHours())}:${two(date.getMinutes())}` +
    `${offset < 0 ? "-" : "+"}${two(offset / 60)}:${two(offset % 60)}`
  )
}

/** `value` as HTML text. */
function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** `value` as a double-quoted attribute. */
function attr(value: string): string {
  return text(value).replace(/"/g, "&quot;")
}
