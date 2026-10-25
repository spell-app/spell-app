import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import { Inspector } from "./Inspector"
import { on } from "./on"

/****************
 * ### `<InspectorTree>`
 * The running app's parts as a tree, "Views", the Inspector's bottom pane (epic `debut` P13, C22):  a row each,
 * its icon and title, nested as they are in the app.
 * - A part is a drawn thing or a Spell UI element (`Inspector.isPart()`);  the elements between them are skipped.
 * - Clicking a row picks that part;  the picked one is highlighted.
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
  return (
    <section class="InspectorSection InspectorTree">
      <ui-panel label={appTexts.text("inspectorParts")} class="InspectorPanel">
        <Show when={rows().length} fallback={<p class="InspectorTip">{appTexts.text("inspectorNoParts")}</p>}>
          <ul role="tree">
            <For each={rows()}>
              {(row) => (
                <li
                  role="treeitem"
                  class={{ picked: Inspector.picked?.element === row.element }}
                  style={{ "--depth": row.depth }}
                  aria-selected={Inspector.picked?.element === row.element ? "true" : "false"}
                  onClick={() => Inspector.pick(row.element)}
                >
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
    <section class="InspectorSection InspectorEvents">
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
