/**
 * Shared types and constants of `$/ui/static`, the static (no shadow DOM, no JS) server render of `ui-*` pages.
 * - The BOTTOM of the folder's import graph:  `import type` only (and `UIT`, pure data), no class file of its folder;
 *   every class file above it reads it.
 * - Its marks are read while their users EVALUATE (the module constants of `StaticSelectors`, `StaticStylesheet`),
 *   so those import them from this file, not through `SSR`.
 * - Node only, like the folder:  NEVER imported by a component or `$/ui`.
 */

import * as UIT from "$/ui/components/components.types"
import type { E } from "$/ui/core"

////////////////
// ## Static marks
////////////////

// The attributes the flattener writes on its output, and the static stylesheet selects by.
// - PUBLISHED, so their spelling is fixed:  component sheets (`:not([data-ui])`), `native.css` and the
//   `*.ssr.test.tsx` expectations spell them out;  `UITable` writes `ROOT_ATTRIBUTE` as `UIT.STATIC_ROOT` (I14).
// - A form control's own mark is the components' `UIT.STATIC_CONTROL` (`data-ui-control`):  their renders write it.

/**
 * Marks each component root with its family's kind (`data-ui="card"`, `StaticFamily.kind`).
 * - The static stylesheet's `@scope` root, and its boundary:  `[data-ui]` inside a scope is another component.
 */
export const ROOT_ATTRIBUTE = UIT.STATIC_ROOT

/**
 * Marks what the flattener put where a `<slot>` was:  author content, or a slotted component's root.
 * - The static stylesheet's other boundary:  a component's rules never reached into slotted content.
 */
export const SLOTTED_ATTRIBUTE = "data-ui-slotted"

/** Marks the `<li>` the flattener wraps a list item in (`display: contents` in the static stylesheet). */
export const LIST_ITEM_ATTRIBUTE = "data-ui-li"

/** Every custom state the host had, space-separated:  what `:state(x)` becomes, `[data-state~="x"]`. */
export const STATE_ATTRIBUTE = "data-state"

/** Any component root. */
export const ROOT = `[${ROOT_ATTRIBUTE}]`

/** Anything slotted. */
export const SLOTTED = `[${SLOTTED_ATTRIBUTE}]`

/** The flattener's list item wrapper. */
export const LIST_ITEM = `[${LIST_ITEM_ATTRIBUTE}]`

/**
 * What page CSS could reach:  outside every component, component roots (were hosts), slotted author content.
 * - Zero specificity (`:where()`).  NOTE:  approximate:  a component rendered inside slotted content is reachable too.
 * - Used on page sheets (`StaticPageStyles`) and the page-only foundation sheets (`StaticStylesheet.page()`).
 */
export const REACH = `:where(:not(${ROOT} *), ${ROOT}, ${SLOTTED}, ${SLOTTED} *)`

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
  Class: E.UIElementClass
  /** Its definition under the tag it renders as. */
  definition: E.ElementDefinition
  /**
   * What its roots are marked with (`data-ui="<kind>"`):  the tag without `ui-` (`placeholder-image`).
   * - NOT the vocabulary noun:  nouns aren't unique (`ui-image` / `ui-placeholder-image` are both `image`), and the
   *   static stylesheet scopes each sheet by this mark.
   */
  kind: string
}

/**
 * A family's optional static hook for `StaticRender.prepare()`:  load the data `html`'s render will read
 * synchronously (`UIEmoji`:  emoji names), for the elements tagged `tag`.
 */
export type StaticPreload = {
  /** Load what rendering `html`'s `tag` elements reads;  `prepare()` awaits it. */
  preload(html: string, tag: string): Promise<unknown>
}

/**
 * Which sheets rendered elements adopted, over every render so far (`StaticRender.sheetUsage`), for
 * `StaticStylesheet.build()`.
 */
export type StaticSheetUsage = {
  /**
   * Sheet registry name => kinds (`StaticFamily.kind`) of the elements seen adopting it.
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

////////////////
// ## Selectors
////////////////

/** What `StaticSelectors.rewrite()` returns. */
export type StaticSelectorResult = {
  /** Rewritten selectors (one, or two for a host-descendant rule). */
  selectors: string[]
  /** A rule on the host box alone (`:host(X)`):  `display` there is the host's, never the root's. */
  hostOnly: boolean
  /**
   * From `::slotted()`:  in a shadow root such a rule lost to the page's CSS and to the slotted component's own
   * rules, so the stylesheet puts it in a layer before `page`.
   */
  slotted: boolean
}

/** Options for `StaticSelectors.rewrite()`, and `StaticStylesheet.scope()`, which passes them on. */
export type StaticSelectorOptions = {
  /** The sheet's group wraps its items in `<li data-ui-li>`:  child combinators also step over the wrapper. */
  listItems?: boolean
  /** Rendered tag => kind (`ui-segments` => `segments`), for `::slotted(ui-x)`. */
  tags?: ReadonlyMap<string, string>
}
