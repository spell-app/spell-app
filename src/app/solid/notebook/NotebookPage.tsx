import { For, Show, createEffect, getOwner, onCleanup, onSettled, runWithOwner } from "solid-js"
import { render } from "@solidjs/web"

import { setDebugGlobal } from "spell/util"
import { UI } from "spell-ui/core"
import type { SP } from "spell-parser/spell"
import { tracked } from "spell-app/app/solid/tracked"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { NotebookController, type KeyedCell } from "./NotebookController"
import { ExampleCode, NotebookCell } from "./NotebookCell"
import { NotebookToolbar } from "./NotebookToolbar"
import { SpellExample } from "./SpellExample"

import "./NotebookPage.css"

/****************
 * ### `<NotebookPage>`
 * A `.spellx` NOTEBOOK's page (epic `elemental-spell` P16):  the page its `<spell-notebook>` template draws, in the
 * editor app, editable in place.
 * - A sticky toolbar (`<NotebookToolbar>`);  a masthead, the page's `#` title and the first paragraph under it;
 *   each `##` section a `<ui-section sticky collapsible>`, listed in "On this page" at the right.
 * - Each cell (`<NotebookCell>`) in order:  prose drawn as markdown, templates as code, and what the notebook
 *   draws -- examples, sections, text -- live, each in its own place, drawn by the running program's runtime.
 * - Editing it changes only that cell's span of the file, saves it, and draws only that cell again
 *   (`NotebookController`):  nothing else on the page moves.
 * - ⌘Z, outside an editor:  undoes the last move, delete, add or lock.
 * - A change to the file from outside the page:  the cells it changed draw again (`NotebookController.outsideChange()`).
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
  controller.panelMaker = (key, index) => {
    const panel = document.createElement("div")
    panel.slot = "code"
    const dispose = runWithOwner(owner, () =>
      render(() => <ExampleCode controller={controller} key={key} index={index} />, panel)
    )
    panelDisposers.push(dispose)
    return panel
  }
  onCleanup(() => panelDisposers.forEach((dispose) => dispose()))

  // a change from outside the page:  the file's text, as the editor last read it
  const contents = tracked(() => props.file.contents ?? "")
  createEffect(contents, (text) => {
    controller.outsideChange(text)
  })

  let page!: HTMLDivElement
  onSettled(() =>
    UI.keyboard.register({
      chord: "Mod+Z",
      // in the page, or with nothing focused (a button that just went disabled lets go of the focus);
      // an editor has its own undo
      handler: (event) => (isForPage(event, page) ? controller.undo() : false)
    })
  )

  const sections = () => sectionsOf(controller.cells())
  return (
    <div class="NotebookPage" ref={(div) => (page = div)}>
      <NotebookToolbar controller={controller} />
      <div class="NotebookColumns">
        <main class="NotebookMain">
          <For each={sections()} keyed={(section) => section.key}>
            {(section) => (
              <Show
                when={section().heading !== undefined}
                fallback={<Cells controller={controller} cells={section().cells} masthead />}
              >
                <ui-section
                  id={slugOf(section().heading!)}
                  label={section().heading}
                  sticky=""
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
        <nav class="NotebookToc" aria-label={appTexts.text("notebookPageContents")}>
          <div class="NotebookTocTitle">{appTexts.text("notebookPageContents")}</div>
          <For each={sections().filter((section) => section.heading !== undefined)} keyed={(section) => section.key}>
            {(section) => (
              <a class="NotebookTocLink" href={`#${slugOf(section().heading!)}`} onClick={scrollTo}>
                {section().heading}
              </a>
            )}
          </For>
        </nav>
      </div>
    </div>
  )
}

/** A section's cells;  the first section's first prose cell with a `#` title is the masthead. */
function Cells(props: { controller: NotebookController; cells: KeyedCell[]; masthead?: boolean }) {
  return (
    <For each={props.cells} keyed={(each) => each.key}>
      {(each, index) => (
        <Show
          when={props.masthead && index() === 0 && each().cell.title && !props.controller.editing()}
          fallback={
            <NotebookCell
              controller={props.controller}
              key={each().key}
              cell={each().cell}
              heading={!props.masthead && index() === 0}
            />
          }
        >
          <header class="NotebookMasthead" onClick={() => props.controller.select(each().key)}>
            <h1>{each().cell.title}</h1>
            <Show when={each().cell.code.split("\n").slice(1).join("\n").trim()}>
              {(rest) => <ui-markdown class="NotebookLead">{rest()}</ui-markdown>}
            </Show>
          </header>
        </Show>
      )}
    </For>
  )
}

/** A section of the page:  its heading (none for what comes before the first), its key, and its cells. */
type Section = { key: string; heading: string | undefined; cells: KeyedCell[] }

/** `cells` as the page's sections:  a new one at each prose cell with a `##` heading, keyed by that cell. */
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
