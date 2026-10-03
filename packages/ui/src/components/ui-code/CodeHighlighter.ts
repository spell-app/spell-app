import { SourceError, UI, type CodeLanguage } from "$/ui/core"

import { CodeLines } from "./CodeLines"
import { TEXT, type Highlighted } from "./ui-code.types"
import type { CodeEngine } from "./CodeEngine"

/****************
 * ### `CodeHighlighter`
 * What `<ui-code>` asks to colour code:  picks the highlighter, loading what it needs on first use.
 * - `text`:  plain, escaped;  nothing loads.
 * - A language registered with `UI.code` (spell, an app's own):  its `highlight()` function (no highlight.js at all),
 *   or its highlight.js `grammar`;  a `load()`ed language is fetched once per name + variant.
 * - Anything else:  highlight.js (`CodeEngine`, the lazy chunk), by name, or guessed when `language` is absent.
 * - Fails with a `render` `SourceError` for a language nobody knows (or a variant that won't load).
 ****************/
export class CodeHighlighter {
  /** The engine's import, started once. */
  private static engine?: Promise<CodeEngine>

  /** `load()`ed `UI.code` languages, by `name/variant`. */
  private static readonly loaded = new Map<string, Promise<Omit<CodeLanguage, "load">>>()

  /** highlight.js, loaded on first use. */
  static load(): Promise<CodeEngine> {
    return (CodeHighlighter.engine ??= import("./CodeEngine").then((module) => module.CodeEngine.instance))
  }

  /** `code` as HTML, coloured as `language`, or as its best guess when `language` is absent. */
  static async highlight(code: string, language?: string): Promise<Highlighted> {
    if (language?.toLowerCase() === TEXT) return { html: CodeLines.escape(code), detected: false }
    const registered = language ? UI.code.find(language) : undefined
    if (registered) return CodeHighlighter.withRegistered(code, registered.language, registered.variant)
    const engine = await CodeHighlighter.load()
    for (const extra of UI.code.detectable()) {
      engine.register(extra.name, extra.grammar!, { aliases: extra.aliases, detect: true })
    }
    if (!language) {
      const guess = engine.detect(code)
      return { html: guess.html, language: guess.language, detected: true }
    }
    const name = await engine.ensure(language)
    if (!name) throw new SourceError("render", `No highlighting for "${language}"`)
    return { html: engine.highlight(code, name), language: name, detected: false }
  }

  /** `code` coloured by a `UI.code` language. */
  private static async withRegistered(
    code: string,
    language: CodeLanguage & { name: string },
    variant: string | undefined
  ): Promise<Highlighted> {
    const name = variant ? `${language.name}/${variant}` : language.name
    const ready = language.load ? await CodeHighlighter.loadLanguage(name, language, variant) : language
    if (ready.highlight)
      return { html: CodeLines.fromSpans(code, await ready.highlight(code)), language: name, detected: false }
    if (!ready.grammar) throw new SourceError("render", `"${name}" has neither a grammar nor a highlighter`)
    const engine = await CodeHighlighter.load()
    engine.register(name, ready.grammar, { aliases: language.aliases, detect: language.detect })
    return { html: engine.highlight(code, name), language: name, detected: false }
  }

  /** `language.load(variant)`, once per `name`;  a failure isn't cached, and becomes a `render` error. */
  private static loadLanguage(
    name: string,
    language: CodeLanguage,
    variant: string | undefined
  ): Promise<Omit<CodeLanguage, "load">> {
    let pending = CodeHighlighter.loaded.get(name)
    if (!pending) {
      pending = language.load!(variant).catch((error: unknown) => {
        CodeHighlighter.loaded.delete(name)
        throw error instanceof SourceError
          ? error
          : new SourceError("render", `Can't load "${name}":  ${(error as Error)?.message ?? error}`)
      })
      CodeHighlighter.loaded.set(name, pending)
    }
    return pending
  }
}
