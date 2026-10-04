import { SourceHost } from "$/ui/core"

import type { CodeController } from "./ui-code.types"

/****************
 * ### `UICodeHost`
 * Host base of `<ui-code>`:  the source API (`content`, `save()` ... from `SourceHost`), plus `detectedLanguage`.
 * - `detectedLanguage` -- what auto-detection picked (no `language` given);  `undefined` otherwise, or before the
 *   colours arrive (`ui-highlight` says when).
 ****************/
export class UICodeHost extends SourceHost {
  get detectedLanguage(): string | undefined {
    return (this.controller as unknown as CodeController | undefined)?.detectedLanguage()
  }
}
