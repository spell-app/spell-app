import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import { Inspector, addressKey, type PartRow } from "./Inspector"
import { on } from "./on"

/****************
 * ### `<InspectorTree>`
 * The running app's parts as a tree, "Views", the Inspector's bottom pane (epic `debut` P13, C22):  a row each,
 * its icon and title, nested as they are in the app.
 * - A part is a drawn thing or a Spell UI element (`Inspector.isPart()`);  the elements between them are skipped.
 * - Clicking a row picks that part;  the picked one is highlighted.
 * - A part with parts inside folds:  its caret;  what's folded is remembered with the project.
 * - Its heading sticks while the rows scroll.
 * - Walked again whenever the app's drawing changes, once a frame at most;
 *   then what was picked is picked again, if it was redrawn (`Inspector.restorePick()`).
 * - Its icons are stubs (`Inspector.iconFor()`):  one for drawn things, one for Spell UI elements.
 ****************/
export function InspectorTree(): JSX.Element {
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
  const shown = createMemo(() => shownRows(rows(), foldedKeys()))
  return (
    <section class="Inspector InspectorSection InspectorTree">
      <ui-panel label={appTexts.text("inspectorParts")} class="InspectorPanel" sticky="">
        <Show when={rows().length} fallback={<p class="InspectorTip">{appTexts.text("inspectorNoParts")}</p>}>
          <ul role="tree">
            <For each={shown()}>
              {(row) => (
                <li
                  role="treeitem"
                  class={{ picked: Inspector.picked?.element === row.element }}
                  style={{ "--depth": row.depth }}
                  aria-selected={Inspector.picked?.element === row.element ? "true" : "false"}
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
      </ui-panel>
    </section>
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
  editorPrefs.set(Inspector.projectPref(FOLDED_PREF), [...folded])
  setFoldsChanged((count) => count + 1)
}

/** Counts the folds, so the tree reads them again. */
const [foldsChanged, setFoldsChanged] = createSignal(0)

/** The start of the pref remembering what's folded, a project's each. */
const FOLDED_PREF = "inspector:folded"

/****************
 * ### `<InspectorEvents>`
 * The picked part's events, a pane of the Inspector's own, between its properties and its views
 * (epic `debut` P13, C23).
 * - Nothing picked:  a tip.
 * - What it handles already (`Inspector.eventsOf()`), then what was added here;  "None yet." when neither.
 * - "Add event":  a dropdown of the events a part understands, those it doesn't handle yet.
 *   - For now, the DOM's everyday ones (`DEFAULT_EVENTS`):  click, mouse down ...
 *   - An added event is listed only:  writing its handler into the code is later (T18).
 ****************/
export function InspectorEvents(): JSX.Element {
  return (
    <section class="Inspector InspectorSection InspectorEvents">
      <ui-panel label={appTexts.text("inspectorEvents")} class="InspectorPanel">
        <Show
          when={Inspector.picked}
          keyed
          fallback={<p class="InspectorNone">{appTexts.text("inspectorEventsTip")}</p>}
        >
          {(part) => <PartEvents element={part.element} />}
        </Show>
      </ui-panel>
    </section>
  )
}

/** One part's events, and "Add event". */
function PartEvents(props: { element: Element }): JSX.Element {
  const events = createMemo(() => Inspector.eventsOf(props.element))
  const addable = () => DEFAULT_EVENTS.filter((event) => !events().includes(event))
  return (
    <>
      <Show when={events().length} fallback={<p class="InspectorNone">{appTexts.text("inspectorNoEvents")}</p>}>
        <ul class="InspectorEventList">
          <For each={events()}>
            {(event) => (
              <li>
                <ui-icon name="bolt" />
                {eventText(event)}
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={addable().length}>
        <ui-dropdown
          button=""
          class="InspectorAddEvent"
          ref={on<{ value: string }>("ui-change", (event) => {
            if (event.detail.value) Inspector.addEvent(props.element, event.detail.value)
          })}
        >
          <span slot="trigger">
            <ui-icon name="plus" />
            {appTexts.text("inspectorAddEvent")}
          </span>
          <For each={addable()}>{(event) => <ui-item value={event}>{eventText(event)}</ui-item>}</For>
        </ui-dropdown>
      </Show>
    </>
  )
}

/** An event's name for people:  `mousedown` => `mouse down`;  one with no text of its own, as it is. */
function eventText(event: string): string {
  return (DEFAULT_EVENTS as readonly string[]).includes(event) ? appTexts.text(`event.${event}` as AppTextKey) : event
}

/** The events "Add event" offers, for now:  the DOM's everyday ones, each named in the texts (`event.<name>`). */
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
