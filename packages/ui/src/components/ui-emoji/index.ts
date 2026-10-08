/**
 * The emoji family:  defines `<ui-emoji>` and exports its component, `UIEmoji`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-emoji` entry (its size is in `docs/report.md`).
 * - It exports `EmojiData` too, for apps that pick the page's name set
 *   (`EmojiData.use("fomantic")`;  for a subtree, `<ui-root emoji="fomantic">`),
 *   register their own names or preload a name (`EmojiData.get("smile")`).
 *   Its data chunks (`data/<set>/*.json`) load lazily, one per first letter of a name.
 */

import { UIEmoji } from "./UIEmoji"
import { EmojiData } from "./EmojiData"

UIEmoji.define()

export { UIEmoji, EmojiData }
