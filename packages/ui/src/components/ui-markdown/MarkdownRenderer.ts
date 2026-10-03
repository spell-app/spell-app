import type { MarkdownEngine } from "./MarkdownEngine"

/****************
 * ### `MarkdownRenderer`
 * What `<ui-markdown>` asks to render:  loads the engine (marked + DOMPurify, the lazy chunk) on first use.
 * - The seam for another engine later:  the element only knows `render(text, options) -> { fragment, headings }`.
 ****************/
export class MarkdownRenderer {
  /**
   * Imports the engine module;  replaceable, e.g. by a bundle that can't keep `import()`s (the docs' classic
   * script loads it as a script of its own).  Read once, on the first render.
   */
  static engineLoader: () => Promise<{ MarkdownEngine: { instance: MarkdownEngine } }> = () =>
    import("./MarkdownEngine")

  /** The engine's import, started once. */
  private static engine?: Promise<MarkdownEngine>

  /** marked + DOMPurify, loaded on first use. */
  static load(): Promise<MarkdownEngine> {
    return (MarkdownRenderer.engine ??= MarkdownRenderer.engineLoader().then(
      (module) => module.MarkdownEngine.instance
    ))
  }
}
