import type { JSX } from "@solidjs/web"

/**
 * Types for the app's Solid code.
 * - `<ui-*>` tags in Solid JSX:  `spell-ui` ships no JSX types,
 *   so every `ui-*` tag takes the HTML attributes plus anything else, any value.
 *   - An object or function becomes the element's property, `on-ui-change` a listener
 *     (`spell-kit/element`'s `RichAttributes`).
 *   - Loose ON PURPOSE until `ui` ships typed tags:  a misspelt attribute isn't caught here.
 * - Augments `"@solidjs/web/types/jsx.js"`, NOT `"@solidjs/web"`:
 *   that one only re-exports `JSX` (see `guides/solid/solid-2.md`).
 */

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `ui-${string}`]: UIElementAttributes
    }
  }
}

/** Attributes of any `<ui-*>` element in JSX:  HTML attributes, plus any attribute the element defines, any value. */
export type UIElementAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
