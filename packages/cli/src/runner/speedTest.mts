/**
 * Child process of `spell speed`:  times the parser's rule tests once (`SP.spellParser.speedTest()`),
 * and prints the results as JSON, the last line on stdout.
 * - Started by `speedCommand.ts` as `node --import tsx/esm speedTest.mts [module]`.
 *   One process per run, so each run starts cold.
 * - SELF-CONTAINED:  it imports only spell, by its `$/` alias -- `--against` COPIES it into another checkout,
 *   where those aliases reach THAT checkout's spell.  Never `$/cli`.
 * - `.mts`, so it loads as an ES module wherever it's copied -- see `PAPERCUTS.md`.
 * - `failed` is a count, not the list.
 */
// spell logs as it loads, and `speedTest()` logs every run:  silence it all BEFORE loading anything
for (const method of ["log", "info", "debug", "warn", "group", "groupCollapsed", "groupEnd"] as const) {
  console[method] = () => {}
}
// defines `__PACKAGE_VERSION__` before spell reads it
await import("$/spell/node/packageVersion.node")
const { SP } = await import("$/spell")

const { failed, ...results } = SP.spellParser.speedTest(process.argv[2] ?? "")
process.stdout.write(`${JSON.stringify({ ...results, failed: failed.length })}\n`)
// NOTE: exits explicitly -- a parse can leave timers running, which would keep the process alive
process.exit(0)
