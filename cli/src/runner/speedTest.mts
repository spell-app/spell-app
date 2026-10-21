/**
 * Child process of `spell speed`:  times the parser's rule tests once (`SP.spellParser.speedTest()`),
 * and prints the results as JSON, the last line on stdout.
 * - Started by `speedCommand.ts` as `node --import tsx/esm --import <aliases> speedTest.mts <spell src URL> [module]`.
 *   One process per run, so each run starts cold.
 * - `<spell src URL>`:  the spell `src/` folder to time (a `file:` URL, ending `/`):  ours, or `--against`'s temp
 *   checkout of spell-lang;  its own `$/` imports go by its checkout's alias table (`spell-kit/toolchain/aliases`).
 *   Never `$/cli`.
 * - `.mts`, so it loads as an ES module wherever it's copied -- see `PAPERCUTS.md`.
 * - `failed` is a count, not the list.
 */
// spell logs as it loads, and `speedTest()` logs every run:  silence it all BEFORE loading anything
for (const method of ["log", "info", "debug", "warn", "group", "groupCollapsed", "groupEnd"] as const) {
  console[method] = () => {}
}
// defines `__PACKAGE_VERSION__` before spell reads it
const [spellSrc = "", module = ""] = process.argv.slice(2)
await import(new URL("node/packageVersion.node.ts", spellSrc).href)
const { SP } = (await import(new URL("index.ts", spellSrc).href)) as typeof import("spell-lang/spell")

const { failed, ...results } = SP.spellParser.speedTest(module)
process.stdout.write(`${JSON.stringify({ ...results, failed: failed.length })}\n`)
// NOTE: exits explicitly -- a parse can leave timers running, which would keep the process alive
process.exit(0)
