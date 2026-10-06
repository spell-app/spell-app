import type { Accessor } from "solid-js"
import { isServer } from "@solidjs/web"

import { E } from "$/ui/core"

/****************
 * ### `HostAttribute`
 * One host attribute that ISN'T in the vocabulary, as a signal -- e.g. the host's `aria-label`, forwarded to the
 * inner control of an icon-only label.
 * - Watched with a `MutationObserver` for the element's whole life:  it keeps watching while the element is out of
 *   the document (`keepAlive`), and is disconnected when the host is released (`host.dispose()`).
 * - MUST be created under the element's owner (field initializer / constructor).
 ****************/
export class HostAttribute {
  /** Current value, `null` when absent (as `getAttribute()` says);  tracked. */
  readonly get: Accessor<string | null>

  constructor(host: E.UIHost, name: string) {
    const cell = new E.Cell(host.getAttribute(name))
    this.get = cell.get
    if (isServer) return
    const observer = new MutationObserver(() => cell.set(host.getAttribute(name)))
    observer.observe(host, { attributeFilter: [name] })
    host.addReleaseCallback(() => observer.disconnect())
  }
}
