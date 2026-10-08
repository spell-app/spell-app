import { untrack } from "solid-js"

import { E } from "$/ui/core"
import type { CodeController } from "./ui-code.types"

/****************
 * ### `UICodeHost`
 * Host base of `<ui-code>`:  the source API (`content`, `save()` ... from `SourceHost`), plus `detectedLanguage`.
 ****************/
export class UICodeHost extends E.SourceHost {
  /**
   * What auto-detection picked (no `language` given);  `undefined` otherwise, or before the colours arrive
   * (`ui-highlight` says when).  Untracked:  script API.
   */
  get detectedLanguage(): string | undefined {
    return untrack(() => (this.controller as unknown as CodeController | undefined)?.detectedLanguage)
  }
}
