import { For, Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import type { codeVocabulary } from "$/ui/components/ui-code/UICode.en"
import { MarkdownRenderer } from "./MarkdownRenderer"
import type { MarkdownHeading, MarkdownOptions } from "./UIMarkdown.types"
import { markdownVocabulary } from "./UIMarkdown.en"

import markdownCSS from "./UIMarkdown.css?inline"

/****************
 * ### `DOMMarkdownElement`
 * The DOM element of `<ui-markdown>`:  it adds `headings` and `reveal()`
 * to the source API it inherits from `DOMLoadableElement` (`content`, `save()` ...).
 * - `headings`:  `{ level, text, id }` of each heading of the last render, e.g. for a table of contents;
 *   `[]` before the first (`ui-render` says when).
 * - `reveal(id)`:  scroll to one of them from outside.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMMarkdownElement extends E.DOMLoadableElement {
  /** Each heading of the last render;  `[]` before the first.  Untracked:  it's for scripts. */
  get headings(): MarkdownHeading[] {
    return untrack(() => this.markdown?.headings) ?? []
  }

  /**
   * Scroll to the rendered heading `id` (a `headings` entry's) and put `#id` in the address,
   * as a `#id` link inside does;  `false` when no such heading is rendered (yet).
   * - Why a method:  the headings live in the shadow root, which the page's own fragment navigation can't see,
   *   e.g. from a table of contents outside the element.
   */
  reveal(id: string): boolean {
    return this.markdown?.reveal(id) ?? false
  }

  /** This element's component, once it has one. */
  private get markdown(): UIMarkdown | undefined {
    return this.component as UIMarkdown | undefined
  }
}

/****************
 * ### `UIMarkdown`
 * The component behind `<ui-markdown>`:  GitHub-flavoured markdown, rendered.
 *
 * - Its shadow DOM:  `<article class="ui [size] markdown" part="body">`,
 *   in a `<section>` (the preview panel, when `editable`).
 * - The text:  the element's own (`<script type="text/markdown">` keeps it exact),
 *   or a `source` file (see `LoadableComponent`).
 * - Rendering:  marked, loaded with the first render (`MarkdownRenderer` -> `MarkdownEngine`, the lazy chunk).
 *   Headings get GitHub's ids (`headings`, `ui-render`).
 * - NOT sanitized unless `sanitized`:  raw HTML in the text is kept.
 *   `sanitized` loads DOMPurify (`MarkdownSanitizer`, a lazy chunk of its own) alongside the engine:
 *   set it for text you didn't write.
 * - After rendering:
 *   - each fenced code block becomes a `<ui-code language="x" copy>` (one highlighter, one palette)
 *   - each task-list checkbox is named by its item's text (marked leaves it unlabelled)
 *   - relative `href` / `src` resolve against `source`, so a README's links and images work where it's shown
 *   - `#id` links scroll to the heading INSIDE the shadow root
 *     (the page's own fragment navigation can't see it).
 *     So do `reveal(id)` from outside, and a `#id` in the address that names one of its headings:
 *     after the FIRST render (a page loaded with it), and on each `hashchange` (a link elsewhere on the page).
 * - `skip-title`:  the text's leading `#` title isn't rendered (the text keeps it).
 * - A failed render (an engine that won't load) is a `render` error, with its message.
 * - `editable`:  Write / Preview tabs (`role=tablist`, arrow keys), a `<textarea>` for the text,
 *   and the article as the preview, drawn by spell's engine
 *   (`MarkdownRenderer.loadMD()`:  `ui-*` elements, with `<ui-table>`'s sheet adopted here too).
 *   - each keystroke sets `content`:  `ui-change`, `:state(dirty)`, and `save()` writes it back to `source`
 *   - the preview renders while it's shown:  the WHOLE text each time (~2 ms for 32 kB),
 *     then swaps only the top-level blocks whose markup changed (`patchBody()`),
 *     so unchanged `ui-*` elements keep their state.
 * - SIDE EFFECTS:  listens to `window`'s `hashchange` while connected;
 *   a revealed heading is put in the address (`history.replaceState`, no new entry).
 ****************/
export class UIMarkdown extends E.LoadableComponent<typeof markdownVocabulary> {
  @E.proto static vocabulary = markdownVocabulary
  @E.proto static styleSheets = { markdown: markdownCSS }
  @E.proto static elementSetup = {
    DOMElement: DOMMarkdownElement,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Rendering
  ////////////////

  /** The `<article>`, once rendered. */
  private body?: HTMLElement

  /** Renders started;  only the latest one's result is shown. */
  private ticket = 0

  /** Markup of each top-level node `patchBody()` put in the article, to tell which blocks changed. */
  private readonly rendered = new WeakMap<Node, string>()

  /**
   * Render whenever the text or a rendering attribute changes;  `editable`, only while the preview shows.
   * - Stays an explicit effect:  its compute BUILDS the render's input (title stripped, options), not just reads.
   */
  onMount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({
          text: this.skipTitle ? this.textToShow.replace(LEADING_TITLE, "") : this.textToShow,
          isLoaded: this.loadStatus === "loaded",
          isEditable: this.editable,
          isShown: !this.editable || this.shownTab === PREVIEW,
          options: {
            breaks: !!this.breaks,
            headingOffset: Number(this.headingOffset) || 0,
            sanitized: !!this.sanitized
          }
        }),
        ({ text, isLoaded, isEditable, isShown, options }) => {
          if (isLoaded && isShown) void this.renderMarkdown({ text, options, isEditable })
        }
      )
    }
    return super.onMount()
  }

  protected renderContent(): JSX.Element {
    return (
      <>
        <Show when={this.editable}>
          {this.tabs()}
          {this.editor()}
        </Show>
        <section
          id={UIMarkdown.panelId(PREVIEW)}
          role={this.editable ? TAB_ROLES.panel : undefined}
          aria-labelledby={this.editable ? UIMarkdown.tabId(PREVIEW) : undefined}
          hidden={this.editable && this.shownTab !== PREVIEW ? true : undefined}
        >
          <article
            class={this.rootClass}
            part={this.partForName("body")}
            onClick={this.onClick}
            ref={(body: HTMLElement) => {
              this.body = body
            }}
          />
        </section>
      </>
    )
  }

  /** `editable`:  `<ui-table>`'s sheet too, since the preview draws tables with it (a page sheet:  `TABLE_SHEET`). */
  get styleSheetNames(): string[] {
    const names = super.styleSheetNames
    return this.editable ? [...names, TABLE_SHEET] : names
  }

  ////////////////
  // ## Editing (`editable`)
  ////////////////

  /** `editable`'s shown tab. */
  @E.state accessor shownTab: MarkdownTab = WRITE

  /** `editable`:  the text box. */
  private textBox?: HTMLTextAreaElement

  /** `editable`:  the tab buttons, by tab. */
  private readonly tabButtons = new Map<MarkdownTab, HTMLButtonElement>()

  /** `editable`'s tab list:  Write, Preview. */
  private tabs(): JSX.Element {
    return (
      <nav part={this.partForName("tabs")} role={TAB_ROLES.list} onKeyDown={this.onTabKeyDown}>
        <For each={MarkdownTabs}>
          {(tab) => (
            <button
              type="button"
              id={UIMarkdown.tabId(tab)}
              role={TAB_ROLES.tab}
              part={this.partForName("tab")}
              aria-selected={this.shownTab === tab ? "true" : "false"}
              aria-controls={UIMarkdown.panelId(tab)}
              tabindex={this.shownTab === tab ? 0 : -1}
              onClick={() => (this.shownTab = tab)}
              ref={(button: HTMLButtonElement) => {
                this.tabButtons.set(tab, button)
              }}
            >
              {this.translationForKey(tab)}
            </button>
          )}
        </For>
      </nav>
    )
  }

  /** `editable`'s text box, in the Write panel. */
  private editor(): JSX.Element {
    return (
      <section
        id={UIMarkdown.panelId(WRITE)}
        role={TAB_ROLES.panel}
        aria-labelledby={UIMarkdown.tabId(WRITE)}
        hidden={this.shownTab !== WRITE ? true : undefined}
      >
        <textarea
          part={this.partForName("editor")}
          aria-label={this.translationForKey("editor")}
          onInput={this.onInput}
          ref={(textBox: HTMLTextAreaElement) => {
            this.textBox = textBox
            textBox.value = untrack(() => this.textToShow)
          }}
        />
      </section>
    )
  }

  /** `editable`:  the text box follows the content (`domElement.content = ...`, a reload). */
  @E.onChange("textToShow")
  protected onTextChanged(text: string) {
    if (this.textBox && this.textBox.value !== text) this.textBox.value = text
  }

  /** `editable`:  each keystroke is an edit (`ui-change`, `dirty`). */
  private readonly onInput = (event: InputEvent) => {
    this.content = (event.currentTarget as HTMLTextAreaElement).value
  }

  /** `editable`'s tab list:  arrows move between the tabs (wrapping), Home / End to the ends;  focus follows. */
  private readonly onTabKeyDown = (event: KeyboardEvent) => {
    const to = UIMarkdown.tabAfter(this.shownTab, event.key)
    if (!to) return
    event.preventDefault()
    this.shownTab = to
    this.tabButtons.get(to)?.focus()
  }

  ////////////////
  // ## Headings
  ////////////////

  /** The headings of the last render;  the DOM element's `headings` reads it untracked. */
  @E.state accessor headings: MarkdownHeading[] = []

  /** A render has finished:  the address's `#id` was looked for once, after the first. */
  private hasRendered = false

  /** Scroll to the rendered heading `id` and put `#id` in the address;  `false` when there's none. */
  reveal(id: string): boolean {
    if (!this.scrollTo(id)) return false
    history.replaceState(history.state, "", `#${id}`)
    return true
  }

  /** While connected, listen to `window`'s `hashchange`;  returns the listener's abort. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (!isConnected) return
    const listeners = new AbortController()
    window.addEventListener("hashchange", () => this.onHashChange(), { signal: listeners.signal })
    return () => listeners.abort()
  }

  /**
   * Scroll to the heading the address's `#id` names, if it's one of ours:  on `hashchange`, and once after the first
   * render.
   * - Not when the PAGE has that id:  the browser went there itself.
   */
  private onHashChange() {
    const id = UIMarkdown.idForHash(location.hash)
    if (id && !this.domElement.ownerDocument.getElementById(id)) this.scrollTo(id)
  }

  /** Scroll the element with `id` in the article into view;  `false` when there's none. */
  private scrollTo(id: string): boolean {
    const target = this.body?.querySelector(`[id="${CSS.escape(id)}"]`)
    target?.scrollIntoView()
    return !!target
  }

  /** A `#id` link:  scroll to that heading here, in the shadow root, and put it in the address. */
  private readonly onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest?.(IN_PAGE_LINK)
    const id = link && UIMarkdown.idForHash(link.getAttribute("href")!)
    if (id && this.reveal(id)) event.preventDefault()
  }

  ////////////////
  // ## Markup
  ////////////////

  /**
   * Render `text` into the article;  `ui-render` when done.
   * - `isEditable`:  with spell's engine, its markup patched in (`patchBody()`);  sanitized keeping `ui-*` tags.
   */
  private async renderMarkdown({ text, options, isEditable }: RenderParams) {
    const ticket = ++this.ticket
    try {
      await UI.load()
      const [engine, sanitizer] = await Promise.all([
        isEditable ? MarkdownRenderer.loadMD() : MarkdownRenderer.load(),
        options.sanitized ? MarkdownRenderer.loadSanitizer() : undefined
      ])
      if (ticket !== this.ticket || !this.body) return
      const { html, headings } = engine.render(text, options)
      const fragment = sanitizer
        ? sanitizer.sanitize(html, { uiTags: isEditable })
        : this.domElement.ownerDocument.createRange().createContextualFragment(html)
      this.upgradeCode(fragment)
      this.labelTaskItems(fragment)
      this.resolveUrls(fragment)
      if (isEditable) this.patchBody(this.body, fragment)
      else this.body.replaceChildren(fragment)
      this.headings = headings
      this.send("ui-render", { headings })
      if (!this.hasRendered) {
        this.hasRendered = true
        this.onHashChange()
      }
    } catch (error) {
      if (ticket === this.ticket) this.onLoadError(error, "render")
    }
  }

  /** Each `<pre><code class="language-x">` in `fragment` becomes a `<ui-code language="x" copy>` with its text. */
  private upgradeCode(fragment: DocumentFragment) {
    for (const code of fragment.querySelectorAll(CODE_BLOCK)) {
      const pre = code.parentElement!
      const block = this.domElement.ownerDocument.createElement(CODE_TAG)
      const language = LANGUAGE_CLASS.exec(code.className)?.[1]
      if (language) block.setAttribute(LANGUAGE, language)
      block.setAttribute(COPY, "")
      block.textContent = (code.textContent ?? "").replace(/\n$/, "")
      pre.replaceWith(block)
    }
  }

  /** Name each task-list checkbox by its item's text:  both engines write a bare box, which nothing labels. */
  private labelTaskItems(fragment: DocumentFragment) {
    for (const box of fragment.querySelectorAll(TASK_BOXES)) {
      const text = box.parentElement!.textContent?.trim()
      if (text) box.setAttribute("aria-label", text)
    }
  }

  /** Point relative URLs in `fragment` where they point beside `source`;  in-page `#id`s are left alone. */
  private resolveUrls(fragment: DocumentFragment) {
    const source = this.source || undefined
    if (!source) return
    const base = new URL(source, this.domElement.ownerDocument.baseURI)
    for (const name of LINK_ATTRIBUTES) {
      for (const element of fragment.querySelectorAll(`[${name}]`)) {
        const value = element.getAttribute(name)!
        if (value.startsWith("#")) continue
        try {
          element.setAttribute(name, new URL(value, base).href)
        } catch {
          // not a URL:  leave it
        }
      }
    }
  }

  /**
   * Put `fragment`'s top-level nodes in `body`, keeping the ones already there whose markup is the same:
   * the unchanged lead and tail stay, only the middle is swapped.
   * - Why:  an edit changes a block or two;  re-creating every `ui-*` element would re-highlight every code block and
   *   lose each one's state (a scrolled table, a copied-code tick).
   * - A node not put here (marked's render, before `editable`) has no markup recorded, so it's always swapped.
   */
  private patchBody(body: HTMLElement, fragment: DocumentFragment) {
    const next = [...fragment.childNodes]
    const nextMarkup = next.map(UIMarkdown.markupFor)
    const old = [...body.childNodes]
    const oldMarkup = old.map((node) => this.rendered.get(node))
    let lead = 0
    while (lead < next.length && lead < old.length && nextMarkup[lead] === oldMarkup[lead]) lead++
    let tail = 0
    while (
      tail < next.length - lead &&
      tail < old.length - lead &&
      nextMarkup[next.length - 1 - tail] === oldMarkup[old.length - 1 - tail]
    ) {
      tail++
    }
    for (const node of old.slice(lead, old.length - tail)) node.remove()
    // `insertBefore()`'s "at the end" is `null`:  a platform boundary
    const anchor = tail ? old[old.length - tail] : null
    for (const [index, node] of next.slice(lead, next.length - tail).entries()) {
      this.rendered.set(node, nextMarkup[lead + index])
      body.insertBefore(node, anchor)
    }
  }

  ////////////////
  // ## Helpers:  static, as they're pure
  ////////////////

  /** `#some%20id` => `some id`;  `undefined` for no hash, or a malformed one. */
  private static idForHash(hash: string): string | undefined {
    try {
      return decodeURIComponent(hash.slice(1)) || undefined
    } catch {
      return undefined
    }
  }

  /** A top-level node's markup, to compare renders by. */
  private static markupFor(node: Node): string {
    const markup = node.nodeType === E.NodeType.element ? (node as Element).outerHTML : node.textContent
    return `${node.nodeType}:${markup}`
  }

  /** Id of `tab`'s button, inside the shadow root. */
  private static tabId(tab: MarkdownTab): string {
    return `ui-markdown-${tab}-tab`
  }

  /** Id of `tab`'s panel, inside the shadow root. */
  private static panelId(tab: MarkdownTab): string {
    return `ui-markdown-${tab}-panel`
  }

  /** The tab `key` moves to from `tab`;  `undefined` for any other key. */
  private static tabAfter(tab: MarkdownTab, key: string): MarkdownTab | undefined {
    const index = MarkdownTabs.indexOf(tab)
    const count = MarkdownTabs.length
    if (key === UIT.Key.arrowLeft) return MarkdownTabs[(index + count - 1) % count]
    if (key === UIT.Key.arrowRight) return MarkdownTabs[(index + 1) % count]
    if (key === UIT.Key.home) return MarkdownTabs[0]
    if (key === UIT.Key.end) return MarkdownTabs[count - 1]
    return undefined
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIMarkdown extends E.AttributeValues<typeof markdownVocabulary> {}

/** What `renderMarkdown()` renders. */
type RenderParams = {
  /** the markdown */
  text: string
  /** how to render it */
  options: MarkdownOptions
  /** `editable`:  spell's engine, patched in, `ui-*` tags kept when sanitized */
  isEditable: boolean
}

/** `editable`'s Write tab:  the text box. */
const WRITE = "write"

/** `editable`'s Preview tab:  the article. */
const PREVIEW = "preview"

/** `editable`'s tabs, in order;  each is also its text's key. */
const MarkdownTabs = [WRITE, PREVIEW] as const

/** One of `MarkdownTabs`. */
type MarkdownTab = (typeof MarkdownTabs)[number]

/** `editable`'s tab roles. */
const TAB_ROLES = { list: "tablist", tab: "tab", panel: "tabpanel" } as const

/** `<ui-table>`'s sheet (`UI.styles` name):  a page sheet, so `editable` adopts it into its shadow root too. */
const TABLE_SHEET = "table"

/**
 * A leading `#` title (`skip-title`):  blank lines, then an ATX `# Title` (one `#`) or a setext title (a line
 * underlined with `=`), with its line end.
 */
const LEADING_TITLE = /^(?:[ \t]*\n)*[ ]{0,3}(?:#(?=[ \t\n]|$)[^\n]*|[^\s][^\n]*\n[ ]{0,3}=+[ \t]*)(?:\n|$)/

/** A fenced code block, as both engines write it. */
const CODE_BLOCK = "pre > code"

/** A code block's language, from its class:  `language-js` => `js`. */
const LANGUAGE_CLASS = /\blanguage-(\S+)/

/** Tag a fenced code block becomes. */
const CODE_TAG: (typeof codeVocabulary)["tag"] = "ui-code"

/** `<ui-code>`'s highlighting language. */
const LANGUAGE: E.AttributeName<typeof codeVocabulary> = "language"

/** `<ui-code>`'s copy button. */
const COPY: E.AttributeName<typeof codeVocabulary> = "copy"

/** Task-list checkboxes:  marked's (`<input>`) and spell's engine's (`<ui-checkbox>`). */
const TASK_BOXES = "li > input[type=checkbox], ui-item > ui-checkbox"

/**
 * Attributes rewritten against `source`, so relative links and images point where they did beside the file.
 * - Not the element core's `E.URL_ATTRIBUTES`:  markdown writes only these two, and keeps no originals to save.
 */
const LINK_ATTRIBUTES = ["href", "src"] as const

/** A link to a `#id` on this page. */
const IN_PAGE_LINK = "a[href^='#']"
