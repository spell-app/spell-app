/**
 * Types for the app's Solid code.
 * - `<ui-*>` tags in Solid JSX:  Spell UI's own types, exact (`spell-ui/jsx`, generated from its vocabularies).
 *   - Every attribute of every tag, with its values and hover docs.
 *   - Data goes as plain props:  an object or function becomes the element's property, `on-ui-change` a listener
 *     (`spell-kit/element`'s `RichAttributes`).
 *   - A misspelt attribute or a value its set doesn't hold is an error.
 * - Translated tags (`<es-boton>`) stay loose:  the generated types name the English tags only.
 * - Importing it here puts them in every program that holds the app's Solid code.
 * - Augments `"@solidjs/web/types/jsx.js"`, NOT `"@solidjs/web"`:
 *   that one only re-exports `JSX` (see `guides/solid/solid-2.md`).
 */

import type { JSX } from "@solidjs/web"
import type {} from "spell-ui/jsx"

declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      // a Spanish program's Spell UI tags, `<es-boton>`:  the same elements, under `<ui-root lang="es">`;
      // loose until the generated types cover translated tags
      [tag: `es-${string}`]: TranslatedUIElementAttributes
    }
  }
}

/** Attributes of a translated Spell UI tag (`<es-boton>`) in JSX:  HTML attributes, plus any attribute, any value. */
export type TranslatedUIElementAttributes = JSX.HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
