/**
 * Entry of the brand's share of the claude.ai DESIGN bundle (epic `claude-design`, P11):  `dist/brand-design.js`
 * (`vite.design.config.ts`), which `spell-epic/src/tools/bundle-spell-ui.js --design` bundles with Spell UI.
 * - In order (ES modules evaluate in import order):
 *   1. `./hues`:  the `accent` hue, added to Spell UI's `hues` before any element is defined (issue I17)
 *   2. every `<brand-*>` element (`$/brand/components`)
 * - NOT the theme, the page CSS, the icons or the site header:  the design entry
 *   (`spell-epic/src/tools/_assets/spell-ui.design.entry.js`) applies `spell-brand` and registers the icons itself.
 */
import "./hues"
import "$/brand/components"
