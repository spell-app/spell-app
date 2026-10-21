/**
 * `spell run <project> --target ts | py`:  a project run as another target compiles it, not as javascript
 * (epic `python-target`, closing T4:  `spell run` ran only javascript).
 * - `--target js` (or none):  as before, `runCommand()`'s own path.
 * - `--target ts`:  the Solid TypeScript (`ts/solid`), built and run under node, as the core contract runs it:
 *   its `print`s and tests in the terminal.
 *   - One that draws can't open in a browser yet:  the page runner points only `@spell/core` at its own copy,
 *     and the build imports Solid too (`solid-js`, `@solidjs/web`).  It says so, and runs what it can.
 * - `--target py`:  the Python (`py`):
 *   - one that draws is served as its web app on Quart (`<Project>.app.py`), and opens in a browser, until `Ctrl-C`
 *   - one that doesn't runs in the terminal, as `python -m spell_core.run`
 * - Nothing is written into the project:  every file goes in a temp folder, removed after.
 */
import { spawn, spawnSync, type ChildProcess } from "child_process"
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { pathToFileURL } from "url"

import { SRV } from "spell-kit/server"
import environment from "$/spaces/server/node/environment"
import { buildTsx } from "spell-lang/spell/node/buildTsx"
import { SP } from "spell-lang/spell"
import { PY } from "spell-lang/py"
import { LSP } from "$/lsp"
import { CLI } from "$/cli"

/** `--target`'s short names, e.g. `ts`:  each target's full name, `ts/solid`. */
const SHORT_NAMES: Record<string, string> = { js: "js/solid", ts: "ts/solid", py: "py" }

/** `app`, whose `yarn build:page` builds the page side a Python app's page loads:  `dist-page/`. */
const APP_DIR = resolve(environment.packagesDir, "app")

/** `spell_quart`'s uv project, which serves a Python app:  Python's web server, in spaces. */
const SPELL_QUART_DIR = resolve(environment.packagesDir, "spaces", "src", "server", "py")

/**
 * The target `--target name` asks for:  `js`, `ts` or `py`, or a target's full name (`ts/solid`).
 * - `undefined` for none, or javascript:  `spell run`'s own path.
 * - throws `CLI.CliError` for a name no target has, or one that doesn't run, e.g. a library (`ts/lib`).
 */
export function targetNamed(name: string | undefined): SP.Target | undefined {
  if (name === undefined) return undefined
  const target = SP.TARGETS[SHORT_NAMES[name] ?? name]
  if (!target) throw new CLI.CliError(`--target takes js, ts or py, not "${name}"`)
  if (target.can.run === false) {
    throw new CLI.CliError(`"${target.name}" doesn't run:  it's compiled for other code to import (\`spell compile\`)`)
  }
  return target.name === SP.RUNNING_TARGET ? undefined : target
}

/**
 * Run `project`, compiled for `target` (`project.compile()` with it, just now):  see the file's docs.
 * - Returns the exit code.
 */
export async function runTarget(
  session: CLI.CliSession,
  project: SP.SpellProject,
  target: SP.Target,
  options: CLI.RunOptions
): Promise<number> {
  const name = project.projectName ?? project.projectId
  const folder = mkdtempSync(resolve(tmpdir(), "spell-run-"))
  try {
    const imports = await writeImports(project, target, folder)
    if (target.appSuffix && project.elementsFileFor(target)?.contents && options.browser !== false) {
      return await serveApp(session, project, target, folder, imports, options)
    }
    const extension = target.suffix.slice(target.suffix.lastIndexOf("."))
    const code = project.outputFileFor(target).contents ?? ""
    const projects = Object.fromEntries(Object.entries(imports).map(([id, it]) => [id, it.url]))
    const { exitCode, skipped } = await CLI.runCode("run", name, code, { ...options, extension, projects })
    // what needed a browser, e.g. `start the game`:  skipped under node
    if (skipped.length && options.browser !== false) {
      session.err(`${name} draws:  its ${target.name} can't open in a browser yet -- \`--target js\` (or none) does`)
    }
    return exitCode
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/** One project `project` imports, as written for a target:  its file's URL, and its drawing half's file, if any. */
type WrittenImport = { url: string; module: string; elements?: string }

/**
 * SIDE EFFECT:  each project `project` imports, and each they import,
 * compiled for `target` and written into `folder`, as its code imports it.  Returns them by project id.
 * - Python:  a module of the project's name, `cards.py`, beside the program:  `from cards import Card`;
 *   and its drawing half, `cards.elements.spell.js`, which the app serves.
 * - TypeScript:  built (`buildTsx()`) to `<Project>.spell.mjs`.
 */
async function writeImports(
  project: SP.SpellProject,
  target: SP.Target,
  folder: string,
  written: Record<string, WrittenImport> = {}
): Promise<Record<string, WrittenImport>> {
  for (const imported of LSP.ScopeExplorer.importedProjects(project)) {
    if (written[imported.projectId]) continue
    await imported.compile(undefined, { save: false, targets: [target.name] })
    const module = `${SP.SPELL_PROJECT_MODULE}${imported.projectId}`
    const name = imported.projectName ?? imported.projectId
    let code = imported.outputFileFor(target).contents ?? ""
    let file: string
    if (target.name === "py") file = `${PY.PyWriter.projectModule(module)}.py`
    else {
      code = await buildTsx(code, { filename: `${name}${target.suffix}` })
      file = `${name}.spell.mjs`
    }
    writeFileSync(join(folder, file), code)
    const entry: WrittenImport = { url: pathToFileURL(join(folder, file)).href, module }
    const elements = imported.elementsFileFor(target)?.contents
    if (elements && target.elementsSuffix) {
      entry.elements = `${PY.PyWriter.projectModule(module)}${target.elementsSuffix}`
      writeFileSync(join(folder, entry.elements), elements)
    }
    written[imported.projectId] = entry
    await writeImports(imported, target, folder, written)
  }
  return written
}

/**
 * Serve `project`'s web app (`target.appSuffix`, Python's on Quart) from `folder`, open it in a browser,
 * and wait for `Ctrl-C`.
 * - Writes the program, its drawing half and its app into `folder`, beside its imports.
 * - Builds the page side first if it's missing or older than what it's built from (`ensurePageBuilt()`).
 * - `--seed`:  every visitor is dealt the same game (`$SPELL_SEED`).
 * - Returns the exit code.
 */
async function serveApp(
  session: CLI.CliSession,
  project: SP.SpellProject,
  target: SP.Target,
  folder: string,
  imports: Record<string, WrittenImport>,
  options: CLI.RunOptions
): Promise<number> {
  const name = project.projectName ?? project.projectId
  const program = `${name}${target.suffix}`
  const elements = `${name}${target.elementsSuffix}`
  writeFileSync(join(folder, program), project.outputFileFor(target).contents ?? "")
  writeFileSync(join(folder, elements), project.elementsFileFor(target)?.contents ?? "")
  const projects = Object.fromEntries(
    Object.values(imports).flatMap((it) => (it.elements ? [[it.module, it.elements]] : []))
  )
  const app = join(folder, `${name}${target.appSuffix}`)
  writeFileSync(app, PY.quartApp({ projectName: name, program, elements, outputs: ".", projects }))
  await ensurePageBuilt(session)

  const port = await SRV.freePort()
  const url = `http://${SRV.LOCALHOST}:${port}/`
  const env = {
    ...process.env,
    PORT: String(port),
    ...(options.seed !== undefined && { SPELL_SEED: String(options.seed) })
  }
  const child = spawn("uv", ["run", "--quiet", "--project", SPELL_QUART_DIR, "python", app], { env, stdio: "inherit" })
  try {
    if (!(await answers(url, child))) {
      session.err(`${name}'s app never answered at ${url}`)
      return CLI.EXIT.ERRORS
    }
    session.out(url)
    session.err(`${name} shows a UI:  running it in Python at ${url} -- Ctrl-C to stop`)
    SRV.openBrowser(url)
    return await untilDone(child)
  } finally {
    if (child.exitCode === null) child.kill()
  }
}

/** Does `url` answer, within 30 seconds, while `child` runs? */
async function answers(url: string, child: ChildProcess): Promise<boolean> {
  for (let tries = 0; tries < 60 && child.exitCode === null; tries++) {
    try {
      if ((await fetch(url)).ok) return true
    } catch {
      // not up yet
    }
    await new Promise((wait) => setTimeout(wait, 500))
  }
  return false
}

/** Wait for `Ctrl-C` (stopping `child`), or for `child` to end by itself:  the exit code. */
function untilDone(child: ChildProcess): Promise<number> {
  return new Promise((done) => {
    const stop = () => child.kill("SIGINT")
    process.once("SIGINT", stop)
    process.once("SIGTERM", stop)
    child.once("exit", (code, signal) => {
      process.off("SIGINT", stop)
      process.off("SIGTERM", stop)
      done(signal || code === 0 ? CLI.EXIT.OK : CLI.EXIT.ERRORS)
    })
  })
}

/**
 * Build the page side a Python app's page loads (`yarn build:page` in `app`, `dist-page/`),
 * when it's missing or older than the newest file it's built from:  the core, Spell UI, the app's runner.
 * - A few seconds;  shown as a status row.
 * - Throws `CLI.CliError` with the build's last lines if it fails.
 */
async function ensurePageBuilt(session: CLI.CliSession): Promise<void> {
  const built = resolve(APP_DIR, "dist-page", "spell-page.js")
  const sources = [
    environment.coreDir,
    join(environment.packageFolder("spell-ui"), "src"),
    resolve(APP_DIR, "src", "runner")
  ]
  if (existsSync(built) && statSync(built).mtimeMs >= Math.max(...sources.map(newestIn))) return
  const status = new CLI.StatusReporter(session.isInteractive)
  const row = status.start("Building the page side for the browser (yarn build:page)")
  try {
    const { status: code, stdout, stderr } = spawnSync("yarn", ["build:page"], { cwd: APP_DIR, encoding: "utf8" })
    if (code !== 0) {
      status.done(row, "failed")
      const output = `${stdout}${stderr}`.trim().split("\n").slice(-8).join("\n")
      throw new CLI.CliError(`yarn build:page failed:\n${output}`)
    }
    status.done(row, "ok", session.relative(resolve(APP_DIR, "dist-page")))
  } finally {
    status.finish()
  }
}

/** When the newest file under `folder` last changed (ms), `node_modules` left out. */
function newestIn(folder: string): number {
  let newest = 0
  for (const entry of readdirSync(folder, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || entry.parentPath.includes("node_modules")) continue
    newest = Math.max(newest, statSync(join(entry.parentPath, entry.name)).mtimeMs)
  }
  return newest
}
