import { For, Show, createSignal, onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editor } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { ValueSets } from "spell-ui/vocabulary"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { ClassSchemas } from "spell-app/app/ui/ClassSchemas"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { SpellElement } from "spell-app/app/runner/SpellElement"
import { InspectorEvents, InspectorTree } from "./InspectorParts"
import { SplitPanel } from "./SplitPanel"

import "./Inspector.css"

/****************
 * ### `Inspector`
 * Look inside the running app, and change it (epic `debut` P13):  a part picked in the app, its properties to edit.
 * - Open or closed:  `<InspectorToggle>` in the app's header;  remembered in the browser (`OPEN_PREF`).
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

  /** Open the column if closed, else close it;  remember which.  Opening starts picking. */
  static toggle(): void {
    const open = !isOpen()
    setOpen(open)
    editorPrefs.set(OPEN_PREF, open)
    if (open) Inspector.startPicking()
    else Inspector.close()
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

  /** Pick `element` (`undefined`:  nothing), outlined while it stays picked. */
  static pick(element: Element | undefined): void {
    setPicked(element && Inspector.partFor(element))
    Picker.select(element)
    const address = element && Inspector.addressOf(element)
    if (address) editorPrefs.set(Inspector.pickedPref, address)
  }

  /**
   * Pick again what was picked, once the app's parts are drawn:  after a reload, a restart, a recompile
   * (Owen:  "keep everything EXACTLY THE SAME across page moves").
   * - `rows`:  the app's parts, as the parts tree walks them (`partsIn()`).
   * - Nothing to do while what's picked is still in the app.
   * - Found by its place among the parts and its tag (`PartAddress`), for this project:  none there, nothing's picked.
   */
  static restorePick(rows: readonly PartRow[]): void {
    if (picked()?.element.isConnected) return
    const address = editorPrefs.get(Inspector.pickedPref) as PartAddress | undefined
    const row = address && rows[address.index]
    if (row && row.element.localName === address.tag) Inspector.pick(row.element)
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

  /** Where `element` sits among the app's parts, to find it again:  `undefined` outside the app. */
  private static addressOf(element: Element): PartAddress | undefined {
    const area = appArea
    const index = area ? Inspector.partsIn(area).findIndex((row) => row.element === element) : -1
    return index < 0 ? undefined : { index, tag: element.localName }
  }

  /** The pref remembering what's picked, the project's own:  `inspector:picked:@spell/examples/tic-tac-toe`. */
  private static get pickedPref(): string {
    return `${PICKED_PREF}:${editor.project?.path ?? ""}`
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

  /** A part's title:  `Card · the queen of spades`, `<ui-input>`. */
  static labelFor(element: Element): string {
    const thing = SpellElement.thingOf(element)
    if (!thing) return `<${element.localName}>`
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
   * - NOT what's listened for with `addEventListener()`:  nothing on the element says so.
   */
  static eventsOf(element: Element): string[] {
    const handled = [element, ...(element.shadowRoot?.querySelectorAll("*") ?? [])].flatMap((at) =>
      Object.keys(at).flatMap((key) => SOLID_HANDLER.exec(key)?.[1] ?? [])
    )
    eventsAdded()
    const address = Inspector.addressOf(element)
    const added = address ? (Inspector.addedEvents[addressKey(address)] ?? []) : []
    return [...new Set([...handled, ...added])]
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
    return `${EVENTS_PREF}:${editor.project?.path ?? ""}`
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
type PartAddress = { index: number; tag: string }

/** A part's place as one key:  `4:tic-tac-toe-square`. */
function addressKey(address: PartAddress): string {
  return `${address.index}:${address.tag}`
}

/** What the Inspector reads of a Spell UI attribute:  its name and kind (`size`, `color` ...). */
export type FieldSpec = { name: string; kind?: string }

/** The preference that remembers whether the Inspector is open. */
const OPEN_PREF = "inspector"
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
const [isPicking, setPicking] = createSignal(false)
const [picked, setPicked] = createSignal<Picked | undefined>(undefined)

/** Where the running app draws, as `<AppPane>` last handed it over. */
let appArea: HTMLElement | undefined
/**
 * Counts the area's moves, for its reactive readers (`Inspector.area`).
 * - The area itself is a plain variable:  a signal reads its old value until the next flush,
 *   and picking reads it straight after `watch()`.
 */
const [areaMoved, setAreaMoved] = createSignal(0)

/** Watch `area` from now on (`undefined`:  none), and tell its reactive readers. */
function setArea(area: HTMLElement | undefined): void {
  appArea = area
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
const FLUID_CONTROLS = "ui-property > :is(ui-input, ui-select, ui-dropdown, ui-textarea, ui-calendar)"

/****************
 * ### `<InspectorColumn>`
 * The Inspector, a tall column at the page's far right, while it's open (`Inspector.isOpen`).
 * - Its header is the App pane's, in the editor's theme (Owen:  "doesn't match the theme"):
 *   its icon and title, then crosshairs (pick again;  a round button of the theme's, pressed while picking)
 *   and Close.
 * - Below it, the brand's Theme Creator inspector, in the Spell Brand theme whatever the editor wears:
 *   that theme's tokens, re-declared on `.Inspector` (`UI.themes.scopedTokens()`, J63).
 * - Below, split in three, resizable (its sizes remembered):
 *   - what's picked:  a `<ui-property-editor>` in a panel titled with what it is,
 *     a Spell UI element's fields in its `layout`:  its text, what it sets, then "More" folded;
 *     nothing picked:  a tip
 *   - its events (`<InspectorEvents>`)
 *   - the app's parts as a tree, "Views" (`<InspectorTree>`)
 * - Each pane's panel runs its height;  no box, border or colour between them (Owen).
 ****************/
export function InspectorColumn(): JSX.Element {
  void loadBrandTokens()
  return (
    <Show when={Inspector.isOpen}>
      <div class="InspectorColumn">
        <header class="AppPaneHeader InspectorHead">
          <h2>
            <ui-icon name={INSPECTOR_ICON} />
            {appTexts.text("inspector")}
          </h2>
          <ui-button
            icon="crosshairs"
            circular=""
            basic={Inspector.isPicking ? undefined : ""}
            active={Inspector.isPicking}
            size="small"
            class="InspectorPick"
            aria-label={appTexts.text("inspectorPick")}
            aria-pressed={Inspector.isPicking ? "true" : "false"}
            data-tooltip={appTexts.text("inspectorPick")}
            data-position="bottom right"
            data-inverted=""
            onClick={() => (Inspector.isPicking ? Inspector.stopPicking() : Inspector.startPicking())}
          />
          <ui-icon
            name="close"
            link=""
            class="IconAction"
            label={appTexts.text("inspectorClose")}
            data-tooltip={appTexts.text("inspectorClose")}
            data-position="bottom right"
            data-inverted=""
            onClick={() => Inspector.close()}
          />
        </header>
        <aside class="Inspector" aria-label={appTexts.text("inspector")}>
          <style>{brandTokens()}</style>
          <SplitPanel id="spellEditor-inspector-panes" rows="50%,20%,30%" resizable class="InspectorSplit">
            <div class="InspectorSection InspectorMain">
              <Show
                when={Inspector.picked}
                keyed
                fallback={
                  <p class="InspectorTip">{appTexts.text(Inspector.isPicking ? "inspectorPicking" : "inspectorTip")}</p>
                }
              >
                {(part) => (
                  <>
                    <ui-panel label={part.label} class="InspectorPanel">
                      <ui-property-editor
                        schema={part.schema}
                        value={part.value}
                        ref={(propertyEditor) => onCleanup(Compact.keep(propertyEditor))}
                      >
                        <Show when={part.layout}>
                          {(layout) => (
                            <>
                              <Show when={layout().hasText}>
                                <ui-property name="textContent" label={appTexts.text("inspectorText")} />
                              </Show>
                              <For each={layout().set}>{(field) => <Field field={field} fields={layout().set} />}</For>
                              <Show when={layout().more.length}>
                                <ui-property-group label={appTexts.text("inspectorMore")} collapsible="" collapsed="">
                                  <For each={layout().more}>
                                    {(field) => <Field field={field} fields={layout().more} />}
                                  </For>
                                </ui-property-group>
                              </Show>
                            </>
                          )}
                        </Show>
                      </ui-property-editor>
                    </ui-panel>
                  </>
                )}
              </Show>
            </div>
            <InspectorEvents />
            <InspectorTree />
          </SplitPanel>
        </aside>
      </div>
    </Show>
  )
}

/****************
 * ### `<Field>`
 * One of a Spell UI element's attributes, as the Inspector lays it out.
 * - A size or a colour is half a row (`.half`), so the two share one:  each is a short choice.
 * - So is an attribute and the one that places it, side by side:  `icon` and `icon-position`.
 * - A colour's choices are chips (`<HueSelect>`), not words alone.
 ****************/
function Field(props: { field: FieldSpec; fields: FieldSpec[] }): JSX.Element {
  const isHalf = HALF_KINDS.has(props.field.kind ?? "") || isPositionPair(props.field, props.fields)
  return (
    <ui-property name={props.field.name} class={{ half: isHalf }}>
      <Show when={props.field.kind === "color"}>
        <HueSelect name={props.field.name} />
      </Show>
    </ui-property>
  )
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
 * The Inspector's button, in the app's header:  opens and closes the column.
 ****************/
export function InspectorToggle(): JSX.Element {
  return (
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
  )
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
