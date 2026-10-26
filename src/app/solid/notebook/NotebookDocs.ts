/**
 * Spell UI's docs elements, for a notebook's `<html>` blocks (epic `elemental-spell` P18):
 * `<ui-docs-api tag="ui-avatar" only="attributes">` draws a component's API tables, as its page does.
 * - Loaded once, when a notebook's page first draws:  a lazy chunk, never in the editor's own bundle.
 * - Its data is Spell UI's docs site's, `components.json5` (`SiteData`), through the page server:
 *   the editor's dev server passes `/components/` on to it, as it does `/api/` (`app/vite.config.ts`).
 *   - A static build has no page server:  the tables show their error, and the rest of the page draws.
 * - Plain TypeScript:  `<NotebookPage>` calls it, and knows nothing else of the docs elements.
 */
export class NotebookDocs {
  /** Where `<ui-docs-api>` reads its data:  Spell UI's docs site, on the page server. */
  static readonly dataUrl = "/components/ui/__data/components.json5"

  /** The load, once started. */
  private static loading: Promise<void> | undefined

  /**
   * Define `<ui-docs-api>`, its data pointed at Spell UI's docs site, once.
   * - NEVER throws:  a failed load is logged, and a notebook drawing one shows the bare tag.
   */
  static load(): Promise<void> {
    NotebookDocs.loading ??= (async () => {
      const [{ SiteData }] = await Promise.all([
        import("spell-ui/docs-components/SiteData"),
        import("spell-ui/docs-components/ui-docs-api")
      ])
      SiteData.url ??= NotebookDocs.dataUrl
    })().catch((error) => console.error("NotebookDocs.load():  couldn't load Spell UI's docs elements", error))
    return NotebookDocs.loading
  }
}
