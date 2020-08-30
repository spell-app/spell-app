/** Load and configure JSHINT global variable, which is used to display compiled JS source. */
import global from "global"
import { JSHINT } from "jshint"

global.JSHINT = function(source) {
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
Object.keys(JSHINT).forEach(key => {
  global.JSHINT[key] = JSHINT[key]
})
