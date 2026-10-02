/**
 * Barrel for the emoji components -- also the `emoji` lib entry (`@spell-app/ui/ui-emoji`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-emoji>`.
 * - `EmojiData` is exported for apps that pick the page's name set (`EmojiData.use("fomantic")`;  a subtree:
 *   `<ui-root emoji="fomantic">`), register their own names or preload a name (`EmojiData.get("smile")`);  its data
 *   chunks (`data/<set>/*.json`) load lazily, one per first letter of a name.
 */

import { UIEmoji } from "./UIEmoji"
import { EmojiData } from "./EmojiData"

UIEmoji.define()

export { UIEmoji, EmojiData }
