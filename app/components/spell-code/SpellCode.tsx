import { E } from "spell-ui/core"
import { UICode } from "spell-ui/ui-code"
import { spellCodeVocabulary } from "./SpellCode.en"

/****************
 * ### `vocabulary`
 * `<spell-code>`'s whole vocabulary:  `<ui-code>`'s names, its own in place (`SpellCode.en.ts`).
 * - Where both name an attribute, its own wins:  `language`, which defaults to `spell`.
 * - Above the component:  its `@E.proto static vocabulary` reads it while the class is built.
 ****************/
const CODE_VOCABULARY = UICode.describe()
const OWN_ATTRIBUTES = new Map<string, E.AttributeSpec>(spellCodeVocabulary.attributes.map((spec) => [spec.name, spec]))
const vocabulary = {
  ...CODE_VOCABULARY,
  ...spellCodeVocabulary,
  attributes: CODE_VOCABULARY.attributes.map((spec) => OWN_ATTRIBUTES.get(spec.name) ?? spec),
  events: CODE_VOCABULARY.events,
  slots: CODE_VOCABULARY.slots,
  parts: CODE_VOCABULARY.parts,
  states: CODE_VOCABULARY.states,
  texts: CODE_VOCABULARY.texts
} satisfies E.ComponentVocabulary

/****************
 * ### `SpellCode`
 * The component behind `<spell-code>`:  a block of spell, coloured by spell's own parser.
 * - A `<ui-code>` in every way (text or `source`, `line-numbers`, `wrap`, `copy`), but `language` is `spell` unless
 *   it says otherwise.
 * - The colours:  `SpellLanguage`, which the family's barrel registers with the page's `UI.code` as it loads.
 *   So a `<ui-code language="spell">` beside it is coloured too.
 * - Its DOM element is `<ui-code>`'s, `DOMCodeElement` (`detectedLanguage`).
 * - On a page with Spell UI of its own (a docs page), it extends the PAGE's `UICode`:
 *   `$/ui/components/ui-code` comes from `SpellUI.packModules` there (`spell-ui-shared.js`, `vite.solid.config.ts`).
 * - SEE:  its App UI components page, `packages/app/docs/spell-code.html` (`/components/app/spell-code.html`).
 ****************/
export class SpellCode extends UICode {
  @E.proto static vocabulary: E.ComponentVocabulary = vocabulary
}
