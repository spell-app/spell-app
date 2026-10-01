/**
 * Barrel for the emoji component -- also the `emoji` lib entry (`@spell-app/ui/emoji`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-emoji>`.
 * - `EmojiData` is exported for apps that register their own names or preload a name (`EmojiData.get("smile")`);
 *   its data chunks (`data/*.json`) load lazily, one per first letter of a name.
 */

import { UIEmoji } from "./UIEmoji"
import { EmojiData } from "./EmojiData"

UIEmoji.define()

export { UIEmoji, EmojiData }
