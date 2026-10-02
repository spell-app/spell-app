/** @jsxImportSource react */
import { observe, unobserve } from "@nx-js/observer-util"
import classnames from "classnames"
import React from "react"
import * as SUI from "semantic-ui-react"

import type { ThingAction, ThingLike, ThingRegistry } from "$/core/things"
import type { ThingExplorerState, ThingOrder } from "./ui.types"
import { TreeRow } from "./TypeExplorer"
import { SCOPE_ICONS, SectionMarker, sectionStartsAt } from "./ScopeDetailsPane"

import "./TypeExplorer.css"
import "./ThingExplorer.css"

/****************
 * ### `<ThingExplorer>`
 * Things the running program has made:  a tree of them on the left -- its top-level things, then all of them --
 * and the selected thing's properties and actions on the right, live as the program changes them.
 * - `things` is the registry of the runtime copy the program runs on, e.g. `loaded.runtime.spellCore.things` --
 *   NEVER the page's own `spellCore`, see `spellRuntime.ts`.  Only a TYPE import here, so it stays out of
 *   the runner's bundle.
 * - Lists all of them in the order they were made, or under each type they are -- the buttons in its header
 *   switch.  See `UI.ThingOrder`.
 * - Keeps what's selected and open as a `UI.ThingExplorerState` through `state` + `onStateChange` -- else just
 *   while it's showing.
 * - NEVER reads the program's things while rendering:  a computed property runs the program's code, which may
 *   change what it just read, e.g. `spellCore.map()` filling the list it made -- and in a `view()` render,
 *   that re-renders mid-render, forever (React error #301).  So `describeThings()` reads them in
 *   `watchLive()`, OUTSIDE React's render, and we draw its plain `ThingsSnapshot` -- again as they change.
 ****************/
export function ThingExplorer({ things, state: initial, onStateChange }: ThingExplorerProps) {
  const [state, setState] = React.useState<ThingExplorerState>(() => initial ?? {})
  const order = state.order ?? "document"
  const open = state.open ?? [TOP_LEVEL, ALL]
  const snapshot = useLive(
    () => describeThings(things, { order, open, selected: state.selected }),
    [things, order, open.join("\n"), state.selected]
  )
  if (!snapshot) return <div className="TypeExplorer ThingExplorer empty">Loading…</div>
  return (
    <ThingExplorerView
      things={things}
      snapshot={snapshot}
      order={order}
      onOrder={(changed) => update({ order: changed })}
      onToggle={toggle}
      onSelect={select}
    />
  )

  /** Change `changed` in our state, and have it remembered. */
  function update(changed: ThingExplorerState) {
    const next = { ...state, ...changed }
    setState(next)
    onStateChange?.(next)
  }

  /** Open or close tree row `key` -- see `ThingExplorerState.open`. */
  function toggle(key: string) {
    const next = new Set(open)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    update({ open: [...next] })
  }

  /** Show `thing`'s details, with its own type open in the tree. */
  function select(thing: ThingLike) {
    update({ selected: thingKey(things, thing), open: [...new Set([...open, typeKey(thing.type)])] })
  }
}

/** Props for `<ThingExplorer>`. */
export type ThingExplorerProps = {
  /** Registry of the things to show -- the running program's `spellCore.things`. */
  things: ThingRegistry
  /** What to start with, as last remembered. */
  state?: ThingExplorerState
  /** Something changed:  remember `state`. */
  onStateChange?: (state: ThingExplorerState) => void
}

/****************
 * ### `<ThingExplorerView>`
 * Both panes of a `<ThingExplorer>`, from a `snapshot` of its things:  the tree, and the selected one's details.
 * - "Top level" first, whatever `order`:  the program's top-level things, plain lists too, e.g. `all_piles`.
 * - Then, in `document` order, "All things" in the order they were made, with a `<SectionMarker>` for each
 *   heading whose code made them -- see `ThingRegistry.heading()`.  Or, by `type`, a row for each type,
 *   listing its things and its sub-types' -- see `ThingRegistry.bySuperType()`.
 * - Reads NOTHING of the program's -- all it shows is in `snapshot`.  See `<ThingExplorer>`.
 ****************/
export function ThingExplorerView({ things, snapshot, order, onOrder, onToggle, onSelect }: ThingExplorerViewProps) {
  const { topLevel, groups, details } = snapshot
  if (!topLevel.length && !groups.some((group) => group.count)) {
    return <div className="TypeExplorer ThingExplorer empty">Run the project to see its things.</div>
  }
  const rowProps = { selected: details?.key, onSelect }
  return (
    <div className="TypeExplorer ThingExplorer">
      <div className="ScopesPane">
        <div className="PaneHeader">
          Things
          <span className="tools">
            {ORDERS.map(({ id, icon, title }) => (
              <SUI.Icon
                key={id}
                name={icon}
                link
                className={classnames("order", { active: order === id })}
                title={title}
                onClick={() => onOrder(id)}
              />
            ))}
          </span>
        </div>
        <div className="PaneBody">
          {!!topLevel.length && (
            <GroupRow
              group={{ key: TOP_LEVEL, label: "Top level", count: topLevel.length, isOpen: snapshot.topLevelOpen }}
              onToggle={onToggle}
            />
          )}
          {snapshot.topLevelOpen && topLevel.map((row) => <ThingRow key={row.name} row={row} {...rowProps} />)}
          {groups.map((group) => (
            <React.Fragment key={group.key}>
              <GroupRow group={group} onToggle={onToggle} />
              {group.rows?.map((row, index) => (
                <React.Fragment key={row.key}>
                  {group.key === ALL && sectionStartsAt(group.rows!, index) && (
                    <SectionMarker section={row.section} style={{ paddingLeft: MARKER_INDENT }} />
                  )}
                  <ThingRow row={row} {...rowProps} />
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="DetailsPane">
        <div className="PaneHeader">Details</div>
        <div className="PaneBody">
          {details ? (
            <ThingDetails things={things} details={details} onSelect={onSelect} />
          ) : (
            <div className="ScopeDetails empty">Select a thing to see its properties.</div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Props for `<ThingExplorerView>`. */
export type ThingExplorerViewProps = {
  /** Registry the things are in -- only to do an action. */
  things: ThingRegistry
  /** What to show -- see `describeThings()`. */
  snapshot: ThingsSnapshot
  /** Order it's in. */
  order: ThingOrder
  /** An order button clicked. */
  onOrder: (order: ThingOrder) => void
  /** Open / close tree row `key`. */
  onToggle: (key: string) => void
  /** Select `thing`. */
  onSelect: (thing: ThingLike) => void
}

/****************
 * ### `<GroupRow>`
 * Row of the tree which just opens and closes:  "Top level", "All things", or a type.
 ****************/
function GroupRow({ group, onToggle }: GroupRowProps) {
  const { key, icon, label, count, isOpen } = group
  return (
    <TreeRow
      className="ThingTreeGroup"
      depth={0}
      isOpen={isOpen}
      onToggle={() => onToggle(key)}
      onClick={() => onToggle(key)}
    >
      <span className="label">
        {!!icon && <SUI.Icon name={icon} />}
        {label} <span className="detail">{count}</span>
      </span>
    </TreeRow>
  )
}

/** Props for `<GroupRow>`. */
type GroupRowProps = {
  /** Row to show. */
  group: Pick<ThingGroup, "key" | "icon" | "label" | "count" | "isOpen">
  /** Open / close row `key`. */
  onToggle: (key: string) => void
}

/****************
 * ### `<ThingRow>`
 * One thing in the tree, e.g. `Foundation clubs`, with an icon saying whether it's a list -- click to select it.
 * - Scrolls itself into view when selected, e.g. from a link in `<ThingDetails>`.
 ****************/
function ThingRow({ row, selected, onSelect }: ThingRowProps) {
  const isSelected = row.key !== undefined && row.key === selected
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (isSelected) ref.current?.scrollIntoView({ block: "nearest" })
  }, [isSelected])
  return (
    <TreeRow
      rowRef={ref}
      className={classnames("ThingTreeNode", { selected: isSelected })}
      depth={1}
      onToggle={() => onSelect(row.thing)}
      onClick={() => onSelect(row.thing)}
    >
      <span className="label">
        <ThingIcon isList={row.isList} />
        {row.label}
      </span>
    </TreeRow>
  )
}

/** Props for `<ThingRow>`. */
type ThingRowProps = {
  /** Thing to show. */
  row: ThingRowData
  /** Key of the selected thing. */
  selected?: string
  /** Select `thing`. */
  onSelect: (thing: ThingLike) => void
}

/** Icon for a thing:  a list, or any other thing. */
function ThingIcon({ isList }: { isList: boolean }) {
  return <SUI.Icon name={isList ? LIST_ICON : THING_ICON} title={isList ? "list" : "thing"} />
}

/****************
 * ### `<ThingDetails>`
 * Selected thing:  what it's called, its types, its properties -- computed ones too -- its actions, and its
 * items, if it's a list.
 * - An action which takes no arguments, e.g. `turn over`, has a ▶ to do it -- see `ThingRegistry.perform()`.
 ****************/
function ThingDetails({ things, details, onSelect }: ThingDetailsProps) {
  const { thing, label, isList, typeChain, properties, actions, items } = details
  return (
    <div className="ScopeDetails ThingDetails">
      <div className="title">
        <ThingIcon isList={isList} />
        {label}
      </div>
      <div className="TypeChain">{typeChain.join(" → ")}</div>
      {properties.length > 0 && (
        <>
          <div className="DetailsSectionTitle">Properties</div>
          <table className="ThingValues">
            <tbody>
              {properties.map(({ name, computed, value }) => (
                <tr key={name}>
                  <th title={computed ? "computed" : undefined}>
                    <SUI.Icon name={SCOPE_ICONS.property} />
                    {name}
                  </th>
                  <td>
                    <ThingValue value={value} onSelect={onSelect} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {actions.length > 0 && (
        <>
          <div className="DetailsSectionTitle">Actions</div>
          <table className="ThingValues">
            <tbody>
              {actions.map((action) => (
                <tr key={action.name}>
                  <th>
                    <SUI.Icon name={SCOPE_ICONS.method} />
                    {action.label}
                    {!!action.inheritedFrom && <span className="inherited">from {action.inheritedFrom}</span>}
                  </th>
                  <td>
                    {action.arguments === 0 && (
                      <SUI.Icon
                        name="play"
                        link
                        className="perform"
                        title={`Do it:  ${action.name}()`}
                        onClick={() => things.perform(thing, action.name)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {items && (
        <>
          <div className="DetailsSectionTitle">
            Items <span className="detail">{items.length}</span>
          </div>
          <ValueList values={items} onSelect={onSelect} />
        </>
      )}
    </div>
  )
}

/** Props for `<ThingDetails>`. */
type ThingDetailsProps = {
  /** Registry the thing is in -- to do its actions. */
  things: ThingRegistry
  /** What to show of it. */
  details: ThingDetailsData
  /** Select `thing`, e.g. a link clicked. */
  onSelect: (thing: ThingLike) => void
}

/****************
 * ### `<ThingValue>`
 * One value in `<ThingDetails>`:  plain values as spell writes them, a thing we can select as a link.
 * - A list opens in place to show its items -- a native `<details>`, so it needs no state.
 ****************/
function ThingValue({ value, onSelect }: ThingValueProps) {
  switch (value.kind) {
    case "empty":
      return <span className="ThingValue empty">empty</span>
    case "thing":
      return (
        <a className="ThingValue thing" onClick={() => onSelect(value.thing)}>
          {value.label}
        </a>
      )
    case "list":
      if (!value.items) return <span className="ThingValue other">{value.summary}</span>
      return (
        <details className="ThingValue list">
          <summary>{value.summary}</summary>
          <ValueList values={value.items} onSelect={onSelect} />
        </details>
      )
    default:
      return <span className={classnames("ThingValue", value.kind)}>{value.text}</span>
  }
}

/** Props for `<ThingValue>`. */
type ThingValueProps = {
  /** Value to show. */
  value: ShownValue
  /** Select `thing`, e.g. a link clicked. */
  onSelect: (thing: ThingLike) => void
}

/** `values` numbered from 1, e.g. a list's items. */
function ValueList({ values, onSelect }: { values: ShownValue[]; onSelect: (thing: ThingLike) => void }) {
  return (
    <table className="ThingValues">
      <tbody>
        {values.map((value, index) => (
          <tr key={index}>
            <th>{index + 1}</th>
            <td>
              <ThingValue value={value} onSelect={onSelect} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

////////////////
// ## Snapshots
////////////////

/**
 * All a `<ThingExplorerView>` shows of `things`, read now -- the rows of the open groups only, and the details of
 * thing `selected`, if it's still there.
 * - Runs the program's code, e.g. computed properties:  NEVER call it while React renders.  See `<ThingExplorer>`.
 */
export function describeThings(things: ThingRegistry, { order, open, selected }: DescribeOptions): ThingsSnapshot {
  const isOpen = new Set(open)
  const topLevel = things.topLevel()
  const all = things.all()
  const ofTypes =
    order === "type"
      ? things.bySuperType().map(({ type, things: ofType }) => ({ key: typeKey(type), label: type, ofType }))
      : [{ key: ALL, label: "All things", ofType: all }]
  const groups: ThingGroup[] = ofTypes.map(({ key, label, ofType }) => {
    const group: ThingGroup = { key, label, count: ofType.length, isOpen: isOpen.has(key) }
    if (order === "type") group.icon = SCOPE_ICONS.type
    if (group.isOpen) group.rows = ofType.map(rowFor)
    return group
  })
  const thing =
    selected === undefined
      ? undefined
      : (topLevel.find((it) => thingKey(things, it.thing) === selected)?.thing ??
        all.find((it) => thingKey(things, it) === selected))
  return {
    topLevel: topLevel.map(({ name, thing }) => ({ ...rowFor(thing), name })),
    topLevelOpen: isOpen.has(TOP_LEVEL),
    groups,
    details: thing && detailsOf(thing)
  }

  /** Tree row for `thing`. */
  function rowFor(thing: ThingLike): ThingRowData {
    const row: ThingRowData = {
      key: thingKey(things, thing),
      thing,
      label: things.labelOf(thing),
      isList: !!things.itemsOf(thing)
    }
    const section = things.headingOf(thing)
    if (section) row.section = section
    return row
  }

  /** Details of `thing`. */
  function detailsOf(thing: ThingLike): ThingDetailsData {
    const items = things.itemsOf(thing)
    return {
      ...rowFor(thing),
      key: selected!,
      typeChain: things.typeChainOf(thing),
      properties: things.propertiesOf(thing).map(({ name, computed }) => {
        const read = things.read(thing, name)
        return { name, computed, value: "error" in read ? { kind: "error", text: read.error } : shown(read.value) }
      }),
      actions: things.actionsOf(thing),
      ...(items ? { items: items.map((item) => shown(item)) } : {})
    }
  }

  /**
   * `value` as `<ThingValue>` shows it:  plain values as spell writes them, a thing we can select as a link,
   * a list with its items -- `depth` lists deep, down to `MAX_DEPTH`.
   */
  function shown(value: unknown, depth = 0): ShownValue {
    if (value === undefined || value === null) return { kind: "empty" }
    switch (typeof value) {
      case "string":
        return { kind: "text", text: JSON.stringify(value) }
      case "number":
      case "boolean":
      case "bigint":
        return { kind: typeof value as "number" | "boolean" | "bigint", text: String(value) }
      case "function":
        return { kind: "other", text: "action" }
    }
    if (things.isThing(value) && thingKey(things, value)) {
      return { kind: "thing", label: things.labelOf(value), thing: value }
    }
    const items = Array.isArray(value)
      ? (value as unknown[])
      : things.isThing(value)
        ? things.itemsOf(value)
        : undefined
    if (!items) return { kind: "other", text: `${constructorName(value)} {…}` }
    const summary = `${things.isThing(value) ? value.type : "list"} of ${items.length}`
    if (!items.length || depth >= MAX_DEPTH) return { kind: "list", summary }
    return { kind: "list", summary, items: items.map((item) => shown(item, depth + 1)) }
  }
}

/** What `describeThings()` needs to know of a `<ThingExplorer>`'s state. */
export type DescribeOptions = {
  /** Order the tree's in. */
  order: ThingOrder
  /** Keys of its open rows. */
  open: string[]
  /** Key of the selected thing, if any. */
  selected?: string
}

/** All a `<ThingExplorerView>` shows -- plain data, read from the program's things by `describeThings()`. */
export type ThingsSnapshot = {
  /** The program's top-level things, each with its variable's name. */
  topLevel: Array<ThingRowData & { name: string }>
  /** Is "Top level" open? */
  topLevelOpen: boolean
  /** "All things", or one per type. */
  groups: ThingGroup[]
  /** The selected thing's details, if it's still there. */
  details?: ThingDetailsData
}

/** A group of rows in the tree:  "All things", or a type's. */
export type ThingGroup = {
  /** Its key in `ThingExplorerState.open`, e.g. `type:Card`. */
  key: string
  /** Icon before it, e.g. for a type. */
  icon?: SUI.SemanticICONS
  /** What it says, e.g. `Card`. */
  label: string
  /** How many things are in it. */
  count: number
  /** Is it open? */
  isOpen: boolean
  /** Its things' rows -- only if it's open. */
  rows?: ThingRowData[]
}

/** A thing, as the tree shows it. */
export type ThingRowData = {
  /** Its key -- see `thingKey()`. */
  key?: string
  /** The thing. */
  thing: ThingLike
  /** What it's called, e.g. `Foundation clubs`. */
  label: string
  /** Is it a list? */
  isList: boolean
  /** Heading whose code made it, e.g. `set up all piles` -- see `ThingRegistry.heading()`. */
  section?: string
}

/** A thing, as its details show it. */
export type ThingDetailsData = ThingRowData & {
  /** Its key. */
  key: string
  /** Its type, then each it extends -- see `ThingRegistry.typeChainOf()`. */
  typeChain: string[]
  /** Each property, and its value now. */
  properties: Array<{ name: string; computed: boolean; value: ShownValue }>
  /** What it can do. */
  actions: ThingAction[]
  /** Its items, if it's a list. */
  items?: ShownValue[]
}

/** A value, as `<ThingValue>` shows it. */
export type ShownValue =
  | { kind: "empty" }
  | { kind: "text" | "number" | "boolean" | "bigint" | "other" | "error"; text: string }
  | { kind: "thing"; label: string; thing: ThingLike }
  | { kind: "list"; summary: string; items?: ShownValue[] }

/**
 * `work()`'s answer, live -- see `watchLive()` -- and again whenever `deps` change.  `undefined` until it first
 * runs, after the first render.
 */
function useLive<T>(work: () => T, deps: unknown[]): T | undefined {
  const [live, setLive] = React.useState<{ value: T }>()
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- `deps` says when `work` changes
  React.useEffect(() => watchLive(work, (value) => setLive({ value })), deps)
  return live?.value
}

/**
 * Hand `onValue()` what `work()` answers now, and again whenever something it read changes -- until the
 * function we answer is called.
 * - A reaction, OUTSIDE React's render.
 * - What `work()` changes itself, while it runs, does NOT set it off again -- e.g. a computed property filling a
 *   list it made, which it's just read.  Why:  `observer-util` queues a reaction set off while it runs, to run
 *   again after -- when it'd make, fill and read a new list, and queue itself again, forever.  NOT `autoEffect()`.
 * - Changes made while it isn't running set it off once, in a microtask -- however many there are.
 */
export function watchLive<T>(work: () => T, onValue: (value: T) => void): () => void {
  let running = false
  let queued = false
  let stopped = false
  const reaction = observe(
    () => {
      running = true
      try {
        onValue(work())
      } finally {
        running = false
      }
    },
    { scheduler: rerun }
  )
  return () => {
    stopped = true
    unobserve(reaction)
  }

  /** Run `work()` again, soon -- unless it's running, or already due to. */
  function rerun() {
    if (running || queued) return
    queued = true
    queueMicrotask(() => {
      queued = false
      if (!stopped) reaction()
    })
  }
}

////////////////
// ## Helpers
////////////////

/** Key of the "Top level" tree row. */
const TOP_LEVEL = "top"

/** Key of the "All things" tree row, in document order. */
const ALL = "all"

/** Indent of a `<SectionMarker>` among a group's rows, in px -- as `<TypeExplorer>`'s, past the rows' arrows. */
const MARKER_INDENT = 36

/** Deepest lists open in place, e.g. a list of lists of lists. */
const MAX_DEPTH = 3

/** Icon for a thing which is a list, e.g. a `Deck`. */
const LIST_ICON: SUI.SemanticICONS = "list"

/** Icon for any other thing, e.g. a `Card`. */
const THING_ICON: SUI.SemanticICONS = "dot circle outline"

/** Each order the tree can be in, as a button in its header -- see `UI.ThingOrder`. */
const ORDERS: Array<{ id: ThingOrder; icon: SUI.SemanticICONS; title: string }> = [
  { id: "document", icon: "list ol", title: "In the order they were made" },
  { id: "type", icon: SCOPE_ICONS.type, title: "By type, sub-types included" }
]

/** Key of type `type`'s tree row, e.g. `type:Card`. */
function typeKey(type: string): string {
  return `type:${type}`
}

/**
 * Key `thing` is known by in a `ThingExplorerState`:  `#12` by creation number, else `@all_piles` by top-level
 * name -- `undefined` for neither, e.g. a plain list that's some thing's property.
 */
function thingKey(things: ThingRegistry, thing: ThingLike): string | undefined {
  const number = things.numberOf(thing)
  if (number) return `#${number}`
  const name = things.nameOf(thing)
  return name ? `@${name}` : undefined
}

/** Name of `value`'s class, e.g. `Date` -- `object` if it has none. */
function constructorName(value: unknown): string {
  return (value as { constructor?: { name?: string } }).constructor?.name || "object"
}
