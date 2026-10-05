/**
 * `brand-ui.ts`' FIRST import:  the brand's extra hue, `accent` (Polished Ivory), added to Spell UI's `hues` value set,
 * so every element that takes `color` accepts `color="accent"`.
 * - Before any element is defined:  a module of its own, imported first (ES modules evaluate in import order).
 * - Its colours are the `spell-brand` theme's (`--ui-accent-*` and the `.ui.accent` remap, at the end of
 *   `spell-brand.css`):  under another theme the name is accepted but tints nothing.
 * - SIDE EFFECT:  `ValueSets.add("hues", "accent")`, page-wide.
 */
import { ValueSets } from "$/ui/core"

ValueSets.add("hues", "accent")
