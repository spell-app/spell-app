/**
 * The `spell-code` family:  defines `<spell-code>`, and registers the `spell` language with the page's `UI.code`;
 * exports its component, `SpellCode`, and `SpellLanguage`.
 * - SIDE EFFECTS:
 *   - importing it defines the tag (nothing, if something already has), and `<ui-code>` with it
 *   - once the page's Spell UI runtime is in, it registers `spell` (`SpellLanguage`):
 *     so EVERY `<ui-code language="spell">` on the page is coloured, a spell block in any markdown too
 * - Also the entry of `spell-code.js` (`yarn build:element`, `vite.code.config.ts`),
 *   which a page loads by itself, or through the component pack, `spell.pack.js`:
 *
 *       <script type="module" src="/element/spell-code.js"></script>
 *       <spell-code>a pile is a list of cards</spell-code>
 *
 * - On a page with Spell UI of its own (a docs page), it extends the page's `UICode`:
 *   one Solid and one Spell UI (`spell-solid-shared.js`, `spell-ui-shared.js`).
 *   - Such a page MUST share the code family (`SpellUI.packModules`), or this script stops with an error saying so.
 *   - To colour `language="spell"` alone, a page loads `spell-language.js` instead (`spellLanguage.ts`):
 *     what the page server adds to the docs pages it serves.
 */

import { SpellCode } from "./SpellCode"
import { SpellLanguage } from "./SpellLanguage"

SpellCode.define()
SpellLanguage.registerWhenLoaded()

export { SpellCode, SpellLanguage }
