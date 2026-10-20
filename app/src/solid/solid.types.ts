import type { JSX } from "@solidjs/web"

/**
 * Types for the app's Solid code.
 * - `<ui-*>` tags in Solid JSX:  `@spell-app/ui` ships no JSX types, so every `ui-*` tag takes the HTML attributes
 *   plus anything else, as a string-attribute or `prop:` form.  Loose ON PURPOSE until `ui` ships typed tags:  a
 *   misspelt attribute isn't caught here.
 * - Augments `"@solidjs/web/types/jsx.js"`, NOT `"@solidjs/web"` (that one only re-exports `JSX`;  see
 *   `guides/solid/solid-2.md`).
 */

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `ui-${string}`]: UIElementAttributes
    }
  }
}

/** Attributes of any `<ui-*>` element in JSX:  HTML attributes, plus any attribute or `prop:` the element defines. */
export type UIElementAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
