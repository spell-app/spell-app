import { For, Match, Show, Switch, createEffect, createMemo, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editor, runtimeCore } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import type { ThingExplorerState } from "spell-app/app/ui/ui.types"
import { Inspector, addressKey, type InspectorPanel, type PartRow } from "./Inspector"
import { ThingExplorer } from "./ThingExplorer"
import { TypeExplorer } from "./TypeExplorer"
import { on } from "./on"

/****************
 * ### `<InspectorCard>`
 * One of the Inspector's cards:  a header, in the editor's theme as the App pane's, over its body, in the brand's.
 * - The header:  a caret, the card's icon and title (`title`), then its own buttons (`actions`) and Close.
 * - A click on the caret or title folds the card to its header, or unfolds it (`Inspector.toggleFolded()`).
 * - Close hides the card (`Inspector.setShown()`);  the Inspector's button, held, shows it again.
 * - The body scrolls by itself, and is drawn only while the card is unfolded.
 ****************/
export function InspectorCard(props: {
  /** Which card. */
  panel: InspectorPanel
  /** Its title:  text, or what a card toggles between (Views). */
  title: JSX.Element
  /** Its title's icon. */
  icon?: string
  /** Its own buttons, before Close. */
  actions?: JSX.Element
  /** The body's class. */
  class?: string
  /** The body. */
  children?: JSX.Element
}): JSX.Element {
  const isFolded = () => Inspector.isFolded(props.panel)
  return (
    <section class={["InspectorCard", { folded: isFolded() }]}>
      <header class="AppPaneHeader InspectorCardHead">
        <h2
          aria-expanded={isFolded() ? "false" : "true"}
          title={appTexts.text(isFolded() ? "inspectorUnfold" : "inspectorFold")}
          onClick={() => Inspector.toggleFolded(props.panel)}
        >
          <ui-icon name={isFolded() ? "caret right" : "caret down"} class="InspectorCardFold" />
          <Show when={props.icon}>{(icon) => <ui-icon name={icon()} />}</Show>
          {props.title}
        </h2>
        {props.actions}
        <ui-icon
          name="close"
          link=""
          class="IconAction"
          label={appTexts.text("inspectorHide")}
          data-tooltip={appTexts.text("inspectorHide")}
          data-position="bottom right"
          data-inverted=""
          onClick={() => Inspector.setShown(props.panel, false)}
        />
      </header>
      <Show when={!isFolded()}>
        <div class={["Inspector", "InspectorSection", props.class]}>{props.children}</div>
      </Show>
    </section>
  )
}

/**
 * The running app's parts (reactive):  walked again whenever its drawing changes, once a frame at most.
 * - Then what was picked is picked again, if it was redrawn (`Inspector.restorePick()`).
 * - Call it in a component:  it watches the app while the component lives.
 */
export function appParts(): () => PartRow[] {
  const [redrawn, setRedrawn] = createSignal(0)
  createEffect(
    () => Inspector.area,
    (area) => {
      if (!area) return
      let frame = 0
      const observer = new MutationObserver(() => {
        frame ||= requestAnimationFrame(() => {
          frame = 0
          setRedrawn((count) => count + 1)
        })
      })
      observer.observe(area, { childList: true, subtree: true })
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame)
      }
    }
  )
  const rows = createMemo(() => {
    redrawn()
    const area = Inspector.area
    return area ? Inspector.partsIn(area) : []
  })
  // what was picked comes back, once the app's drawn again
  createEffect(rows, (rows) => {
    Inspector.restorePick(rows)
  })
  return rows
}

/****************
 * ### `<InspectorViews>`
 * The Inspector's bottom card:  the app as Views, Things or Templates, which its header switches between
 * (remembered:  `VIEW_PREF`).
 * - Views:  the running app's parts as a tree (`<PartsTree>`);  the header's double chevron folds them all, or
 *   unfolds them all, as the epic page's does.
 * - Things:  what the running program has made, live (`<ThingExplorer>`).
 * - Templates:  every type the code knows (`<TypeExplorer>`).
 ****************/
export function InspectorViews(props: {
  /** The app's parts (`appParts()`). */
  rows: readonly PartRow[]
}): JSX.Element {
  const [view, setView] = createSignal((editorPrefs.get(VIEW_PREF) as ViewId | undefined) ?? "views")
  const show = (id: ViewId) => {
    setView(id)
    editorPrefs.set(VIEW_PREF, id)
  }
  const parents = () => shownRows(props.rows, new Set()).filter((row) => row.hasChildren)
  const isAllFolded = () => {
    const folded = foldedKeys()
    return parents().length > 0 && parents().every((row) => folded.has(row.key))
  }
  // the Things view's state, kept here so it outlives switching views
  let thingsState: ThingExplorerState = {}
  return (
    <InspectorCard
      panel="views"
      class="InspectorViews"
      title={
        <ui-menu
          appearance="segmented"
          class="InspectorViewTabs"
          onClick={(event: MouseEvent) => event.stopPropagation()}
        >
          <For each={VIEWS}>
            {(id) => (
              <ui-item link="" selected={view() === id} onClick={() => show(id)}>
                <ui-icon name={VIEW_ICONS[id]} />
                {appTexts.text(VIEW_TEXTS[id])}
              </ui-item>
            )}
          </For>
        </ui-menu>
      }
      actions={
        <Show when={view() === "views" && parents().length}>
          <ui-icon
            name={isAllFolded() ? "angle double down" : "angle double up"}
            link=""
            class="IconAction"
            label={appTexts.text(isAllFolded() ? "inspectorExpandAll" : "inspectorCollapseAll")}
            data-tooltip={appTexts.text(isAllFolded() ? "inspectorExpandAll" : "inspectorCollapseAll")}
            data-position="bottom right"
            data-inverted=""
            onClick={() => setFolds(isAllFolded() ? [] : parents().map((row) => row.key))}
          />
        </Show>
      }
    >
      <Switch>
        <Match when={view() === "views"}>
          <PartsTree rows={props.rows} />
        </Match>
        <Match when={view() === "things"}>
          <Show
            when={runtimeCore()?.things}
            keyed
            fallback={<p class="InspectorTip">{appTexts.text("inspectorNoParts")}</p>}
          >
            {(things) => (
              <ThingExplorer
                things={things}
                words={editor.programWords}
                state={thingsState}
                onStateChange={(changed) => (thingsState = changed)}
              />
            )}
          </Show>
        </Match>
        <Match when={view() === "templates"}>
          <TypeExplorer
            tree={editor.scopeTree}
            onOpen={editor.openScopeLink}
            loadDetails={editor.scopeDetails}
            onRefresh={() => void editor.refreshScopes()}
          />
        </Match>
      </Switch>
    </InspectorCard>
  )
}

/** What the Views card shows. */
const VIEWS = ["views", "things", "templates"] as const
/** One of them. */
type ViewId = (typeof VIEWS)[number]
/** Each one's name, in the card's header. */
const VIEW_TEXTS: Record<ViewId, AppTextKey> = {
  views: "inspectorParts",
  things: "inspectorThings",
  templates: "inspectorTemplates"
}
/** Each one's icon:  Things' and Templates' are the Program panel's tabs' (Templates is its Types). */
const VIEW_ICONS: Record<ViewId, string> = { views: "layer group", things: "cubes", templates: "sitemap" }
/** The pref remembering which shows. */
const VIEW_PREF = "inspector:view"

/****************
 * ### `<PartsTree>`
 * The running app's parts as a tree (epic `debut` P13, C22):  a row each, its icon and title, nested as they are
 * in the app.
 * - A part is a drawn thing or a Spell UI element (`Inspector.isPart()`);  the elements between them are skipped.
 * - Clicking a row picks that part;  the picked one is highlighted.
 * - A part with parts inside folds:  its caret;  what's folded is remembered with the project.
 * - Its icons are stubs (`Inspector.iconFor()`):  one for drawn things, one for Spell UI elements.
 ****************/
function PartsTree(props: { rows: readonly PartRow[] }): JSX.Element {
  const shown = createMemo(() => shownRows(props.rows, foldedKeys()))
  return (
    <Show when={props.rows.length} fallback={<p class="InspectorTip">{appTexts.text("inspectorNoParts")}</p>}>
      <ul role="tree" class="InspectorTree">
        <For each={shown()}>
          {(row) => (
            <li
              role="treeitem"
              class={{ picked: Inspector.inspected?.element === row.element }}
              style={{ "--depth": row.depth }}
              aria-selected={Inspector.inspected?.element === row.element ? "true" : "false"}
              aria-expanded={row.hasChildren ? (row.isFolded ? "false" : "true") : undefined}
              onClick={() => Inspector.pick(row.element)}
            >
              <Show when={row.hasChildren} fallback={<span class="InspectorFold" />}>
                <ui-icon
                  name={row.isFolded ? "caret right" : "caret down"}
                  class="InspectorFold"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleFold(row.key)
                  }}
                />
              </Show>
              <ui-icon name={Inspector.iconFor(row.element)} />
              <span>{Inspector.labelFor(row.element)}</span>
            </li>
          )}
        </For>
      </ul>
    </Show>
  )
}

/** A row of the tree as shown:  its part, its key, and whether it has parts inside, folded away. */
type ShownRow = PartRow & { key: string; hasChildren: boolean; isFolded: boolean }

/** `rows` as the tree shows them:  each with its key, the parts inside a folded one left out. */
function shownRows(rows: readonly PartRow[], folded: ReadonlySet<string>): ShownRow[] {
  const shown: ShownRow[] = []
  // rows deeper than this are inside a folded part
  let hiddenBelow = Infinity
  rows.forEach((row, index) => {
    if (row.depth > hiddenBelow) return
    hiddenBelow = Infinity
    const key = addressKey({ index, tag: row.element.localName })
    const hasChildren = (rows[index + 1]?.depth ?? -1) > row.depth
    const isFolded = hasChildren && folded.has(key)
    if (isFolded) hiddenBelow = row.depth
    shown.push({ ...row, key, hasChildren, isFolded })
  })
  return shown
}

/** The parts folded in the tree, by key (reactive):  this project's, remembered. */
function foldedKeys(): ReadonlySet<string> {
  foldsChanged()
  return new Set((editorPrefs.get(Inspector.projectPref(FOLDED_PREF)) as string[] | undefined) ?? [])
}

/** Fold the part at `key`, or unfold it;  remember which. */
function toggleFold(key: string): void {
  const folded = new Set(foldedKeys())
  if (!folded.delete(key)) folded.add(key)
  setFolds([...folded])
}

/** Fold exactly the parts at `keys`;  remember which. */
function setFolds(keys: readonly string[]): void {
  editorPrefs.set(Inspector.projectPref(FOLDED_PREF), keys)
  setFoldsChanged((count) => count + 1)
}

/** Counts the folds, so the tree reads them again. */
const [foldsChanged, setFoldsChanged] = createSignal(0)

/** The start of the pref remembering what's folded, a project's each. */
const FOLDED_PREF = "inspector:folded"

/****************
 * ### `<InspectorEvents>`
 * The picked part's events, a card of the Inspector's own (epic `debut` P13, C23).
 * - Each:  its name as a heading, then its code, typed into a box that grows with it (`<EventCode>`);
 *   what the program was written with to start with (`Inspector.writtenHandlersOf()`).
 * - What it handles already (`Inspector.eventsOf()`), then what was added here;  "None yet." when neither.
 * - The header's "+" adds one:  a dropdown of the events a part understands, those it doesn't handle yet.
 *   - For now, the DOM's everyday ones (`DEFAULT_EVENTS`):  click, mouse down ...
 *   - Writing an event's code into the program is later (T18):  it's kept with the project for now.
 * - Nothing picked:  a tip.
 ****************/
export function InspectorEvents(): JSX.Element {
  const events = createMemo(() => {
    const element = Inspector.inspected?.element
    return element ? Inspector.eventsOf(element) : []
  })
  const addable = () => DEFAULT_EVENTS.filter((event) => !events().includes(event))
  return (
    <InspectorCard
      panel="events"
      class="InspectorEvents"
      icon="bolt"
      title={appTexts.text("inspectorEvents")}
      actions={
        <Show when={Inspector.inspected?.element && addable().length}>
          <ui-dropdown
            class="InspectorAddEvent"
            aria-label={appTexts.text("inspectorAddEvent")}
            data-tooltip={appTexts.text("inspectorAddEvent")}
            data-position="bottom right"
            data-inverted=""
            ref={on<{ value: string }>("ui-changed", (event) => {
              const element = Inspector.inspected?.element
              if (element && event.detail.value) Inspector.addEvent(element, event.detail.value)
            })}
          >
            <ui-icon slot="trigger" name="plus" />
            <For each={addable()}>{(event) => <ui-item value={event}>{eventText(event)}</ui-item>}</For>
          </ui-dropdown>
        </Show>
      }
    >
      <Show
        when={Inspector.inspected?.element}
        keyed
        fallback={<p class="InspectorNone">{appTexts.text("inspectorEventsTip")}</p>}
      >
        {(element) => (
          <Show when={events().length} fallback={<p class="InspectorNone">{appTexts.text("inspectorNoEvents")}</p>}>
            <For each={events()}>
              {(event) => (
                <EventCode element={element} event={event} written={Inspector.writtenHandlersOf(element)[event]} />
              )}
            </For>
          </Show>
        )}
      </Show>
    </InspectorCard>
  )
}

/**
 * One of a part's events:  its name, then its code, in a box that grows as it's typed into.
 * - Its code:  what was typed here, else what the program was written with (`written`), else empty.
 */
function EventCode(props: { element: Element; event: string; written?: string }): JSX.Element {
  const key = () => `${Inspector.keyOf(props.element) ?? ""}|${props.event}`
  return (
    <section class="InspectorEvent">
      <h3>{eventText(props.event)}</h3>
      <textarea
        class="InspectorCode"
        rows={2}
        spellcheck={false}
        placeholder={appTexts.text("inspectorEventCode", { event: eventText(props.event) })}
        value={eventCode()[key()] ?? props.written ?? ""}
        ref={(textarea) => requestAnimationFrame(() => fitHeight(textarea))}
        onInput={(input) => {
          fitHeight(input.currentTarget)
          setEventCode(key(), input.currentTarget.value)
        }}
      />
    </section>
  )
}

/** Grow (or shrink) `textarea` to its text:  where the browser can't (`field-sizing`), by hand. */
function fitHeight(textarea: HTMLTextAreaElement): void {
  if (CSS.supports("field-sizing", "content")) return
  textarea.style.height = "auto"
  textarea.style.height = `${textarea.scrollHeight}px`
}

/** The code typed for events, by part and event (`<key>|<event>`;  reactive):  this project's, remembered. */
function eventCode(): Record<string, string> {
  codeChanged()
  return (editorPrefs.get(Inspector.projectPref(CODE_PREF)) as Record<string, string> | undefined) ?? {}
}

/** Remember `code` for the event at `key`. */
function setEventCode(key: string, code: string): void {
  editorPrefs.set(Inspector.projectPref(CODE_PREF), { ...eventCode(), [key]: code })
  setCodeChanged((count) => count + 1)
}

/** Counts the code typed, so the boxes read it again. */
const [codeChanged, setCodeChanged] = createSignal(0)

/** The start of the pref remembering the code typed for events, a project's each. */
const CODE_PREF = "inspector:code"

/** An event's name for people:  `mousedown` => `mouse down`;  one with no text of its own, as it is. */
function eventText(event: string): string {
  return (DEFAULT_EVENTS as readonly string[]).includes(event) ? appTexts.text(`event.${event}` as AppTextKey) : event
}

/** The events "+" offers, for now:  the DOM's everyday ones, each named in the texts (`event.<name>`). */
const DEFAULT_EVENTS = [
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mouseenter",
  "mouseleave",
  "focus",
  "blur",
  "keydown",
  "keyup"
] as const
