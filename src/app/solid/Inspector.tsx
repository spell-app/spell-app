import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "spell/element"
import { editor } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { PropertySchemas } from "spell-ui/property"
import { ValueSets } from "spell-ui/vocabulary"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import { ClassSchemas } from "spell-app/app/ui/ClassSchemas"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { SpellElement } from "spell-app/app/runner/SpellElement"
import { InspectorCard, InspectorEvents, InspectorViews, appParts } from "./InspectorParts"
import { handlersInSource } from "./InspectorSource"
import { on } from "./on"
import { SplitPanel } from "./SplitPanel"

import "./Inspector.css"

/****************
 * ### `Inspector`
 * Look inside the running app, and change it (epic `debut` P13):  a part picked in the app, its properties to edit.
 * - Open or closed:  `<InspectorToggle>` in the App pane's header;  remembered in the browser (`OPEN_PREF`).
 * - PICKING:  while it's on, pointing at the app outlines the part under the pointer, and a click picks it:
 *   a drawn thing or a Spell UI control (an input, a button);  Alt-click picks any Spell UI element.
 *   - It starts as the Inspector opens, and stops once something's picked:  the app works as ever again.
 *   - Its crosshairs button starts it again;  Esc stops it.
 *   - The click goes to the Inspector, never to the app:  picking a button doesn't press it.
 * - What a part is (`Picked`):
 *   - a drawn spell thing (a drawable type's element, `<solitaire-card>`):  its thing, with its class's properties
 *     (`ClassSchemas`)
 *   - a Spell UI element (`<ui-input>`):  the element, with its tag's attributes (its vocabulary)
 * - Edits change the running app at once (J62):  writing them back into the code is later (T18).
 * - The column is `<InspectorColumn>`;  the app's area it watches is handed over by `<AppPane>` (`watch()`).
 ****************/
export class Inspector {
  /** Is the column showing (reactive)? */
  static get isOpen(): boolean {
    return isOpen()
  }

  /** Is a click in the app a pick (reactive)? */
  static get isPicking(): boolean {
    return isPicking()
  }

  /** The part picked, if any (reactive). */
  static get picked(): Picked | undefined {
    return picked()
  }

  /**
   * Open the column if closed, else close it;  remember which.  Opening starts picking.
   * - It opens with the cards it last showed (`shownPanels`);  every card when none were.
   */
  static toggle(): void {
    if (isOpen()) return Inspector.close()
    if (!shownPanels().length) setPanels(INSPECTOR_PANELS)
    setOpen(true)
    editorPrefs.set(OPEN_PREF, true)
    Inspector.startPicking()
  }

  /** Is card `panel` showing in the column (reactive)? */
  static isShown(panel: InspectorPanel): boolean {
    return shownPanels().includes(panel)
  }

  /**
   * Show card `panel`, or hide it;  remember which.
   * - Showing one opens the column;  hiding the last closes it.
   */
  static setShown(panel: InspectorPanel, shown: boolean): void {
    const next = INSPECTOR_PANELS.filter((each) => (each === panel ? shown : shownPanels().includes(each)))
    setPanels(next)
    if (!next.length) Inspector.close()
    else if (!isOpen()) Inspector.toggle()
  }

  /** Is the properties card's section for `group` folded (reactive)?  Advanced starts folded. */
  static isGroupFolded(group: E.AttributeGroup): boolean {
    return foldedGroups().includes(group)
  }

  /** Fold the properties card's section for `group`, or unfold it;  remember which. */
  static setGroupFolded(group: E.AttributeGroup, isFolded: boolean): void {
    const next = [...foldedGroups().filter((each) => each !== group), ...(isFolded ? [group] : [])]
    setFoldedGroups(next)
    editorPrefs.set(FOLDED_GROUPS_PREF, next)
  }

  /** Is card `panel` folded to its header (reactive)? */
  static isFolded(panel: InspectorPanel): boolean {
    return foldedPanels().includes(panel)
  }

  /** Fold card `panel` to its header, or unfold it;  remember which. */
  static toggleFolded(panel: InspectorPanel): void {
    const folded = foldedPanels()
    const next = folded.includes(panel) ? folded.filter((each) => each !== panel) : [...folded, panel]
    setFoldedPanels(next)
    editorPrefs.set(FOLDED_PANELS_PREF, next)
  }

  /** Close the column:  no picking, nothing picked. */
  static close(): void {
    setOpen(false)
    editorPrefs.set(OPEN_PREF, false)
    Inspector.stopPicking()
    Inspector.pick(undefined)
  }

  /** Start picking:  outline what's pointed at in the app, pick what's clicked. */
  static startPicking(): void {
    setPicking(true)
    const area = appArea
    if (area) Picker.listen(area)
  }

  /** Stop picking:  the app gets its clicks back. */
  static stopPicking(): void {
    setPicking(false)
    Picker.stop()
  }

  /**
   * Pick `element` (`undefined`:  nothing), outlined while it stays picked.
   * - A new pick starts the trail afresh (`inspected`);  `trail`, picking it again after a redraw, follows that one.
   * - NOTE:  the new pick and trail are passed along, never read back:  a signal reads its old value until the next
   *   flush.
   */
  static pick(element: Element | undefined, { trail: steps = [] as readonly string[] } = {}): void {
    const part = element && Inspector.partFor(element)
    setPicked(part)
    setTrail(steps)
    editorPrefs.set(Inspector.projectPref(TRAIL_PREF), steps)
    Picker.select((part && Inspector.outlinedElement(steps, part)) || element)
    const address = element && Inspector.addressOf(element)
    if (address) editorPrefs.set(Inspector.pickedPref, address)
  }

  /**
   * What the properties card shows (reactive):  what's picked, or the thing its TRAIL leads to from it
   * (Owen:  "I'd expect that the \"new discards\" line would make something that could be inspected").
   * - The trail:  the steps from the picked part's thing, a property's name (`discards`) or a list's item (`#3`);
   *   remembered with the project, as the pick is.
   * - A step that leads nowhere any more (the program changed) ends the trail there.
   * - The thing at its end is drawn when an element in the app draws it (`element`):  else it has none.
   */
  static get inspected(): Inspected | undefined {
    const base = picked()
    if (!base) return undefined
    const crumbs: Crumb[] = [{ label: base.label, depth: 0 }]
    let value = base.value
    for (const step of trail()) {
      const next = stepInto(value, step)
      if (!next) break
      value = next
      crumbs.push({ label: Inspector.thingLabel(next, step), depth: crumbs.length })
    }
    if (value === base.value) return { ...base, crumbs }
    return {
      element: Inspector.elementDrawing(value),
      value,
      schema: ClassSchemas.fromClass(value.constructor),
      label: crumbs.at(-1)!.label,
      crumbs
    }
  }

  /** Inspect what `step` leads to from what's inspected now:  a property's thing (`discards`), a list's item (`#3`). */
  static inspect(step: string): void {
    Inspector.followTrail([...trail(), step])
  }

  /** Go back along the trail to step `depth` (0:  what's picked). */
  static backTo(depth: number): void {
    Inspector.followTrail(trail().slice(0, depth))
  }

  /** Follow `steps` from what's picked;  remember them, and outline what they lead to when it's drawn. */
  private static followTrail(steps: readonly string[]): void {
    setTrail(steps)
    editorPrefs.set(Inspector.projectPref(TRAIL_PREF), steps)
    // `steps` itself:  the trail signal reads its old value until the next flush
    Picker.select(Inspector.outlinedElement(steps))
  }

  /** The element to outline:  the one drawing what `steps` lead to (the trail), else what's picked. */
  private static outlinedElement(steps: readonly string[], base = picked()): Element | undefined {
    if (!base) return undefined
    let value = base.value
    for (const step of steps) value = stepInto(value, step) ?? value
    return (value !== base.value && Inspector.elementDrawing(value)) || base.element
  }

  /** The element in the app that draws `thing`, if one does. */
  static elementDrawing(thing: object): Element | undefined {
    const area = appArea
    return area
      ? Inspector.partsIn(area).find((row) => SpellElement.thingOf(row.element) === thing)?.element
      : undefined
  }

  /** A thing's title:  its type, then its name if it has one (`DiscardPile · discards`);  a list's item, its place too. */
  static thingLabel(thing: object, step = ""): string {
    const type = thing.constructor.name
    const name = (thing as { name?: unknown }).name
    const titled = typeof name === "string" && name ? `${type} · ${name}` : type
    return step.startsWith(ITEM_STEP) && !(typeof name === "string" && name) ? `${titled} ${step}` : titled
  }

  /**
   * Pick again what was picked, once the app's parts are drawn:  after a reload, a restart, a recompile
   * (Owen:  "keep everything EXACTLY THE SAME across page moves").
   * - `rows`:  the app's parts, as the parts tree walks them (`partsIn()`).
   * - While what's picked is still in the app, only its outline is put on what the trail leads to again.
   * - Found by its place among the parts and its tag (`PartAddress`), for this project:  none there, nothing's picked.
   */
  static restorePick(rows: readonly PartRow[]): void {
    // still there:  only its outline, on what the trail leads to now (a redraw replaces a drawn thing's element)
    if (picked()?.element.isConnected) return Picker.select(Inspector.outlinedElement(trail()))
    const address = editorPrefs.get(Inspector.pickedPref) as PartAddress | undefined
    const row = address && rows[address.index]
    // the trail from it too, as it was left
    const steps = (editorPrefs.get(Inspector.projectPref(TRAIL_PREF)) as string[] | undefined) ?? []
    if (row && row.element.localName === address.tag) Inspector.pick(row.element, { trail: steps })
    else if (picked()) Inspector.pick(undefined)
  }

  /** The app's parts under `element`, in document order, each with its depth;  what isn't a part is looked through. */
  static partsIn(element: Element, depth = 0): PartRow[] {
    return [...element.children].flatMap((child) =>
      Inspector.isPart(child)
        ? [{ element: child, depth }, ...Inspector.partsIn(child, depth + 1)]
        : Inspector.partsIn(child, depth)
    )
  }

  /** `element`'s key among the app's parts, as a string (`addressKey()`):  `undefined` outside the app. */
  static keyOf(element: Element): string | undefined {
    const address = Inspector.addressOf(element)
    return address && addressKey(address)
  }

  /** Where `element` sits among the app's parts, to find it again:  `undefined` outside the app. */
  private static addressOf(element: Element): PartAddress | undefined {
    const area = appArea
    const index = area ? Inspector.partsIn(area).findIndex((row) => row.element === element) : -1
    return index < 0 ? undefined : { index, tag: element.localName }
  }

  /** The pref remembering what's picked, the project's own:  `inspector:picked:@spell/examples/tic-tac-toe`. */
  private static get pickedPref(): string {
    return Inspector.projectPref(PICKED_PREF)
  }

  /** A pref of the Inspector's that's each project's own:  `start`, then the project's path. */
  static projectPref(start: string): string {
    return `${start}:${editor.project?.path ?? ""}`
  }

  /**
   * Watch `area`, the element the running app draws in:  `<AppPane>`'s, as it's drawn.
   * - Picking listens there;  a new area while picking moves the listening to it.
   * - Returns the cleanup:  forget it, if it's still the one watched.
   */
  static watch(area: HTMLElement): () => void {
    setArea(area)
    if (isPicking()) Picker.listen(area)
    return () => {
      if (appArea !== area) return
      setArea(undefined)
      Picker.stop()
    }
  }

  /** The element the running app draws in, while it's watched (reactive):  the parts tree walks it. */
  static get area(): HTMLElement | undefined {
    areaMoved()
    return appArea
  }

  /** Is `element` a part the Inspector shows:  a drawn thing, or a Spell UI element? */
  static isPart(element: Element): boolean {
    return !!SpellElement.thingOf(element) || element.localName.startsWith(UI_PREFIX)
  }

  /**
   * A part's title:  `Card · the queen of spades`, `<ui-button "20%" />`.
   * - A Spell UI element reads as its tag, then which it is:  its `name`, else its `label`, else its own words,
   *   shortened (Owen:  "show name or label to make it clearer which is which";  `<ui-button "20%" />`);
   *   none:  its tag alone, `<ui-form />`.
   */
  static labelFor(element: Element): string {
    const thing = SpellElement.thingOf(element)
    if (!thing) {
      const which = element.getAttribute("name") || element.getAttribute("label") || ownWords(element)
      return which ? `<${element.localName} "${which}" />` : `<${element.localName} />`
    }
    const type = thing.constructor.name
    const name = (thing as { name?: unknown }).name
    return typeof name === "string" && name ? `${type} · ${name}` : type
  }

  /** A part's icon:  a stub for now, one for drawn things and one for Spell UI elements. */
  static iconFor(element: Element): string {
    return SpellElement.thingOf(element) ? THING_ICON : CONTROL_ICON
  }

  /**
   * The events `element` handles:  what its drawing listens for, through Solid (`onClick` ...), then those added
   * here (`addEvent()`), each once (reactive, for the added ones).
   * - The added ones are remembered by the part's place, a project's each:  a reload keeps them.
   * - A drawn thing's drawing is in its shadow root:  its handlers count as the thing's.
   * - And those its tag was written with in the program (`writtenHandlersOf()`), whatever listens for them.
   */
  static eventsOf(element: Element): string[] {
    const handled = [element, ...(element.shadowRoot?.querySelectorAll("*") ?? [])].flatMap((at) =>
      Object.keys(at).flatMap((key) => SOLID_HANDLER.exec(key)?.[1] ?? [])
    )
    handled.push(...Object.keys(Inspector.writtenHandlersOf(element)))
    eventsAdded()
    const address = Inspector.addressOf(element)
    const added = address ? (Inspector.addedEvents[addressKey(address)] ?? []) : []
    return [...new Set([...handled, ...added])]
  }

  /**
   * The code `element` was written with for each event, from the program's spell (`handlersInSource()`):
   * `{ click: "add someone" }`.
   * - A drawn thing's handlers are on what its drawing holds:  the thing's, merged.
   * - Not found:  `{}`.
   */
  static writtenHandlersOf(element: Element): Record<string, string> {
    const sources = editor.project?.spellFiles.map((file) => file.contents ?? "") ?? []
    const handling = [...(element.shadowRoot?.querySelectorAll("*") ?? [])].filter((at) =>
      Object.keys(at).some((key) => SOLID_HANDLER.test(key))
    )
    return Object.assign({}, ...[element, ...handling].map((at) => handlersInSource(at, sources)))
  }

  /**
   * Add `event` to `element`'s events, remembered with the project.
   * - Writing a handler into the code is later (T18), as with property edits.
   * - Nothing happens for an element outside the app.
   */
  static addEvent(element: Element, event: string): void {
    const address = Inspector.addressOf(element)
    if (!address) return
    const added = Inspector.addedEvents
    const key = addressKey(address)
    editorPrefs.set(Inspector.eventsPref, { ...added, [key]: [...(added[key] ?? []), event] })
    setEventsAdded((count) => count + 1)
  }

  /** The events added here, by the part's place (`addressKey()`):  this project's. */
  private static get addedEvents(): Record<string, string[]> {
    return (editorPrefs.get(Inspector.eventsPref) as Record<string, string[]> | undefined) ?? {}
  }

  /** The pref remembering the events added here, the project's own. */
  private static get eventsPref(): string {
    return Inspector.projectPref(EVENTS_PREF)
  }

  /** What `element` is, as the Inspector shows it:  a drawn thing, a Spell UI element, else `undefined`. */
  static partFor(element: Element): Picked | undefined {
    const thing = SpellElement.thingOf(element)
    if (thing) {
      return {
        element,
        value: thing,
        schema: ClassSchemas.fromClass(thing.constructor),
        label: Inspector.labelFor(element)
      }
    }
    if (element.localName.startsWith(UI_PREFIX)) {
      // its attributes as its vocabulary lists them:  those it sets first, the rest under "More"
      const component = (element as Element & { component?: { vocabulary?: { attributes?: FieldSpec[] } } }).component
      const fields = component?.vocabulary?.attributes ?? []
      return {
        element,
        value: element,
        schema: element.localName,
        label: Inspector.labelFor(element),
        layout: {
          // its text, when it holds only text:  a button's words aren't an attribute
          hasText: element.childElementCount === 0 && !!element.textContent?.trim(),
          ...withPositionsBesideTheirs(
            fields.filter((field) => element.hasAttribute(field.name)),
            fields.filter((field) => !element.hasAttribute(field.name))
          )
        }
      }
    }
    return undefined
  }
}

/** What the properties card shows:  a pick, or the thing its trail leads to, with the trail to it. */
export type Inspected = Omit<Picked, "element"> & {
  /** The element drawing it, outlined:  none for a thing nothing draws. */
  element?: Element
  /** The trail from what's picked to it, a step each (what's picked first). */
  crumbs: Crumb[]
}

/** One step of the trail:  its title, and how far along it is (0:  what's picked). */
export type Crumb = { label: string; depth: number }

/** A part of the running app, picked in the Inspector. */
export type Picked = {
  /** Its element in the app, outlined. */
  element: Element
  /** What the editor binds to:  the thing a drawn element draws, else the element itself. */
  value: object
  /** What the editor shows:  the thing's class's properties, or the Spell UI tag's name (its vocabulary's). */
  schema: ReturnType<typeof ClassSchemas.fromClass> | string
  /** Its title:  `Card · the queen of spades`, `<ui-input>`. */
  label: string
  /**
   * A Spell UI element's fields, in the editor's order:  what it sets first, the rest folded under "More";
   * `undefined`, the schema's own order (a thing's properties are all set).
   */
  layout?: {
    /** It holds only text, its words:  a field for them first, its `textContent`. */
    hasText: boolean
    /** The attributes it sets, in its vocabulary's order. */
    set: FieldSpec[]
    /** The rest. */
    more: FieldSpec[]
  }
}

/**
 * An attribute that places another (`icon-position`) goes beside it, so the two share a row.
 * - set:  `icon` set and its position not, the position comes up from "More" to sit after it
 */
function withPositionsBesideTheirs(set: FieldSpec[], more: FieldSpec[]): { set: FieldSpec[]; more: FieldSpec[] } {
  const moved = more.filter((field) => set.some((other) => field.name === `${other.name}${POSITION_SUFFIX}`))
  const ordered = set.flatMap((field) => [
    field,
    ...moved.filter((other) => other.name === `${field.name}${POSITION_SUFFIX}`)
  ])
  return { set: ordered, more: more.filter((field) => !moved.includes(field)) }
}

/** The name ending of an attribute that places another:  `icon-position` places `icon`. */
const POSITION_SUFFIX = "-position"

/** One of the app's parts, as the parts tree lists it:  the part, and how deep it sits. */
export type PartRow = { element: Element; depth: number }

/** Where a picked part was, to pick it again:  its place among the app's parts (`partsIn()`), and its tag. */
export type PartAddress = { index: number; tag: string }

/** `element`'s own words, its text children's, shortened to `WORDS_LENGTH` characters:  `""` for none. */
function ownWords(element: Element): string {
  const words = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
  return words.length > WORDS_LENGTH ? `${words.slice(0, WORDS_LENGTH - 1)}…` : words
}

/** The most of a part's own words its title shows. */
const WORDS_LENGTH = 24

/** A part's place as one key:  `4:tic-tac-toe-square`. */
export function addressKey(address: PartAddress): string {
  return `${address.index}:${address.tag}`
}

/** What the Inspector reads of a Spell UI attribute:  its name and kind (`size`, `color` ...). */
export type FieldSpec = { name: string; kind?: string; group?: E.AttributeGroup; description?: string }

/** The preference that remembers whether the Inspector is open. */
const OPEN_PREF = "inspector"
/** The start of the pref remembering the trail, a project's each. */
const TRAIL_PREF = "inspector:trail"
/** The pref remembering which cards show. */
const PANELS_PREF = "inspector:panels"
/** The pref remembering which of the properties card's sections are folded. */
const FOLDED_GROUPS_PREF = "inspector:foldedGroups"
/** The pref remembering which cards are folded. */
const FOLDED_PANELS_PREF = "inspector:foldedPanels"
/** The Inspector's icon:  its toggle's, and its header's. */
const INSPECTOR_ICON = "sliders horizontal"
/** The start of the pref remembering what's picked, a project's each (`Inspector.pickedPref`). */
const PICKED_PREF = "inspector:picked"
/** The start of the pref remembering the events added, a project's each (`Inspector.eventsPref`). */
const EVENTS_PREF = "inspector:events"
/** Spell UI's tags start so. */
const UI_PREFIX = "ui-"
/** Spell UI's controls:  what a plain click picks, beside a drawn thing (Alt-click:  any Spell UI element). */
const CONTROL_TAGS = new Set([
  "ui-button",
  "ui-input",
  "ui-textarea",
  "ui-checkbox",
  "ui-radio",
  "ui-select",
  "ui-dropdown",
  "ui-slider",
  "ui-rating",
  "ui-calendar",
  "ui-search",
  "ui-progress"
])

editorPrefs.declare(OPEN_PREF, { type: "choice" })
const [isOpen, setOpen] = createSignal(editorPrefs.get(OPEN_PREF) as boolean)

/** The Inspector's cards, top to bottom:  what's picked, its events, the app's views. */
export const INSPECTOR_PANELS = ["properties", "events", "views"] as const
/** One of the Inspector's cards. */
export type InspectorPanel = (typeof INSPECTOR_PANELS)[number]

/** The cards showing, in order (remembered:  `PANELS_PREF`). */
const [shownPanels, setShownPanels] = createSignal<readonly InspectorPanel[]>(
  (editorPrefs.get(PANELS_PREF) as InspectorPanel[] | undefined) ?? INSPECTOR_PANELS
)
/** The cards folded to their headers (remembered:  `FOLDED_PANELS_PREF`). */
const [foldedPanels, setFoldedPanels] = createSignal<readonly InspectorPanel[]>(
  (editorPrefs.get(FOLDED_PANELS_PREF) as InspectorPanel[] | undefined) ?? []
)

/** The properties card's folded sections (remembered:  `FOLDED_GROUPS_PREF`). */
const [foldedGroups, setFoldedGroups] = createSignal<readonly E.AttributeGroup[]>(
  (editorPrefs.get(FOLDED_GROUPS_PREF) as E.AttributeGroup[] | undefined) ?? ["advanced"]
)

/** Show `panels`, and remember them. */
function setPanels(panels: readonly InspectorPanel[]): void {
  setShownPanels(panels)
  editorPrefs.set(PANELS_PREF, panels)
}
const [isPicking, setPicking] = createSignal(false)
const [picked, setPicked] = createSignal<Picked | undefined>(undefined)
/** The trail from what's picked (`Inspector.inspected`):  property names and list items (`#3`). */
const [trail, setTrail] = createSignal<readonly string[]>([])

/** Where a step leads from `value`:  a property's thing (`discards`), a list's item (`#3`);  `undefined` if nowhere. */
function stepInto(value: object, step: string): object | undefined {
  const next = step.startsWith(ITEM_STEP)
    ? itemsOf(value)?.[Number(step.slice(ITEM_STEP.length))]
    : (value as Record<string, unknown>)[step]
  return isThing(next) ? next : undefined
}

/**
 * Is `value` one of the program's things:  an instance of a spell class (lists too)?
 * - By what its class carries, its `schema` symbol:  the runtime has its own copy of `spell/util`, so no symbol
 *   or class of the page's own would match.
 */
export function isThing(value: unknown): value is object {
  if (
    !value ||
    typeof value !== "object" ||
    value instanceof Node ||
    typeof (value as { toJSON?: unknown }).toJSON !== "function"
  )
    return false
  for (let Class = value.constructor; Class && Class !== Function.prototype; Class = Object.getPrototypeOf(Class)) {
    if (Object.getOwnPropertySymbols(Class).some((symbol) => symbol.description === "schema")) return true
  }
  return false
}

/** A list thing's items (a `Deck`'s cards), when it's a list:  else `undefined`. */
export function itemsOf(value: object): unknown[] | undefined {
  if (typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== "function") return undefined
  return [...(value as Iterable<unknown>)]
}

/** How a list's item is named in the trail:  `#3`. */
export const ITEM_STEP = "#"

/**
 * Where the running app draws, as `<AppPane>` last handed it over.
 * - Kept through a hot reload of this file:  the pane hands it over only as it's drawn, so without it the reloaded
 *   Inspector had no app (Views empty, the crosshairs picking nothing) until the page was reloaded.
 */
let appArea = import.meta.hot?.data.appArea as HTMLElement | undefined
/**
 * Counts the area's moves, for its reactive readers (`Inspector.area`).
 * - The area itself is a plain variable:  a signal reads its old value until the next flush,
 *   and picking reads it straight after `watch()`.
 */
const [areaMoved, setAreaMoved] = createSignal(0)

/** Watch `area` from now on (`undefined`:  none), and tell its reactive readers. */
function setArea(area: HTMLElement | undefined): void {
  appArea = area
  if (import.meta.hot) import.meta.hot.data.appArea = area
  setAreaMoved((count) => count + 1)
}

/** Counts the events added in the Inspector, so their lists read them again. */
const [eventsAdded, setEventsAdded] = createSignal(0)

/** Where Solid keeps an element's handler for a delegated event:  `_$$click` (NOT its data, `_$$clickData`). */
const SOLID_HANDLER = /^_\$\$([a-z]+)$/

/** The parts tree's stub icons:  a drawn thing's, a Spell UI element's. */
const THING_ICON = "cube"
const CONTROL_ICON = "square outline"

/****************
 * ### `Picker`
 * The Inspector's hands in the app:  the outlines, and the listeners that pick.
 * - Plain DOM, no Solid:  two boxes on `<body>`, drawn over the app (`Inspector.css`), never inside it.
 *   - the HOVER box:  what a click would pick
 *   - the PICKED box:  what's picked, kept on it as the app moves (redrawn each frame while there is one)
 * - The listeners are on the app's area, capturing:  they see a click before the app does, and stop it.
 ****************/
class Picker {
  /** Start listening on `area`;  stops listening anywhere else first. */
  static listen(area: HTMLElement): void {
    Picker.stop()
    const stop = new AbortController()
    Picker.listening = stop
    const options = { capture: true, signal: stop.signal }
    area.addEventListener("pointermove", (event) => Picker.hover(Picker.partAt(event, area)), options)
    area.addEventListener("pointerleave", () => Picker.hover(undefined), options)
    area.addEventListener(
      "click",
      (event) => {
        const part = Picker.partAt(event, area)
        if (!part) return
        event.preventDefault()
        event.stopPropagation()
        Picker.hover(undefined)
        Inspector.pick(part)
        Inspector.stopPicking()
      },
      options
    )
    // and the presses before a click:  picking a draggable card mustn't start a drag
    area.addEventListener("pointerdown", (event) => Picker.partAt(event, area) && event.stopPropagation(), options)
    window.addEventListener("keydown", (event) => event.key === "Escape" && Inspector.stopPicking(), {
      signal: stop.signal
    })
  }

  /** Stop listening, and hide the hover box. */
  static stop(): void {
    Picker.listening?.abort()
    Picker.listening = undefined
    Picker.hover(undefined)
  }

  /** Outline `element` as the one a click would pick;  `undefined` hides the box. */
  static hover(element: Element | undefined): void {
    Picker.place(Picker.box("InspectorHover"), element)
  }

  /** Keep `element` outlined as picked, following it each frame;  `undefined` hides the box. */
  static select(element: Element | undefined): void {
    Picker.selected = element
    const box = Picker.box("InspectorPicked")
    const follow = () => {
      if (Picker.selected !== element) return
      Picker.place(box, element?.isConnected ? element : undefined)
      if (element) requestAnimationFrame(follow)
    }
    follow()
  }

  /**
   * The part under the event's pointer:  the innermost on its path, inside `area`, that's
   * - a drawn thing (its type's element, a card), or a Spell UI CONTROL (`CONTROL_TAGS`:  an input, a button ...)
   * - with Alt held, any Spell UI element:  the text or label inside a card too
   * - Not one inside a Spell UI element's own shadow root:  a button's icon is the button's.
   */
  private static partAt(event: Event, area: HTMLElement): Element | undefined {
    const anyElement = (event as MouseEvent).altKey
    for (const target of event.composedPath()) {
      if (target === area) return undefined
      if (!(target instanceof Element)) continue
      const host = (target.getRootNode() as ShadowRoot).host
      if (host?.localName.startsWith(UI_PREFIX)) continue
      const isPart = SpellElement.thingOf(target) || anyElement || CONTROL_TAGS.has(target.localName)
      if (isPart && Inspector.partFor(target)) return target
    }
    return undefined
  }

  /** Box `className` on `<body>`, made the first time. */
  private static box(className: string): HTMLElement {
    let box = document.body.querySelector<HTMLElement>(`:scope > .${className}`)
    if (!box) {
      box = document.body.appendChild(document.createElement("div"))
      box.className = `InspectorBox ${className}`
    }
    return box
  }

  /** Put `box` over `element`, or hide it. */
  private static place(box: HTMLElement, element: Element | undefined): void {
    if (!element) {
      box.hidden = true
      return
    }
    const { left, top, width, height } = element.getBoundingClientRect()
    Object.assign(box.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` })
    box.hidden = false
  }

  /** What's picked now, as `select()` follows it. */
  private static selected: Element | undefined
  /** Stops the listeners, while listening. */
  private static listening: AbortController | undefined
}

/****************
 * ### `Compact`
 * The Inspector's property editor, laid out as the Theme Creator's inspector is:  compact (Owen).
 * - Its controls the column's full width:  `fluid` on each it makes.
 * - A yes or no (a checkbox) beside its label, one row:  `inline` on its property.
 * - The rest is the column's CSS:  small type, 12px between fields, the label 4px above its control.
 * - The editor makes its properties' controls as it draws, and again for a new schema:  watched, not set once.
 ****************/
class Compact {
  /** Keep `propertyEditor`'s fields compact as it makes them;  returns the cleanup. */
  static keep(propertyEditor: HTMLElement): () => void {
    const tidy = () => {
      for (const control of propertyEditor.querySelectorAll(FLUID_CONTROLS)) control.toggleAttribute("fluid", true)
      for (const checkbox of propertyEditor.querySelectorAll("ui-property > ui-checkbox"))
        checkbox.parentElement!.toggleAttribute("inline", true)
    }
    const watching = new MutationObserver(tidy)
    watching.observe(propertyEditor, { childList: true, subtree: true })
    tidy()
    return () => watching.disconnect()
  }
}

/** The controls a property makes that take the column's width. */
const FLUID_CONTROLS = "ui-property > :is(ui-input, ui-select, ui-dropdown, ui-textarea, ui-calendar, ui-icon-picker)"

/****************
 * ### `<InspectorColumn>`
 * The Inspector, a tall column at the page's far right, while it's open (`Inspector.isOpen`):
 * its cards, one above the other, resizable (their sizes remembered, for each set of cards).
 *   - what's picked (`<PropertiesCard>`)
 *   - its events (`<InspectorEvents>`)
 *   - the app's views, things or templates (`<InspectorViews>`)
 * - Which cards show:  the App pane's Inspector button, held (`<InspectorToggle>`);  each card's Close hides it.
 * - Each card folds to its header (`<InspectorCard>`):  a folded card keeps its header's height, the others share
 *   the rest.
 * - Each is a card of its own, the page showing in the narrow seams between them, so they read as a set
 *   (Owen:  "separate panels ... we see background in the seams";  "less space between these panels").
 * - The cards' insides are the brand's Theme Creator inspector, in the Spell Brand theme whatever the editor
 *   wears:  that theme's tokens, re-declared on `.Inspector` (`UI.themes.scopedTokens()`, J63);
 *   their headers are the App pane's, in the editor's theme.
 * - The app's parts are walked here (`appParts()`), so what was picked comes back whichever cards show.
 ****************/
export function InspectorColumn(): JSX.Element {
  void loadBrandTokens()
  const rows = appParts()
  const layout = createMemo(() => cardsLayout(INSPECTOR_PANELS.filter((panel) => Inspector.isShown(panel))))
  return (
    <Show when={Inspector.isOpen}>
      <aside class="InspectorColumn" aria-label={appTexts.text("inspector")}>
        <style>{brandTokens()}</style>
        <SplitPanel id={layout().id} rows={layout().rows} resizable class="InspectorSplit">
          <Show when={Inspector.isShown("properties")}>
            <PropertiesCard />
          </Show>
          <Show when={Inspector.isShown("events")}>
            <InspectorEvents />
          </Show>
          <Show when={Inspector.isShown("views")}>
            <InspectorViews rows={rows()} />
          </Show>
        </SplitPanel>
      </aside>
    </Show>
  )
}

/**
 * The column's sizes for the cards `shown`:  a folded card its header's height, the others their usual shares.
 * - `id`:  the sizes remembered for this set of cards, as dragged (`<SplitPanel id>`).
 */
function cardsLayout(shown: readonly InspectorPanel[]): { id: string; rows: string } {
  const open = shown.filter((panel) => !Inspector.isFolded(panel))
  const total = open.reduce((sum, panel) => sum + CARD_SHARES[panel], 0)
  return {
    id: `spellEditor-inspector-${shown.map((panel) => (Inspector.isFolded(panel) ? `${panel}-folded` : panel)).join(",")}`,
    rows: shown
      .map((panel) =>
        Inspector.isFolded(panel) ? `${FOLDED_CARD_HEIGHT}px` : `${Math.round((CARD_SHARES[panel] / total) * 100)}%`
      )
      .join(",")
  }
}

/** Each card's usual share of the column, among those open. */
const CARD_SHARES: Record<InspectorPanel, number> = { properties: 50, events: 20, views: 30 }
/** A folded card's height:  its header's (`.AppPaneHeader`). */
const FOLDED_CARD_HEIGHT = 40

/****************
 * ### `<PropertiesCard>`
 * What's picked:  its title in the card's header, a blue pill (`<ui-button "20%" />`), then a
 * `<ui-property-editor>` of every property it has, those it sets first
 * (Owen:  "lose that [More]. Show all of the properties").
 * - Picking again is the App pane's crosshairs (`<InspectorPick>`), beside the Inspector's button.
 * - Nothing picked:  the card is titled "Inspector", and says how to pick.
 * - A thing's property whose value is a thing is a link to it (`<ThingLink>`);  a list's items are links too.
 *   Following one, the title is the TRAIL from what was picked (`Solitaire › DiscardPile · discards`),
 *   each step a pill that goes back to it (`Inspector.inspected`).
 ****************/
function PropertiesCard(): JSX.Element {
  return (
    <InspectorCard
      panel="properties"
      class="InspectorMain"
      title={
        <Show when={Inspector.inspected} fallback={appTexts.text("inspector")}>
          {(part) => (
            <span class="InspectorTrail">
              <For each={part().crumbs}>
                {(crumb) => (
                  <>
                    <Show when={crumb.depth}>
                      <span class="InspectorTrailStep">›</span>
                    </Show>
                    <span
                      class={["InspectorPartTag", { back: crumb.depth < part().crumbs.length - 1 }]}
                      onClick={(event: MouseEvent) => {
                        if (crumb.depth === part().crumbs.length - 1) return
                        event.stopPropagation()
                        Inspector.backTo(crumb.depth)
                      }}
                    >
                      {crumb.label}
                    </span>
                  </>
                )}
              </For>
            </span>
          )}
        </Show>
      }
    >
      <Show
        when={Inspector.inspected}
        keyed
        fallback={
          <p class="InspectorTip">{appTexts.text(Inspector.isPicking ? "inspectorPicking" : "inspectorTip")}</p>
        }
      >
        {(part) => (
          <ui-property-editor
            schema={part.schema}
            value={part.value}
            ref={(propertyEditor) => onCleanup(Compact.keep(propertyEditor))}
          >
            <Show when={part.layout}>
              {(layout) => (
                <For each={sectionsFor([...layout().set, ...layout().more], layout().hasText)}>
                  {(section) => (
                    <ui-property-group
                      label={appTexts.text(`inspectorGroup.${section.group}` as AppTextKey)}
                      collapsible=""
                      collapsed={Inspector.isGroupFolded(section.group) ? "" : undefined}
                      ref={(group) => {
                        on("ui-closing", () => Inspector.setGroupFolded(section.group, true))(group)
                        on("ui-opening", () => Inspector.setGroupFolded(section.group, false))(group)
                      }}
                    >
                      <Show when={section.hasText}>
                        <ui-property name="textContent" label={appTexts.text("inspectorText")} />
                      </Show>
                      <For each={section.fields}>{(field) => <Field field={field} fields={section.fields} />}</For>
                    </ui-property-group>
                  )}
                </For>
              )}
            </Show>
            <Show when={!part.layout}>
              <ThingFields value={part.value} schema={part.schema as ReturnType<typeof ClassSchemas.fromClass>} />
            </Show>
          </ui-property-editor>
        )}
      </Show>
    </InspectorCard>
  )
}

/**
 * A Spell UI element's fields in the Inspector's sections, one per group, in the groups' order
 * (`E.ATTRIBUTE_GROUPS`:  Name, Content, Appearance, Layout ...).
 * - A field keeps its place in `fields` within its section:  those it sets first.
 * - A field with no group goes in Appearance;  the element's own text (`hasText`) heads Content.
 * - A section with nothing in it isn't drawn.
 */
function sectionsFor(fields: FieldSpec[], hasText: boolean): InspectorSection[] {
  return E.ATTRIBUTE_GROUPS.map((group) => ({
    group,
    hasText: hasText && group === "content",
    fields: fields.filter((field) => (field.group ?? "appearance") === group)
  })).filter((section) => section.fields.length || section.hasText)
}

/** One of the Inspector's sections:  a group, its fields, and whether the element's text heads it. */
type InspectorSection = { group: E.AttributeGroup; hasText: boolean; fields: FieldSpec[] }

/****************
 * ### `<ThingFields>`
 * A thing's properties, as the properties card lists them:  a field each, or a link to the thing it holds;
 * then, for a list, its items, a link each.
 ****************/
function ThingFields(props: { value: object; schema: ReturnType<typeof ClassSchemas.fromClass> }): JSX.Element {
  const holds = (name: string) => (props.value as Record<string, unknown>)[name]
  const items = () => itemsOf(props.value)?.filter(isThing) ?? []
  return (
    <>
      <For each={props.schema.attributes}>
        {(attribute) => (
          <Show when={isThing(holds(attribute.name))} fallback={<ui-property name={attribute.name} />}>
            <ThingLink
              label={PropertySchemas.labelOf(attribute)}
              thing={holds(attribute.name) as object}
              step={attribute.name}
            />
          </Show>
        )}
      </For>
      <Show when={items().length}>
        <div class="InspectorItems">
          <span class="InspectorItemsLabel">{appTexts.text("inspectorItems", { count: items().length })}</span>
          <For each={items()}>{(item, index) => <ThingLink thing={item} step={`${ITEM_STEP}${index()}`} />}</For>
        </div>
      </Show>
    </>
  )
}

/****************
 * ### `<ThingLink>`
 * A link to a thing a property (or a list) holds:  its title, then `›`;  a click inspects it.
 * - `label`:  the property's label, above it, as a field's;  none for a list's item.
 ****************/
function ThingLink(props: { thing: object; step: string; label?: string }): JSX.Element {
  return (
    <div class={["InspectorThingLink", { item: !props.label }]}>
      <Show when={props.label}>{(label) => <span class="InspectorThingLabel">{label()}</span>}</Show>
      <ui-button
        basic=""
        size="small"
        icon="angle right"
        icon-position="right"
        class="InspectorThingButton"
        onClick={() => Inspector.inspect(props.step)}
      >
        {Inspector.thingLabel(props.thing, props.step)}
      </ui-button>
    </div>
  )
}

/****************
 * ### `<Field>`
 * One of a Spell UI element's attributes, as the Inspector lays it out.
 * - A size or a colour is half a row (`.half`), so the two share one:  each is a short choice.
 * - So is an attribute and the one that places it, side by side:  `icon` and `icon-position`.
 * - A colour's choices are chips (`<HueSelect>`), not words alone.
 * - Its info icon's tip is the attribute's description, shown after a 2s hover (`chrome.css`).
 ****************/
function Field(props: { field: FieldSpec; fields: FieldSpec[] }): JSX.Element {
  const isHalf = HALF_KINDS.has(props.field.kind ?? "") || isPositionPair(props.field, props.fields)
  return (
    <ui-property name={props.field.name} class={{ half: isHalf }} description={tipFor(props.field)}>
      <Show when={props.field.kind === "color"}>
        <HueSelect name={props.field.name} />
      </Show>
    </ui-property>
  )
}

/** A field's info tip:  its vocabulary's description, its `code` marks dropped (the tip is plain text). */
function tipFor(field: FieldSpec): string | undefined {
  return field.description?.replace(/`/g, "")
}

/** It places the field beside it, or the one beside it places it:  `icon` and `icon-position`. */
function isPositionPair(field: FieldSpec, fields: FieldSpec[]): boolean {
  const index = fields.indexOf(field)
  const [before, after] = [fields[index - 1], fields[index + 1]]
  return (
    (!!before && field.name === `${before.name}${POSITION_SUFFIX}`) ||
    (!!after && after.name === `${field.name}${POSITION_SUFFIX}`)
  )
}

/** Attribute kinds whose field is half a row. */
const HALF_KINDS = new Set(["size", "color"])

/****************
 * ### `<HueSelect>`
 * A colour's select:  each hue a round chip of its colour, then its name.
 * - The chip is the option's `image` (a select draws it round, as an avatar):  a circle of the hue's colour,
 *   as the Inspector's theme paints it, worked out on a probe inside the column.
 ****************/
function HueSelect(props: { name: string }): JSX.Element {
  return (
    <ui-select name={props.name} fluid="" placeholder={appTexts.text("inspectorNone")}>
      <For each={ValueSets.get("hues")}>
        {(hue) => (
          <ui-item value={hue} image={chipFor(hue)}>
            {hue}
          </ui-item>
        )}
      </For>
    </ui-select>
  )
}

/** A round chip of `hue`'s colour, as an SVG `data:` URL;  grey where the colour can't be read. */
function chipFor(hue: string): string {
  const probe = (document.querySelector(".Inspector") ?? document.body).appendChild(document.createElement("span"))
  probe.style.color = `var(--ui-${hue}, gray)`
  const color = getComputedStyle(probe).color
  probe.remove()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${color}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/****************
 * ### `<InspectorToggle>`
 * The Inspector's button, in the App pane's header, right of the crosshairs:  its icon, then a dropdown arrow,
 * as Events' "+" (Owen).
 * - The icon opens the column with the cards it last showed, or closes it (`Inspector.toggle()`).
 * - The arrow:  a menu of the cards, each checked when it shows;  choosing one shows or hides it.
 ****************/
export function InspectorToggle(): JSX.Element {
  return (
    <span class="InspectorToggle">
      <ui-icon
        name={INSPECTOR_ICON}
        link=""
        class={["IconAction", { active: Inspector.isOpen }]}
        label={appTexts.text("inspector")}
        data-tooltip={appTexts.text("inspector")}
        data-position="bottom right"
        data-inverted=""
        onClick={() => Inspector.toggle()}
      />
      <ui-dropdown
        class="InspectorPanelsDropdown"
        aria-label={appTexts.text("inspectorPanels")}
        data-tooltip={appTexts.text("inspectorPanels")}
        data-position="bottom right"
        data-inverted=""
        ref={on<{ value: string }>("ui-changed", (event) => {
          const panel = event.detail.value as InspectorPanel
          if (!panel) return
          Inspector.setShown(panel, !Inspector.isShown(panel))
          // chosen again next time:  a dropdown tells only of a new value
          const dropdown = event.currentTarget as HTMLElement & { value: string }
          queueMicrotask(() => (dropdown.value = ""))
        })}
      >
        <span slot="trigger" />
        <For each={INSPECTOR_PANELS}>
          {(panel) => (
            <ui-item value={panel} icon={Inspector.isShown(panel) ? "check" : "blank"}>
              {appTexts.text(PANEL_TEXTS[panel])}
            </ui-item>
          )}
        </For>
      </ui-dropdown>
    </span>
  )
}

/****************
 * ### `<InspectorPick>`
 * The crosshairs, in the App pane's header beside the Inspector's button:  pick a part of the app.
 * - A click starts picking, or stops it;  pressed (a round dip behind it) while picking.
 * - With the Inspector closed, it opens it, which starts picking.
 ****************/
export function InspectorPick(): JSX.Element {
  return (
    <ui-icon
      name="crosshairs"
      link=""
      class={["IconAction", "InspectorPick", { picking: Inspector.isPicking }]}
      label={appTexts.text("inspectorPick")}
      aria-pressed={Inspector.isPicking ? "true" : "false"}
      data-tooltip={appTexts.text("inspectorPick")}
      data-position="bottom right"
      data-inverted=""
      onClick={() => {
        if (!Inspector.isOpen) Inspector.toggle()
        else if (Inspector.isPicking) Inspector.stopPicking()
        else Inspector.startPicking()
      }}
    />
  )
}

/** Each card's name, in the menu of cards. */
const PANEL_TEXTS: Record<InspectorPanel, AppTextKey> = {
  properties: "inspectorProperties",
  events: "inspectorEvents",
  views: "inspectorParts"
}

/** The Spell Brand theme's tokens on `.Inspector`, once loaded. */
const [brandTokens, setBrandTokens] = createSignal("")

/**
 * Load the Spell Brand theme's tokens, scoped to the column, once.
 * - NEVER throws:  without them the column wears the editor's theme, and says so on the console.
 */
async function loadBrandTokens(): Promise<void> {
  if (brandTokens() || loadingBrandTokens) return
  loadingBrandTokens = true
  try {
    const { UI } = await import("spell-ui")
    await UI.load()
    setBrandTokens(await UI.themes.scopedTokens(BRAND_THEME, ".Inspector"))
  } catch (error) {
    console.error("InspectorColumn:  couldn't load the Spell Brand theme's tokens", error)
  }
}

/** The theme the Inspector wears (Owen:  "in the brand's theme"). */
const BRAND_THEME = "spell-brand"
/** A load of the brand's tokens has started. */
let loadingBrandTokens = false
