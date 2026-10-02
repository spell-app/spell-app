/** @jsxImportSource react */
import classnames from "classnames"
import React from "react"
import * as SUI from "semantic-ui-react"

// Import directly, NOT through the `$/lsp` barrel, which would pull the language service into the bundle.
import {
  SCOPE_MEMBER_GROUPS,
  type ScopeDetails,
  type ScopeMember,
  type ScopeNode,
  type ScopeNodeKind,
  type SetDescriptionParams,
  firstLine,
  scopeSegment
} from "$/lsp/lsp.types"
import type { ScopeOrder } from "./ui.types"
import { Markdown } from "./Markdown"

/****************
 * ### `<ScopeDetailsPane>`
 * "Details" of scope-tree `node`:  breadcrumbs of where it is in the tree -- click one to select it -- then
 * `<DetailsBody>`.
 * - Keyed by node `path` by `<TypeExplorer>`, so what's expanded, or an edit, resets on selecting another node.
 ****************/
export function ScopeDetailsPane({ node, trail, ...props }: ScopeDetailsPaneProps) {
  return (
    <div className="ScopeDetails">
      <div className="Breadcrumbs">
        {trail.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="divider">›</span>}
            <span className={classnames("crumb", { current: crumb === node })} onClick={() => props.onSelect(crumb)}>
              <SUI.Icon name={SCOPE_ICONS[crumb.kind]} />
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
      <DetailsBody path={node.path} members={node.members} {...props} />
    </div>
  )
}

/** Props for `<ScopeDetailsPane>`. */
export type ScopeDetailsPaneProps = Omit<DetailsBodyProps, "path" | "members"> & {
  /** Node to show. */
  node: ScopeNode
  /** Nodes from the top of the tree down to `node`, for its breadcrumbs -- the root left out. */
  trail: ScopeNode[]
}

/****************
 * ### `<DetailsBody>`
 * What there is to say about node or member `path`, top to bottom:
 * - its description -- click to edit, if `onSaveDescription`
 * - its `members`:  click one to select it in the tree, or its `▶` to show its own `<DetailsBody>` right here
 *   - in `document` order, under one collapsible "Members" heading, with a marker for each section
 *   - `alphabetical`, by kind, under collapsible "Properties", "Actions" ... headings
 * - "Spell" -- with where it's defined at its right -- "Rules" its statement made, and "Compiled Output",
 *   each collapsible
 * - Every heading is closed until opened, and open or closed alike for every node -- see `<Section>`.
 * - Its details are fetched when first shown -- see `TypeExplorerProps.loadDetails`.
 ****************/
function DetailsBody(props: DetailsBodyProps) {
  const { path, members, order, openSections, onToggleSection, onOpen, onSaveDescription, nodeFor } = props
  const { detailsFor, load } = props
  const sectionProps = { openSections, onToggle: onToggleSection }
  const [expanded, setExpanded] = React.useState(new Set<string>())
  const details = detailsFor(path)
  React.useEffect(() => {
    if (details === undefined) load(path)
  })
  if (details === undefined || details === "loading") return <div className="DetailsBody loading">Loading…</div>
  // its file:  where its details say it's declared, else the file its node is in
  const uri = details?.uri ?? nodeFor(path)?.uri
  const line = details?.line !== undefined ? firstLine(details.line) : undefined
  const location = uri && line ? linkTo(uri, line) : undefined
  // where its docstring's changed:  a file's at its top, else on the line its statement starts
  const isFile = scopeSegment(path).kind === "file"
  const at: DescriptionAt | undefined = !uri
    ? undefined
    : isFile
      ? { uri, file: true }
      : line
        ? { uri, line }
        : undefined
  return (
    <div className="DetailsBody">
      {!!details && <Description details={details} at={at} onSave={onSaveDescription} onOpen={onOpen} />}
      {order === "document" && members.length > 0 && (
        <Section title="Members" className="MemberGroup" {...sectionProps}>
          {members.map((member, index) => (
            <React.Fragment key={`${member.kind}:${member.name}`}>
              {sectionStartsAt(members, index) && <SectionMarker section={member.section} />}
              {memberRow(member)}
            </React.Fragment>
          ))}
        </Section>
      )}
      {order === "alphabetical" &&
        SCOPE_MEMBER_GROUPS.map(({ kinds, label }) => {
          const inGroup = alphabetical(members.filter((member) => kinds.includes(member.kind)))
          if (!inGroup.length) return null
          return (
            <Section key={label} title={label} className="MemberGroup" {...sectionProps}>
              {inGroup.map(memberRow)}
            </Section>
          )
        })}

      {!!details?.spell && (
        <Section
          title="Spell"
          aside={
            location && (
              <a
                href={location.href}
                title="Show where it's defined"
                onClick={(event) => {
                  event.preventDefault()
                  onOpen(location.href)
                }}
              >
                {location.label}
              </a>
            )
          }
          {...sectionProps}
        >
          <pre className="code spell">{details.spell}</pre>
        </Section>
      )}
      {!!details?.rules?.length && (
        <Section title="Rules" {...sectionProps}>
          {details.rules.map((rule) => (
            <div key={rule.name} className="Rule">
              <div className="RuleName">{rule.name}</div>
              <pre className="code rulex">{rule.syntax}</pre>
            </div>
          ))}
        </Section>
      )}
      {!!details?.compiled && (
        <Section title="Compiled Output" {...sectionProps}>
          <pre className="code javascript">{details.compiled}</pre>
        </Section>
      )}
    </div>
  )

  /** Row for `member`:  its name -- click to select it -- and its `▶`, to show its own details here. */
  function memberRow(member: ScopeMember) {
    const key = `${member.kind}:${member.name}`
    const memberNode = nodeFor(member.path)
    const isOpen = expanded.has(key)
    return (
      <div key={key} className={classnames("ScopeMember", member.kind, { open: isOpen })}>
        <div className="name">
          <span className="toggle" onClick={() => toggle(key)}>
            {isOpen ? "▼" : "▶"}
          </span>
          <span
            className={classnames("label", { selectable: !!memberNode })}
            onClick={() => (memberNode ? props.onSelect(memberNode) : toggle(key))}
          >
            <SUI.Icon name={SCOPE_ICONS[member.kind]} />
            {member.name}
            {!!member.detail && <span className="detail">{member.detail}</span>}
            {!!member.inheritedFrom && <span className="inherited">from {member.inheritedFrom}</span>}
          </span>
        </div>
        {isOpen && (
          <div className="MemberDetails">
            <DetailsBody {...props} path={member.path} members={memberNode?.members ?? []} />
          </div>
        )}
      </div>
    )
  }

  /** Show / hide member `key`'s details. */
  function toggle(key: string) {
    const next = new Set(expanded)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setExpanded(next)
  }
}

/** Props for `<DetailsBody>`. */
type DetailsBodyProps = {
  /** `path` of the node or member whose details to show. */
  path: string
  /** What it declares, if it's a node -- in document order. */
  members: ScopeMember[]
  /** Order to list `members` in. */
  order: ScopeOrder
  /** Titles of the sections open, e.g. `Spell` -- for every node.  Kept, and remembered, by `<TypeExplorer>`. */
  openSections: Set<string>
  /** Open / close section `title`. */
  onToggleSection: (title: string) => void
  /** Select `node` in the tree, e.g. a breadcrumb or member clicked. */
  onSelect: (node: ScopeNode) => void
  /** Link clicked, e.g. `file:///…/Card.spell#L12` -- open it in the editor. */
  onOpen: (href: string) => void
  /** Save `text` as the docstring at `at` -- descriptions are read-only without it. */
  onSaveDescription?: (at: DescriptionAt, text: string) => void
  /** Node at `path` in the tree, if it's there -- e.g. a member's. */
  nodeFor: (path: string) => ScopeNode | undefined
  /** Details of `path`:  `undefined` if not asked for yet, `"loading"`, or `null` if there are none. */
  detailsFor: (path: string) => ScopeDetails | null | "loading" | undefined
  /** Ask for the details of `path` -- see `detailsFor`. */
  load: (path: string) => void
}

/****************
 * ### `<SectionMarker>`
 * Marker in a list in document order, for the heading what follows is under, e.g. `actions` -- see
 * `sectionStartsAt()`.  A plain rule if there's none, e.g. after a type's own members.
 * - Shared with `<TypeExplorer>`'s tree, which indents it with `style`.
 ****************/
export function SectionMarker({ section, style }: SectionMarkerProps) {
  return (
    <div className={classnames("SectionMarker", { empty: !section })} style={style}>
      {section}
    </div>
  )
}

/** Props for `<SectionMarker>`. */
export type SectionMarkerProps = {
  /** Heading's text, e.g. `actions` -- none for a plain rule. */
  section?: string
  /** Inline style, e.g. to indent it. */
  style?: React.CSSProperties
}

/**
 * Does a new section start at `items[index]`, in a list in document order -- so a `<SectionMarker>` goes before it?
 * - Where its `section` differs from the item before's -- or, for the first, if it has one.
 */
export function sectionStartsAt(items: Array<{ section?: string }>, index: number): boolean {
  return index === 0 ? !!items[0]?.section : items[index]!.section !== items[index - 1]!.section
}

/** `items` in alphabetical order of `name`, ignoring case -- a copy. */
export function alphabetical<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
}

/** Where a docstring can be changed:  a file and line, or a file's top -- as `spell/setDescription` takes. */
export type DescriptionAt = Omit<SetDescriptionParams, "text">

/****************
 * ### `<Description>`
 * `node`'s docstring, as markdown -- a `#` comment is a top heading, `##` the next ... -- click to edit it,
 * if we know where -- `at` -- and `onSave` is given.
 * - Edits the markdown as written, e.g. `## Cards` -- see `LSP.SpellLanguageService.commentLines()`.
 * - Cmd/Ctrl-Enter or "Save" saves, Escape or "Cancel" doesn't.
 * - Shows what was saved until a new tree brings the real one.
 ****************/
function Description({ details, at, onSave, onOpen }: DescriptionProps) {
  const [editing, setEditing] = React.useState<string>()
  // what we saved, over which docstring:  shown until a new tree brings a different one
  const [saved, setSaved] = React.useState<{ text: string; over?: string }>()
  const text = (saved && saved.over === details.description ? saved.text : details.description) ?? ""
  const editable = !!onSave && !!at

  if (editing !== undefined) {
    return (
      <div className="Description editing">
        <textarea
          autoFocus
          rows={Math.max(2, editing.split("\n").length)}
          value={editing}
          onChange={(event) => setEditing(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <SUI.Button size="mini" primary content="Save" onClick={save} />
        <SUI.Button size="mini" content="Cancel" onClick={() => setEditing(undefined)} />
      </div>
    )
  }
  if (!text && !editable) return null
  return (
    <div
      className={classnames("Description", { editable, empty: !text })}
      title={editable ? "Click to edit" : undefined}
      onClick={editable ? () => setEditing(text) : undefined}
    >
      {text ? <Markdown text={text} onOpen={onOpen} /> : "Add a description…"}
    </div>
  )

  /** Save what's being edited. */
  function save() {
    onSave!(at!, editing!)
    setSaved({ text: editing!.trim(), over: details.description })
    setEditing(undefined)
  }

  /** Cmd/Ctrl-Enter saves, Escape cancels. */
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") setEditing(undefined)
    else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) save()
  }
}

/** Props for `<Description>`. */
type DescriptionProps = {
  /** Details holding the docstring. */
  details: ScopeDetails
  /** Where its docstring is changed, if we know. */
  at?: DescriptionAt
  /** Save `text` as the docstring at `at` -- read-only without it. */
  onSave?: (at: DescriptionAt, text: string) => void
  /** Link in it clicked. */
  onOpen: (href: string) => void
}

/****************
 * ### `<Section>`
 * Collapsible section of `<DetailsBody>`:  closed until opened -- by its `title`, the same for every node.
 * - `aside` shows at the right of its heading;  clicking it does NOT open / close the section.
 ****************/
function Section({ title, className, aside, openSections, onToggle, children }: SectionProps) {
  const isOpen = openSections.has(title)
  return (
    <div className={classnames("DetailsSection", className, { open: isOpen })}>
      <div className="DetailsSectionTitle" onClick={() => onToggle(title)}>
        <span className="toggle">{isOpen ? "▼" : "▶"}</span>
        {title}
        {!!aside && (
          <span className="aside" onClick={(event) => event.stopPropagation()}>
            {aside}
          </span>
        )}
      </div>
      {isOpen && <div className="DetailsSectionBody">{children}</div>}
    </div>
  )
}

/** Props for `<Section>`. */
type SectionProps = {
  /** Heading. */
  title: string
  /** Extra class name. */
  className?: string
  /** Shown at the right of the heading, e.g. a link. */
  aside?: ReactNode
  /** Titles of the sections open. */
  openSections: Set<string>
  /** Open / close section `title`. */
  onToggle: (title: string) => void
  /** Content. */
  children: ReactNode
}

////////////////
// ## Helpers
////////////////

/** Semantic UI icon for each kind of scope-tree node. */
export const SCOPE_ICONS: Record<ScopeNodeKind, SUI.SemanticICONS> = {
  root: "sitemap",
  project: "folder",
  file: "file code outline",
  type: "cube",
  property: "tag",
  enumeration: "list ul",
  method: "cog",
  function: "code",
  constant: "lock",
  variable: "tag"
}

/** Line `line` of file `uri` as a link:  `href`, e.g. `file:///…/Card.spell#L12`, and a label like `Card.spell:12`. */
function linkTo(uri: string, line: number): { href: string; label: string } {
  return { href: `${uri}#L${line}`, label: `${decodeURIComponent(uri.split("/").pop()!)}:${line}` }
}
