import { Show, createSignal, getOwner, onCleanup, runWithOwner, type Owner } from "solid-js"
import { render } from "@solidjs/web"

import { E } from "spell-ui/core"
import { ExampleSource } from "spell-ui/docs-components/ui-docs-example"

/****************
 * ### `NotebookOriginal`
 * TEMPORARY scaffolding while Spell UI's pages become notebooks (epic `elemental-spell` P18, Owen 2026-10-26:
 * "add an "original" section to each example so I can see what we started with").
 * - A converted notebook names the page it came from:  `<spell-notebook "avatar examples" original="/components/ui/ui-avatar.html">`.
 * - Under each of its examples, a folded "Original" section, closed at first:
 *   the original page's example, live and with its code open, as that page's `</>` shows it.
 * - Matched by its section and its place in it:  the labels of the sections around it (`Owners › Comment`),
 *   then which example it is in the innermost one.  One with no match says so in its fold.
 * - The page is fetched once, when a fold first opens:  the editor's dev server passes `/components/` on to the page
 *   server.  Its relative URLs (`images/...`) are pointed where they were on the page, and shown as written.
 * - Its words are English only, on purpose:  scaffolding, never translated.
 * - Placed by `NotebookController`, after each example it draws (`place()`);  nothing else knows of it.
 * - TODO:  remove after P19's Button page:  this file, `original=` on the notebooks, and `NotebookController`'s
 *   `originals`.
 ****************/
export class NotebookOriginal {
  /** Each example's fold, by its cell's key, in order:  made once, moved after each new drawing of it. */
  private readonly folds = new Map<string, Fold[]>()
  /** Where the folds draw:  the page's, so they go with it. */
  private readonly owner: Owner | null

  constructor(
    /** the original page's address, if the notebook names one */
    readonly page: () => string | undefined
  ) {
    this.owner = getOwner()
    if (this.owner) onCleanup(() => this.dispose())
  }

  /**
   * Put example `index` of cell `key`'s fold right after `example`, its new drawing, making it the first time.
   * - Nothing when the notebook names no original page.
   */
  place(key: string, index: number, example: Element) {
    const page = this.page()
    if (!page) return
    const folds = this.folds.get(key) ?? []
    const fold = (folds[index] ??= this.foldFor(page))
    fold.example = example
    example.after(fold.element)
    this.folds.set(key, folds)
  }

  /** Let every fold go. */
  dispose() {
    for (const fold of [...this.folds.values()].flat()) fold.dispose()
    this.folds.clear()
  }

  /** A new fold for an example of `page`'s:  its `<OriginalFold>`, drawn in a box of its own. */
  private foldFor(page: string): Fold {
    const element = document.createElement("div")
    element.className = "NotebookOriginal"
    const fold: Fold = { element, example: undefined, dispose: () => {} }
    fold.dispose = runWithOwner(this.owner, () =>
      render(() => <OriginalFold page={page} example={() => fold.example} />, element)
    )!
    return fold
  }

  ////////////////
  // ## The original page
  ////////////////

  /**
   * The original's example for `example`, a notebook's `<spell-example>` on the page:  the same sections, the same
   * place in the innermost.
   * - throws when the page can't be read
   */
  static async matchFor(page: string, example: Element): Promise<OriginalMatch> {
    const place = placeOf(example, NOTEBOOK_EXAMPLE)
    const examples = await NotebookOriginal.examplesOf(page)
    const found = examples.find(
      (each) => each.index === place.index && each.sections.join(SECTION_GAP) === place.sections.join(SECTION_GAP)
    )
    return { ...place, element: found?.element }
  }

  /** Every `<ui-docs-example>` on `page`, where it is:  read once a page. */
  static examplesOf(page: string): Promise<OriginalPlace[]> {
    let examples = NotebookOriginal.pages.get(page)
    if (!examples) {
      examples = NotebookOriginal.read(page)
      // a page that didn't load is read again next time
      examples.catch(() => NotebookOriginal.pages.delete(page))
      NotebookOriginal.pages.set(page, examples)
    }
    return examples
  }

  /** `page`, fetched and parsed:  its examples, where they are.  Throws when it doesn't load. */
  private static async read(page: string): Promise<OriginalPlace[]> {
    const response = await fetch(page)
    if (!response.ok) throw new Error(`NotebookOriginal.read():  ${page} answered ${response.status}`)
    const parsed = new DOMParser().parseFromString(await response.text(), "text/html")
    return [...parsed.querySelectorAll(ORIGINAL_EXAMPLE)].map((element) => ({
      ...placeOf(element, ORIGINAL_EXAMPLE),
      element
    }))
  }

  /** Each page read, by its address. */
  private static readonly pages = new Map<string, Promise<OriginalPlace[]>>()

  /**
   * The original example `element`, ready for this page:  a `<ui-docs-example>` of its attributes and children,
   * its code open, its URLs pointing where they did on `page` but shown as written.
   */
  static copyOf(element: Element, page: string): HTMLElement {
    const copy = document.createElement(ORIGINAL_EXAMPLE)
    for (const { name, value } of element.attributes) copy.setAttribute(name, value)
    copy.setAttribute("code", "")
    for (const child of element.childNodes) copy.append(document.importNode(child, true))
    E.SourceMarkup.rewriteUrls(copy, page, document)
    // its code from the markup as written, before it's on the page:  the kept URLs put back
    const holder = document.createElement("div")
    holder.append(copy)
    ExampleSource.keep(holder)
    return copy
  }
}

/****************
 * ### `<OriginalFold>`
 * An example's "Original" section:  closed at first;  opened, the original page's example (`NotebookOriginal`).
 * - The page is read when it first opens, so a closed fold costs nothing.
 ****************/
function OriginalFold(props: { page: string; example: () => Element | undefined }) {
  const [match, setMatch] = createSignal<OriginalMatch>()
  const [failure, setFailure] = createSignal<string>()
  const open = () => {
    const example = props.example()
    if (match() || !example) return
    NotebookOriginal.matchFor(props.page, example)
      .then(setMatch)
      .catch((error: unknown) => setFailure(String(error)))
  }
  return (
    <ui-section label={FOLD_LABEL} collapsible open="false" on-ui-opened={open}>
      <Show when={failure()}>{(text) => <p class="NotebookOriginalNote">{text()}</p>}</Show>
      <Show when={match()}>
        {(found) => (
          <Show
            when={found().element}
            fallback={
              <p class="NotebookOriginalNote">
                {`No example ${found().index + 1} in ${found().sections.join(SECTION_GAP) || "the page"} of `}
                <a href={props.page}>{props.page}</a>
              </p>
            }
          >
            {(element) => <div ref={(host) => host.append(NotebookOriginal.copyOf(element(), props.page))} />}
          </Show>
        )}
      </Show>
    </ui-section>
  )
}

////////////////
// ## Helpers
////////////////

/**
 * Where `example` is:  the labels of the `<ui-section>`s around it, outermost first, and which `tag` it is in the
 * innermost (from 0), not counting those in a section inside that one.
 */
function placeOf(example: Element, tag: string): Omit<OriginalPlace, "element"> {
  const sections: Element[] = []
  for (let at = example.parentElement; at; at = at.parentElement) if (at.localName === SECTION) sections.unshift(at)
  const inner = sections.at(-1)
  const within = inner ?? example.ownerDocument.body
  const siblings = [...within.querySelectorAll(tag)].filter((each) => each.parentElement?.closest(SECTION) === inner)
  return {
    sections: sections.map((section) => section.getAttribute("label") ?? "").filter(Boolean),
    index: siblings.indexOf(example)
  }
}

/** One of an example's folds, and the example it's after now. */
type Fold = { element: HTMLElement; example: Element | undefined; dispose: () => void }

/** An example on the original page, and where it is. */
type OriginalPlace = {
  /** the labels of the sections around it, outermost first:  `["Owners", "Comment"]` */
  sections: string[]
  /** which example it is in its innermost section, from 0 */
  index: number
  /** the example, in the parsed page */
  element: Element
}

/** A notebook example's place, and the original's example there, if there is one. */
type OriginalMatch = Omit<OriginalPlace, "element"> & { element: Element | undefined }

/** A notebook's example, drawn on its page. */
const NOTEBOOK_EXAMPLE = "spell-example"

/** A component page's example. */
const ORIGINAL_EXAMPLE = "ui-docs-example"

/** A section, on either page. */
const SECTION = "ui-section"

/** Between section labels, as the fold says them. */
const SECTION_GAP = " › "

/** The fold's label. */
const FOLD_LABEL = "Original"
