import chalk from "chalk"
import { render, type Instance } from "ink"

import { CLI } from "$/cli"

/**
 * Shows progress of a command's work, one `StatusRow` per piece, e.g. per project compiled.
 * - In a terminal:  a live `<StatusList>` on stderr, spinners and all.  Its last frame stays on screen.
 * - Otherwise, e.g. in CI:  one plain line per row, on stderr, once it's done.
 * - Call `finish()` when done, BEFORE writing anything else, or the two interleave.
 */
export class StatusReporter {
  /** Draw a live screen, rather than plain lines? */
  declare interactive: boolean
  /** Every row so far, in order. */
  rows: CLI.StatusRow[] = []
  /** Live screen, once there's something on it. */
  #app?: Instance

  constructor(interactive: boolean) {
    this.interactive = interactive
  }

  /** Add a row for work starting now, labelled `label`.  Pass it to `done()` when it's done. */
  start(label: string): CLI.StatusRow {
    const row: CLI.StatusRow = { label, state: "running" }
    this.rows.push(row)
    this.redraw()
    return row
  }

  /** `row`'s work is done:  `state`, plus a short `note` and `details` lines under it. */
  done(row: CLI.StatusRow, state: CLI.StatusState, note?: string, details?: string[]): void {
    Object.assign(row, { state, note: note || undefined, details })
    if (this.interactive) return this.redraw()

    const mark = state === "ok" ? chalk.green(CLI.STATE_MARK[state]) : chalk.red(CLI.STATE_MARK[state])
    const lines = [`${mark} ${row.label}${row.note ? chalk.dim(`  ${row.note}`) : ""}`]
    for (const line of details ?? []) lines.push(`    ${line}`)
    process.stderr.write(`${lines.join("\n")}\n`)
  }

  /**
   * Stop drawing, leaving the last frame on screen -- or, with `clear`, erasing it,
   * e.g. when it only showed progress towards the real output.
   */
  finish({ clear = false }: { clear?: boolean } = {}): void {
    if (clear) this.#app?.clear()
    this.#app?.unmount()
    this.#app = undefined
  }

  /** Redraw the live screen, if we have one. */
  private redraw(): void {
    if (!this.interactive) return
    const screen = <CLI.StatusList rows={[...this.rows]} />
    if (this.#app) this.#app.rerender(screen)
    else this.#app = render(screen, { stdout: process.stderr, patchConsole: false, exitOnCtrlC: true })
  }
}
