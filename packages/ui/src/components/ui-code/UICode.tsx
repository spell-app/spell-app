import { Show, createEffect, createMemo, onSettled, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import { codeVocabulary } from "./ui-code.vocabulary.en"
import { CodeFallback } from "./ui-code.fallback"
import { CodeHighlighter } from "./CodeHighlighter"
import { CodeLines } from "./CodeLines"
import { UICodeHost } from "./UICodeHost"
import type { Highlighted } from "./ui-code.types"

import codeCSS from "./ui-code.css?inline"

/****************
 * ### `<ui-code>`
 * A block of code, coloured by language:  `<div class="ui [numbered] [wrapping] code" part="box">` around an
 * optional copy `<button>` and `<pre><code class="hljs language-x">`, one `<span class="line">` per line.
 * - Text:  the element's own (`<script type="text/plain">` keeps `<` and `&` exact), or a `source` file -- see
 *   `SourceElement`.
 * - Colours:  highlight.js, loaded with the first highlight (`CodeHighlighter` -> `CodeEngine`, the lazy chunk);
 *   `language` absent => guessed among the detect set;  `text` => none;  a `UI.code` language (spell) => its own
 *   highlighter.  Shown plain until the colours arrive.  An unknown language stays plain, with a `render`
 *   `ui-error` (no message:  the code is still there).
 * - `line-numbers` (from `start`) and `wrap` are CSS:  counters and a hanging indent per `.line`.
 * - The `<pre>` is a tab stop, named "`<language>` code", so a keyboard can scroll it.
 ****************/
export class UICode extends E.SourceElement<typeof codeVocabulary> {
  @E.proto static vocabulary = codeVocabulary
  @E.proto static styles = { code: codeCSS }
  @E.proto static Fallback = CodeFallback
  @E.proto static Host = UICodeHost
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** The latest colouring, and the code it's for. */
  readonly highlighted = new E.Cell<(Highlighted & { code: string }) | undefined>(undefined)

  /** The copy button just copied. */
  readonly isCopied = new E.Cell(false)

  /** Bumped when `UI.code` gets a language:  highlight again. */
  readonly languages = new E.Cell(0)

  /** The lines as HTML:  coloured once the colours for THIS text arrive, escaped plain text until then. */
  readonly lines = createMemo(() => {
    const text = this.contentText()
    const highlighted = this.highlighted.get()
    return CodeLines.split(highlighted?.code === text ? highlighted.html : CodeLines.escape(text))
  })

  /** `<code>`'s HTML:  a `.line` span per line. */
  readonly markup = createMemo(() =>
    this.lines()
      .map((line) => `<span class="${LINE_CLASS}">${line}</span>`)
      .join("")
  )

  /** The language shown, as asked for or guessed. */
  readonly language = createMemo(() => this.highlighted.get()?.language ?? (this.attrs.language || undefined))

  /** Highlights started;  only the latest one's result is shown. */
  private ticket = 0

  /** Clears `isCopied`. */
  private copiedTimer?: ReturnType<typeof setTimeout>

  ////////////////
  // ## Rendering
  ////////////////

  /** Highlight whenever the text, `language` or `UI.code`'s languages change. */
  mount(): JSX.Element {
    if (!isServer) {
      onSettled(() => {
        const bump = () => this.languages.set(untrack(this.languages.get) + 1)
        document.addEventListener(E.CODE_LANGUAGES_EVENT, bump)
        return () => document.removeEventListener(E.CODE_LANGUAGES_EVENT, bump)
      })
      createEffect(
        () => ({
          code: this.contentText(),
          language: this.attrs.language || undefined,
          isLoaded: this.status.get() === "loaded",
          languages: this.languages.get()
        }),
        ({ code, language, isLoaded }) => {
          if (isLoaded) void this.highlight(code, language)
        }
      )
    }
    return super.mount()
  }

  protected renderContent(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("box")}>
        <Show when={this.attrs.copy}>
          <button type="button" class={COPY_CLASS} part={this.part("copy")} onClick={this.onCopy}>
            {this.isCopied.get() ? this.text("codeCopied") : this.text("codeCopy")}
          </button>
        </Show>
        <pre
          part={this.part("pre")}
          tabindex="0"
          aria-label={
            this.language() ? this.text("codeLabel", { language: this.language()! }) : this.text("codeLabelPlain")
          }
          style={{ "counter-reset": `${LINE_COUNTER} ${(this.attrs.start ?? 1) - 1}` }}
        >
          <code part={this.part("code")} class={this.codeClass()} innerHTML={this.markup()} />
        </pre>
      </div>
    )
  }

  /** `hljs language-<name>`, or `hljs` for plain text. */
  private codeClass(): string {
    const language = this.language()
    return language ? `${HLJS_CLASS} language-${language.replace("/", "-")}` : HLJS_CLASS
  }

  protected hostStates() {
    return { ...super.hostStates(), copied: this.isCopied.get() }
  }

  /** What auto-detection picked, when it ran (`UICodeHost.detectedLanguage`). */
  detectedLanguage(): string | undefined {
    const highlighted = untrack(this.highlighted.get)
    return highlighted?.detected ? highlighted.language : undefined
  }

  ////////////////
  // ## Highlighting
  ////////////////

  /** Colour `code` as `language`;  `ui-highlight` when done, a `render` `ui-error` (code left plain) when not. */
  private async highlight(code: string, language: string | undefined) {
    const ticket = ++this.ticket
    try {
      await UI.load()
      const result = await CodeHighlighter.highlight(code, language)
      if (ticket !== this.ticket) return
      this.highlighted.set({ ...result, code })
      this.emitSource("ui-highlight", { language: result.language, detected: result.detected })
    } catch (error) {
      if (ticket !== this.ticket) return
      this.highlighted.set(undefined)
      const kind = E.SourceError.kindFor(error, "render")
      this.emitSource("ui-error", { kind, source: untrack(() => this.sourceAttribute()), error })
    }
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** The copy button:  the code to the clipboard, `ui-copy`, "Copied" for a moment. */
  private readonly onCopy = async () => {
    const { content } = this
    await navigator.clipboard.writeText(content)
    this.isCopied.set(true)
    this.emitSource("ui-copy", { content })
    clearTimeout(this.copiedTimer)
    this.copiedTimer = setTimeout(() => this.isCopied.set(false), COPIED_MS)
  }
}

/** Class of each line's span inside `<code>`. */
const LINE_CLASS = "line"

/** The CSS counter that numbers the lines (`ui-code.css`);  `start` sets where it begins. */
const LINE_COUNTER = "line"

/** highlight.js's class on `<code>`. */
const HLJS_CLASS = "hljs"

/** Class of the copy button. */
const COPY_CLASS = "copy"

/** ms the copy button says "Copied". */
const COPIED_MS = 2000
