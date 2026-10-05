/**
 * `yarn site:dev`:  work on the Spell UI site live.  The page server (started if it isn't running) serves the pages
 * at `/ui/`;  the site bundle, `site/_assets/`, rebuilds on every source edit, and the page server's live reload
 * then reloads every open page.
 * - Why not a dev server:  the pages are static files loading ONE committed bundle (`yarn site:build`);  this is
 *   that same build, watched, so what you see is what gets committed.
 * - Starts with `yarn site:bundle` (clears `_assets/`, makes the `icon-packs` link, prints sizes), then Vite's watch
 *   build with the same config (`vite.site.config.ts`):  edits under `src/` or `site/_src/` rebuild in seconds.
 * - Page edits (the shared pages, `ui/`:  `*.html`, `_parts/`) and new data (`site/_data/`) need no rebuild:  the
 *   page server reloads them itself.
 * - NOT watched:  `site:data`, `site:index`, `site:kitchen` (a vocabulary, a family sheet's tokens, an example):
 *   rerun `yarn site:build` for those.
 * - A watch rebuild doesn't clear `_assets/`, so a chunk whose hash changed leaves its old file behind:  run
 *   `yarn site:build` before committing.
 * - `Ctrl-C` stops the watch;  the page server keeps running (`spell dev server stop`).
 */
import { execFileSync } from "node:child_process"
import path from "node:path"
import { build, type Rolldown } from "vite"

/** `packages/ui/`. */
const UI = path.resolve(import.meta.dirname, "..")

/** Repo root (of this checkout):  where `spell dev server ensure` runs. */
const REPO = path.resolve(UI, "../..")

/** This checkout's own `spell` CLI:  run with `node`, never the `spell` on `PATH` (maybe another checkout's). */
const SPELL = path.join(REPO, "packages/cli/bin/spell.mjs")

execFileSync("yarn", ["site:bundle"], { cwd: UI, stdio: "inherit" })
const base = ensurePageServer()
console.log(`\nSpell UI site:  ${base}/ui/  (live reload);  watching the bundle's sources, Ctrl-C to stop\n`)
const watcher = (await build({
  configFile: path.join(UI, "vite.site.config.ts"),
  build: { watch: {} }
})) as Rolldown.RolldownWatcher
watcher.on("event", report)

/** One line per rebuild (the config's `logLevel` is `warn`, so Vite lists nothing). */
function report(event: Rolldown.RolldownWatcherEvent): void {
  if (event.code === "BUNDLE_END") console.log(`${new Date().toLocaleTimeString()}  rebuilt in ${event.duration}ms`)
  if (event.code === "ERROR") console.error(`${new Date().toLocaleTimeString()}  build failed:  ${event.error.message}`)
}

/**
 * This checkout's page server origin, e.g. `http://127.0.0.1:54769`.
 * - SIDE EFFECT:  `spell dev server ensure` starts it in the background if it isn't running
 * - it prints `{ base, port, ... }` as JSON, maybe after other lines:  parsed from the first `{`
 */
function ensurePageServer(): string {
  const text = execFileSync(process.execPath, [SPELL, "dev", "server", "ensure"], {
    cwd: REPO,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    timeout: 60000
  })
  return (JSON.parse(text.slice(text.indexOf("{"))) as { base: string }).base.replace(/\/$/, "")
}
