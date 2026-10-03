import type { MarkdownEngine } from "./MarkdownEngine"

/****************
 * ### `MarkdownRenderer`
 * What `<ui-markdown>` asks to render:  loads the engine (marked + DOMPurify, the lazy chunk) on first use.
 * - The seam for another engine later:  the element only knows `render(text, options) -> { fragment, headings }`.
 ****************/
export class MarkdownRenderer {
  /** The engine's import, started once. */
  private static engine?: Promise<MarkdownEngine>

  /** marked + DOMPurify, loaded on first use. */
  static load(): Promise<MarkdownEngine> {
    return (MarkdownRenderer.engine ??= import("./MarkdownEngine").then((module) => module.MarkdownEngine.instance))
  }
}
