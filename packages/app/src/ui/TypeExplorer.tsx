/** @jsxImportSource react */
import classnames from "classnames"
import React from "react"
import * as SUI from "semantic-ui-react"

// Import directly, NOT through the `$/lsp` barrel, which would pull the language service into the bundle.
import { SCOPE_MEMBER_GROUPS, type ScopeDetails, type ScopeMember, type ScopeNode } from "$/lsp/lsp.types"
import type { ScopeOrder, TypeExplorerState } from "./ui.types"
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
 * - A node's details are asked for with `loadDetails()` when first shown, and kept until a new `tree` comes.
 * - `readonly`, e.g. embedded in a page by `<spell-app>`:  descriptions can't be edited, whatever `onSaveDescription`.
 ****************/
export function TypeExplorer(props: TypeExplorerProps) {
  const { tree, onOpen, loadDetails, onRefresh, state: initial, onStateChange } = props
  const onSaveDescription = props.readonly ? undefined : props.onSaveDescription
  const [state, setState] = React.useState<TypeExplorerState>(() => initial ?? loadState())
  // details per tree -- a new tree, a new cache;  late answers for an old one land in its old cache, harmlessly
  const [detailsByTree] = React.useState(() => new WeakMap<ScopeNode, Map<string, LoadedDetails>>())
  const [, setLoaded] = React.useState(0)
  if (!tree) return <div className="TypeExplorer empty">Run the project to see its scopes.</div>

  let details = detailsByTree.get(tree)
  if (!details) detailsByTree.set(tree, (details = new Map()))
  const open = new Set(state.open ?? defaultOpen(tree))
  const openSections = new Set(state.openSections)
  const order = state.order ?? "document"
  const trail = (state.selected !== undefined && trailTo(tree, state.selected)) || trailTo(tree, lastChild(tree).path)!
  const selected = trail.at(-1)!
  return (
    <div className="TypeExplorer">
      <div className="ScopesPane">
        <div className="PaneHeader">
          Scopes
          <span className="tools">
            {ORDERS.map(({ id, icon, title }) => (
              <SUI.Icon
                key={id}
                name={icon}
                link
                className={classnames("order", { active: order === id })}
                title={title}
                onClick={() => update({ order: id })}
              />
            ))}
            {!!onRefresh && (
              <SUI.Icon name="refresh" link className="refresh" title="Refresh the scopes" onClick={onRefresh} />
            )}
          </span>
        </div>
        <div className="PaneBody">
          <ScopeTreeNode
            node={tree}
            depth={0}
            order={order}
            open={open}
            selected={selected}
            onToggle={toggle}
            onSelect={select}
          />
        </div>
      </div>
      <div className="DetailsPane">
        <div className="PaneHeader">Details</div>
        <div className="PaneBody">
          <ScopeDetailsPane
            key={selected.path}
            node={selected}
            trail={trail.slice(1)}
            order={order}
            openSections={openSections}
            onToggleSection={toggleSection}
            onSelect={select}
            onOpen={onOpen}
            onSaveDescription={onSaveDescription}
            nodeFor={(path) => trailTo(tree, path)?.at(-1)}
            detailsFor={(path) => details.get(path)}
            load={load}
          />
        </div>
      </div>
    </div>
  )

  /** Ask for the details of `path`, once per tree -- they show when they come. */
  function load(path: string) {
    const cache = details!
    if (cache.has(path)) return
    cache.set(path, "loading")
    void loadDetails(path).then((loaded) => {
      cache.set(path, loaded)
      setLoaded((count) => count + 1)
    })
  }

  /** Change `changed` in our state, and have it remembered. */
  function update(changed: TypeExplorerState) {
    const next = { ...state, ...changed }
    setState(next)
    if (onStateChange) onStateChange(next)
    else saveState(next)
  }

  /** Open or close tree row `path`:  a node, or a group of a type's members -- see `groupPath()`. */
  function toggle(path: string) {
    update({ open: toggled(open, path) })
  }

  /** Show `node`'s details, with the tree open down to it -- its group in its type included. */
  function select(node: ScopeNode) {
    const trail = trailTo(tree!, node.path) ?? []
    const needed = trail.slice(0, -1).map((it) => it.path)
    trail.forEach((parent, index) => {
      const child = trail[index + 1]
      const group = child && SCOPE_MEMBER_GROUPS.find(({ kinds }) => kinds.includes(child.kind as ScopeMemberKind))
      if (group && parent.kind === "type") needed.push(groupPath(parent, group.label))
    })
    update({ selected: node.path, open: [...new Set([...open, ...needed])] })
  }

  /** Open or close details section `title`, for every node. */
  function toggleSection(title: string) {
    update({ openSections: toggled(openSections, title) })
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
  /** What to start with, as last remembered.  Default:  as saved in `localStorage`. */
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
 * - Scrolls itself into view when selected, e.g. from the breadcrumbs.
 ****************/
function ScopeTreeNode({ node, depth, order, open, selected, onToggle, onSelect }: ScopeTreeNodeProps) {
  const isRoot = node.kind === "root"
  const isOpen = isRoot || open.has(node.path)
  const isSelected = node === selected
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (isSelected) ref.current?.scrollIntoView({ block: "nearest" })
  }, [isSelected])
  const childProps = { depth: depth + 1, order, open, selected, onToggle, onSelect }
  const children = isRoot || order === "document" ? node.children : alphabetical(node.children)
  const grouped = node.kind === "type" && order === "alphabetical"
  return (
    <>
      <TreeRow
        rowRef={ref}
        className={classnames("ScopeTreeNode", node.kind, { selected: isSelected })}
        depth={depth}
        isOpen={node.children.length && !isRoot ? isOpen : undefined}
        onToggle={() => !isRoot && onToggle(node.path)}
        onClick={() => onSelect(node)}
      >
        <span className="label">
          <SUI.Icon name={SCOPE_ICONS[node.kind]} />
          {node.name}
          {!!node.detail && <span className="detail">{node.detail}</span>}
        </span>
      </TreeRow>
      {isOpen &&
        !grouped &&
        children.map((child, index) => (
          <React.Fragment key={child.path}>
            {order === "document" && !isRoot && sectionStartsAt(children, index) && (
              <SectionMarker
                section={child.section}
                style={{ paddingLeft: ROW_PADDING + (depth + 1) * INDENT_WIDTH + MARKER_INSET }}
              />
            )}
            <ScopeTreeNode node={child} {...childProps} />
          </React.Fragment>
        ))}
      {isOpen &&
        grouped &&
        SCOPE_MEMBER_GROUPS.map(({ kinds, label }) => {
          const members = children.filter((child) => kinds.includes(child.kind as ScopeMemberKind))
          if (!members.length) return null
          const path = groupPath(node, label)
          const isGroupOpen = open.has(path)
          return (
            <React.Fragment key={path}>
              <TreeRow
                className="ScopeTreeGroup"
                depth={depth + 1}
                isOpen={isGroupOpen}
                onToggle={() => onToggle(path)}
                onClick={() => onToggle(path)}
              >
                <span className="label">
                  {label} <span className="detail">{members.length}</span>
                </span>
              </TreeRow>
              {isGroupOpen &&
                members.map((child) => (
                  <ScopeTreeNode key={child.path} node={child} {...childProps} depth={depth + 2} />
                ))}
            </React.Fragment>
          )
        })}
    </>
  )
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
  open: Set<string>
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
export function TreeRow({ className, depth, isOpen, onToggle, onClick, rowRef, children }: TreeRowProps) {
  return (
    <div ref={rowRef} className={classnames("TreeRow", className)}>
      <span className="opener" style={{ paddingLeft: ROW_PADDING + depth * INDENT_WIDTH }} onClick={onToggle}>
        <span className="toggle">{isOpen === undefined ? "" : isOpen ? "▼" : "▶"}</span>
      </span>
      <span className="body" onClick={onClick}>
        {children}
      </span>
    </div>
  )
}

/** Props for `<TreeRow>`. */
export type TreeRowProps = {
  /** Class names. */
  className: string
  /** Nesting depth, for indenting. */
  depth: number
  /** Is it open?  `undefined` if there's nothing to open. */
  isOpen?: boolean
  /** Indent or arrow clicked. */
  onToggle: () => void
  /** Anywhere right of the arrow clicked. */
  onClick: () => void
  /** Ref to the row's element. */
  rowRef?: React.Ref<HTMLDivElement>
  /** What's in the row. */
  children: ReactNode
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
const ORDERS: Array<{ id: ScopeOrder; icon: SUI.SemanticICONS; title: string }> = [
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

/** `localStorage` key for a `<TypeExplorer>`'s state, when nobody else remembers it. */
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
function toggled(items: Set<string>, item: string): string[] {
  const next = new Set(items)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return [...next]
}

/** Kind of a `ScopeMember`. */
type ScopeMemberKind = ScopeMember["kind"]

/** Details of a node, as `<TypeExplorer>` holds them:  `"loading"` while asked for, `null` if there are none. */
type LoadedDetails = ScopeDetails | null | "loading"
