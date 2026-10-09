import { Show, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import { codeVocabulary } from "./UICode.en"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"
import type { Highlighted } from "./UICode.types"

import codeCSS from "./UICode.css?inline"

/****************
 * ### `DOMCodeElement`
 * The DOM element of `<ui-code>`:
 * it adds `detectedLanguage` to the source API it inherits from `DOMLoadableElement` (`content`, `save()` ...).
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMCodeElement extends E.DOMLoadableElement {
  /**
   * What auto-detection picked (when no `language` is given);  `undefined` otherwise,
   * or before the colours arrive (`ui-highlight` says when).
   * - Untracked:  it's for scripts.
   */
  get detectedLanguage(): string | undefined {
    return untrack(() => this.code?.detectedLanguage)
  }

  /** This element's component, once it has one. */
  private get code(): UICode | undefined {
    return this.component as UICode | undefined
  }
}

/****************
 * ### `UICode`
 * The component behind `<ui-code>`:  a block of code, coloured by language.
 *
 * - Its shadow DOM:
 *   `<div class="ui [numbered] [wrapping] code" part="box">` around an optional copy `<button>` and
 *   `<pre><code class="hljs language-x">`, one `<span class="line">` per line.
 * - The text:  the element's own (`<script type="text/plain">` keeps `<` and `&` exact),
 *   or a `source` file (see `LoadableComponent`).
 * - The colours come from highlight.js, loaded with the first highlight
 *   (`CodeHighlighter` -> `CodeEngine`, the lazy chunk):
 *   - no `language`:  guessed among the detect set
 *   - `text`:  none
 *   - a language `UI.code` knows (spell):  its own highlighter.
 *   The code shows plain until the colours arrive.
 *   An unknown language stays plain, with a `render` `ui-error` (no message:  the code is still there).
 * - `line-numbers` (from `start`) and `wrap` are CSS:  counters, and a hanging indent per `.line`.
 * - The `<pre>` is a tab stop, named "`<language>` code", so a keyboard can scroll it.
 ****************/
export class UICode extends E.LoadableComponent<typeof codeVocabulary> {
  @E.proto static vocabulary = codeVocabulary
  @E.proto static styleSheets = { code: codeCSS }
  @E.proto static elementSetup = { DOMElement: DOMCodeElement, delegatesFocus: false } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Colouring
  ////////////////

  /** The latest colouring, and the code it's for. */
  @E.state accessor highlighted: (Highlighted & { code: string }) | undefined = undefined

  /** Bumped when `UI.code` gets a language:  highlight again. */
  @E.state accessor languageCount = 0

  /** Highlights started;  only the latest one's result is shown. */
  private ticket = 0

  /** The lines as HTML:  coloured once the colours for THIS text arrive, escaped plain text until then. */
  @E.derived
  get lines(): string[] {
    const text = this.textToShow
    const highlighted = this.highlighted
    return CodeLines.split(highlighted?.code === text ? highlighted.html : CodeLines.escape(text))
  }

  /** `<code>`'s HTML:  a `.line` span per line. */
  @E.derived
  get markup(): string {
    return this.lines.map((line) => `<span class="${LINE_CLASS}">${line}</span>`).join("")
  }

  /** The language shown:  as asked for (`language`), or guessed. */
  get shownLanguage(): string | undefined {
    return this.highlighted?.language ?? (this.language || undefined)
  }

  /** `hljs language-<name>`, or `hljs` for plain text. */
  private get codeClass(): string {
    const language = this.shownLanguage
    return language ? `${HLJS_CLASS} language-${language.replace("/", "-")}` : HLJS_CLASS
  }

  /** What auto-detection picked, when it ran (`DOMCodeElement.detectedLanguage`). */
  get detectedLanguage(): string | undefined {
    const highlighted = this.highlighted
    return highlighted?.detected ? highlighted.language : undefined
  }

  /** Counts `UI.code`'s new languages (`languageCount`), then renders. */
  onMount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const bump = () => (this.languageCount += 1)
        document.addEventListener(E.CODE_LANGUAGES_EVENT, bump)
        return () => document.removeEventListener(E.CODE_LANGUAGES_EVENT, bump)
      })
    }
    return super.onMount()
  }

  /** Highlight whenever the text, `language` or `UI.code`'s languages change, once the text has loaded. */
  @E.onChange("textToShow", "language", "loadStatus", "languageCount")
  protected onCodeChanged(code: string, language: string | undefined, loadStatus: E.SourceStatus) {
    if (loadStatus === "loaded") void this.highlight(code, language || undefined)
  }

  /** Colour `code` as `language`;  `ui-highlight` when done, a `render` `ui-error` (code left plain) when not. */
  private async highlight(code: string, language: string | undefined) {
    const ticket = ++this.ticket
    try {
      await UI.load()
      const result = await CodeHighlighter.highlight(code, language)
      if (ticket !== this.ticket) return
      this.highlighted = { ...result, code }
      this.send("ui-highlight", { language: result.language, detected: result.detected })
    } catch (error) {
      if (ticket !== this.ticket) return
      this.highlighted = undefined
      const kind = E.SourceError.kindFor(error, "render")
      this.sendSourceEvent("ui-error", { kind, source: untrack(() => this.source || undefined), error })
    }
  }

  ////////////////
  // ## Copying
  ////////////////

  /** The copy button just copied (for `COPIED_MS`):  it says "Copied".  `:state(copied)`. */
  @E.cssState("copied")
  @E.state
  accessor wasJustCopied = false

  /** Clears `wasJustCopied`. */
  private copiedTimer?: ReturnType<typeof setTimeout>

  /** The copy button:  the code to the clipboard, `ui-copy`, "Copied" for a moment. */
  private readonly onCopy = async () => {
    const { content } = this
    await navigator.clipboard.writeText(content)
    this.wasJustCopied = true
    this.send("ui-copy", { content })
    clearTimeout(this.copiedTimer)
    this.copiedTimer = setTimeout(() => (this.wasJustCopied = false), COPIED_MS)
  }

  ////////////////
  // ## Rendering
  ////////////////

  protected renderContent(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("box")}>
        <Show when={this.copy}>
          <button type="button" class={COPY_CLASS} part={this.partForName("copy")} onClick={this.onCopy}>
            {this.wasJustCopied ? this.translationForKey("codeCopied") : this.translationForKey("codeCopy")}
          </button>
        </Show>
        <pre
          part={this.partForName("pre")}
          tabindex="0"
          aria-label={
            this.shownLanguage
              ? this.translationForKey("codeLabel", { language: this.shownLanguage })
              : this.translationForKey("codeLabelPlain")
          }
          style={{ "counter-reset": `${LINE_COUNTER} ${(this.start ?? 1) - 1}` }}
        >
          <code part={this.partForName("code")} class={this.codeClass} innerHTML={this.markup} />
        </pre>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UICode extends E.AttributeValues<typeof codeVocabulary> {}

/** Class of each line's span inside `<code>`. */
const LINE_CLASS = "line"

/** The CSS counter that numbers the lines (`UICode.css`);  `start` sets where it begins. */
const LINE_COUNTER = "line"

/** highlight.js's class on `<code>`. */
const HLJS_CLASS = "hljs"

/** Class of the copy button. */
const COPY_CLASS = "copy"

/** ms the copy button says "Copied". */
const COPIED_MS = 2000
