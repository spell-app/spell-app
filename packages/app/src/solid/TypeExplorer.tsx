import { For, Show, createEffect, createMemo, createSignal, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

// Import directly, NOT through the `$/lsp` barrel, which would pull the language service into the bundle.
import { SCOPE_MEMBER_GROUPS, type ScopeDetails, type ScopeMember, type ScopeNode } from "$/lsp/lsp.types"
import type { ScopeOrder, TypeExplorerState } from "$/app/ui/ui.types"
import {
  SCOPE_ICONS,
  ScopeDetailsPane,
  SectionMarker,
  alphabetical,
  sectionStartsAt,
  type DescriptionAt
} from "./ScopeDetailsPane"

import "./TypeExplorer.css"

/****************
 * ### `<TypeExplorer>`
 * Live scope tree a project parses in:  "Scopes" as a tree, and "Details" of the selected node beside it.
 * - `tree` is `LSP.ScopeNode`s, from the language server's `spell/scopes` -- or the app's in-process service.
 * - Keeps what's selected and open by node `path` as new trees come in, e.g. after each run.
 * - Selecting a node, e.g. from the breadcrumbs, opens the tree down to it.
 * - Details sections are closed to start, and open or closed alike for every node.
 * - Lists things in document order, with a marker for each heading they're under, or alphabetically -- the
 *   buttons left of Refresh switch.  See `UI.ScopeOrder`.
 * - Remembers all that as a `UI.TypeExplorerState` through `state` + `onStateChange`, e.g. in the VS Code runner's
 *   `settings.json5` -- else in `localStorage`.
 *   - `state` is read ONCE, as it mounts:  after that, ours is the truth, and `onStateChange` hears each change.
 *     So a caller echoing `onStateChange` back into `state` is fine.
 * - A node's details are asked for with `loadDetails()` when first shown, and kept until a new `tree` comes.
 * - `readonly`, e.g. embedded in a page by `<spell-app>`:  descriptions can't be edited, whatever `onSaveDescription`.
 * - NOTE: imports its peers directly, NOT the `$/app/solid` barrel:  a runner's bundle would get the whole editor
 *   through it (`Actions.tsx`).  So its `<ui-*>` tags are the CALLER's to define:  the barrel or `./loadUI`.  Not
 *   imported here:  `$/ui` can't load under node (`customElements`), and the `node` tests render this.
 ****************/
export function TypeExplorer(props: TypeExplorerProps) {
  const [state, setState] = createSignal<TypeExplorerState>(untrack(() => props.state) ?? loadState())
  /** Bumped as details come in, so readers of `detailsFor()` redraw -- the cache itself is a plain `Map`. */
  const [loads, setLoads] = createSignal(0)
  /** Details per tree -- a new tree, a new cache;  late answers for an old one land in its old cache, harmlessly. */
  const detailsByTree = new WeakMap<ScopeNode, Map<string, LoadedDetails>>()

  /**
   * `props.tree`, read once per change:  the details cache is per tree OBJECT, so a caller handing a new (equal)
   * tree on every read, e.g. `tree={buildScopeTree(entries)}`, would otherwise ask for details forever.
   */
  const currentTree = createMemo(() => props.tree)
  const open = createMemo(() => new Set(state().open ?? (currentTree() ? defaultOpen(currentTree()!) : [])))
  const openSections = createMemo(() => new Set(state().openSections))
  const order = (): ScopeOrder => state().order ?? "document"
  /** Nodes from the root down to the selected one -- the project, if none is, or it's gone from the tree. */
  const trail = createMemo(() => {
    const tree = currentTree()
    if (!tree) return []
    const selected = state().selected
    return (selected !== undefined && trailTo(tree, selected)) || trailTo(tree, lastChild(tree).path)!
  })
  const selected = () => trail().at(-1)!
  /** `{ path }` of the selected node:  a new object only when the PATH changes, so the details remount just then. */
  const shown = createMemo(() => ({ path: selected()?.path }), { equals: (a, b) => a.path === b.path })

  return (
    <Show when={currentTree()} fallback={<div class="TypeExplorer empty">Run the project to see its scopes.</div>}>
      {(tree) => (
        <div class="TypeExplorer">
          <div class="ScopesPane">
            <div class="PaneHeader">
              Scopes
              <span class="tools">
                <For each={ORDERS}>
                  {(it) => (
                    <ui-icon
                      name={it.icon}
                      link=""
                      label={it.title}
                      class={["order", { active: order() === it.id }]}
                      title={it.title}
                      onClick={() => update({ order: it.id })}
                    />
                  )}
                </For>
                <Show when={props.onRefresh}>
                  <ui-icon
                    name="refresh"
                    link=""
                    label="Refresh the scopes"
                    class="refresh"
                    title="Refresh the scopes"
                    onClick={() => props.onRefresh?.()}
                  />
                </Show>
              </span>
            </div>
            <div class="PaneBody">
              <ScopeTreeNode
                node={tree()}
                depth={0}
                order={order()}
                open={open()}
                selected={selected()}
                onToggle={toggle}
                onSelect={select}
              />
            </div>
          </div>
          <div class="DetailsPane">
            <div class="PaneHeader">Details</div>
            <div class="PaneBody">
              <Show when={shown()} keyed>
                {(current) => (
                  <ScopeDetailsPane
                    node={trailTo(tree(), current.path)?.at(-1) ?? selected()}
                    trail={trail().slice(1)}
                    order={order()}
                    openSections={openSections()}
                    onToggleSection={toggleSection}
                    onSelect={select}
                    onOpen={(href) => props.onOpen(href)}
                    onSaveDescription={props.readonly ? undefined : props.onSaveDescription}
                    nodeFor={(path) => trailTo(tree(), path)?.at(-1)}
                    detailsFor={detailsFor}
                    load={load}
                  />
                )}
              </Show>
            </div>
          </div>
        </div>
      )}
    </Show>
  )

  /** Details of `path` in the current tree, as far as they've come -- reactive, through `loads()`. */
  function detailsFor(path: string): LoadedDetails | undefined {
    loads()
    const tree = currentTree()
    return tree && cacheFor(tree).get(path)
  }

  /** Ask for the details of `path`, once per tree -- they show when they come. */
  function load(path: string) {
    const tree = currentTree()
    if (!tree) return
    const cache = cacheFor(tree)
    if (cache.has(path)) return
    cache.set(path, "loading")
    void props.loadDetails(path).then((loaded) => {
      cache.set(path, loaded)
      setLoads((count) => count + 1)
    })
  }

  /** Details cache of `tree`, made on first ask. */
  function cacheFor(tree: ScopeNode): Map<string, LoadedDetails> {
    let cache = detailsByTree.get(tree)
    if (!cache) detailsByTree.set(tree, (cache = new Map()))
    return cache
  }

  /** Change `changed` in our state, and have it remembered. */
  function update(changed: TypeExplorerState) {
    const next = { ...state(), ...changed }
    setState(next)
    if (props.onStateChange) props.onStateChange(next)
    else saveState(next)
  }

  /** Open or close tree row `path`:  a node, or a group of a type's members -- see `groupPath()`. */
  function toggle(path: string) {
    update({ open: toggled(open(), path) })
  }

  /** Show `node`'s details, with the tree open down to it -- its group in its type included. */
  function select(node: ScopeNode) {
    const tree = currentTree()
    const trail = (tree && trailTo(tree, node.path)) ?? []
    const needed = trail.slice(0, -1).map((it) => it.path)
    trail.forEach((parent, index) => {
      const child = trail[index + 1]
      const group = child && SCOPE_MEMBER_GROUPS.find(({ kinds }) => kinds.includes(child.kind as ScopeMemberKind))
      if (group && parent.kind === "type") needed.push(groupPath(parent, group.label))
    })
    update({ selected: node.path, open: [...new Set([...open(), ...needed])] })
  }

  /** Open or close details section `title`, for every node. */
  function toggleSection(title: string) {
    update({ openSections: toggled(openSections(), title) })
  }
}

/** Props for `<TypeExplorer>`. */
export type TypeExplorerProps = {
  /** Scope tree to show, if we've had one. */
  tree?: ScopeNode
  /** Link clicked, e.g. `file:///…/Card.spell#L12` -- open it in the editor. */
  onOpen: (href: string) => void
  /** Save `text` as the docstring at `at` -- descriptions are read-only without it. */
  onSaveDescription?: (at: DescriptionAt, text: string) => void
  /** Nothing can be edited, e.g. descriptions -- ignores `onSaveDescription`. */
  readonly?: boolean
  /**
   * Details of node or member `path` of `tree` -- `null` if there are none.
   * - e.g. the language server's `spell/scopeDetails`, or the app's in-process `LSP.ScopeExplorer.details()`.
   */
  loadDetails: (path: string) => Promise<ScopeDetails | null>
  /** Ask for a fresh `tree` -- shows a Refresh button when given.  A new tree's details are fetched afresh too. */
  onRefresh?: () => void
  /** What to start with, as last remembered -- read once, as it mounts.  Default:  as saved in `localStorage`. */
  state?: TypeExplorerState
  /** Something changed:  remember `state` -- instead of in `localStorage`. */
  onStateChange?: (state: TypeExplorerState) => void
}

/****************
 * ### `<ScopeTreeNode>`
 * One node in the "Scopes" tree, and its children if it's open.
 * - Click its arrow, or left of it, to open / close it -- anywhere right of that selects it.
 * - The root, "Spell", is always open:  no arrow.  Its children stay in tree order, whatever `order`:  the built-ins,
 *   then the projects, ours last.
 * - Anything else's children come in `order`:
 *   - `document`:  as declared, with a `<SectionMarker>` for each heading they're under -- a type's members too
 *   - `alphabetical`:  a type's members under collapsible "Properties", "Actions" ... rows
 * - Rows are keyed by `path`, so a new tree updates them in place.
 * - Scrolls itself into view when selected, e.g. from the breadcrumbs.
 ****************/
function ScopeTreeNode(props: ScopeTreeNodeProps) {
  let row: HTMLDivElement | undefined
  const isRoot = () => props.node.kind === "root"
  const isOpen = () => isRoot() || props.open.has(props.node.path)
  const isSelected = () => props.node === props.selected
  const children = createMemo(() =>
    isRoot() || props.order === "document" ? props.node.children : alphabetical(props.node.children)
  )
  const grouped = () => props.node.kind === "type" && props.order === "alphabetical"

  createEffect(
    () => isSelected(),
    (selected) => {
      if (selected) row?.scrollIntoView({ block: "nearest" })
    }
  )

  return (
    <>
      <TreeRow
        onElement={(element) => {
          row = element
        }}
        class={["ScopeTreeNode", props.node.kind, { selected: isSelected() }]}
        depth={props.depth}
        isOpen={props.node.children.length && !isRoot() ? isOpen() : undefined}
        onToggle={() => {
          if (!isRoot()) props.onToggle(props.node.path)
        }}
        onClick={() => props.onSelect(props.node)}
      >
        <span class="label">
          <ui-icon name={SCOPE_ICONS[props.node.kind]} />
          {props.node.name}
          <Show when={props.node.detail}>
            <span class="detail">{props.node.detail}</span>
          </Show>
        </span>
      </TreeRow>
      <Show when={isOpen() && !grouped()}>
        <For each={children()} keyed={(child) => child.path}>
          {(child, index) => (
            <>
              <Show when={props.order === "document" && !isRoot() && sectionStartsAt(children(), index())}>
                <SectionMarker
                  section={child().section}
                  style={{ "padding-left": `${ROW_PADDING + (props.depth + 1) * INDENT_WIDTH + MARKER_INSET}px` }}
                />
              </Show>
              {childNode(child, props.depth + 1)}
            </>
          )}
        </For>
      </Show>
      <Show when={isOpen() && grouped()}>
        <For each={SCOPE_MEMBER_GROUPS}>{(group) => memberGroup(group)}</For>
      </Show>
    </>
  )

  /** Collapsible "Properties", "Actions" ... row of this type's `group` of members, and them while it's open. */
  function memberGroup(group: (typeof SCOPE_MEMBER_GROUPS)[number]) {
    const members = createMemo(() => children().filter((child) => group.kinds.includes(child.kind as ScopeMemberKind)))
    const path = () => groupPath(props.node, group.label)
    const isGroupOpen = () => props.open.has(path())
    return (
      <Show when={members().length}>
        <TreeRow
          class="ScopeTreeGroup"
          depth={props.depth + 1}
          isOpen={isGroupOpen()}
          onToggle={() => props.onToggle(path())}
          onClick={() => props.onToggle(path())}
        >
          <span class="label">
            {group.label} <span class="detail">{members().length}</span>
          </span>
        </TreeRow>
        <Show when={isGroupOpen()}>
          <For each={members()} keyed={(child) => child.path}>
            {(child) => childNode(child, props.depth + 2)}
          </For>
        </Show>
      </Show>
    )
  }

  /** `<ScopeTreeNode>` of `child`, at `depth`. */
  function childNode(child: () => ScopeNode, depth: number) {
    return (
      <ScopeTreeNode
        node={child()}
        depth={depth}
        order={props.order}
        open={props.open}
        selected={props.selected}
        onToggle={props.onToggle}
        onSelect={props.onSelect}
      />
    )
  }
}

/** Props for `<ScopeTreeNode>`. */
type ScopeTreeNodeProps = {
  /** Node to show. */
  node: ScopeNode
  /** Nesting depth, for indenting. */
  depth: number
  /** Order to list its children in. */
  order: ScopeOrder
  /** Paths of the open rows. */
  open: ReadonlySet<string>
  /** Selected node. */
  selected: ScopeNode
  /** Open / close row `path`. */
  onToggle: (path: string) => void
  /** Select `node`. */
  onSelect: (node: ScopeNode) => void
}

/****************
 * ### `<TreeRow>`
 * One row of the "Scopes" tree, all of it clickable:  its indent and open / closed arrow `onToggle`,
 * the rest -- `children`, and the space after them -- `onClick`.
 * - Shared with `<ThingExplorer>`'s tree.
 ****************/
export function TreeRow(props: TreeRowProps) {
  return (
    <div ref={(element) => props.onElement?.(element)} class={["TreeRow", props.class]}>
      <span
        class="opener"
        style={{ "padding-left": `${ROW_PADDING + props.depth * INDENT_WIDTH}px` }}
        onClick={() => props.onToggle()}
      >
        <span class="toggle">{props.isOpen === undefined ? "" : props.isOpen ? "▼" : "▶"}</span>
      </span>
      <span class="body" onClick={() => props.onClick()}>
        {props.children}
      </span>
    </div>
  )
}

/** Props for `<TreeRow>`. */
export type TreeRowProps = {
  /** Class names -- any form Solid's `class` takes, e.g. `["ScopeTreeNode", { selected }]`. */
  class: JSX.HTMLAttributes<HTMLDivElement>["class"]
  /** Nesting depth, for indenting. */
  depth: number
  /** Is it open?  `undefined` if there's nothing to open. */
  isOpen?: boolean
  /** Indent or arrow clicked. */
  onToggle: () => void
  /** Anywhere right of the arrow clicked. */
  onClick: () => void
  /**
   * The row's element is made -- a ref callback, e.g. to scroll it into view.
   * - NOT `rowRef`, as React's was:  the React lint takes a `*Ref` prop for a React ref (`react(refs)`).
   */
  onElement?: (element: HTMLDivElement) => void
  /** What's in the row. */
  children: JSX.Element
}

////////////////
// ## Helpers
////////////////

/** Indent per level of the "Scopes" tree, in px. */
const INDENT_WIDTH = 14

/** Space left of every row's arrow, in px -- part of the arrow's click area. */
const ROW_PADDING = 8

/** How far a `<SectionMarker>` sits right of the rows it heads, in px -- past their arrows. */
const MARKER_INSET = 14

/** Each order the lists can be in, as a button left of Refresh -- see `UI.ScopeOrder`. */
const ORDERS: Array<{ id: ScopeOrder; icon: string; title: string }> = [
  { id: "document", icon: "list ol", title: "Document order, under their headings" },
  { id: "alphabetical", icon: "sort alphabet down", title: "Alphabetical" }
]

/** Tree row path of group `label` of `type`'s members, e.g. its "Properties". */
function groupPath(type: ScopeNode, label: string): string {
  return `${type.path}#${label}`
}

/**
 * Nodes from `tree` down to node `path`, both included -- `undefined` if it isn't there.
 * - Follows `path`'s segments down:  a node's path starts with its parent's.
 */
function trailTo(tree: ScopeNode, path: string): ScopeNode[] | undefined {
  if (tree.path === path) return [tree]
  for (const child of tree.children) {
    if (path !== child.path && !path.startsWith(`${child.path}/`)) continue
    const trail = trailTo(child, path)
    if (trail) return [tree, ...trail]
  }
  return undefined
}

/** Last child of `tree` -- the project itself, after the built-in types and imports -- else `tree`. */
function lastChild(tree: ScopeNode): ScopeNode {
  return tree.children.at(-1) ?? tree
}

/** Open to start:  the project -- the root always is. */
function defaultOpen(tree: ScopeNode): string[] {
  return [lastChild(tree).path]
}

/** `localStorage` key for a `<TypeExplorer>`'s state, when nobody else remembers it -- the same as React's. */
const STATE_KEY = "spell.typeExplorer"

/**
 * `<TypeExplorer>` state as last saved in `localStorage` -- empty if nothing's saved, or there's no storage.
 * - Per viewer:  a convenience, so any failure just starts afresh.
 * - NOTE: a VS Code webview's `localStorage` is its own, and may not outlive it -- the runner passes `state`
 *   instead, from the project's `settings.json5`.
 */
function loadState(): TypeExplorerState {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) ?? "{}") as TypeExplorerState
  } catch {
    return {}
  }
}

/** Remember `state` in `localStorage` -- see `loadState()`. */
function saveState(state: TypeExplorerState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // e.g. storage blocked:  it just won't be remembered
  }
}

/** `items` as a list, with `item` added if it wasn't there, else removed. */
function toggled(items: ReadonlySet<string>, item: string): string[] {
  const next = new Set(items)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return [...next]
}

/** Kind of a `ScopeMember`. */
type ScopeMemberKind = ScopeMember["kind"]

/** Details of a node, as `<TypeExplorer>` holds them:  `"loading"` while asked for, `null` if there are none. */
type LoadedDetails = ScopeDetails | null | "loading"
