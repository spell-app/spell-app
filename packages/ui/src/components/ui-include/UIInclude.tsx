import { Show, createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, SourceElement, SourceError } from "$/ui/core"
import { RootLoader } from "$/ui/components/ui-root"

import { includeVocabulary } from "./ui-include.vocabulary.en"
import { IncludeFallback } from "./ui-include.fallback"
import { UIIncludeHost } from "./UIIncludeHost"
import {
  BODY_CLOSE,
  BODY_OPEN,
  MAX_DEPTH,
  EAGER,
  LOADING_CLASS,
  ORIGINAL_PREFIX,
  URL_ATTRIBUTES,
  URL_SELECTOR,
  type Vocabulary
} from "./ui-include.types"

import includeCSS from "./ui-include.css?inline"

/****************
 * ### `<ui-include>`
 * Another page of this site, shown in this one -- like an Astro island:  the page loads, and the include fills in
 * when `load` says (`eager`, `visible`, `idle`).  Its children are a placeholder until then.
 * - What's shown:  `source`'s `<body>` content, or just the first `select` match;  `<head>` (title, styles,
 *   scripts) is left out.
 * - Where it goes:  a shadow root by default (`<div part="content">`):  the page's CSS stays out, inherited values
 *   (fonts, colours, `--ui-*` tokens) come in.  `page-styles` puts it in the LIGHT DOM instead, where the page's CSS
 *   (and `<ui-root>`) see it.
 * - Scripts in the included markup do NOT run (parsed by `DOMParser`).
 * - `ui-*` tags inside are loaded on demand, as `<ui-root>` loads them (`RootLoader`):  a shadow root is out of a
 *   root's sight.
 * - Relative `href` / `src` / `action` / `poster` / `source` are rewritten against `source`, so links, images and
 *   nested includes point where they did there;  the originals are kept (`data-ui-include-*`) for saving.
 * - Nesting:  an include inside an include of the same file, or nested deeper than `MAX_DEPTH`, shows an error.
 * - `content` (and so `save()`) is the FILE:  the source text as fetched while the markup is untouched;  once it's
 *   edited in place, the live markup spliced back into the file's `<body>` (byte-exact outside it).  With
 *   `select`, the matched element's markup alone, saved by its `id` (`fragment`).
 ****************/
export class UIInclude extends SourceElement<Vocabulary> {
  @proto static vocabulary = includeVocabulary
  @proto static styles = { include: includeCSS }
  @proto static Fallback = IncludeFallback
  @proto static Host = UIIncludeHost
  @proto static inlineContent = false
  @proto static delegatesFocus = false

  /** Markup is in place:  the placeholder slot goes (shadow mode). */
  readonly inserted = new Cell(false)

  /** The shadow box the markup goes in, once rendered. */
  private box?: HTMLElement

  /** Where the markup is now:  `box`, or the host (`page-styles`). */
  private root?: HTMLElement

  /** The element `select` matched, in the live markup. */
  private selected?: Element

  /** The text the live markup was built from, and the markup as first inserted:  is it edited since? */
  private insertedFrom?: string
  private insertedMarkup?: string

  ////////////////
  // ## Rendering
  ////////////////

  /** Insert the markup whenever the text, `select` or `page-styles` change. */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({
          text: this.contentText(),
          loaded: this.status.get() === "loaded",
          select: this.attrs.select || undefined,
          light: !!this.attrs.pageStyles
        }),
        ({ text, loaded, select, light }) => {
          if (loaded) this.insert(text, select, light)
        }
      )
    }
    return super.mount()
  }

  /**
   * Words after the noun, hooks for page CSS:  a deferred `load` mode (`ui include visible`:  e.g. reserve room for a
   * lazy island), and `loading` while `source` loads.
   */
  protected extraClasses(): string | undefined {
    const mode = this.attrs.load && this.attrs.load !== EAGER ? this.attrs.load : undefined
    const loading = this.status.get() === "loading" ? LOADING_CLASS : undefined
    return [mode, loading].filter(Boolean).join(" ") || undefined
  }

  /** The placeholder slot (and, with `page-styles`, the markup itself), and the shadow box. */
  protected renderContent(): JSX.Element {
    return (
      <>
        <Show when={this.attrs.pageStyles || !this.inserted.get()}>
          <slot />
        </Show>
        <div
          class={this.classes()}
          part={this.part("content")}
          hidden={!!this.attrs.pageStyles}
          ref={(box: HTMLDivElement) => {
            this.box = box
          }}
        />
      </>
    )
  }

  /** Where the included markup lives:  the shadow box, or the host with `page-styles`. */
  contentRoot(): HTMLElement | undefined {
    return this.root
  }

  /**
   * Put `text`'s markup in place:  parsed, `select`ed, URLs rewritten;  then load the `ui-*` families it uses.
   * - A selector that's invalid or matches nothing is a `render` failure.
   */
  private insert(text: string, select: string | undefined, light: boolean) {
    const target = light ? this.host : this.box
    if (!target) return
    const markup = this.parse(text, select)
    if (markup instanceof SourceError) {
      this.loadFailed(markup, "render")
      return
    }
    if (this.root && this.root !== target) this.root.replaceChildren()
    target.replaceChildren(markup)
    this.root = target
    this.selected = select ? (target.firstElementChild ?? undefined) : undefined
    this.insertedFrom = text
    this.insertedMarkup = this.liveMarkup()
    this.inserted.set(true)
    UIInclude.loadFamilies(target)
  }

  /** `text` as a fragment of this document:  `<body>`'s content or the `select` match, URLs rewritten. */
  private parse(text: string, select: string | undefined): DocumentFragment | SourceError {
    const parsed = new DOMParser().parseFromString(text, "text/html")
    let nodes: Node[]
    if (select) {
      let match: Element | null
      try {
        match = parsed.querySelector(select)
      } catch {
        return new SourceError("render", `"${select}" isn't a CSS selector`)
      }
      if (!match)
        return new SourceError("render", `Nothing in ${this.sourceAttribute() ?? "the content"} matches "${select}"`)
      nodes = [match]
    } else nodes = [...parsed.body.childNodes]
    const page = this.host.ownerDocument
    const fragment = page.createDocumentFragment()
    for (const node of nodes) fragment.append(page.importNode(node, true))
    this.rewriteUrls(fragment)
    return fragment
  }

  /** Point relative URLs in `fragment` where they pointed in `source`, keeping each original beside it. */
  private rewriteUrls(fragment: DocumentFragment) {
    const source = this.sourceAttribute()
    if (!source) return
    const base = new URL(source, this.host.ownerDocument.baseURI)
    for (const element of fragment.querySelectorAll(URL_SELECTOR)) {
      for (const name of URL_ATTRIBUTES) {
        const value = element.getAttribute(name)
        if (value === null || value.startsWith("#")) continue
        let absolute: string
        try {
          absolute = new URL(value, base).href
        } catch {
          continue
        }
        if (absolute === new URL(value, this.host.ownerDocument.baseURI).href) continue
        element.setAttribute(ORIGINAL_PREFIX + name, value)
        element.setAttribute(name, absolute)
      }
    }
  }

  /** The live markup (or the `select`ed element's), with every rewritten URL back as written;  none before insert. */
  private liveMarkup(): string | undefined {
    if (!this.root) return undefined
    const holder = this.host.ownerDocument.createElement("template")
    const nodes = this.selected ? [this.selected] : [...this.root.childNodes]
    for (const node of nodes) holder.content.append(node.cloneNode(true))
    for (const element of holder.content.querySelectorAll("*")) {
      for (const name of URL_ATTRIBUTES) {
        const original = element.getAttribute(ORIGINAL_PREFIX + name)
        if (original === null) continue
        element.setAttribute(name, original)
        element.removeAttribute(ORIGINAL_PREFIX + name)
      }
    }
    return holder.innerHTML
  }

  ////////////////
  // ## Source hooks
  ////////////////

  /**
   * The FILE as it should be saved:  the text as loaded while the markup is untouched (or not yet rebuilt from a new
   * `content`);  else the live markup -- the `select`ed element alone, or spliced into the file's `<body>`.
   */
  getContent(): string {
    const text = super.getContent()
    if (text !== this.insertedFrom) return text
    const live = this.liveMarkup()
    if (live === undefined || live === this.insertedMarkup) return this.selected ? (this.insertedMarkup ?? text) : text
    return this.selected ? live : UIInclude.spliceBody(text, live)
  }

  /** With `select`:  the matched element's `id`, so only it is replaced;  it MUST have one. */
  protected saveFragment(): string | undefined {
    if (!this.attrs.select) return undefined
    const id = this.selected?.id
    if (!id) throw new SourceError("save", `Can't save "${this.attrs.select}":  it has no id`)
    return id
  }

  /** A cycle (inside an include of the same file) or nesting deeper than `MAX_DEPTH`. */
  protected refuseSource(source: string): SourceError | undefined {
    const base = this.host.ownerDocument.baseURI
    const url = new URL(source, base).href
    let depth = 0
    for (let node = UIInclude.parentOf(this.host); node; node = UIInclude.parentOf(node)) {
      if (node.localName !== this.host.localName) continue
      depth++
      const outer = node.getAttribute("source")
      if (outer && new URL(outer, base).href === url) return new SourceError("render", `${source} includes itself`)
    }
    if (depth >= MAX_DEPTH) return new SourceError("render", `${source}:  includes nested more than ${MAX_DEPTH} deep`)
    return undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `element`'s parent, stepping out of shadow roots. */
  private static parentOf(element: Element): Element | undefined {
    const parent = element.parentNode
    if (parent instanceof ShadowRoot) return parent.host
    return parent instanceof Element ? parent : undefined
  }

  /** Load the family of every undefined `ui-*` tag under `root`, as `<ui-root>` would. */
  private static loadFamilies(root: ParentNode) {
    for (const tag of RootLoader.undefinedTags(root)) {
      const folder = RootLoader.folderOf(tag)
      if (folder)
        RootLoader.load(folder).catch((error: unknown) => console.warn(`<ui-include>:  <${tag}> didn't load`, error))
    }
  }

  /** `file` with its `<body>` content replaced by `body`;  `body` alone when `file` has no `<body>` tags. */
  static spliceBody(file: string, body: string): string {
    const open = BODY_OPEN.exec(file)
    const close = BODY_CLOSE.exec(file)
    if (!open || !close || close.index < open.index) return body
    return file.slice(0, open.index + open[0].length) + body + file.slice(close.index)
  }
}
