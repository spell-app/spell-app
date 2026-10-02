import type { IconPacks } from "$/ui/runtime"

import { Cell } from "./Cell"

/** What a `<ui-root>` sets for its subtree, looked up from any element inside it. */
export type RootSettingsValue = {
  /** Its icon packs, over the outer root's (or the page's `UI.icons`). */
  readonly icons?: IconPacks
  /** Its emoji name set (`cldr`, `fomantic`). */
  readonly emoji?: string
}

/****************
 * ### `RootSettings`
 * The settings each `<ui-root>` gives its subtree (icon packs, emoji names), by root element, and the lookup from any
 * element inside:  the NEAREST root that sets a key wins, so a nested root inherits what it doesn't set.
 * - In `core`, not in the root's family:  icons and emoji read it, and must never import `<ui-root>`.
 * - The lookup climbs the FLAT tree (slot, parent, shadow host), so an icon inside a component's shadow root finds the
 *   root around the component.
 * - `generation` changes whenever a root's settings do:  icons and emoji inside track it and redraw.  Page-wide on
 *   purpose:  a root changing its packs is rare.
 ****************/
export class RootSettings {
  /** Root element => its settings. */
  private static readonly byRoot = new WeakMap<Element, RootSettingsValue>()

  /** Bumped on every change;  read it (tracked) to redraw when any root's settings change. */
  static readonly generation = new Cell(0)

  /**
   * Set `root`'s settings (replacing its earlier ones) and bump `generation`.
   * - A signal write:  call it from an event handler, a promise callback or an effect's APPLY.
   */
  static set(root: Element, settings: RootSettingsValue) {
    RootSettings.byRoot.set(root, settings)
    RootSettings.generation.set(RootSettings.generation.get() + 1)
  }

  /** Forget `root`'s settings (it left the page) and bump `generation`. */
  static delete(root: Element) {
    if (!RootSettings.byRoot.delete(root)) return
    RootSettings.generation.set(RootSettings.generation.get() + 1)
  }

  /** `key` from the nearest root at or above `element` that sets it, else `undefined`. */
  static nearest<K extends keyof RootSettingsValue>(element: Element | null, key: K): RootSettingsValue[K] | undefined {
    for (let current = element; current; current = RootSettings.parentOf(current)) {
      const value = RootSettings.byRoot.get(current)?.[key]
      if (value !== undefined) return value
    }
    return undefined
  }

  /**
   * `element`'s parent in the flat tree:  its slot, else its parent, else its shadow root's host;  `null` at the top.
   * - No `ShadowRoot` global:  the server render climbs linkedom elements in node (`$/ui/server`).
   */
  static parentOf(element: Element): Element | null {
    if (element.assignedSlot) return element.assignedSlot
    if (element.parentElement) return element.parentElement
    const root = element.getRootNode() as Partial<ShadowRoot>
    return root.nodeType === DOCUMENT_FRAGMENT_NODE && root.host ? root.host : null
  }
}

/** `Node.DOCUMENT_FRAGMENT_NODE`, without the `Node` global. */
const DOCUMENT_FRAGMENT_NODE = 11
