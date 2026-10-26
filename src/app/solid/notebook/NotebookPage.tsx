import { For, Show, createSignal, getOwner, onCleanup, onSettled, runWithOwner } from "solid-js"
import { render, type JSX } from "@solidjs/web"

import { setDebugGlobal } from "spell/util"
import { UI } from "spell-ui/core"
import type { SP } from "spell-parser/spell"
// Import directly:  the barrel brings the site header and the section editor too
import { PagePatch } from "spell/server/site/PagePatch"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { NotebookController, type KeyedCell } from "./NotebookController"
import { CellEditor, ExampleCode, ExampleDescription, NotebookCell } from "./NotebookCell"
import { NotebookToolbar } from "./NotebookToolbar"
import { SpellExample } from "./SpellExample"

// the section titles' look, as a component page draws them
import "spell-ui/docs-components/docs-sections.css"
import "./NotebookPage.css"

/****************
 * ### `<NotebookPage>`
 * A `.spellx` NOTEBOOK's page (epic `elemental-spell` P16):  the page its `<spell-notebook>` template draws, in the
 * editor app, editable in place.
 * - A sticky toolbar (`<NotebookToolbar>`);  a masthead, the page's title and the line under it;  each section a
 *   `<ui-section sticky collapsible>`, listed in "On this page" at the right.
 *   - written either way (`NotebookPageCells`):  markdown (`# Counter`, `## Several counters`), or tags
 *     (`<header level="1">`, `<section label="Several counters">`)
 * - Each cell (`<NotebookCell>`) in order:  prose drawn as markdown, templates as code, and what the notebook
 *   draws -- examples, sections, text -- live, each in its own place, drawn by the running program's runtime.
 * - Editing it changes only that cell's span of the file, saves it, and draws only that cell again
 *   (`NotebookController`):  nothing else on the page moves.
 * - ⌘Z, outside an editor:  undoes the last move, delete, add or lock.
 * - A change to the file from outside the page (read every couple of seconds):  only the cells it changed draw again,
 *   planned by epic-engine's shared page patch;  the cell being typed in keeps its text, with a note
 *   (`NotebookController.outsideChange()`).
 * - "On this page" shows at the right, unless the toolbar hides it;  where it doesn't show (hidden, or a pane too
 *   narrow for it), an icon at the end of the title's row opens it as a flyout over the page's right edge.
 * - The program still runs as ever, drawn out of sight:  its classes and its notebook are what the cells draw with.
 * - SIDE EFFECT:  defines `<spell-example>`, the example frame the notebook's examples draw as.
 ****************/
export function NotebookPage(props: { file: SP.SpellFile; project: SP.SpellProject }) {
  SpellExample.define()
  const controller = new NotebookController(props.file, props.project)
  // DEBUG:  `notebook` at the devtools console
  setDebugGlobal({ notebook: controller })
  const owner = getOwner()
  const panelDisposers: Array<() => void> = []
  /** A panel for an example's `slot`, drawing `view` (its description, its code). */
  const panelFor = (slot: string, view: (panel: HTMLElement) => JSX.Element) => {
    const panel = document.createElement("div")
    panel.slot = slot
    const dispose = runWithOwner(owner, () => render(() => view(panel), panel))
    panelDisposers.push(dispose)
    return panel
  }
  controller.panelMaker = (key, index) => [
    panelFor("description", (panel) => (
      <ExampleDescription controller={controller} key={key} index={index} panel={panel} />
    )),
    panelFor("source", () => <ExampleCode controller={controller} key={key} index={index} />)
  ]
  onCleanup(() => panelDisposers.forEach((dispose) => dispose()))

  // a change from outside the page:  the file on the server, read every couple of seconds
  onSettled(() => controller.watchFile())
  // the cell being typed in:  the one holding the focused editor (`PagePatch.SHARED`'s fixed ones)
  controller.typingIn = () => {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    const editor = active?.closest(PagePatch.SHARED.fixed!)
    return editor?.closest<HTMLElement>("[data-cell-key]")?.dataset.cellKey
  }

  let page!: HTMLDivElement
  onSettled(() =>
    UI.keyboard.register({
      chord: "Mod+Z",
      // in the page, or with nothing focused (a button that just went disabled lets go of the focus);
      // an editor has its own undo
      handler: (event) => (isForPage(event, page) ? controller.undo() : false)
    })
  )

  // the toolbar's height, which wraps on a narrow pane:  where a section's title sticks, just under it
  const [toolbarHeight, setToolbarHeight] = createSignal(0)
  const followToolbar = (toolbar: HTMLElement) => {
    const observer = new ResizeObserver(() => setToolbarHeight(Math.round(toolbar.getBoundingClientRect().height)))
    observer.observe(toolbar)
    onCleanup(() => observer.disconnect())
  }

  // "On this page"'s column showing:  not hidden from the toolbar, and room for it (as the page's CSS lays it out)
  const [isNarrow, setNarrow] = createSignal(false)
  const followWidth = (div: HTMLDivElement) => {
    page = div
    const observer = new ResizeObserver(() => setNarrow(div.clientWidth <= NARROW_PANE))
    observer.observe(div)
    onCleanup(() => observer.disconnect())
  }
  const isColumnShown = () => controller.contentsShown() && !isNarrow()
  const contents: ContentsFlyout = {
    id: `notebook-contents-${++flyouts}`,
    isShown: () => !isColumnShown()
  }

  const sections = () => sectionsOf(controller.cells())
  return (
    <div class="NotebookPage ui-docs-sections" ref={followWidth}>
      <NotebookToolbar controller={controller} ref={followToolbar} />
      <div class="NotebookColumns">
        <main class="NotebookMain">
          <For each={sections()} keyed={(section) => section.key}>
            {(section) => (
              <Show
                when={section().heading !== undefined}
                fallback={<Cells controller={controller} cells={section().cells} masthead={contents} />}
              >
                <ui-section
                  id={slugOf(section().heading!)}
                  label={section().heading}
                  sticky=""
                  offset={toolbarHeight()}
                  level="2"
                  collapsible=""
                  dividing=""
                  class="NotebookSection"
                >
                  <Cells controller={controller} cells={section().cells} />
                </ui-section>
              </Show>
            )}
          </For>
        </main>
        <Contents controller={controller} sections={sections()} hidden={!controller.contentsShown()} />
      </div>
      {/* where the column doesn't show:  the same card, over the page's right edge, from the title row's icon */}
      <ui-flyout
        id={contents.id}
        class="NotebookTocFlyout"
        position="right"
        modeless=""
        visible={contents.isShown() && controller.contentsOpen() ? "" : undefined}
        aria-label={appTexts.text("notebookPageContents")}
        on-ui-opened={() => controller.setContentsOpen(true)}
        on-ui-closed={() => controller.setContentsOpen(false)}
      >
        <Contents controller={controller} sections={sections()} onPick={() => controller.setContentsOpen(false)} />
      </ui-flyout>
    </div>
  )
}

/**
 * "On this page":  a card, headed by the page's title as a component page's is, a link to each section under it.
 * - in its column at the right, `hidden` from the toolbar;  or in the flyout, closing it once a link is picked
 */
function Contents(props: {
  controller: NotebookController
  sections: Section[]
  hidden?: boolean
  onPick?: () => void
}) {
  const pageTitle = () => props.controller.cells().find((each) => each.cell.title)?.cell.title
  return (
    <nav class={["NotebookToc", { hidden: props.hidden }]} aria-label={appTexts.text("notebookPageContents")}>
      <div class="NotebookTocTitle">{pageTitle() ?? appTexts.text("notebookPageContents")}</div>
      <For each={props.sections.filter((section) => section.heading !== undefined)} keyed={(section) => section.key}>
        {(section) => (
          <a
            class="NotebookTocLink"
            href={`#${slugOf(section().heading!)}`}
            onClick={(event) => {
              scrollTo(event)
              props.onPick?.()
            }}
          >
            {section().heading}
          </a>
        )}
      </For>
    </nav>
  )
}

/** The flyout "On this page" opens as, where its column doesn't show. */
type ContentsFlyout = {
  /** the flyout's id, its opener's `commandfor`:  one per page */
  id: string
  /** is its column not showing, so the title row's icon is? */
  isShown: () => boolean
}

/** How many contents flyouts there have been:  each page's id its own. */
let flyouts = 0

/** A section's cells;  the first section's first cell with a title (`#`, or `<header level="1">`) is the masthead. */
function Cells(props: { controller: NotebookController; cells: KeyedCell[]; masthead?: ContentsFlyout }) {
  return (
    <For each={props.cells} keyed={(each) => each.key}>
      {(each, index) => (
        <Show
          when={props.masthead && index() === 0 && each().cell.title}
          fallback={
            <NotebookCell
              controller={props.controller}
              key={each().key}
              cell={each().cell}
              heading={!props.masthead && index() === 0}
            />
          }
        >
          <Show when={props.controller.editing() && props.controller.selected() === each().key}>
            <CellEditor
              code={each().cell.code}
              language={each().cell.kind === "prose" ? "markdown" : "spellx"}
              readOnly={false}
              onChange={(code) => props.controller.editCell(each().key, code)}
            />
          </Show>
          <header
            class={[
              "NotebookMasthead",
              { selected: props.controller.editing() && props.controller.selected() === each().key }
            ]}
            onClick={() => props.controller.select(each().key)}
          >
            <ui-header level="1" class="NotebookTitle">
              {/* "On this page", where its column doesn't show:  the docs site's own opener for its nav flyout */}
              <Show when={props.masthead!.isShown()}>
                <span class="NotebookTocSlot">
                  <ui-button
                    class="NotebookTocButton"
                    icon="bars"
                    appearance="basic circular"
                    title={appTexts.text("notebookPageContents")}
                    aria-label={appTexts.text("notebookPageContents")}
                    commandfor={props.masthead!.id}
                    command="--show"
                    onClick={(event) => event.stopPropagation()}
                  />
                </span>
              </Show>
              {each().cell.title}
              <Show when={each().cell.lead}>{(rest) => <ui-header class="NotebookLead">{rest()}</ui-header>}</Show>
            </ui-header>
          </header>
        </Show>
      )}
    </For>
  )
}

/** The page's width, px, at and under which "On this page" has no room for its column:  the CSS's `@container`. */
const NARROW_PANE = 760

/** A section of the page:  its heading (none for what comes before the first), its key, and its cells. */
type Section = { key: string; heading: string | undefined; cells: KeyedCell[] }

/** `cells` as the page's sections:  a new one at each cell with a heading (`##`, `<section label>`), keyed by it. */
function sectionsOf(cells: KeyedCell[]): Section[] {
  const sections: Section[] = [{ key: "intro", heading: undefined, cells: [] }]
  for (const each of cells) {
    if (each.cell.heading !== undefined) sections.push({ key: each.key, heading: each.cell.heading, cells: [] })
    sections.at(-1)!.cells.push(each)
  }
  return sections[0]!.cells.length ? sections : sections.slice(1)
}

/** A section's id, from its heading:  `Two of them` => `two-of-them`. */
function slugOf(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
}

/** Scroll a "On this page" link's section into view, within the page:  the page scrolls, not the window. */
function scrollTo(event: MouseEvent) {
  const href = (event.currentTarget as HTMLAnchorElement).getAttribute("href") ?? ""
  const target = (event.currentTarget as HTMLElement).closest(".NotebookPage")?.querySelector(href)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: "smooth", block: "start" })
}

/**
 * Is key `event` the notebook page's:  pressed in `page`, or with nothing focused -- but not in an editor, which has
 * its own undo?
 */
function isForPage(event: KeyboardEvent, page: HTMLElement): boolean {
  const path = event.composedPath()
  if (path.some((node) => node instanceof HTMLElement && node.classList.contains("monaco-editor"))) return false
  return path.includes(page) || path[0] === document.body
}
