import classnames from "classnames"
import React from "react"
import * as SUI from "semantic-ui-react"

// Import directly, NOT through the `~/lsp` barrel, which would pull the language service into the bundle.
import {
  SCOPE_MEMBER_GROUPS,
  type ScopeDetails,
  type ScopeMember,
  type ScopeNode,
  type ScopeNodeKind
} from "~/lsp/lsp.types"
import { Markdown } from "./Markdown"

/****************
 * ### `<ScopeDetailsPane>`
 * "Details" of scope-tree `node`:  breadcrumbs of where it is in the tree -- click one to select it -- then
 * `<DetailsBody>`.
 * - Keyed by node `id` by `<TypeExplorer>`, so what's expanded, or an edit, resets on selecting another node.
 ****************/
export function ScopeDetailsPane({ node, path, ...props }: ScopeDetailsPaneProps) {
  return (
    <div className="ScopeDetails">
      <div className="Breadcrumbs">
        {path.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            {index > 0 && <span className="divider">›</span>}
            <span className={classnames("crumb", { current: crumb === node })} onClick={() => props.onSelect(crumb)}>
              <SUI.Icon name={SCOPE_ICONS[crumb.kind]} />
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
      <DetailsBody id={node.id} members={node.members} {...props} />
    </div>
  )
}

/** Props for `<ScopeDetailsPane>`. */
export type ScopeDetailsPaneProps = Omit<DetailsBodyProps, "id" | "members"> & {
  /** Node to show. */
  node: ScopeNode
  /** Nodes from the top of the tree down to `node`, for its breadcrumbs -- the root left out. */
  path: ScopeNode[]
}

/****************
 * ### `<DetailsBody>`
 * What there is to say about node or member `id`, top to bottom:
 * - its description -- click to edit, if `onSaveDescription`
 * - its `members` by kind, under collapsible headings:  click one to select it in the tree, or its `▶`
 *   to show its own `<DetailsBody>` right here
 * - "Spell" -- with where it's defined at its right -- "Rules" its statement made, and "Compiled Output",
 *   each collapsible
 * - Every heading is closed until opened, and open or closed alike for every node -- see `<Section>`.
 * - Its details are fetched when first shown -- see `TypeExplorerProps.loadDetails`.
 ****************/
function DetailsBody(props: DetailsBodyProps) {
  const { id, members, openSections, onToggleSection, onSelect, onOpen, onSaveDescription, nodeFor } = props
  const { detailsFor, load } = props
  const sectionProps = { openSections, onToggle: onToggleSection }
  const [expanded, setExpanded] = React.useState(new Set<string>())
  const details = detailsFor(id)
  React.useEffect(() => {
    if (details === undefined) load(id)
  })
  if (details === undefined || details === "loading") return <div className="DetailsBody loading">Loading…</div>
  const location = details?.location && linkTo(details.location)
  return (
    <div className="DetailsBody">
      {!!details && <Description details={details} onSave={onSaveDescription} onOpen={onOpen} />}
      {SCOPE_MEMBER_GROUPS.map(({ kinds, label }) => {
        const inGroup = members.filter((member) => kinds.includes(member.kind))
        if (!inGroup.length) return null
        return (
          <Section key={label} title={label} className="MemberGroup" {...sectionProps}>
            {inGroup.map((member) => {
              const key = `${member.kind}:${member.name}`
              const memberNode = nodeFor(member.id)
              const isOpen = expanded.has(key)
              return (
                <div key={key} className={classnames("ScopeMember", member.kind, { open: isOpen })}>
                  <div className="name">
                    <span className="toggle" onClick={() => toggle(key)}>
                      {isOpen ? "▼" : "▶"}
                    </span>
                    <span
                      className={classnames("label", { selectable: !!memberNode })}
                      onClick={() => (memberNode ? onSelect(memberNode) : toggle(key))}
                    >
                      <SUI.Icon name={SCOPE_ICONS[member.kind]} />
                      {member.name}
                      {!!member.detail && <span className="detail">{member.detail}</span>}
                      {!!member.inheritedFrom && <span className="inherited">from {member.inheritedFrom}</span>}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="MemberDetails">
                      <DetailsBody {...props} id={member.id} members={memberNode?.members ?? []} />
                    </div>
                  )}
                </div>
              )
            })}
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
  /** Node or member whose details to show. */
  id: string
  /** What it declares, if it's a node. */
  members: ScopeMember[]
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
  /** Node with `id` in the tree, if it's there -- e.g. a member's. */
  nodeFor: (id: string) => ScopeNode | undefined
  /** Details of `id`:  `undefined` if not asked for yet, `"loading"`, or `null` if there are none. */
  detailsFor: (id: string) => ScopeDetails | null | "loading" | undefined
  /** Ask for the details of `id` -- see `detailsFor`. */
  load: (id: string) => void
}

/** Where a docstring can be changed -- `LSP.ScopeDetails.descriptionAt`. */
export type DescriptionAt = NonNullable<ScopeDetails["descriptionAt"]>

/****************
 * ### `<Description>`
 * `node`'s docstring, as markdown -- a `#` comment is a top heading, `##` the next ... -- click to edit it,
 * if it's declared in a file and `onSave` is given.
 * - Edits the markdown as written, e.g. `## Cards` -- see `LSP.SpellLanguageService.commentLines()`.
 * - Cmd/Ctrl-Enter or "Save" saves, Escape or "Cancel" doesn't.
 * - Shows what was saved until a new tree brings the real one.
 ****************/
function Description({ details, onSave, onOpen }: DescriptionProps) {
  const [editing, setEditing] = React.useState<string>()
  // what we saved, over which docstring:  shown until a new tree brings a different one
  const [saved, setSaved] = React.useState<{ text: string; over?: string }>()
  const text = (saved && saved.over === details.description ? saved.text : details.description) ?? ""
  const editable = !!onSave && !!details.descriptionAt

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
    onSave!(details.descriptionAt!, editing!)
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
  /** Details holding the docstring, and where to change it. */
  details: ScopeDetails
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

/** `location` as a link:  `href` with its line, e.g. `file:///…/Card.spell#L12`, and a label like `Card.spell:12`. */
function linkTo({ uri, range }: NonNullable<ScopeDetails["location"]>): { href: string; label: string } {
  const line = range.start.line + 1
  return { href: `${uri}#L${line}`, label: `${decodeURIComponent(uri.split("/").pop()!)}:${line}` }
}
