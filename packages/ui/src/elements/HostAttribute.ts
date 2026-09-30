import type { Accessor } from "solid-js"
import { isServer } from "@solidjs/web"

import { Cell } from "./Cell"
import type { UIHost } from "./UIHost"

/**
 * One host attribute that ISN'T in the vocabulary, as a signal -- e.g. the host's `aria-label`, forwarded to the
 * inner control of an icon-only label.
 * - Watched with a `MutationObserver`, disconnected when the element disconnects.
 * - MUST be created under the element's owner (field initializer / constructor).
 */
export class HostAttribute {
  /** Current value, `null` when absent;  tracked. */
  readonly get: Accessor<string | null>

  constructor(host: UIHost, name: string) {
    const cell = new Cell(host.getAttribute(name))
    this.get = cell.get
    if (isServer) return
    const observer = new MutationObserver(() => cell.set(host.getAttribute(name)))
    observer.observe(host, { attributeFilter: [name] })
    host.addReleaseCallback(() => observer.disconnect())
  }
}
