/**
 * Shared types of `$/ui/server`, the static (no shadow DOM, no JS) server render of `ui-*` pages.
 */

import type { ElementDefinition, UIElementClass } from "$/ui/elements"

////////////////
// ## Hosts
////////////////

/** What a render left on a stand-in host (`ServerHost`), for the flattener. */
export type ServerHostState = {
  /** Custom states set on the host (`:state(x)`), e.g. `in-card`. */
  states: Set<string>
  /** Values the render wrote to `internals`, e.g. `role`, `ariaLabel`. */
  internals: Record<string, unknown>
}

////////////////
// ## Rendering
////////////////

/** One family the static render knows:  its controller class and definition, by tag. */
export type StaticFamily = {
  /** Controller class, e.g. `UIButton`. */
  Class: UIElementClass
  /** Its definition under the tag it renders as. */
  definition: ElementDefinition
}

/**
 * Which sheets rendered elements adopted, over every render so far (`StaticRender.sheetUsage`), for
 * `StaticStylesheet.build()`.
 */
export type StaticSheetUsage = {
  /**
   * Sheet registry name => nouns of the elements seen adopting it.
   * - Beyond a family's own `styles`:  an item adopts its owner's sheet (`list`), a label in a statistic `parts`.
   */
  users: Map<string, Set<string>>
  /**
   * Each distinct adoption order seen, e.g. `["item", "list"]`, by its joined names.
   * - In a shadow root, a sheet adopted LATER has the later layers;  one static stylesheet has one layer order,
   *   so it must keep every order seen.
   */
  orders: Map<string, readonly string[]>
}

/** One rendered element, before flattening. */
export type StaticView = {
  /** The page element (`<ui-button>`), a stand-in host. */
  element: Element
  /** Its family. */
  family: StaticFamily
  /** Its shadow content as HTML. */
  html: string
}
