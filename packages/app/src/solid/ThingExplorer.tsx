import { For, Match, Show, Switch, createEffect, createMemo, createSignal, untrack } from "solid-js"

import type { ThingAction, ThingLike, ThingRegistry } from "$/core/things"
import type { ThingExplorerState, ThingOrder } from "$/app/ui/ui.types"
import { tracked } from "./tracked"
import { SCOPE_ICONS, SectionMarker, sectionStartsAt } from "./ScopeDetailsPane"
import { TreeRow } from "./TypeExplorer"

import "./TypeExplorer.css"
import "./ThingExplorer.css"

/****************
 * ### `<ThingExplorer>`
 * Things the running program has made:  a tree of them on the left -- its top-level things, then all of them --
 * and the selected thing's properties and actions on the right, live as the program changes them.
 * - `things` is the registry of the runtime copy the program runs on, e.g. `loaded.runtime.spellCore.things` --
 *   NEVER the page's own `spellCore`, see `spellRuntime.ts`.  Only a TYPE import here, so it stays out of
 *   the runner's bundle.  A different registry starts the tree afresh (state kept).
 * - Lists all of them in the order they were made, or under each type they are -- the buttons in its header
 *   switch.  See `UI.ThingOrder`.
 * - Keeps what's selected and open as a `UI.ThingExplorerState` through `state` + `onStateChange` -- else just
 *   while it's showing.  `state` is read ONCE, as it mounts:  echoing `onStateChange` back into it is fine.
 * - LIVE, and narrowly:  each piece reads the program's things (`easy-state`) through its OWN accessor, so a
 *   change redraws just what read it:
 *   - the tree's lists:  the registry's `version` (things made and dropped), through `tracked()`
 *   - each row's label;  each property's value;  a list's items:  through `tracked(, { deferred: true })`, as reading them
 *     runs the PROGRAM's code, e.g. a card's computed `name` -- a microtask after the change, then `flush()`
 *   - NEVER a Solid store:  a store would wrap the things in proxies, and `===` breaks.
 * - (React's version re-read a whole snapshot in a microtask, `watchLive()`, and redrew it all.)
 * - NOTE: imports its peers directly, NOT the `$/app/solid` barrel:  a runner's bundle would get the whole editor
 *   through it (`Actions.tsx`).  So its `<ui-*>` tags are the CALLER's to define:  the barrel or `./loadUI`.  Not
 *   imported here:  `$/ui` can't load under node (`customElements`), and the `node` tests render this.
 ****************/
export function ThingExplorer(props: ThingExplorerProps) {
  const [state, setState] = createSignal<ThingExplorerState>(untrack(() => props.state) ?? {})
  return (
    <Show when={props.things} keyed>
      {(things) => <ThingExplorerView things={things} state={state()} onChange={update} />}
    </Show>
  )

  /** Change `changed` in our state, and have it remembered. */
  function update(changed: ThingExplorerState) {
    const next = { ...state(), ...changed }
    setState(next)
    props.onStateChange?.(next)
  }
}

/** Props for `<ThingExplorer>`. */
export type ThingExplorerProps = {
  /** Registry of the things to show -- the running program's `spellCore.things`. */
  things: ThingRegistry
  /** What to start with, as last remembered -- read once, as it mounts. */
  state?: ThingExplorerState
  /** Something changed:  remember `state`. */
  onStateChange?: (state: ThingExplorerState) => void
}

/****************
 * ### `<ThingExplorerView>`
 * Both panes of a `<ThingExplorer>`, for one registry:  the tree, and the selected thing's details.
 * - "Top level" first, whatever `order`:  the program's top-level things, plain lists too, e.g. `all_piles`.
 * - Then, in `document` order, "All things" in the order they were made, with a `<SectionMarker>` for each
 *   heading whose code made them -- see `ThingRegistry.heading()`.  Or, by `type`, a row for each type,
 *   listing its things and its sub-types' -- see `ThingRegistry.bySuperType()`.
 * - Rows are keyed by the thing itself, so a thing made or dropped adds or removes just its row.
 * - `things` never changes for one view:  `<ThingExplorer>` makes a new view for a new registry.
 ****************/
function ThingExplorerView(props: ThingExplorerViewProps) {
  const order = (): ThingOrder => props.state.order ?? "document"
  const open = createMemo(() => new Set(props.state.open ?? [TOP_LEVEL, ALL]))
  const topLevel = tracked(() => props.things.topLevel().map(({ thing }) => thing))
  const all = tracked(() => props.things.all())
  /** By type, sub-types included -- only while that's the order:  its own `tracked()`, made and dropped with it. */
  const byType = createMemo(() => (order() === "type" ? tracked(() => props.things.bySuperType()) : undefined))
  const typeGroups = () => byType()?.() ?? []
  /** Heading each of `all()` was made under -- fixed once it's made, so no `tracked()`. */
  const sections = createMemo(() => all().map((thing) => ({ section: props.things.headingOf(thing) })))
  const isEmpty = () => !topLevel().length && !(byType() ? typeGroups().length : all().length)
  /** The selected thing, if it's still there -- the same thing keeps its details mounted. */
  const selected = createMemo(() => {
    const key = props.state.selected
    if (key === undefined) return undefined
    return (
      topLevel().find((thing) => thingKey(props.things, thing) === key) ??
      all().find((thing) => thingKey(props.things, thing) === key)
    )
  })

  return (
    <Show
      when={!isEmpty()}
      fallback={<div class="TypeExplorer ThingExplorer empty">Run the project to see its things.</div>}
    >
      <div class="TypeExplorer ThingExplorer">
        <div class="ScopesPane">
          <div class="PaneHeader">
            Things
            <span class="tools">
              <For each={ORDERS}>
                {(it) => (
                  <ui-icon
                    name={it.icon}
                    link=""
                    label={it.title}
                    class={["order", { active: order() === it.id }]}
                    title={it.title}
                    onClick={() => props.onChange({ order: it.id })}
                  />
                )}
              </For>
            </span>
          </div>
          <div class="PaneBody">
            <Show when={topLevel().length}>
              <GroupRow
                groupKey={TOP_LEVEL}
                label="Top level"
                count={topLevel().length}
                isOpen={open().has(TOP_LEVEL)}
                onToggle={toggle}
              />
              <Show when={open().has(TOP_LEVEL)}>
                <For each={topLevel()}>{(thing) => row(thing)}</For>
              </Show>
            </Show>
            <Show
              when={byType()}
              fallback={
                <>
                  <GroupRow
                    groupKey={ALL}
                    label="All things"
                    count={all().length}
                    isOpen={open().has(ALL)}
                    onToggle={toggle}
                  />
                  <Show when={open().has(ALL)}>
                    <For each={all()}>
                      {(thing, index) => (
                        <>
                          <Show when={sectionStartsAt(sections(), index())}>
                            <SectionMarker
                              section={sections()[index()]?.section}
                              style={{ "padding-left": `${MARKER_INDENT}px` }}
                            />
                          </Show>
                          {row(thing)}
                        </>
                      )}
                    </For>
                  </Show>
                </>
              }
            >
              <For each={typeGroups()} keyed={(group) => group.type}>
                {(group) => (
                  <>
                    <GroupRow
                      groupKey={typeKey(group().type)}
                      icon={SCOPE_ICONS.type}
                      label={group().type}
                      count={group().things.length}
                      isOpen={open().has(typeKey(group().type))}
                      onToggle={toggle}
                    />
                    <Show when={open().has(typeKey(group().type))}>
                      <For each={group().things}>{(thing) => row(thing)}</For>
                    </Show>
                  </>
                )}
              </For>
            </Show>
          </div>
        </div>
        <div class="DetailsPane">
          <div class="PaneHeader">Details</div>
          <div class="PaneBody">
            <Show
              when={selected()}
              keyed
              fallback={<div class="ScopeDetails empty">Select a thing to see its properties.</div>}
            >
              {(thing) => <ThingDetails things={props.things} thing={thing} onSelect={select} />}
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )

  /** Tree row of `thing`. */
  function row(thing: ThingLike) {
    return <ThingRow things={props.things} thing={thing} selected={props.state.selected} onSelect={select} />
  }

  /** Open or close tree row `key` -- see `ThingExplorerState.open`. */
  function toggle(key: string) {
    const next = new Set(open())
    if (next.has(key)) next.delete(key)
    else next.add(key)
    props.onChange({ open: [...next] })
  }

  /** Show `thing`'s details, with its own type open in the tree. */
  function select(thing: ThingLike) {
    props.onChange({ selected: thingKey(props.things, thing), open: [...new Set([...open(), typeKey(thing.type)])] })
  }
}

/** Props for `<ThingExplorerView>`. */
type ThingExplorerViewProps = {
  /** Registry the things are in -- the same for the view's life. */
  things: ThingRegistry
  /** What's selected and open, and the order. */
  state: ThingExplorerState
  /** Change `changed` in the state. */
  onChange: (changed: ThingExplorerState) => void
}

/****************
 * ### `<GroupRow>`
 * Row of the tree which just opens and closes:  "Top level", "All things", or a type.
 ****************/
function GroupRow(props: GroupRowProps) {
  return (
    <TreeRow
      class="ThingTreeGroup"
      depth={0}
      isOpen={props.isOpen}
      onToggle={() => props.onToggle(props.groupKey)}
      onClick={() => props.onToggle(props.groupKey)}
    >
      <span class="label">
        <Show when={props.icon}>{(icon) => <ui-icon name={icon()} />}</Show>
        {props.label} <span class="detail">{props.count}</span>
      </span>
    </TreeRow>
  )
}

/** Props for `<GroupRow>`. */
type GroupRowProps = {
  /** Its key in `ThingExplorerState.open`, e.g. `type:Card`. */
  groupKey: string
  /** Icon before it, e.g. for a type. */
  icon?: string
  /** What it says, e.g. `Card`. */
  label: string
  /** How many things are in it. */
  count: number
  /** Is it open? */
  isOpen: boolean
  /** Open / close row `key`. */
  onToggle: (key: string) => void
}

/****************
 * ### `<ThingRow>`
 * One thing in the tree, e.g. `Foundation clubs`, with an icon saying whether it's a list -- click to select it.
 * - Its label is its own `tracked(, { deferred: true })`:  it follows the thing's `name`, even a computed one.
 * - Scrolls itself into view when selected, e.g. from a link in `<ThingDetails>`.
 ****************/
function ThingRow(props: ThingRowProps) {
  let element: HTMLDivElement | undefined
  const label = tracked(() => props.things.labelOf(props.thing), { deferred: true })
  const isList = createMemo(() => isListThing(props.things, props.thing))
  const key = createMemo(() => thingKey(props.things, props.thing))
  const isSelected = () => key() !== undefined && key() === props.selected

  createEffect(
    () => isSelected(),
    (selected) => {
      if (selected) element?.scrollIntoView({ block: "nearest" })
    }
  )

  return (
    <TreeRow
      onElement={(row) => {
        element = row
      }}
      class={["ThingTreeNode", { selected: isSelected() }]}
      depth={1}
      onToggle={() => props.onSelect(props.thing)}
      onClick={() => props.onSelect(props.thing)}
    >
      <span class="label">
        <ThingIcon isList={isList()} />
        {label()}
      </span>
    </TreeRow>
  )
}

/** Props for `<ThingRow>`. */
type ThingRowProps = {
  /** Registry it's in. */
  things: ThingRegistry
  /** Thing to show -- the same for the row's life. */
  thing: ThingLike
  /** Key of the selected thing. */
  selected?: string
  /** Select `thing`. */
  onSelect: (thing: ThingLike) => void
}

/** Icon for a thing:  a list, or any other thing. */
function ThingIcon(props: { isList: boolean }) {
  return <ui-icon name={props.isList ? LIST_ICON : THING_ICON} title={props.isList ? "list" : "thing"} />
}

/****************
 * ### `<ThingDetails>`
 * Selected thing:  what it's called, its types, its properties -- computed ones too -- its actions, and its
 * items, if it's a list.
 * - Each property's value is its own `tracked(, { deferred: true })`, so a changed one redraws just its cell.
 * - The property LIST re-reads as the registry changes:  an undeclared property is a plain field, NOT observable.
 * - An action which takes no arguments, e.g. `turn over`, has a ▶ to do it -- see `ThingRegistry.perform()`.
 ****************/
function ThingDetails(props: ThingDetailsProps) {
  const label = tracked(() => props.things.labelOf(props.thing), { deferred: true })
  const typeChain = tracked(() => props.things.typeChainOf(props.thing).join(" → "))
  const properties = tracked(() => {
    void props.things.store.version
    return props.things.propertiesOf(props.thing)
  })
  const names = createMemo(() => properties().map(({ name }) => name))
  const computed = createMemo(() => new Set(properties().flatMap(({ name, computed }) => (computed ? [name] : []))))
  const actions = createMemo(() => props.things.actionsOf(props.thing))
  const isList = createMemo(() => isListThing(props.things, props.thing))
  const items = tracked(() => props.things.itemsOf(props.thing)?.map((item) => shownValue(props.things, item)), {
    deferred: true
  })

  return (
    <div class="ScopeDetails ThingDetails">
      <div class="title">
        <ThingIcon isList={isList()} />
        {label()}
      </div>
      <div class="TypeChain">{typeChain()}</div>
      <Show when={names().length > 0}>
        <div class="DetailsSectionTitle">Properties</div>
        <table class="ThingValues">
          <tbody>
            <For each={names()}>{(name) => propertyRow(name)}</For>
          </tbody>
        </table>
      </Show>
      <Show when={actions().length > 0}>
        <div class="DetailsSectionTitle">Actions</div>
        <table class="ThingValues">
          <tbody>
            <For each={actions()}>{(action) => actionRow(action)}</For>
          </tbody>
        </table>
      </Show>
      <Show when={items()}>
        {(items) => (
          <>
            <div class="DetailsSectionTitle">
              Items <span class="detail">{items().length}</span>
            </div>
            <ValueList values={items()} onSelect={props.onSelect} />
          </>
        )}
      </Show>
    </div>
  )

  /** Row of property `name`:  its value, live. */
  function propertyRow(name: string) {
    const value = tracked(() => propertyValue(props.things, props.thing, name), { deferred: true })
    return (
      <tr>
        <th title={computed().has(name) ? "computed" : undefined}>
          <ui-icon name={SCOPE_ICONS.property} />
          {name}
        </th>
        <td>
          <ThingValue value={value()} onSelect={props.onSelect} />
        </td>
      </tr>
    )
  }

  /** Row of `action`:  its name, and a ▶ to do it if it takes no arguments. */
  function actionRow(action: ThingAction) {
    return (
      <tr>
        <th>
          <ui-icon name={SCOPE_ICONS.method} />
          {action.label}
          <Show when={action.inheritedFrom}>
            <span class="inherited">from {action.inheritedFrom}</span>
          </Show>
        </th>
        <td>
          <Show when={action.arguments === 0}>
            <ui-icon
              name="play"
              link=""
              color="green"
              class="perform"
              label={`Do it:  ${action.name}()`}
              title={`Do it:  ${action.name}()`}
              onClick={() => props.things.perform(props.thing, action.name)}
            />
          </Show>
        </td>
      </tr>
    )
  }
}

/** Props for `<ThingDetails>`. */
type ThingDetailsProps = {
  /** Registry the thing is in -- to do its actions. */
  things: ThingRegistry
  /** Thing to show -- the same for its life:  a new selection remounts it. */
  thing: ThingLike
  /** Select `thing`, e.g. a link clicked. */
  onSelect: (thing: ThingLike) => void
}

/****************
 * ### `<ThingValue>`
 * One value in `<ThingDetails>`:  plain values as spell writes them, a thing we can select as a link.
 * - A list opens in place to show its items -- a native `<details>`, so it needs no state, and stays open as
 *   its value changes.
 ****************/
function ThingValue(props: ThingValueProps) {
  return (
    <Switch fallback={<span class={["ThingValue", props.value.kind]}>{textOf(props.value)}</span>}>
      <Match when={props.value.kind === "empty"}>
        <span class="ThingValue empty">empty</span>
      </Match>
      <Match when={ofKind(props.value, "thing")}>
        {(value) => (
          <a class="ThingValue thing" onClick={() => props.onSelect(value().thing)}>
            {value().label}
          </a>
        )}
      </Match>
      <Match when={ofKind(props.value, "list")}>
        {(list) => (
          <Show when={list().items} fallback={<span class="ThingValue other">{list().summary}</span>}>
            {(items) => (
              <details class="ThingValue list">
                <summary>{list().summary}</summary>
                <ValueList values={items()} onSelect={props.onSelect} />
              </details>
            )}
          </Show>
        )}
      </Match>
    </Switch>
  )
}

/** Props for `<ThingValue>`. */
type ThingValueProps = {
  /** Value to show. */
  value: ShownValue
  /** Select `thing`, e.g. a link clicked. */
  onSelect: (thing: ThingLike) => void
}

/**
 * `values` numbered from 1, e.g. a list's items.
 * - By position:  a changed item redraws its own row.
 */
function ValueList(props: { values: ShownValue[]; onSelect: (thing: ThingLike) => void }) {
  return (
    <table class="ThingValues">
      <tbody>
        <For each={props.values} keyed={false}>
          {(value, index) => (
            <tr>
              <th>{index + 1}</th>
              <td>
                <ThingValue value={value()} onSelect={props.onSelect} />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

////////////////
// ## Live reads
////////////////

////////////////
// ## Values
////////////////

/** A value, as `<ThingValue>` shows it. */
export type ShownValue =
  | { kind: "empty" }
  | { kind: "text" | "number" | "boolean" | "bigint" | "other" | "error"; text: string }
  | { kind: "thing"; label: string; thing: ThingLike }
  | { kind: "list"; summary: string; items?: ShownValue[] }

/**
 * Property `name` of `thing`, as `<ThingValue>` shows it -- the error reading it threw, if it did.
 * - Runs the program's code, e.g. a computed property:  see `ThingRegistry.read()`.
 */
function propertyValue(things: ThingRegistry, thing: ThingLike, name: string): ShownValue {
  const read = things.read(thing, name)
  return "error" in read ? { kind: "error", text: read.error } : shownValue(things, read.value)
}

/**
 * `value` as `<ThingValue>` shows it:  plain values as spell writes them, a thing we can select as a link,
 * a list with its items -- `depth` lists deep, down to `MAX_DEPTH`.
 * - Reads what it shows, e.g. a linked thing's label, a list's items:  inside a `tracked(, { deferred: true })`, those redraw
 *   it.
 */
export function shownValue(things: ThingRegistry, value: unknown, depth = 0): ShownValue {
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
  const items = Array.isArray(value) ? (value as unknown[]) : things.isThing(value) ? things.itemsOf(value) : undefined
  if (!items) return { kind: "other", text: `${constructorName(value)} {…}` }
  const summary = `${things.isThing(value) ? value.type : "list"} of ${items.length}`
  if (!items.length || depth >= MAX_DEPTH) return { kind: "list", summary }
  return { kind: "list", summary, items: items.map((item) => shownValue(things, item, depth + 1)) }
}

/** `value` if it's of `kind` -- for a `<Match>` that narrows it. */
function ofKind<K extends ShownValue["kind"]>(
  value: ShownValue,
  kind: K
): Extract<ShownValue, { kind: K }> | undefined {
  return value.kind === kind ? (value as Extract<ShownValue, { kind: K }>) : undefined
}

/** Text of a plain `value`, e.g. `"queen"` -- `""` for one with none. */
function textOf(value: ShownValue): string {
  return "text" in value ? value.text : ""
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
const LIST_ICON = "list"

/** Icon for any other thing, e.g. a `Card`. */
const THING_ICON = "dot circle outline"

/** Each order the tree can be in, as a button in its header -- see `UI.ThingOrder`. */
const ORDERS: Array<{ id: ThingOrder; icon: string; title: string }> = [
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

/**
 * Is `thing` a list?  Fixed for its life.
 * - NOTE: reads its `items` -- call it OUTSIDE a `tracked()`, or every change to them re-runs that.
 */
function isListThing(things: ThingRegistry, thing: ThingLike): boolean {
  return things.itemsOf(thing) !== undefined
}

/** Name of `value`'s class, e.g. `Date` -- `object` if it has none. */
function constructorName(value: unknown): string {
  return (value as { constructor?: { name?: string } }).constructor?.name || "object"
}
