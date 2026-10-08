/// <reference types="node" />

/****************
 * ### `Terminal`
 * Where `tools/` and `scripts/` print:  their command-line output, straight to `process.stdout` / `stderr`
 * (`packages/ui/AGENTS.md` "Logging";  the shape of `packages/cli`'s `CliSession.out()` / `err()`).
 * - NEVER `console.*` in a tool:  `console` is for a page's warnings (`Warnings`), and a test's spies.
 * - At the bottom of the tools' import graph:  node built-ins only, so any tool or script can import it.
 * - STATIC and instance-free on purpose:  a process has one stdout and one stderr.
 ****************/
export class Terminal {
  /** Write `text` to stdout, on its own line:  results, what a run made. */
  static out(text: string): void {
    process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
  }

  /** Write `text` to stderr, on its own line:  problems, usage, progress a pipe shouldn't get. */
  static err(text: string): void {
    process.stderr.write(text.endsWith("\n") ? text : `${text}\n`)
  }
}
