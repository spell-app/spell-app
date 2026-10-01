import { view } from "#spell-util"
import type { SpellConsole } from "#spell-core/console"
// Import directly, NOT through the `UI` barrel, which would pull in the whole editor.
import { ConsoleLines } from "#spell-app/ui/ConsoleLines"

import "./RunnerConsole.css"

/****************
 * ### `<RunnerConsole>`
 * A `spellCore.console`, e.g. what `print` statements say.
 * - `view()` so it redraws as lines are logged.
 * - `console` is a prop, NOT the imported `spellCore`'s:  `<spell-app>` shows each app's own copy's.
 ****************/
export const RunnerConsole = view(function RunnerConsole({ console }: RunnerConsoleProps) {
  return (
    <div className="RunnerConsole ConsoleViewer scrolling">
      <div className="stretcher">
        <ConsoleLines lines={console.lines} indent={0} />
      </div>
    </div>
  )
})

/** Props for `<RunnerConsole>`. */
export type RunnerConsoleProps = {
  /** Console to show, e.g. `spellCore.console`. */
  console: SpellConsole
}
