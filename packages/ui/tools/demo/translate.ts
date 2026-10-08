/**
 * Translation demo:  the same components registered under Spanish names with `define(tag, dictionary)`;
 * `ie-cambio` / `ie-alternar` events are logged.
 */

import { UIButton, UIDropdown } from "$/ui/index"
import { es } from "$/ui/test/dictionary.es"

UIButton.define("ie-boton", es)
UIDropdown.define("ie-desplegable", es)

const log = document.getElementById("log")!
for (const name of ["ie-cambio", "ie-alternar"]) {
  document.addEventListener(name, (event) => {
    log.textContent += `${name} ${JSON.stringify((event as CustomEvent).detail, ["value", "active"])}\n`
  })
}
