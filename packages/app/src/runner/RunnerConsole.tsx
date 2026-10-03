import type { SpellConsole } from "$/core/console"
// Import directly, NOT through the `$/app/solid` barrel, which pulls in the editor (plan doc C9)
import { tracked } from "$/app/solid/tracked"
import { ConsoleLines } from "$/app/solid/ConsoleLines"

import "./RunnerConsole.css"

/****************
 * ### `<RunnerConsole>`
 * A `spellCore.console`, e.g. what `print` statements say.
 * - Its lines are spell cells:  read through `tracked()`, so a line logged adds a row.
 * - `console` is a prop, NOT the imported `spellCore`'s:  `<spell-app>` shows each app's own copy's.
 * - `console` is read ONCE:  remount for another, e.g. `<Show when={loaded()} keyed>`.
 ****************/
export function RunnerConsole(props: RunnerConsoleProps) {
  const console = props.console
  const lines = tracked(() => console.lines)
  return (
    <div class="RunnerConsole ConsoleViewer scrolling">
      <div class="stretcher">
        <ConsoleLines lines={lines()} indent={0} />
      </div>
    </div>
  )
}

/** Props for `<RunnerConsole>`. */
export type RunnerConsoleProps = {
  /** Console to show, e.g. `spellCore.console`. */
  console: SpellConsole
}
