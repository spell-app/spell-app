import { For, Show, createSignal, getOwner, onCleanup, onSettled, runWithOwner } from "solid-js"
import { render, type JSX } from "@solidjs/web"

import { setDebugGlobal } from "spell/util"
import { after } from "spell/element"
import { UI } from "spell-ui/core"
import { SP } from "spell-parser/spell"
// Import directly:  the barrel brings the site header and the section editor too
import { PagePatch } from "spell/server/site/PagePatch"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { NotebookController, type KeyedCell } from "./NotebookController"
import { ExampleCode, ExampleDescription, NotebookCell } from "./NotebookCell"
import { NotebookDocs } from "./NotebookDocs"
import { showNotebook } from "./NotebookHeader"
import { SpellExample } from "./SpellExample"

// the docs site's look:  the section titles', the subtitle's and the tabs panel's, as a component page draws them
import "spell-ui/docs-components/docs-sections.css"
import "spell-ui/docs-components/docs-page.css"
import "./NotebookPage.css"

/****************
 * ### `<NotebookPage>`
 * A `.spellx` NOTEBOOK's page (epic `elemental-spell` P16):  the page its `<spell-notebook>` template draws, in the
 * editor app, editable in place.
 * - Drawn as Spell UI's docs site draws a component page, on the pane's own glass (no background of its own):
 *   a masthead, the page's title and the line under it;  each section a `<ui-section sticky collapsible>`, listed in
 *   "On this page" at the right, the site's own `<ui-toc>`.
 *   - written either way (`NotebookPageCells`):  markdown (`# Counter`, `## Several counters`), or tags
 *     (`<header level="1">`, `<section label="Several counters">`)
 * - Its tools (the notebooks' menu, the lock, what happened to the last edit) are in the pane's header
 *   (`<NotebookHeader>`):  no toolbar of its own.
 * - Each cell (`<NotebookCell>`) in order:  prose drawn as markdown, templates as code, and what the notebook
 *   draws -- examples, sections, text -- live, each in its own place, drawn by the running program's runtime.
 * - An example's code is always editable:  an edit changes only that cell's span of the file, draws only that cell
 *   again, and saves it, unless the notebook's locked (`NotebookController`).
 * - ⌘Z, outside an editor:  undoes the last lock or unlock.
 * - A change to the file from outside the page (read every couple of seconds):  only the cells it changed draw again,
 *   planned by epic-engine's shared page patch;  the cell being typed in keeps its text, with a note
 *   (`NotebookController.outsideChange()`).
 * - "On this page" shows at the right where there's room, unless its Hide hid it;  where it doesn't show, an icon at
 *   the end of the title's row opens it as a flyout, just under that icon, over the page but never over the pane's
 *   header.
 * - A link to another notebook of the project (its tab bar's) shows it through the app's router:  no reload.
 * - The program still runs as ever, drawn out of sight:  its classes and its notebook are what the cells draw with.
 * - SIDE EFFECT:  defines `<spell-example>`, the example frame the notebook's examples draw as;  and loads
 *   `<ui-toc>`, and `<ui-docs-api>`, which an `<html>` block may draw (`NotebookDocs`).
 ****************/
export function NotebookPage(props: {
  file: SP.SpellFile
  project: SP.SpellProject
  /** hears the page's controller once it's made, and `undefined` as the page goes:  the pane's header's tools */
  onController?: (controller: NotebookController | undefined) => void
}) {
  SpellExample.define()
  // Spell UI's `<ui-toc>` and `<ui-docs-api>`:  a chunk of their own, loaded once
  void NotebookDocs.load()
  const controller = new NotebookController(props.file, props.project)
  // DEBUG:  `notebook` at the devtools console
  setDebugGlobal({ notebook: controller })
  // the pane's header's tools:  once drawn (a write, never in the body)
  onSettled(() => {
    props.onController?.(controller)
    return () => props.onController?.(undefined)
  })
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

  // "On this page"'s column showing:  not hidden, and room for it (as the page's CSS lays it out)
  const [isNarrow, setNarrow] = createSignal(false)
  const followWidth = (div: HTMLDivElement) => {
    page = div
    const observer = new ResizeObserver(() => setNarrow(div.clientWidth <= NARROW_PANE))
    observer.observe(div)
    onCleanup(() => observer.disconnect())
  }
  const isColumnShown = () => controller.contentsShown() && !isNarrow()
  const ids = { scroller: `notebook-scroller-${++pages}`, main: `notebook-main-${pages}` }

  // the flyout, where the column doesn't show:  just under the title row's icon, and closed by a click elsewhere
  const [flyoutTop, setFlyoutTop] = createSignal(FLYOUT_GAP)
  const isFlyoutOpen = () => !isColumnShown() && controller.contentsOpen()
  const contents: ContentsFlyout = {
    isShown: () => !isColumnShown(),
    toggle: (button) => {
      if (isFlyoutOpen()) return controller.setContentsOpen(false)
      const top = button.getBoundingClientRect().bottom - page.getBoundingClientRect().top + FLYOUT_GAP
      setFlyoutTop(Math.max(FLYOUT_GAP, Math.round(top)))
      controller.setContentsOpen(true)
    }
  }
  const closeOnOutside = (event: Event) => {
    const path = event.composedPath()
    const inside = path.some(
      (node) => node instanceof Element && node.matches(".NotebookTocFlyout, .NotebookTocButton")
    )
    if (!inside) controller.setContentsOpen(false)
  }
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") controller.setContentsOpen(false)
  }
  onSettled(() => {
    document.addEventListener("pointerdown", closeOnOutside, true)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside, true)
      document.removeEventListener("keydown", closeOnEscape)
    }
  })

  // a link to another of the project's notebooks (the tab bar's):  through the router, never a reload;
  // a link to a section of the page (the section tabs'):  scrolled to within the page
  const followNotebookLinks = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    if (scrollTo(event)) return
    const link = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
    const notebook = link && notebookAt(link, controller)
    if (!notebook) return
    event.preventDefault()
    if (notebook.path !== controller.file.path) showNotebook(notebook.path)
  }

  const sections = () => sectionsOf(controller.cells())
  const pageTitle = () => controller.cells().find((each) => each.cell.title)?.cell.title
  return (
    <div class="NotebookPage" ref={followWidth} onClick={followNotebookLinks}>
      <div class="NotebookScroller ui-docs-sections" id={ids.scroller}>
        <div class="NotebookColumns">
          <main class="NotebookMain" id={ids.main}>
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
          {/* drawn while hidden too:  it follows the scroll for the section tabs (`selectSectionTab()`) */}
          <aside class={["NotebookAside", { hidden: !isColumnShown() }]}>
            <Contents ids={ids} title={pageTitle()} onScrolledTo={(id) => selectSectionTab(page, id)}>
              <ui-icon
                slot="tools"
                name="eye slash outline"
                link=""
                class="IconAction NotebookTocHide"
                label={appTexts.text("notebookPageHideContents")}
                title={appTexts.text("notebookPageHideContents")}
                onClick={() => controller.toggleContents()}
              />
            </Contents>
          </aside>
        </div>
      </div>
      {/* where the column doesn't show:  the same contents, under the title row's icon */}
      <Show when={isFlyoutOpen()}>
        <div
          class="NotebookTocFlyout"
          role="dialog"
          aria-label={appTexts.text("notebookPageContents")}
          style={{ top: `${flyoutTop()}px` }}
        >
          <Contents ids={ids} title={pageTitle()} onPick={() => controller.setContentsOpen(false)}>
            <Show when={!isNarrow()}>
              <ui-icon
                slot="tools"
                name="columns"
                link=""
                class="IconAction NotebookTocShow"
                label={appTexts.text("notebookPageShowContents")}
                title={appTexts.text("notebookPageShowContents")}
                onClick={() => {
                  controller.setContentsOpen(false)
                  controller.toggleContents()
                }}
              />
            </Show>
          </Contents>
        </div>
      </Show>
    </div>
  )
}

/**
 * "On this page":  Spell UI's `<ui-toc>`, as the docs site's, headed by the page's title, following the page's
 * scroll inside its pane (`scroller`);  `children`, its own buttons in its header's row.
 * - A link scrolls its section into view within the page, never changing the editor's address;  `onPick` then.
 */
function Contents(props: {
  ids: { scroller: string; main: string }
  title?: string
  onPick?: () => void
  /** hears the entry in view change:  its target's id */
  onScrolledTo?: (id: string) => void
  children?: JSX.Element
}) {
  return (
    <ui-toc
      class="NotebookToc"
      for={props.ids.main}
      scroller={props.ids.scroller}
      heading={props.title}
      aria-label={appTexts.text("notebookPageContents")}
      onClick={(event: MouseEvent) => {
        if (scrollTo(event)) props.onPick?.()
      }}
      ref={(toc: HTMLElement) =>
        toc.addEventListener("ui-scrolled-to", (event) =>
          props.onScrolledTo?.((event as CustomEvent<{ value: string }>).detail.value)
        )
      }
    >
      {props.children}
    </ui-toc>
  )
}

/** The flyout "On this page" opens as, where its column doesn't show. */
type ContentsFlyout = {
  /** is its column not showing, so the title row's icon is? */
  isShown: () => boolean
  /** open it under `button` (the title row's icon), or close it */
  toggle: (button: HTMLElement) => void
}

/** How many notebook pages there have been:  each page's ids its own. */
let pages = 0

/** The flyout's gap under the icon that opened it, and from the page's top edge at least, px. */
const FLYOUT_GAP = 6

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
          <header class="NotebookMasthead">
            <ui-header level="1" class="NotebookTitle">
              {/* "On this page", where its column doesn't show:  an icon opening it, as the pane header's icons */}
              <Show when={props.masthead!.isShown()}>
                <span class="NotebookTocSlot">
                  <ui-icon
                    name="list"
                    link=""
                    class="IconAction NotebookTocButton"
                    label={appTexts.text("notebookPageContents")}
                    title={appTexts.text("notebookPageContents")}
                    onClick={(event: MouseEvent) => props.masthead!.toggle(event.currentTarget as HTMLElement)}
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

/**
 * Scroll the section an "On this page" link names into view, within the page:  the page scrolls, not the window,
 * and the editor's address keeps no hash.
 * - Returns whether it was such a link.
 */
function scrollTo(event: MouseEvent): boolean {
  const link = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
  const href = link?.getAttribute("href") ?? ""
  if (!href.startsWith("#")) return false
  const target = (event.currentTarget as HTMLElement)
    .closest(".NotebookPage")
    ?.querySelector(`[id="${CSS.escape(href.slice(1))}"]`)
  event.preventDefault()
  target?.scrollIntoView({ behavior: "smooth", block: "start" })
  return true
}

/**
 * Select the section tab (`<ui-menu class="ui-docs-section-tabs">`, under the page's tabs) of the top-level section
 * holding `id`, the entry in view, as the docs site's section toolbar follows the scroll.
 * - SIDE EFFECT:  sets `selected` on the notebook's own drawn items;  drawn again, they're set again on the next scroll
 */
function selectSectionTab(page: HTMLElement, id: string, tries = SECTION_TAB_TRIES) {
  const tabs = page.querySelector(SECTION_TABS)
  // the first entry in view is known before the notebook's drawings are in:  look again shortly
  if (!tabs) {
    if (tries > 0) after(0.1, () => selectSectionTab(page, id, tries - 1)).catch(() => undefined)
    return
  }
  let section = page.querySelector(`[id="${CSS.escape(id)}"]`)?.closest("ui-section")
  for (
    let outer = section?.parentElement?.closest("ui-section");
    outer;
    outer = outer.parentElement?.closest("ui-section")
  )
    section = outer
  if (!section?.id) return
  for (const item of tabs.querySelectorAll("ui-item[link]"))
    item.toggleAttribute("selected", item.getAttribute("link") === `#${section.id}`)
}

/** How many times, 0.1s apart, `selectSectionTab()` looks for the section tabs while they aren't drawn yet. */
const SECTION_TAB_TRIES = 30

/** The section tabs a notebook draws under its tabs (`docs-page.css`). */
const SECTION_TABS = "ui-menu.ui-docs-section-tabs"

/** The project's notebook `link` points at (`/edit/...`, `/run/...`), if it's one of `controller`'s project's. */
function notebookAt(link: HTMLAnchorElement, controller: NotebookController): SP.SpellFile | undefined {
  const url = new URL(link.href, location.href)
  if (url.origin !== location.origin) return undefined
  return NotebookController.notebooksIn(controller.project).find((file) => {
    const location = new SP.SpellLocation(file.path)
    return url.pathname === location.editorUrl || url.pathname === location.runnerUrl
  })
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

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      // Spell UI's docs-only "On this page":  not in its generated types, which name the component tags only
      "ui-toc": JSX.HTMLAttributes<HTMLElement> & {
        for?: string
        scroller?: string
        header?: string
      }
    }
  }
}
