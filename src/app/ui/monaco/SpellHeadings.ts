import { monaco } from "./monaco"

/**
 * Heading comments -- `#`, `##` ... at the start of a line, after any indent -- in bold, in every spell model.
 * - By DECORATION, NOT theme:  each heading gets classes `spell-heading spell-heading-<level>`, styled in
 *   `MonacoEditor.css` -- so any theme works, and each level can be styled on its own.
 * - Found by the same rule as the tokenizer's `matchComment()`, straight from the text:  no waiting for a parse.
 * - On the MODEL, so every editor showing it gets them.
 */
export class SpellHeadings {
  /** A heading line:  its indent, then its `#`s. */
  static HEADING = /^([ \t]*)(#+)/

  /** Deepest level with its own class -- deeper headings share it, as `LSP.SpellLanguageService.MAX_HEADING`. */
  static MAX_LEVEL = 4

  /**
   * Decorate the headings of `language` models -- those there now, and each made from now on -- as they're edited.
   * - Call once, e.g. from `SpellMonaco.register()`.
   */
  static watch(language: string): monaco.IDisposable {
    for (const model of monaco.editor.getModels()) SpellHeadings.follow(model, language)
    return monaco.editor.onDidCreateModel((model) => SpellHeadings.follow(model, language))
  }

  /**
   * Keep `model`'s heading decorations up to date, while it's a `language` model.
   * - Recomputes every line on each change:  spell files are small, and it's one regex a line.
   */
  private static follow(model: monaco.editor.ITextModel, language: string): void {
    let ids: string[] = []
    update()
    model.onDidChangeContent(update)
    model.onDidChangeLanguage(update)

    /** Replace `model`'s heading decorations with those for its text now. */
    function update() {
      const decorations = model.getLanguageId() === language ? SpellHeadings.decorationsFor(model) : []
      ids = model.deltaDecorations(ids, decorations)
    }
  }

  /** Decorations for `model`'s headings:  each from its first `#` to the end of its line. */
  static decorationsFor(model: monaco.editor.ITextModel): monaco.editor.IModelDeltaDecoration[] {
    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    for (let line = 1; line <= model.getLineCount(); line++) {
      const heading = SpellHeadings.HEADING.exec(model.getLineContent(line))
      if (!heading) continue
      const level = Math.min(heading[2]!.length, SpellHeadings.MAX_LEVEL)
      const range = new monaco.Range(line, heading[1]!.length + 1, line, model.getLineMaxColumn(line))
      decorations.push({ range, options: { inlineClassName: `spell-heading spell-heading-${level}` } })
    }
    return decorations
  }
}
