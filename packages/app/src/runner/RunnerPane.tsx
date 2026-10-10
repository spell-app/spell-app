import { For } from "solid-js"
import type { JSX } from "@solidjs/web"

import "./RunnerPane.css"

/****************
 * ### `<RunnerPane>`
 * One of a runner's panes:  a toolbar of `tabs`, then `children`, what tab `pane` shows.
 * - A single tab just says what it is.
 * - Tabs are `<ui-item>`s in a `<ui-menu>`:  whoever mounts a runner defines the `<ui-*>` tags
 *   (`$/app/solid/loadUI`, or a root around it:  `<spell-app>`), and gives it Fomantic's icon names
 *   (`<ui-root icons="fomantic">`, `<spell-app>`'s default `icons`).
 * - HACK: each tab's icon is a slotted `<ui-icon>`, not the item's `icon`:  `<ui-menu>` draws that at 0 x 0
 *   (plan doc I1, as `$/app/solid`'s `<Action>`).
 ****************/
export function RunnerPane<Id extends string>(props: RunnerPaneProps<Id>) {
  return (
    <div class="RunnerPane">
      <ui-menu attached="" size="mini" class="RunnerPaneToolbar">
        <For each={props.tabs}>
          {(tab) => (
            <ui-item
              link={props.onPane ? "" : undefined}
              selected={props.pane === tab.id}
              data-tab={tab.id}
              onClick={() => props.onPane?.(tab.id)}
            >
              <ui-icon name={tab.icon} />
              {tab.title}
            </ui-item>
          )}
        </For>
      </ui-menu>
      {props.children}
    </div>
  )
}

/** Props for `<RunnerPane>`. */
export type RunnerPaneProps<Id extends string> = {
  /** Tabs in its toolbar, in order. */
  tabs: RunnerTab<Id>[]
  /** Id of the tab showing. */
  pane: Id
  /** Tab clicked -- none if there's nothing to switch to. */
  onPane?: (pane: Id) => void
  /** What `pane` shows. */
  children?: JSX.Element
}

/** One tab of a `<RunnerPane>`'s toolbar. */
export type RunnerTab<Id extends string> = {
  /** Which it is, e.g. `"types"`. */
  id: Id
  /** Icon, by Fomantic's name, e.g. `sitemap`. */
  icon: string
  /** What it says, e.g. `Type Explorer`. */
  title: string
}
