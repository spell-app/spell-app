import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

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
import type { ScopeOrder } from "$/app/ui/ui.types"
import { Markdown } from "./Markdown"

/****************
 * ### `<ScopeDetailsPane>`
 * "Details" of scope-tree `node`:  breadcrumbs of where it is in the tree -- click one to select it -- then
 * `<DetailsBody>`.
 * - Remounted per node `path` by `<TypeExplorer>` (a keyed `<Show>`), so what's expanded, or an edit, resets on
 *   selecting another node.
 ****************/
export function ScopeDetailsPane(props: ScopeDetailsPaneProps) {
  return (
    <div class="ScopeDetails">
      <div class="Breadcrumbs">
        <For each={props.trail}>
          {(crumb, index) => (
            <>
              <Show when={index() > 0}>
                <span class="divider">›</span>
              </Show>
              <span class={["crumb", { current: crumb === props.node }]} onClick={() => props.onSelect(crumb)}>
                <ui-icon name={SCOPE_ICONS[crumb.kind]} />
                {crumb.name}
              </span>
            </>
          )}
        </For>
      </div>
      <DetailsBody
        path={props.node.path}
        members={props.node.members}
        order={props.order}
        openSections={props.openSections}
        onToggleSection={props.onToggleSection}
        onSelect={props.onSelect}
        onOpen={props.onOpen}
        onSaveDescription={props.onSaveDescription}
        nodeFor={props.nodeFor}
        detailsFor={props.detailsFor}
        load={props.load}
      />
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
  /** Keys of the members showing their own details, e.g. `property:suit`. */
  const [expanded, setExpanded] = createSignal<ReadonlySet<string>>(new Set())
  const details = () => props.detailsFor(props.path)
  // its file:  where its details say it's declared, else the file its node is in
  const uri = createMemo(() => loaded()?.uri ?? props.nodeFor(props.path)?.uri)
  const line = createMemo(() => {
    const at = loaded()?.line
    return at !== undefined ? firstLine(at) : undefined
  })
  const location = createMemo(() => {
    const file = uri()
    const at = line()
    return file && at ? linkTo(file, at) : undefined
  })
  // where its docstring's changed:  a file's at its top, else on the line its statement starts
  const descriptionAt = createMemo((): DescriptionAt | undefined => {
    const file = uri()
    if (!file) return undefined
    if (scopeSegment(props.path).kind === "file") return { uri: file, file: true }
    const at = line()
    return at ? { uri: file, line: at } : undefined
  })

  // ask for its details the first time they're wanted -- `load()` marks them `"loading"`, then they come
  createEffect(
    () => (details() === undefined ? props.path : undefined),
    (path) => {
      if (path !== undefined) props.load(path)
    }
  )

  return (
    <Show
      when={details() !== undefined && details() !== "loading"}
      fallback={<div class="DetailsBody loading">Loading…</div>}
    >
      <div class="DetailsBody">
        <Show when={loaded()}>
          {(details) => (
            <Description
              details={details()}
              at={descriptionAt()}
              onSave={props.onSaveDescription}
              onOpen={props.onOpen}
            />
          )}
        </Show>
        <Show when={props.order === "document" && props.members.length > 0}>
          <Section title="Members" class="MemberGroup" openSections={props.openSections} onToggle={toggleSection}>
            <For each={props.members} keyed={memberKey}>
              {(member, index) => (
                <>
                  <Show when={sectionStartsAt(props.members, index())}>
                    <SectionMarker section={member().section} />
                  </Show>
                  {memberRow(member)}
                </>
              )}
            </For>
          </Section>
        </Show>
        <Show when={props.order === "alphabetical"}>
          <For each={SCOPE_MEMBER_GROUPS}>
            {(group) => {
              const inGroup = createMemo(() =>
                alphabetical(props.members.filter((member) => group.kinds.includes(member.kind)))
              )
              return (
                <Show when={inGroup().length}>
                  <Section
                    title={group.label}
                    class="MemberGroup"
                    openSections={props.openSections}
                    onToggle={toggleSection}
                  >
                    <For each={inGroup()} keyed={memberKey}>
                      {(member) => memberRow(member)}
                    </For>
                  </Section>
                </Show>
              )
            }}
          </For>
        </Show>

        <Show when={loaded()?.spell}>
          {(spell) => (
            <Section
              title="Spell"
              aside={
                <Show when={location()}>
                  {(location) => (
                    <a
                      href={location().href}
                      title="Show where it's defined"
                      onClick={(event) => {
                        event.preventDefault()
                        props.onOpen(location().href)
                      }}
                    >
                      {location().label}
                    </a>
                  )}
                </Show>
              }
              openSections={props.openSections}
              onToggle={toggleSection}
            >
              <pre class="code spell">{spell()}</pre>
            </Section>
          )}
        </Show>
        <Show when={loaded()?.rules?.length ? loaded()!.rules : undefined}>
          {(rules) => (
            <Section title="Rules" openSections={props.openSections} onToggle={toggleSection}>
              <For each={rules()}>
                {(rule) => (
                  <div class="Rule">
                    <div class="RuleName">{rule.name}</div>
                    <pre class="code rulex">{rule.syntax}</pre>
                  </div>
                )}
              </For>
            </Section>
          )}
        </Show>
        <Show when={loaded()?.compiled}>
          {(compiled) => (
            <Section title="Compiled Output" openSections={props.openSections} onToggle={toggleSection}>
              <pre class="code javascript">{compiled()}</pre>
            </Section>
          )}
        </Show>
      </div>
    </Show>
  )

  /** Its details once they've come -- `null` if there are none, `undefined` while they haven't. */
  function loaded(): ScopeDetails | null | undefined {
    const it = details()
    return it === "loading" ? undefined : it
  }

  /** Open / close section `title`, for every node. */
  function toggleSection(title: string) {
    props.onToggleSection(title)
  }

  /** Row for `member`:  its name -- click to select it -- and its `▶`, to show its own details here. */
  function memberRow(member: () => ScopeMember) {
    const key = () => memberKey(member())
    const memberNode = () => props.nodeFor(member().path)
    const isOpen = () => expanded().has(key())
    return (
      <div class={["ScopeMember", member().kind, { open: isOpen() }]}>
        <div class="name">
          <span class="toggle" onClick={() => toggle(key())}>
            {isOpen() ? "▼" : "▶"}
          </span>
          <span
            class={["label", { selectable: !!memberNode() }]}
            onClick={() => {
              const node = memberNode()
              if (node) props.onSelect(node)
              else toggle(key())
            }}
          >
            <ui-icon name={SCOPE_ICONS[member().kind]} />
            {member().name}
            <Show when={member().detail}>
              <span class="detail">{member().detail}</span>
            </Show>
            <Show when={member().inheritedFrom}>
              <span class="inherited">from {member().inheritedFrom}</span>
            </Show>
          </span>
        </div>
        <Show when={isOpen()}>
          <div class="MemberDetails">
            <DetailsBody
              path={member().path}
              members={memberNode()?.members ?? []}
              order={props.order}
              openSections={props.openSections}
              onToggleSection={props.onToggleSection}
              onSelect={props.onSelect}
              onOpen={props.onOpen}
              onSaveDescription={props.onSaveDescription}
              nodeFor={props.nodeFor}
              detailsFor={props.detailsFor}
              load={props.load}
            />
          </div>
        </Show>
      </div>
    )
  }

  /** Show / hide member `key`'s details. */
  function toggle(key: string) {
    const next = new Set(expanded())
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
  openSections: ReadonlySet<string>
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
  /**
   * Details of `path`:  `undefined` if not asked for yet, `"loading"`, or `null` if there are none.
   * - MUST be reactive:  `<DetailsBody>` reads it in JSX and memos, and redraws when it changes.
   */
  detailsFor: (path: string) => ScopeDetails | null | "loading" | undefined
  /** Ask for the details of `path` -- see `detailsFor`. */
  load: (path: string) => void
}

/****************
 * ### `<SectionMarker>`
 * Marker in a list in document order, for the heading what follows is under, e.g. `actions` -- see
 * `sectionStartsAt()`.  A plain rule if there's none, e.g. after a type's own members.
 * - Shared with `<TypeExplorer>`'s and `<ThingExplorer>`'s trees, which indent it with `style`.
 ****************/
export function SectionMarker(props: SectionMarkerProps) {
  return (
    <div class={["SectionMarker", { empty: !props.section }]} style={props.style}>
      {props.section}
    </div>
  )
}

/** Props for `<SectionMarker>`. */
export type SectionMarkerProps = {
  /** Heading's text, e.g. `actions` -- none for a plain rule. */
  section?: string
  /** Inline style, e.g. to indent it:  `{ "padding-left": "36px" }`. */
  style?: JSX.CSSProperties
}

/**
 * Does a new section start at `items[index]`, in a list in document order -- so a `<SectionMarker>` goes before it?
 * - Where its `section` differs from the item before's -- or, for the first, if it has one.
 */
export function sectionStartsAt(items: Array<{ section?: string }>, index: number): boolean {
  return index === 0 ? !!items[0]?.section : items[index]?.section !== items[index - 1]?.section
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
function Description(props: DescriptionProps) {
  /** Text being edited -- `undefined` while not editing. */
  const [editing, setEditing] = createSignal<string>()
  /** What we saved, over which docstring:  shown until a new tree brings a different one. */
  const [saved, setSaved] = createSignal<{ text: string; over?: string }>()
  const text = createMemo(() => {
    const ours = saved()
    return (ours && ours.over === props.details.description ? ours.text : props.details.description) ?? ""
  })
  const editable = () => !!props.onSave && !!props.at
  /** The textarea while editing:  `save()` reads it, as `editing()` lags a keystroke until the next flush. */
  let textarea: HTMLTextAreaElement | undefined

  return (
    <Show
      when={editing() === undefined}
      fallback={
        <div class="Description editing">
          <textarea
            ref={(element) => {
              textarea = element
              queueMicrotask(() => element.focus())
            }}
            rows={Math.max(2, (editing() ?? "").split("\n").length)}
            value={editing() ?? ""}
            onInput={(event) => setEditing(event.currentTarget.value)}
            onKeyDown={onKeyDown}
          />
          <ui-button size="mini" primary="" onClick={save}>
            Save
          </ui-button>
          <ui-button size="mini" onClick={() => setEditing(undefined)}>
            Cancel
          </ui-button>
        </div>
      }
    >
      <Show when={text() || editable()}>
        <div
          class={["Description", { editable: editable(), empty: !text() }]}
          title={editable() ? "Click to edit" : undefined}
          onClick={() => {
            if (editable()) setEditing(text())
          }}
        >
          <Show when={text()} fallback="Add a description…">
            {(text) => <Markdown text={text()} onOpen={props.onOpen} />}
          </Show>
        </div>
      </Show>
    </Show>
  )

  /** Save what's being edited. */
  function save() {
    const edited = textarea?.value ?? editing() ?? ""
    props.onSave!(props.at!, edited)
    setSaved({ text: edited.trim(), over: props.details.description })
    setEditing(undefined)
  }

  /** Cmd/Ctrl-Enter saves, Escape cancels. */
  function onKeyDown(event: KeyboardEvent) {
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
 * - `children` are made only while it's open.
 ****************/
function Section(props: SectionProps) {
  const isOpen = () => props.openSections.has(props.title)
  return (
    <div class={["DetailsSection", props.class, { open: isOpen() }]}>
      <div class="DetailsSectionTitle" onClick={() => props.onToggle(props.title)}>
        <span class="toggle">{isOpen() ? "▼" : "▶"}</span>
        {props.title}
        <Show when={props.aside}>
          <span class="aside" onClick={(event) => event.stopPropagation()}>
            {props.aside}
          </span>
        </Show>
      </div>
      <Show when={isOpen()}>
        <div class="DetailsSectionBody">{props.children}</div>
      </Show>
    </div>
  )
}

/** Props for `<Section>`. */
type SectionProps = {
  /** Heading. */
  title: string
  /** Extra class. */
  class?: string
  /** Shown at the right of the heading, e.g. a link. */
  aside?: JSX.Element
  /** Titles of the sections open. */
  openSections: ReadonlySet<string>
  /** Open / close section `title`. */
  onToggle: (title: string) => void
  /** Content. */
  children: JSX.Element
}

////////////////
// ## Helpers
////////////////

/**
 * Icon name for each kind of scope-tree node -- Fomantic's names, from the app's `fomantic` icon pack (see
 * `loadUI.ts`).
 */
export const SCOPE_ICONS: Record<ScopeNodeKind, string> = {
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

/** Key of `member` among its node's, e.g. `property:suit`. */
function memberKey(member: ScopeMember): string {
  return `${member.kind}:${member.name}`
}

/** Line `line` of file `uri` as a link:  `href`, e.g. `file:///…/Card.spell#L12`, and a label like `Card.spell:12`. */
function linkTo(uri: string, line: number): { href: string; label: string } {
  return { href: `${uri}#L${line}`, label: `${decodeURIComponent(uri.split("/").pop()!)}:${line}` }
}
