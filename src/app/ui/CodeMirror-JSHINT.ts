/**
 * Load and configure JSHINT global variable, which is used to display compiled JS source.
 * - SIDE EFFECT: sets `global.JSHINT` -- CodeMirror's `javascript-lint` addon (see `outputOptions`
 *   in `CodeMirror.ts`) looks it up as a global rather than importing it, so it must exist by the
 *   time that addon runs.
 */
import global from "global"
import { JSHINT } from "jshint"

/** Our `global.JSHINT` wrapper, pinning the options CodeMirror's lint addon calls it with. */
global.JSHINT = function (source: string | string[]) {
  // see: https://jshint.com/docs/options
  const hintOptions = {
    esversion: 8,
    asi: true, // ignore semicolons
    globals: {
      spell: true
    }
  }
  return JSHINT(source, hintOptions)
}
// Copy real JSHINT's static properties (e.g. `errors`) onto our wrapper, so anything reading them
// off `global.JSHINT` after a lint pass -- as the lint addon does -- still finds them.
Object.keys(JSHINT).forEach((key) => {
  global.JSHINT[key] = (JSHINT as unknown as Record<string, unknown>)[key]
})
