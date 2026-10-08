import { E } from "$/ui/core"
// Import directly to avoid circular import
import { state } from "./Reactive"

/****************
 * ### `RootSettings`
 * The settings each `<ui-root>` gives its subtree (icon packs, emoji names), by root element, and the lookup from any
 * element inside:  the NEAREST root that sets a key wins, so a nested root inherits what it doesn't set.
 * - In `core`, not in the root's family:  icons and emoji read it, and must never import `<ui-root>`.
 * - The lookup climbs the FLAT tree (`flatParentFor()`:  slot, parent, shadow host), so an icon inside a component's
 *   shadow root finds the root around the component.
 * - `generation` changes whenever a root's settings do:  icons and emoji inside track it and redraw.  Page-wide on
 *   purpose:  a root changing its packs is rare.
 * - STATIC and instance-free on purpose:  ONE registry per page, which every root writes and every icon reads.
 ****************/
export class RootSettings {
  /** Bumped on every change;  read it (tracked) to redraw when any root's settings change. */
  @state static accessor generation = 0

  /**
   * Set `root`'s settings (replacing its earlier ones) and bump `generation`.
   * - A state write:  call it from an event handler, a promise callback or an effect's APPLY.
   */
  static set(root: Element, settings: RootSettingsValue) {
    RootSettings.byRoot.set(root, settings)
    RootSettings.generation += 1
  }

  /** Forget `root`'s settings (it left the page) and bump `generation`. */
  static delete(root: Element) {
    if (!RootSettings.byRoot.delete(root)) return
    RootSettings.generation += 1
  }

  /** `key` from the nearest root at or above `element` that sets it, else `undefined`. */
  static nearest<K extends keyof RootSettingsValue>(
    element: Element | undefined,
    key: K
  ): RootSettingsValue[K] | undefined {
    for (let current = element; current; current = E.flatParentFor(current)) {
      const value = RootSettings.byRoot.get(current)?.[key]
      if (value !== undefined) return value
    }
    return undefined
  }

  /**
   * Forget every root's settings, for tests;  bumps `generation`, so icons and emoji redraw.
   * - A state write, like `set()`.
   */
  static reset() {
    RootSettings.byRoot = new WeakMap()
    RootSettings.generation += 1
  }

  ////////////////
  // ## Registry
  ////////////////

  /**
   * Root element => its settings.
   * - Not `readonly`:  a `WeakMap` can't be cleared, so `reset()` replaces it.
   */
  private static byRoot = new WeakMap<Element, RootSettingsValue>()
}

/** What a `<ui-root>` sets for its subtree, looked up from any element inside it. */
export type RootSettingsValue = {
  /** Its icon packs, over the outer root's (or the page's `UI.icons`). */
  readonly icons?: E.IconPacks
  /** Its emoji name set (`cldr`, `fomantic`). */
  readonly emoji?: string
}
