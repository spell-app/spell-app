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
 * - each card (`epicCardHtml()`):
 *   - the state's mark and the linked title, description, meta line
 *   - a STAR at its top right (`epicStarHtml()`):  click to star / unstar, the docs runtime's "Favorite epics"
 *   - the date it was last worked on at its bottom right, without the year (`epicWorkedHtml()`:  `10/9`)
 * - favourites are stored in ONE shared file, `FAVORITES_FILE` (`["airplane", "spell-element"]`):
 *   the page server's route writes it (`packages/epics/src/tool/epicRoutes.ts`), every checkout reads it (JSON5, its
 *   old `favorites.json` while there's no `.json5`:  `DataFile`, which the callers read it through)
 * - SAGAS (epic `epic-workflow` P15):  each card names the saga its epic serves, a small label (its title, its
 *   purpose the tooltip;  `epicSagaHtml()`);  above the groups, a row of SAGA CHIPS (`epicSagaChipsHtml()`), one per
 *   saga in the sagas' order and "No saga", each with its count;  the docs runtime filters the cards by them
 *   - the sagas come from the caller (`docs index` reads `sagas/sagas.json5`):  this file imports nothing
 *   - each card carries its saga in data attributes too (`data-saga`, `data-saga-title`, `data-saga-purpose`),
 *     so the page server, which can't read the sagas, draws a running epic's card from the written one
 *
 * Who draws them:
 * - `docs index` (`packages/epics/tools/index.js`), plain `node`:  it imports this FILE by path
 * - the page server, through epics' route module `runningRoutes.ts` (`RunningEpics`), which adds the running epics'
 *   cards, re-marks every card and regroups them by the favourites as it serves the page
 * - the docs runtime moves a card between groups when its star is clicked (plain DOM:  it reads `data-group`)
 *
 * Its position:  browser-safe, and imports ONLY files that load in plain `node`.
 * - each by its file name and relative path:  plain `node` resolves nothing else
 * - those files:  `./EpicState.ts`, and the epic pages' dates (`PlanDates`)
 * - NEVER an alias, an `enum` or a parameter property:  plain `node` can't strip those
 */
import { PlanDates } from "../dates/PlanDates.ts"
import { epicStateFor, epicStateMark, type EpicFacts, type EpicState } from "./EpicState.ts"

/** The Epics page's groups, in the page's order. */
export const EPIC_GROUPS = ["favorites", "active", "planning", "urgent", "done"] as const

/** One of `EPIC_GROUPS`. */
export type EpicGroupName = (typeof EPIC_GROUPS)[number]

/** Where the favourites are kept, from a checkout's root:  a JSON list of epic ids (shared content). */
export const FAVORITES_FILE = "epics/favorites.json5"

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

/** A saga, as a card's label and the chips draw it:  `sagas/sagas.json5`'s fields (`$/epics/tool/Sagas`). */
export type SagaLook = {
  /** `drawable-spell` */
  id: string
  /** "Drawable Spell" */
  title: string
  /** one line:  what it's for */
  purpose: string
}

/**
 * One epic's card, as `epicCardHtml()` draws it.
 * - `name`:  the epic (its folder);  `title`:  its epic page's title, without `Epic: `
 * - `href` / `target`:  the link to its epic page
 * - `description`:  its `<meta name="description">`, if any
 * - `meta`:  the meta line, as text:  `P8 · Review Polish · epics/airplane/airplane.plan.html`
 * - `facts`:  what its state is read from (`EpicState`)
 * - `worked`:  when it was last worked on (`lastWorked()`), if known
 * - `favorite`:  Owen starred it
 * - `saga`:  the saga it serves, if any (epic `epic-workflow` P15)
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
  saga?: SagaLook
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
 * - `data-phases`, `data-updated`, `data-urgent`, `data-future`, `data-standing`:  what its state is read from,
 *   so the page server marks it again as it serves the page
 * - `data-worked`:  its last-worked moment
 * - `data-saga`, `data-saga-title`, `data-saga-purpose`:  its saga (`epicSagaHtml()`),
 *   for the chips' filter and the page server
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
    (facts.standing ? " data-standing" : "") +
    (worked ? ` data-worked="${isoLocal(worked)}"` : "") +
    (card.saga
      ? ` data-saga="${attr(card.saga.id)}" data-saga-title="${attr(card.saga.title)}"` +
        ` data-saga-purpose="${attr(card.saga.purpose)}"`
      : "")
  const target = card.target ? ` target="${attr(card.target)}"` : ""
  const html =
    `<ui-card id="epic-${attr(name)}"${data}><ui-content>\n` +
    `<ui-header>${epicStateMark(state)} <a href="${attr(card.href)}"${target}>${text(title)}</a></ui-header>\n` +
    (card.description ? `<ui-description>${text(card.description)}</ui-description>\n` : "") +
    (card.saga ? `${epicSagaHtml(card.saga)}\n` : "") +
    `<ui-meta>${text(card.meta)}</ui-meta>\n` +
    `</ui-content>${epicStarHtml(name, favorite)}${worked ? epicWorkedHtml(worked) : ""}</ui-card>`
  return { group: favorite ? "favorites" : group, title, html }
}

/**
 * The cards in their groups, as the Epics page shows them.
 * - each group a `div.spell-epic-group[data-group]`, holding:
 *   - its heading (title, count)
 *   - a `ui-cards.spell-epics` of its cards, alphabetical by title
 * - every group is written, an empty one `hidden`:  the runtime moves a card into it when it's starred
 */
export function epicGroupsHtml(cards: readonly PlacedCard[]): string {
  return EPIC_GROUPS.map((group) => {
    // `filter()` makes a new array, so sorting it in place leaves `cards` alone.
    // No `toSorted()`:  every package that type-checks this file must know it, and `cli`'s target doesn't.
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

/**
 * A card's saga:  a small label, the saga's title, its purpose the browser's own tooltip.
 * - in the card's content, after the description:  NOT in its meta line, which the page server reads back
 */
export function epicSagaHtml(saga: SagaLook): string {
  return (
    `<ui-label class="spell-epic-saga" size="mini" basic="" icon="bullseye" title="${attr(saga.purpose)}">` +
    `${text(saga.title)}</ui-label>`
  )
}

/**
 * The SAGA CHIPS above the groups:  a button per saga, in `sagas`' order, then "No saga";  each with how many of
 * `cards` are its (`data-saga`), all pressed (showing).
 * - the docs runtime counts them again as the page changes, and filters by them (`wireSagaChips()`);  what it
 *   shows is remembered in the browser
 * - a card naming a saga that isn't in `sagas` counts as "No saga"
 */
export function epicSagaChipsHtml(sagas: readonly SagaLook[], cards: readonly PlacedCard[]): string {
  const ids = new Set(sagas.map((saga) => saga.id))
  const sagaOf = (card: PlacedCard) => {
    const id = /\sdata-saga="([^"]*)"/.exec(card.html)?.[1] ?? ""
    return ids.has(id) ? id : ""
  }
  const count = (id: string) => cards.filter((card) => sagaOf(card) === id).length
  const chip = (id: string, title: string, tip: string) =>
    `<button type="button" class="spell-saga-chip" data-saga="${attr(id)}" aria-pressed="true" title="${attr(tip)}">` +
    `${text(title)} <span class="spell-saga-count">${count(id)}</span></button>`
  return (
    `<div class="spell-saga-chips" role="group" aria-label="Show the epics of a saga">\n` +
    [...sagas.map((saga) => chip(saga.id, saga.title, saga.purpose)), chip("", NO_SAGA, NO_SAGA_TIP)].join("\n") +
    `\n</div>`
  )
}

/** The chip of the epics that name no saga. */
const NO_SAGA = "No saga"
const NO_SAGA_TIP = "Epics that name no saga yet:  epic saga set <epic> <saga>"

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
 * its `title` the full date and time, as epic pages draw dates (`10/9/26 14:34`).
 */
export function epicWorkedHtml(worked: Date): string {
  return (
    `<time class="spell-epic-worked" datetime="${isoLocal(worked)}" ` +
    `title="Last worked on ${PlanDates.formatDate(worked)}">${worked.getMonth() + 1}/${worked.getDate()}</time>`
  )
}

/**
 * The latest of `values`, each a date as epic pages and git write them (`readEpicDate()`);
 * `undefined` when none reads.
 * - "last worked on":  the epic page's `updated` day, its last log line's time, its branch's last commit
 */
export function lastWorked(values: readonly (string | null | undefined)[]): Date | undefined {
  let latest: Date | undefined
  for (const value of values) {
    const date = readEpicDate(value)
    if (date && (!latest || date > latest)) latest = date
  }
  return latest
}

/** Every log line's time in epic-page markup `html` (`<epic-event at="...">`), in the order written. */
export function eventTimesIn(html: string): string[] {
  return Array.from(html.matchAll(EVENT_TIME), (match) => match[1]!)
}

/**
 * `value` as a moment:  `2026-10-08` (local midnight), `2026-10-08 14:34` (local), or ISO with an offset
 * (`2026-10-08T14:34-04:00`, git's `%cI`);  `undefined` when it won't read.
 * - the epic pages' own reading (`PlanDates.read()`), for a value that may be missing
 */
export function readEpicDate(value: string | null | undefined): Date | undefined {
  return value ? PlanDates.read(value)?.date : undefined
}

/**
 * The favourites file's data (`FAVORITES_FILE`, read as JSON5 by the caller:  `DataFile`) as a set of epic ids;
 * empty when it isn't a list.  NEVER throws.
 */
export function favoritesIn(list: unknown): Set<string> {
  return new Set(Array.isArray(list) ? list.filter((name): name is string => typeof name === "string") : [])
}

/** A log line's time:  `<epic-event at="2026-10-09T00:26-04:00">`, `$1`. */
const EVENT_TIME = /<epic-event\b[^>]*?\sat="([^"]+)"/g

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
