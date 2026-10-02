/** @jsxImportSource react */
import * as SUI from "semantic-ui-react"

import "./RunnerPane.css"

/****************
 * ### `<RunnerPane>`
 * One of a runner's panes:  a toolbar of `tabs`, then `content`, showing tab `pane`.
 * - A single tab just says what it is.
 ****************/
export function RunnerPane<Id extends string>({ tabs, pane, onPane, content }: RunnerPaneProps<Id>) {
  return (
    <div className="RunnerPane">
      <SUI.Menu attached size="mini" className="RunnerPaneToolbar">
        {tabs.map((tab) => (
          <SUI.Menu.Item
            key={tab.id}
            icon={tab.icon}
            content={tab.title}
            active={pane === tab.id}
            onClick={onPane && (() => onPane(tab.id))}
          />
        ))}
      </SUI.Menu>
      {content}
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
  content: ReactNode
}

/** One tab of a `<RunnerPane>`'s toolbar. */
export type RunnerTab<Id extends string> = {
  /** Which it is, e.g. `"types"`. */
  id: Id
  /** Semantic UI icon, e.g. `sitemap`. */
  icon: SUI.SemanticICONS
  /** What it says, e.g. `Type Explorer`. */
  title: string
}
