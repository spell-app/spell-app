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

/** One rendered element, before flattening. */
export type StaticView = {
  /** The page element (`<ui-button>`), a stand-in host. */
  element: Element
  /** Its family. */
  family: StaticFamily
  /** Its shadow content as HTML. */
  html: string
}
