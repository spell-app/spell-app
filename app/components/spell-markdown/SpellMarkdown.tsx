import { E } from "@spell-app/ui/core"
import { UIMarkdown, type MarkdownRendering } from "@spell-app/ui/ui-markdown"
import { spellMarkdownVocabulary } from "./SpellMarkdown.en"

/****************
 * ### `vocabulary`
 * `<spell-markdown>`'s whole vocabulary:  `<ui-markdown>`'s names, its own in place (`SpellMarkdown.en.ts`).
 * - Where both name an attribute, its own wins:  `editable`, whose preview is spell's engine's.
 * - Above the component:  its `@E.proto static vocabulary` reads it while the class is built.
 ****************/
const MARKDOWN_VOCABULARY = UIMarkdown.describe()
const OWN_ATTRIBUTES = new Map<string, E.AttributeSpec>(
  spellMarkdownVocabulary.attributes.map((spec) => [spec.name, spec])
)
const vocabulary = {
  ...MARKDOWN_VOCABULARY,
  ...spellMarkdownVocabulary,
  attributes: MARKDOWN_VOCABULARY.attributes.map((spec) => OWN_ATTRIBUTES.get(spec.name) ?? spec),
  events: MARKDOWN_VOCABULARY.events,
  slots: MARKDOWN_VOCABULARY.slots,
  parts: MARKDOWN_VOCABULARY.parts,
  states: MARKDOWN_VOCABULARY.states,
  texts: MARKDOWN_VOCABULARY.texts
} satisfies E.ComponentVocabulary

/****************
 * ### `SpellMarkdown`
 * The component behind `<spell-markdown>`:  markdown drawn by spell's own engine, in `ui-*` elements.
 * - A `<ui-markdown>` in every way (text or `source`, `editable`, `sanitized`, headings, `reveal()`),
 *   but drawn by `MDEngine` (`$/markdown`, on the parser) instead of marked:  `loadEngine()`.
 *   - `ui-header`, `ui-list`, `ui-table`, `ui-message` for alerts, `ui-checkbox` for tasks ...
 *   - their families come with the family's barrel;  `sanitized` keeps them (`MDEngine.drawsUITags`)
 * - Its spell blocks are coloured:  the barrel loads `<spell-code>`, which registers spell with `UI.code`.
 * - `<ui-table>`'s sheet is adopted into its shadow root too, for the tables (`styleSheetNames`).
 * - On a page with Spell UI of its own (a docs page), it extends the PAGE's `UIMarkdown`
 *   (`spell-ui-shared.js`, `vite.solid.config.ts`).
 * - SEE:  its App UI components page, `packages/app/docs/spell-markdown.html` (`/components/app/spell-markdown.html`).
 ****************/
export class SpellMarkdown extends UIMarkdown {
  @E.proto static vocabulary: E.ComponentVocabulary = vocabulary

  /** Spell's engine, `MDEngine`:  its own lazy chunk, imported once for the page. */
  protected loadEngine(): Promise<MarkdownRendering> {
    return SpellMarkdown.loadMDEngine()
  }

  /** `<ui-table>`'s sheet too, since spell's engine draws tables with it (a page sheet:  `TABLE_SHEET`). */
  get styleSheetNames(): string[] {
    return [...super.styleSheetNames, TABLE_SHEET]
  }

  /** `MDEngine`, loaded on first use;  the import starts once, for every `<spell-markdown>` on the page. */
  @E.once private static loadMDEngine(): Promise<MarkdownRendering> {
    return import("./MDEngine").then((module) => module.MDEngine.instance)
  }
}

/** `<ui-table>`'s sheet (`UI.styles` name):  a page sheet, so the element adopts it into its shadow root too. */
const TABLE_SHEET = "table"
