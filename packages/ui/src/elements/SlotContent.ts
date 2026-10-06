import { createSignal, onSettled, type Accessor } from "solid-js"

import { NodeType } from "$/ui/util"

/**
 * Which of a host's slots have light-DOM content, as signals -- e.g. an icon-only button needs to know that
 * its default slot is empty, and shorthand attributes yield to slotted content.
 * - Watches the host's children (and their `slot` attributes / text) with a `MutationObserver` rather than
 *   `slotchange`, so the answer exists before anything renders and doesn't depend on a `<slot>` being present.
 * - Default slot:  child elements without `slot`, or non-blank text.  Named slot:  child elements with that `slot`.
 * - MUST be created under the component's owner;  the observer is disconnected when it's disposed.
 */
export class SlotContent {
  /** Occupied slot names;  `""` is the default slot. */
  readonly occupied: Accessor<ReadonlySet<string>>

  /** The host. */
  private readonly host: HTMLElement

  constructor(host: HTMLElement) {
    this.host = host
    const [occupied, setOccupied] = createSignal<ReadonlySet<string>>(this.scan(), {
      equals: (a, b) => a.size === b.size && [...a].every((name) => b.has(name))
    })
    this.occupied = occupied
    onSettled(() => {
      const observer = new MutationObserver(() => setOccupied(this.scan()))
      observer.observe(host, { childList: true, characterData: true, subtree: true, attributeFilter: ["slot"] })
      setOccupied(this.scan())
      return () => observer.disconnect()
    })
  }

  /** Does slot `name` have content?  Tracked. */
  has(name: string): boolean {
    return this.occupied().has(name)
  }

  /**
   * Occupied slot names, read from the DOM now.
   * - No `Element` / `Node` globals:  the server render scans linkedom elements in node (`$/ui/server`).
   */
  private scan(): Set<string> {
    const names = new Set<string>()
    for (const node of this.host.childNodes) {
      if (node.nodeType === NodeType.element) names.add((node as Element).getAttribute("slot") ?? "")
      else if (node.nodeType === NodeType.text && node.textContent?.trim()) names.add("")
    }
    return names
  }
}
