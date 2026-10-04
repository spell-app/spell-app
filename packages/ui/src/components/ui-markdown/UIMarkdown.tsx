import { For, Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SourceElement, UI } from "$/ui/core"

import { markdownVocabulary } from "./ui-markdown.vocabulary.en"
import { MarkdownFallback } from "./ui-markdown.fallback"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { UIMarkdownHost } from "./UIMarkdownHost"
import {
  CODE_TAG,
  MARKDOWN_TABS,
  TABLE_SHEET,
  TAB_KEYS,
  TAB_ROLES,
  TASK_BOXES,
  URL_ATTRIBUTES,
  type MarkdownHeading,
  type MarkdownOptions,
  type MarkdownTab,
  type Vocabulary
} from "./ui-markdown.types"

import markdownCSS from "./ui-markdown.css?inline"

/****************
 * ### `<ui-markdown>`
 * GitHub-flavoured markdown, rendered into `<article class="ui [size] markdown" part="body">` (in a `<section>`:
 *   the preview panel, when `editable`).
 * - Text:  the element's own (`<script type="text/markdown">` keeps it exact), or a `source` file -- see
 *   `SourceElement`.
 * - Rendering:  marked + DOMPurify, loaded with the first render (`MarkdownRenderer` -> `MarkdownEngine`, the lazy
 *   chunk);  sanitized unless `trusted`;  headings get GitHub's ids (`headings`, `ui-render`).
 * - After rendering:
 *   - each fenced code block becomes a `<ui-code language="x" copy>` (one highlighter, one palette)
 *   - each task-list checkbox is named by its item's text (marked leaves it unlabelled)
 *   - relative `href` / `src` resolve against `source`, so a README's links and images work where it's shown
 *   - `#id` links scroll to the heading INSIDE the shadow root (the page's own fragment navigation can't see it)
 * - A failed render (an engine that won't load) is a `render` error with its message.
 * - `editable`:  Write / Preview tabs (`role=tablist`, arrow keys), a `<textarea>` for the text and the article as the
 *   preview, drawn by spell's engine (`MarkdownRenderer.loadMD()`:  `ui-*` elements, `<ui-table>`'s sheet adopted
 *   here too).
 *   - each keystroke is `setContent()`:  `ui-change`, `:state(dirty)`, and `save()` writes it back to `source`
 *   - the preview renders while it's shown:  the WHOLE text each time (~2 ms for 32 kB), then only the top-level
 *     blocks whose markup changed are swapped (`patchBody()`), so unchanged `ui-*` elements keep their state
 ****************/
export class UIMarkdown extends SourceElement<Vocabulary> {
  @proto static vocabulary = markdownVocabulary
  @proto static styles = { markdown: markdownCSS }
  @proto static Fallback = MarkdownFallback
  @proto static Host = UIMarkdownHost
  @proto static delegatesFocus = false

  /** The headings of the last render. */
  readonly headings = new Cell<MarkdownHeading[]>([])

  /** `editable`'s shown tab. */
  readonly tab = new Cell<MarkdownTab>("write")

  /** The `<article>`, once rendered. */
  private body?: HTMLElement

  /** Renders started;  only the latest one's result is shown. */
  private ticket = 0

  /** `editable`:  the text box, and the tab buttons by tab. */
  private editor?: HTMLTextAreaElement
  private readonly tabButtons = new Map<MarkdownTab, HTMLButtonElement>()

  /** Markup of each top-level node `patchBody()` put in the article, to tell which blocks changed. */
  private readonly rendered = new WeakMap<Node, string>()

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Render whenever the text or a rendering attribute changes;  `editable`, only while the preview shows.
   * - `editable`:  the text box follows the content too (`host.content = ...`, a reload).
   */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({
          text: this.contentText(),
          loaded: this.status.get() === "loaded",
          editable: this.editable(),
          shown: !this.editable() || this.tab.get() === "preview",
          options: {
            breaks: !!this.attrs.breaks,
            headingOffset: Number(this.attrs.headingOffset) || 0,
            trusted: !!this.attrs.trusted
          }
        }),
        ({ text, loaded, editable, shown, options }) => {
          if (loaded && shown) void this.renderMarkdown(text, options, editable)
        }
      )
      createEffect(
        () => this.contentText(),
        (text) => {
          if (this.editor && this.editor.value !== text) this.editor.value = text
        }
      )
    }
    return super.mount()
  }

  protected renderContent(): JSX.Element {
    return (
      <>
        <Show when={this.editable()}>
          {this.renderTabs()}
          {this.renderEditor()}
        </Show>
        <section
          id={UIMarkdown.panelId("preview")}
          role={this.editable() ? TAB_ROLES.panel : undefined}
          aria-labelledby={this.editable() ? UIMarkdown.tabId("preview") : undefined}
          hidden={this.editable() && this.tab.get() !== "preview" ? true : undefined}
        >
          <article
            class={this.classes()}
            part={this.part("body")}
            onClick={this.onClick}
            ref={(body: HTMLElement) => {
              this.body = body
            }}
          />
        </section>
      </>
    )
  }

  /** `editable`'s tab list:  Write, Preview. */
  private renderTabs(): JSX.Element {
    return (
      <nav part={this.part("tabs")} role={TAB_ROLES.list} onKeyDown={this.onTabKey}>
        <For each={MARKDOWN_TABS}>
          {(tab) => (
            <button
              type="button"
              id={UIMarkdown.tabId(tab)}
              role={TAB_ROLES.tab}
              part={this.part("tab")}
              aria-selected={this.tab.get() === tab ? "true" : "false"}
              aria-controls={UIMarkdown.panelId(tab)}
              tabindex={this.tab.get() === tab ? 0 : -1}
              onClick={() => this.tab.set(tab)}
              ref={(button: HTMLButtonElement) => {
                this.tabButtons.set(tab, button)
              }}
            >
              {this.text(tab)}
            </button>
          )}
        </For>
      </nav>
    )
  }

  /** `editable`'s text box, in the Write panel. */
  private renderEditor(): JSX.Element {
    return (
      <section
        id={UIMarkdown.panelId("write")}
        role={TAB_ROLES.panel}
        aria-labelledby={UIMarkdown.tabId("write")}
        hidden={this.tab.get() !== "write" ? true : undefined}
      >
        <textarea
          part={this.part("editor")}
          aria-label={this.text("editor")}
          onInput={this.onInput}
          ref={(editor: HTMLTextAreaElement) => {
            this.editor = editor
            editor.value = untrack(this.contentText)
          }}
        />
      </section>
    )
  }

  /** `editable`, as a boolean. */
  private editable(): boolean {
    return !!this.attrs.editable
  }

  /** `editable`:  `<ui-table>`'s sheet too, since the preview draws tables with it (a page sheet:  `TABLE_SHEET`). */
  protected sheetNames(): string[] {
    const names = super.sheetNames()
    return this.editable() ? [...names, TABLE_SHEET] : names
  }

  /** The headings of the last render. */
  getHeadings(): MarkdownHeading[] {
    return untrack(this.headings.get)
  }

  /** Render `text` into the article (`editable`:  with spell's engine, patched);  `ui-render` when done. */
  private async renderMarkdown(text: string, options: MarkdownOptions, editable: boolean) {
    const ticket = ++this.ticket
    try {
      await UI.load()
      const engine = editable ? await MarkdownRenderer.loadMD() : await MarkdownRenderer.load()
      if (ticket !== this.ticket || !this.body) return
      const { fragment, headings } = engine.render(text, options)
      this.upgradeCode(fragment)
      this.labelTaskItems(fragment)
      this.resolveUrls(fragment)
      if (editable) this.patchBody(this.body, fragment)
      else this.body.replaceChildren(fragment)
      this.headings.set(headings)
      this.emitSource("ui-render", { headings })
    } catch (error) {
      if (ticket === this.ticket) this.loadFailed(error, "render")
    }
  }

  /** Each `<pre><code class="language-x">` in `fragment` becomes a `<ui-code language="x" copy>` with its text. */
  private upgradeCode(fragment: DocumentFragment) {
    for (const code of fragment.querySelectorAll("pre > code")) {
      const pre = code.parentElement!
      const block = this.host.ownerDocument.createElement(CODE_TAG)
      const language = /\blanguage-(\S+)/.exec(code.className)?.[1]
      if (language) block.setAttribute("language", language)
      block.setAttribute("copy", "")
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
    const source = this.sourceAttribute()
    if (!source) return
    const base = new URL(source, this.host.ownerDocument.baseURI)
    for (const name of URL_ATTRIBUTES) {
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
   * Put `fragment`'s top-level nodes in `body`, keeping the ones already there whose markup is the same:  the
   * unchanged lead and tail stay, only the middle is swapped.
   * - Why:  an edit changes a block or two;  re-creating every `ui-*` element would re-highlight every code block and
   *   lose each one's state (a scrolled table, a copied-code tick).
   * - A node not put here (marked's render, before `editable`) has no markup recorded, so it's always swapped.
   */
  private patchBody(body: HTMLElement, fragment: DocumentFragment) {
    const next = [...fragment.childNodes]
    const nextMarkup = next.map(UIMarkdown.markupOf)
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
    const anchor = tail ? old[old.length - tail] : null
    for (const [index, node] of next.slice(lead, next.length - tail).entries()) {
      this.rendered.set(node, nextMarkup[lead + index])
      body.insertBefore(node, anchor)
    }
  }

  /** A top-level node's markup, to compare renders by. */
  private static markupOf(node: Node): string {
    return `${node.nodeType}:${node.nodeType === Node.ELEMENT_NODE ? (node as Element).outerHTML : node.textContent}`
  }

  /** Ids of `tab`'s button and panel, inside the shadow root. */
  private static tabId(tab: MarkdownTab): string {
    return `ui-markdown-${tab}-tab`
  }

  private static panelId(tab: MarkdownTab): string {
    return `ui-markdown-${tab}-panel`
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** `editable`:  each keystroke is an edit (`ui-change`, `dirty`). */
  private readonly onInput = (event: InputEvent) => {
    this.setContent((event.currentTarget as HTMLTextAreaElement).value)
  }

  /** `editable`'s tab list:  arrows move between the tabs (wrapping), Home / End to the ends;  focus follows. */
  private readonly onTabKey = (event: KeyboardEvent) => {
    const to = UIMarkdown.tabAfter(untrack(this.tab.get), event.key)
    if (!to) return
    event.preventDefault()
    this.tab.set(to)
    this.tabButtons.get(to)?.focus()
  }

  /** The tab `key` moves to from `tab`;  `undefined` for any other key. */
  private static tabAfter(tab: MarkdownTab, key: string): MarkdownTab | undefined {
    const index = MARKDOWN_TABS.indexOf(tab)
    const count = MARKDOWN_TABS.length
    if (key === TAB_KEYS.previous) return MARKDOWN_TABS[(index + count - 1) % count]
    if (key === TAB_KEYS.next) return MARKDOWN_TABS[(index + 1) % count]
    if (key === TAB_KEYS.first) return MARKDOWN_TABS[0]
    if (key === TAB_KEYS.last) return MARKDOWN_TABS[count - 1]
    return undefined
  }

  /** A `#id` link:  scroll to that heading here, in the shadow root, and put it in the address. */
  private readonly onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest?.("a[href^='#']")
    if (!link || !this.body) return
    const id = decodeURIComponent(link.getAttribute("href")!.slice(1))
    const target = this.body.querySelector(`[id="${CSS.escape(id)}"]`)
    if (!target) return
    event.preventDefault()
    target.scrollIntoView()
    history.replaceState(history.state, "", `#${id}`)
  }
}
