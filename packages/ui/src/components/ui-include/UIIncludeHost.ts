import { E } from "$/ui/core"
import type { IncludeController } from "./ui-include.types"

/****************
 * ### `UIIncludeHost`
 * Host base of `<ui-include>`:  the source API (`content`, `save()` ... from `SourceHost`), plus `contentRoot`.
 ****************/
export class UIIncludeHost extends E.SourceHost {
  /**
   * Where the included markup lives:  the shadow box (`[part~=content]`), or the host itself with `page-styles`;
   * `undefined` before it loads.
   * - For editors:  edit there, then `save()`.
   */
  get contentRoot(): HTMLElement | undefined {
    return (this.controller as unknown as IncludeController | undefined)?.contentRoot()
  }
}
