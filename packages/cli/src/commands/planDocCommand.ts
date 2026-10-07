// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { findCheckout } from "$/cli/findCheckout"

/**
 * `spell dev plan-doc <command> <name> ...`:  the tool that edits a plan doc
 * (`epics/<name>/<name>.plan.html`), as the `/epic` skill uses it.  `spell dev plan-doc` alone
 * lists its commands, e.g. `spell dev plan-doc summary seo`, `spell dev plan-doc phase seo 2 done`.
 * - Root `yarn plan-doc` aliases it;  `spell plan-doc` too, until skills stop calling it (deprecated).
 * - Which checkout:  the nearest one from the current folder up (a worktree's, when run in one), else this
 *   checkout's (`findCheckout()`):  its `epics/`, templates and docs tools.  The CODE is this checkout's.
 * - Runs the tool IN this process:  `$/epics/tool/PlanDocCommands` (epic `epic-components`, P7;  it was a child
 *   `node` running `packages/docs/tools/plan-doc.js`, since nothing may import `docs`).
 * - Lean, like every `spell dev` command:  `args` only, no `CliSession` (which loads spell);  the tool loads on
 *   first use (a dynamic `import()`), so other `spell dev` commands don't pay for linkedom and oxfmt.
 * - Returns the tool's exit code, once its output is written:  `runLean()` exits at once, and a pipe on macOS takes
 *   its writes asynchronously.
 */
export async function planDocCommand(args: string[]): Promise<number> {
  const [{ PlanDocCommands }, { PlanDocFiles }] = await Promise.all([
    import("$/epics/tool/PlanDocCommands"),
    import("$/epics/tool/PlanDocFiles")
  ])
  const files = new PlanDocFiles({ root: findCheckout(CHECKOUT_MARKER) })
  const exitCode = await new PlanDocCommands({ files }).run(args)
  await flushed()
  return exitCode
}

/**
 * What marks a checkout the tool can work on (`findCheckout()`):  its docs tools, as when the tool ran from there.
 * - a worktree cut before P7 of `epic-components` has it too:  its docs are the shared ones either way
 */
const CHECKOUT_MARKER = "packages/docs/tools/plan-doc.js"

/** Resolves once everything written to stdout and stderr so far is out:  an empty write's callback comes after. */
function flushed(): Promise<void> {
  const streams = [process.stdout, process.stderr]
  return Promise.all(streams.map((stream) => new Promise<void>((done) => stream.write("", () => done())))).then(
    () => undefined
  )
}
