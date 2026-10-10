import type { SharedDictionary } from "./vocabulary.types"

/**
 * Spanish names for the attributes every element shares (`SharedVocabulary`):  `<ie-boton desactivado>`.
 * - Every Spanish dictionary gets them, so it needn't name them itself;
 *   one that does (`attributes: { disabled: "inactivo" }`) wins.
 * - The states stay English (`:state(disabled)`):  a CSS contract, never translated.
 */
export const sharedEs = {
  lang: "es",
  attributes: { disabled: "desactivado", loading: "cargando", visible: "visible" }
} as const satisfies SharedDictionary
