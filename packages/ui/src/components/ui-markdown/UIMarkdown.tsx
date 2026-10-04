import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SourceElement, UI } from "$/ui/core"

import { markdownVocabulary } from "./ui-markdown.vocabulary.en"
import { MarkdownFallback } from "./ui-markdown.fallback"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { UIMarkdownHost } from "./UIMarkdownHost"
import {
  CODE_TAG,
  URL_ATTRIBUTES,
  type MarkdownHeading,
  type MarkdownOptions,
  type Vocabulary
} from "./ui-markdown.types"

import markdownCSS from "./ui-markdown.css?inline"

/****************
 * ### `<ui-markdown>`
 * GitHub-flavoured markdown, rendered into `<article class="ui [size] markdown" part="body">`.
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
 ****************/
export class UIMarkdown extends SourceElement<Vocabulary> {
  @proto static vocabulary = markdownVocabulary
  @proto static styles = { markdown: markdownCSS }
  @proto static Fallback = MarkdownFallback
  @proto static Host = UIMarkdownHost
  @proto static delegatesFocus = false

  /** The headings of the last render. */
  readonly headings = new Cell<MarkdownHeading[]>([])

  /** The `<article>`, once rendered. */
  private body?: HTMLElement

  /** Renders started;  only the latest one's result is shown. */
  private ticket = 0

  ////////////////
  // ## Rendering
  ////////////////

  /** Render whenever the text or a rendering attribute changes. */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({
          text: this.contentText(),
          loaded: this.status.get() === "loaded",
          options: {
            breaks: !!this.attrs.breaks,
            headingOffset: Number(this.attrs.headingOffset) || 0,
            trusted: !!this.attrs.trusted
          }
        }),
        ({ text, loaded, options }) => {
          if (loaded) void this.renderMarkdown(text, options)
        }
      )
    }
    return super.mount()
  }

  protected renderContent(): JSX.Element {
    return (
      <article
        class={this.classes()}
        part={this.part("body")}
        onClick={this.onClick}
        ref={(body: HTMLElement) => {
          this.body = body
        }}
      />
    )
  }

  /** The headings of the last render. */
  getHeadings(): MarkdownHeading[] {
    return untrack(this.headings.get)
  }

  /** Render `text` into the article;  `ui-render` when done. */
  private async renderMarkdown(text: string, options: MarkdownOptions) {
    const ticket = ++this.ticket
    try {
      await UI.load()
      const engine = await MarkdownRenderer.load()
      if (ticket !== this.ticket || !this.body) return
      const { fragment, headings } = engine.render(text, options)
      this.upgradeCode(fragment)
      this.labelTaskItems(fragment)
      this.resolveUrls(fragment)
      this.body.replaceChildren(fragment)
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

  /** Name each task-list checkbox by its item's text:  marked writes a bare `<input>`, which nothing labels. */
  private labelTaskItems(fragment: DocumentFragment) {
    for (const box of fragment.querySelectorAll("li > input[type=checkbox]")) {
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

  ////////////////
  // ## Handlers
  ////////////////

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
