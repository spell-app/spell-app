/**
 * Barrel for the emoji components -- also the `emoji` lib entry (`@spell-app/ui/emoji`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-emoji>` and `<ui-emoji-set>`.
 * - `EmojiData` is exported for apps that pick a name set (`EmojiData.use("fomantic")`), register their own names or
 *   preload a name (`EmojiData.get("smile")`);  its data chunks (`data/<set>/*.json`) load lazily, one per first
 *   letter of a name.
 */

import { UIEmoji } from "./UIEmoji"
import { UIEmojiSet } from "./UIEmojiSet"
import { EmojiData } from "./EmojiData"

UIEmoji.define()
UIEmojiSet.define()

export { UIEmoji, UIEmojiSet, EmojiData }
