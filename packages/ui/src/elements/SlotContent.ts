import { onSettled } from "solid-js"

import { E } from "$/ui/core"
// Import directly to avoid circular import
import { state } from "./Reactive"

/**
 * Same slot names:  a rescan finding them again changes nothing (`SlotContent.filledSlots`'s `equals`).
 * - Above the class:  `@state({ equals })` reads it while the class is defined.
 */
function isSameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((name) => b.has(name))
}

/****************
 * ### `SlotContent`
 * Which of a host's slots have light-DOM content -- e.g. an icon-only button needs to know that its default slot is
 * empty, and shorthand attributes yield to slotted content.
 * - Watches the host's children (and their `slot` attributes / text) with a `MutationObserver` rather than
 *   `slotchange`, so the answer exists before anything renders and doesn't depend on a `<slot>` being present.
 * - Default slot:  child elements without `slot`, or non-blank text.  Named slot:  child elements with that `slot`.
 * - MUST be created under the component's owner;  the observer is disconnected when that owner is disposed.
 * - Takes any `HTMLElement`:  uses no element-core class, only `solid-js`, `@state` and `E.NodeType`.
 ****************/
export class SlotContent {
  /** Names of the slots with content;  `""` is the default slot.  Tracked. */
  @state({ equals: isSameSet }) accessor filledSlots: ReadonlySet<string> = new Set<string>()

  /** The host. */
  private readonly host: HTMLElement

  constructor(host: HTMLElement) {
    this.host = host
    this.filledSlots = this.scan()
    onSettled(() => {
      const observer = new MutationObserver(() => (this.filledSlots = this.scan()))
      observer.observe(host, { childList: true, characterData: true, subtree: true, attributeFilter: ["slot"] })
      this.filledSlots = this.scan()
      return () => observer.disconnect()
    })
  }

  /** Does slot `name` have content?  Tracked. */
  hasContent(name: string): boolean {
    return this.filledSlots.has(name)
  }

  /**
   * Slot names with content, read from the DOM now.
   * - No `Element` / `Node` globals:  the server render scans linkedom elements in node (`$/ui/static`).
   */
  private scan(): Set<string> {
    const names = new Set<string>()
    for (const node of this.host.childNodes) {
      if (node.nodeType === E.NodeType.element) names.add((node as Element).getAttribute("slot") ?? "")
      else if (node.nodeType === E.NodeType.text && node.textContent?.trim()) names.add("")
    }
    return names
  }
}
