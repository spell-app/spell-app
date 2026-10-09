import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, type UIT } from "$/ui/core"
import { RootLoader } from "$/ui/components/ui-root"
import { includeVocabulary } from "./UIInclude.en"

import includeCSS from "./UIInclude.css?inline"

/****************
 * ### `DOMIncludeElement`
 * The DOM element of `<ui-include>`:  it adds `contentRoot`, where the included markup lives,
 * to the source API it inherits from `DOMLoadableElement` (`content`, `save()` ...).
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMIncludeElement extends E.DOMLoadableElement<UIInclude> {
  /**
   * Where the included markup lives:
   * the shadow box (`[part~=content]`), or the DOM element itself with `page-styles`;  `undefined` before it loads.
   * - For editors:  edit there, then `save()`.
   */
  get contentRoot(): HTMLElement | undefined {
    return this.component?.contentRoot
  }
}

/****************
 * ### `UIInclude`
 * The component behind `<ui-include>`:  another page of this site, shown in this one.
 *
 * - Like an Astro island:  the page loads, and the include fills in when `load` says
 *   (`eager`, `visible`, `idle`).  Its children are a placeholder until then.
 * - What's shown:  `source`'s `<body>` content, or just the first `select` match.
 *   The `<head>` (title, styles, scripts) is left out.
 * - Where it goes:  a shadow root by default (`<div part="content">`),
 *   so the page's CSS stays out, while inherited values (fonts, colours, `--ui-*` tokens) come in.
 *   `page-styles` puts it in the LIGHT DOM instead, where the page's CSS (and `<ui-root>`) see it.
 * - Scripts in the included markup do NOT run (it's parsed by `DOMParser`).
 * - `ui-insert` fires just before the markup goes in, with the fragment:  a listener may read or change it.
 * - `ui-*` tags inside are loaded on demand, as `<ui-root>` loads them (`RootLoader`):
 *   a shadow root is out of a root's sight.
 * - Relative `href` / `src` / `action` / `poster` / `source` are rewritten against `source`,
 *   so links, images and nested includes point where they did there.
 *   The originals are kept (`data-ui-include-*`), for saving.
 * - Nesting:  an include inside an include of the same file, or nested deeper than `MAX_DEPTH`, shows an error.
 * - `content` (and so `save()`) is the FILE:
 *   - the source text as fetched, while the markup is untouched
 *   - once it's edited in place, the live markup spliced back into the file's `<body>` (byte-exact outside it)
 *   - with `select`, the matched element's markup alone, saved by its `id` (`fragment`).
 ****************/
export class UIInclude extends E.LoadableComponent<typeof includeVocabulary> {
  @E.proto static vocabulary = includeVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { include: includeCSS },
    DOMElement: DOMIncludeElement,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>
  @E.proto static wantsInlineContent = false

  /** Markup is in place:  the placeholder slot goes (shadow mode). */
  @E.state accessor markupIsInserted = false

  /** The shadow box the markup goes in, once rendered. */
  private box?: HTMLElement

  /** Where the markup is now:  `box`, or the DOM element (`page-styles`). */
  private root?: HTMLElement

  /** The element `select` matched, in the live markup. */
  private selected?: Element

  /** The text the live markup was built from:  a new `content` rebuilds it. */
  private insertedFrom?: string

  /** The markup as first inserted:  is it edited since? */
  private insertedMarkup?: string

  ////////////////
  // ## Rendering
  ////////////////

  /** Insert the markup whenever the text, `select` or `page-styles` change, once loaded. */
  @E.onChange("textToShow", "loadStatus", "select", "pageStyles")
  protected onMarkupChanged(
    text: string,
    loadStatus: E.SourceStatus,
    select: string | undefined,
    pageStyles: boolean | undefined
  ) {
    if (loadStatus === E.SourceStatus.loaded)
      this.insert({ text, select: select || undefined, pageStyles: !!pageStyles })
  }

  /**
   * Words before the noun, hooks for page CSS:
   * - a deferred `load` mode (`ui visible include`:  e.g. reserve room for a lazy island)
   * - `loading` while `source` loads
   */
  protected get extraClass(): string | undefined {
    const mode = this.load && this.load !== EAGER ? this.load : undefined
    const loading = this.loadStatus === E.SourceStatus.loading ? LOADING_CLASS : undefined
    return [mode, loading].filter(Boolean).join(" ") || undefined
  }

  /** The placeholder slot (and, with `page-styles`, the markup itself), and the shadow box. */
  protected renderContent(): JSX.Element {
    return (
      <>
        <Show when={this.pageStyles || !this.markupIsInserted}>
          <slot />
        </Show>
        <div
          class={this.rootClass}
          part={this.partForName("content")}
          hidden={!!this.pageStyles}
          ref={(box: HTMLDivElement) => {
            this.box = box
          }}
        />
      </>
    )
  }

  /** Where the included markup lives:  the shadow box, or the DOM element with `page-styles`. */
  get contentRoot(): HTMLElement | undefined {
    return this.root
  }

  /**
   * Put `text`'s markup in place:  parsed, `select`ed, URLs rewritten;  then load the `ui-*` families it uses.
   * - `pageStyles`:  into the DOM element's light DOM, else the shadow box.
   * - SIDE EFFECT:  `ui-insert` first, with the fragment, while it's still out of the page.
   * - A selector that's invalid or matches nothing is a `render` failure.
   */
  private insert({ text, select, pageStyles }: { text: string; select?: string; pageStyles: boolean }) {
    const target = pageStyles ? this.domElement : this.box
    if (!target) return
    let markup: DocumentFragment
    try {
      markup = this.parse(text, select)
    } catch (error) {
      this.onLoadError(error, "render")
      return
    }
    if (this.root && this.root !== target) this.root.replaceChildren()
    this.send("ui-insert", { fragment: markup, source: this.source || undefined } satisfies IncludeInsertDetail)
    target.replaceChildren(markup)
    this.root = target
    this.selected = select ? (target.firstElementChild ?? undefined) : undefined
    this.insertedFrom = text
    this.insertedMarkup = this.liveMarkup()
    this.markupIsInserted = true
    UIInclude.loadFamilies(target)
  }

  /**
   * `text` as a fragment of this document:  `<body>`'s content or the `select` match, URLs rewritten.
   * - Throws a `render` `SourceError` for a selector that's invalid or matches nothing.
   */
  private parse(text: string, select: string | undefined): DocumentFragment {
    return E.SourceMarkup.parse(text, { page: this.domElement.ownerDocument, source: this.source || undefined, select })
  }

  /** The live markup (or the `select`ed element's), with every rewritten URL back as written;  none before insert. */
  private liveMarkup(): string | undefined {
    if (!this.root) return undefined
    const holder = this.domElement.ownerDocument.createElement("template")
    const nodes = this.selected ? [this.selected] : [...this.root.childNodes]
    for (const node of nodes) holder.content.append(node.cloneNode(true))
    E.SourceMarkup.restoreUrls(holder.content)
    return holder.innerHTML
  }

  ////////////////
  // ## Source hooks
  ////////////////

  /**
   * The FILE as it should be saved:
   * - the text as loaded, while the markup is untouched (or not yet rebuilt from a new `content`)
   * - else the live markup:  the `select`ed element alone, or spliced into the file's `<body>`
   */
  get content(): string {
    const text = super.content
    if (text !== this.insertedFrom) return text
    const live = this.liveMarkup()
    if (live === undefined || live === this.insertedMarkup) return this.selected ? (this.insertedMarkup ?? text) : text
    return this.selected ? live : UIInclude.spliceBody(text, live)
  }

  /** As `LoadableComponent`'s:  a getter override hides the inherited setter, so it's repeated here. */
  set content(text: string) {
    super.content = text
  }

  /** With `select`:  the matched element's `id`, so only it is replaced;  it MUST have one. */
  protected saveFragment(): string | undefined {
    if (!this.select) return undefined
    const id = this.selected?.id
    if (!id) {
      throw new E.SourceError(`UIInclude.save():  "${this.select}" matched an element with no id;  give it one`, {
        cause: { kind: "save" }
      })
    }
    return id
  }

  /** A cycle (inside an include of the same file) or nesting deeper than `MAX_DEPTH`. */
  protected checkSource(source: string) {
    E.SourceMarkup.checkNesting(this.domElement, source, (node) => node.localName === this.domElement.localName)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * Load the family of every undefined tag under `root`, as `<ui-root>` would
   * (a component pack's tags are defined by its pack, as it registers).
   * - STATIC:  needs nothing of the include, only `root`.
   * - NEVER throws:  a tag that fails to load is a warning.
   */
  private static loadFamilies(root: ParentNode) {
    for (const tag of RootLoader.undefinedTags(root)) {
      RootLoader.loadTag(tag)?.catch((error: unknown) =>
        E.Warnings.warn("<ui-include>", `<${tag}> didn't load:`, error)
      )
    }
  }

  /**
   * `file` with its `<body>` content replaced by `body`;  `body` alone when `file` has no `<body>` tags.
   * - STATIC:  pure text work, so tests call it without an element.
   */
  static spliceBody(file: string, body: string): string {
    const open = BODY_OPEN.exec(file)
    const close = BODY_CLOSE.exec(file)
    if (!open || !close || close.index < open.index) return body
    return file.slice(0, open.index + open[0].length) + body + file.slice(close.index)
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIInclude extends E.AttributeValues<typeof includeVocabulary> {}

/** The default `load` mode:  no class word. */
const EAGER: UIT.SourceLoadMode = "eager"

/** Class word before the noun while `source` loads. */
const LOADING_CLASS = "loading"

/** The `<body ...>` opening tag of a page, for splicing a saved body back into its file. */
const BODY_OPEN = /<body\b[^>]*>/i

/** The `</body>` closing tag of a page, as `BODY_OPEN`. */
const BODY_CLOSE = /<\/body\s*>/i

/** The `detail` of `ui-insert`. */
export type IncludeInsertDetail = {
  /** The markup about to go in:  parsed, `select`ed, URLs rewritten;  not yet in the page. */
  fragment: DocumentFragment
  /** `source` as written. */
  source?: string
}
