import type { MarkdownEngine } from "./MarkdownEngine"
import type { MarkdownSanitizer } from "./MarkdownSanitizer"
import type { MDEngine } from "./MDEngine"

/****************
 * ### `MarkdownRenderer`
 * What `<ui-markdown>` asks to render:  loads an engine on first use, each in its own lazy chunk.
 * - `load()`:  marked (`MarkdownEngine`), for plain `<ui-markdown>`.
 * - `loadMD()`:  spell's engine (`MDEngine`, on `@spell-app/markdown`'s bundle), for `<ui-markdown editable>`.
 * - `loadSanitizer()`:  DOMPurify (`MarkdownSanitizer`), only for `sanitized`.
 * - The element only knows `render(text, options) -> { html, headings }` (`MarkdownRendering`).
 ****************/
export class MarkdownRenderer {
  /**
   * Imports the engine module;  replaceable, e.g. by a bundle that can't keep `import()`s (the docs' classic
   * script loads it as a script of its own).  Read once, on the first render.
   */
  static engineLoader: () => Promise<{ MarkdownEngine: { instance: MarkdownEngine } }> = () =>
    import("./MarkdownEngine")

  /**
   * Imports `MDEngine`;  replaceable as `engineLoader`.
   * - NOTE:  the docs' classic script doesn't replace it yet:  an editable `<ui-markdown>` there can't load it.
   */
  static mdLoader: () => Promise<{ MDEngine: { instance: MDEngine } }> = () => import("./MDEngine")

  /**
   * Imports `MarkdownSanitizer`;  replaceable as `engineLoader` (the docs' classic script loads it as a script of its
   * own).
   */
  static sanitizerLoader: () => Promise<{ MarkdownSanitizer: { instance: MarkdownSanitizer } }> = () =>
    import("./MarkdownSanitizer")

  /** The engines' imports, each started once. */
  private static engine?: Promise<MarkdownEngine>
  private static md?: Promise<MDEngine>
  private static sanitizer?: Promise<MarkdownSanitizer>

  /** marked, loaded on first use. */
  static load(): Promise<MarkdownEngine> {
    return (MarkdownRenderer.engine ??= MarkdownRenderer.engineLoader().then(
      (module) => module.MarkdownEngine.instance
    ))
  }

  /** Spell's engine, loaded on first use. */
  static loadMD(): Promise<MDEngine> {
    return (MarkdownRenderer.md ??= MarkdownRenderer.mdLoader().then((module) => module.MDEngine.instance))
  }

  /** DOMPurify, loaded on first use. */
  static loadSanitizer(): Promise<MarkdownSanitizer> {
    return (MarkdownRenderer.sanitizer ??= MarkdownRenderer.sanitizerLoader().then(
      (module) => module.MarkdownSanitizer.instance
    ))
  }
}
