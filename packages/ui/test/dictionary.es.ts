/**
 * A small Spanish dictionary for the translation-hook demo and test:  `<ie-boton primario color="rojo">`,
 * `<ie-desplegable seleccion marcador="Género">` dispatching `ie-cambio`.
 * - Keys are canonical English;  values are what a Spanish author writes (see `Dictionary`).
 */

import type { Dictionary } from "$/vocabulary"

/** Spanish names for the button and dropdown. */
export const es = {
  lang: "es",
  tags: { "ui-button": "boton", "ui-dropdown": "desplegable" },
  attributes: {
    primary: "primario",
    size: "tamano",
    placeholder: "marcador",
    selection: "seleccion",
    search: "busqueda",
    toggle: "alternable"
  },
  values: { hues: { red: "rojo", blue: "azul", green: "verde" }, sizes: { small: "pequeno", large: "grande" } },
  events: { "ui-change": "cambio", "ui-toggle": "alternar" }
} as const satisfies Dictionary
