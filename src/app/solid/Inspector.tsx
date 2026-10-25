import { For, Show, createSignal, onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { ClassSchemas } from "spell-app/app/ui/ClassSchemas"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { SpellElement } from "spell-app/app/runner/SpellElement"

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
    if (appArea) Picker.listen(appArea)
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
  }

  /**
   * Watch `area`, the element the running app draws in:  `<AppPane>`'s, as it's drawn.
   * - Picking listens there;  a new area while picking moves the listening to it.
   * - Returns the cleanup:  forget it, if it's still the one watched.
   */
  static watch(area: HTMLElement): () => void {
    appArea = area
    if (isPicking()) Picker.listen(area)
    return () => {
      if (appArea !== area) return
      appArea = undefined
      Picker.stop()
    }
  }

  /** What `element` is, as the Inspector shows it:  a drawn thing, a Spell UI element, else `undefined`. */
  static partFor(element: Element): Picked | undefined {
    const thing = SpellElement.thingOf(element)
    if (thing) {
      const type = thing.constructor.name
      const name = (thing as { name?: unknown }).name
      return {
        element,
        value: thing,
        schema: ClassSchemas.fromClass(thing.constructor),
        label: typeof name === "string" && name ? `${type} · ${name}` : type
      }
    }
    if (element.localName.startsWith(UI_PREFIX)) {
      // its attributes as its vocabulary lists them:  those it sets first, the rest under "More"
      const component = (element as Element & { component?: { vocabulary?: { attributes?: { name: string }[] } } })
        .component
      const names = component?.vocabulary?.attributes?.map((attribute) => attribute.name) ?? []
      return {
        element,
        value: element,
        schema: element.localName,
        label: `<${element.localName}>`,
        layout: {
          // its text, when it holds only text:  a button's words aren't an attribute
          hasText: element.childElementCount === 0 && !!element.textContent?.trim(),
          set: names.filter((name) => element.hasAttribute(name)),
          more: names.filter((name) => !element.hasAttribute(name))
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
    set: string[]
    /** The rest. */
    more: string[]
  }
}

/** The preference that remembers whether the Inspector is open. */
const OPEN_PREF = "inspector"
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
 * - Its look is the brand's Theme Creator inspector, in the Spell Brand theme whatever the editor wears:
 *   that theme's tokens, re-declared on the column (`UI.themes.scopedTokens()`, J63).
 * - Its header:  its title, then crosshairs (pick again) and Close.
 * - Below:  what's picked, a `<ui-property-editor>` in a panel titled with what it is;
 *   a Spell UI element's fields in its `layout`:  its text, what it sets, then "More" folded;
 *   nothing picked:  a tip.
 ****************/
export function InspectorColumn(): JSX.Element {
  void loadBrandTokens()
  return (
    <Show when={Inspector.isOpen}>
      <aside class="Inspector" aria-label={appTexts.text("inspector")}>
        <style>{brandTokens()}</style>
        <header class="InspectorHead">
          <span class="InspectorTitle">{appTexts.text("inspector")}</span>
          <ui-icon
            name="crosshairs"
            link=""
            class={["IconAction", { active: Inspector.isPicking }]}
            label={appTexts.text("inspectorPick")}
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
        <Show
          when={Inspector.picked}
          keyed
          fallback={
            <p class="InspectorTip">{appTexts.text(Inspector.isPicking ? "inspectorPicking" : "inspectorTip")}</p>
          }
        >
          {(part) => (
            <ui-panel label={part.label} class="InspectorPanel">
              <ui-property-editor
                size="small"
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
                      <For each={layout().set}>{(name) => <ui-property name={name} />}</For>
                      <Show when={layout().more.length}>
                        <ui-property-group label={appTexts.text("inspectorMore")} collapsible="" collapsed="">
                          <For each={layout().more}>{(name) => <ui-property name={name} />}</For>
                        </ui-property-group>
                      </Show>
                    </>
                  )}
                </Show>
              </ui-property-editor>
            </ui-panel>
          )}
        </Show>
      </aside>
    </Show>
  )
}

/****************
 * ### `<InspectorToggle>`
 * The Inspector's button, in the app's header:  opens and closes the column.
 ****************/
export function InspectorToggle(): JSX.Element {
  return (
    <ui-icon
      name="sliders horizontal"
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
