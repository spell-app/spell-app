import { spawn } from "node:child_process"
import { constants } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { EXIT, type ToolSpec } from "./command.types"
import { planDocArgs } from "./epicArgs"
import { Git } from "./Git"
import { Sessions } from "./Sessions"

/****************
 * ### `EpicTools`
 * The tools the `epic` command runs:  scripts in a child `node`, terminal attached (`run()`), and the `epic` tool,
 * in this process (`planDoc()`).
 * - ONE copy of the code:  every tool is the copy beside THIS code (`Git.CODE_ROOT`), whichever checkout calls it.
 *   - So a worktree 50 commits behind main runs main's tools, through main's `epic` on the `PATH`.
 *   - Its DATA stays the caller's:  the nearest checkout from the current folder (`Git.nearestCheckout()`), handed
 *     to the tool as `EPIC_CHECKOUT` (the docs tools' `pages.js` and the window script read it as their root).
 *   - The one exception:  a tool that SERVES its checkout (the page server), whose code is that checkout's
 *     (`code: "caller"`).
 * - All `static`:  no state;  `codeRoot` is the one seam, a test's fake checkout of tools.
 ****************/
export class EpicTools {
  /**
   * Run tool `name` with `args` verbatim and this terminal attached;  resolves to its exit code.
   * - the script:  `codeRoot`'s copy (default this code's checkout), unless the tool's `code` is `caller`
   * - the data:  the caller's checkout (`EPIC_CHECKOUT`);  a tool with a `cwd` runs in that folder of it
   * - a child `node`, under THIS checkout's `tsx` when the tool has a `tsx` config:  the config's `$/...` imports
   *   map into the CODE's checkout
   * - `env`:  added to this process's
   * - `cwd`:  the caller's folder, default the current one;  `codeRoot`:  where the code is, default this checkout
   *   (tests give a fake checkout of tools)
   */
  static run(name: EpicToolName, args: string[], options: EpicToolOptions = {}): Promise<number> {
    const { env = {}, codeRoot = Git.CODE_ROOT, cwd = process.cwd() } = options
    const spec: ToolSpec = EpicTools.TOOLS[name]
    const data = Git.nearestCheckout(spec.tool, cwd)
    const code = spec.code === "caller" ? data : codeRoot
    return EpicTools.runChild(process.execPath, [...EpicTools.toolArgs(spec, code), ...args], {
      cwd: spec.cwd ? join(data, spec.cwd) : cwd,
      env: {
        ...process.env,
        EPIC_CHECKOUT: data,
        ...(spec.tsx ? { TSX_TSCONFIG_PATH: join(code, spec.tsx) } : {}),
        ...env
      }
    })
  }

  /**
   * `node`'s arguments before the tool's own, for `spec` in checkout `root`:  the `tsx` loader if any, the script.
   * - the loader is THIS checkout's:  a worktree's tool runs before the worktree has a `node_modules`
   */
  static toolArgs(spec: ToolSpec, root: string): string[] {
    return spec.tsx ? ["--import", EpicTools.TSX_LOADER, join(root, spec.tool)] : [join(root, spec.tool)]
  }

  /**
   * Run `command` with `args` as a child, with this terminal attached, and resolve to its exit code.
   * - `Ctrl-C` reaches the child from the terminal itself, so this process ignores it until the child is done:
   *   a foreground server (`server serve`) gets to stop cleanly, and we exit with its code
   * - `SIGTERM` / `SIGHUP` sent to us alone are passed on
   * - killed by a signal:  `128 +` its number, as a shell reports it;  failed to start:  `EXIT.ERRORS`, saying why
   * - static:  any command;  the `spell dev` pass-throughs run theirs with it too
   */
  static runChild(
    command: string,
    args: string[],
    options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
  ): Promise<number> {
    const child = spawn(command, args, { ...options, stdio: "inherit" })
    const ignore = () => {}
    const pass = (signal: NodeJS.Signals) => child.kill(signal)
    process.on("SIGINT", ignore)
    for (const signal of PASSED_SIGNALS) process.on(signal, pass)
    return new Promise((done) => {
      child.on("error", (error) => {
        process.stderr.write(`${command}:  ${error.message}\n`)
        finish(EXIT.ERRORS)
      })
      child.on("exit", (code, signal) => finish(code ?? 128 + (signal ? constants.signals[signal] : 0)))

      /** Stop listening for signals, and resolve to `code`. */
      function finish(code: number) {
        process.off("SIGINT", ignore)
        for (const signal of PASSED_SIGNALS) process.off(signal, pass)
        done(code)
      }
    })
  }

  ////////////////
  // ## The `epic` tool, in this process
  ////////////////

  /**
   * Run the `epic` tool's command line `argv` (`add seo judgement "Title"`, the tool's own order) IN this process:
   * `PlanDocCommands`, on the caller's checkout's epic pages (`PlanDocFiles`).  Resolves to its exit code, once its
   * output is written (a pipe on macOS takes writes asynchronously, and the program exits at once).
   * - loaded on first use (a dynamic `import()`):  the other verbs don't pay for linkedom and oxfmt
   * - gives the tool an epic's RUNNING sessions (`Sessions.ofEpic()`), for `migrate --notify`
   */
  static async planDoc(argv: string[]): Promise<number> {
    const [{ PlanDocCommands }, { PlanDocFiles }] = (await Promise.all([import(COMMANDS), import(FILES)])) as [
      {
        PlanDocCommands: new (props: { files: unknown; sessionsOf: typeof sessionsOf }) => {
          run(argv: string[]): Promise<number>
        }
      },
      { PlanDocFiles: new (props: { root: string }) => unknown }
    ]
    const files = new PlanDocFiles({ root: Git.nearestCheckout(PLAN_DOC_MARKER) })
    const exitCode = await new PlanDocCommands({ files, sessionsOf }).run(argv)
    await flushed()
    return exitCode
  }

  /**
   * Run `epic <verb> <args...>` through the `epic` tool:  each command `planDocArgs()` makes, stopping at a failure.
   * - throws `EpicCommandError` for a target the verb can't take (`planDocArgs()`)
   */
  static async runPlanDoc([verb, ...args]: string[]): Promise<number> {
    for (const argv of planDocArgs(verb!, args)) {
      const exitCode = await EpicTools.planDoc(argv)
      if (exitCode !== EXIT.OK) return exitCode
    }
    return EXIT.OK
  }

  ////////////////
  // ## The tools
  ////////////////

  /**
   * The tools, by command:  each as its yarn script ran it.
   * - `agents`:  the running-agents list (`packages/epics/tools/agents.ts`), in the caller's folder
   * - `airplane`:  airplane mode and its pre-flight check (`packages/epics/tools/airplane.ts`), in the caller's folder
   * - `details`, `choices`:  details and choice pages, in `packages/epics` as `yarn workspace` ran them
   * - `notes`, `comments`:  page notes and comments on docs pages, in the caller's folder (`--file` is from there)
   * - `window`:  the VS Code windows (`scripts/window.mjs`);  plain `node`, so it runs in a worktree before its
   *   `yarn install`
   * - `server`:  the caller's checkout's page server (`packages/server`'s `cli.ts`);  `serve`:  every web server,
   *   `epic server start --all` (root `scripts/serve.mjs`)
   * - static:  the one table
   */
  static readonly TOOLS = {
    agents: { tool: "packages/epics/tools/agents.ts", tsx: "packages/epics/tsconfig.json" },
    airplane: { tool: "packages/epics/tools/airplane.ts", tsx: "packages/epics/tsconfig.json" },
    details: { tool: "packages/epics/tools/details.js", cwd: "packages/epics" },
    choices: { tool: "packages/epics/tools/choices.js", cwd: "packages/epics" },
    notes: { tool: "packages/epics/tools/notes.ts", tsx: "packages/epics/tsconfig.json" },
    comments: { tool: "packages/epics/tools/comments.ts", tsx: "packages/epics/tsconfig.json" },
    window: { tool: "scripts/window.mjs" },
    server: { tool: "packages/server/src/page/cli.ts", tsx: "packages/server/tsconfig.json", code: "caller" },
    serve: { tool: "scripts/serve.mjs", code: "caller" }
  } satisfies Record<string, ToolSpec>

  /**
   * This checkout's own `tsx` loader.
   * - static:  where every tool's loader comes from
   */
  static readonly TSX_LOADER = pathToFileURL(join(Git.CODE_ROOT, "node_modules", "tsx", "dist", "loader.mjs")).href
}

/** A tool `EpicTools.run()` runs, e.g. `details`. */
export type EpicToolName = keyof typeof EpicTools.TOOLS

/** `EpicTools.run()`'s options:  see there. */
export type EpicToolOptions = { env?: NodeJS.ProcessEnv; codeRoot?: string; cwd?: string }

/**
 * The `epic` tool's modules, by alias (`tsx` resolves them at run time).
 * - HACK: specifiers in constants, so the CLI package's `tsc` (which follows this file from `epicMain.ts`) doesn't
 *   follow them;  the tool is type-checked here, in `packages/epics`.  Literal specifiers fail the CLI's `tsc`
 *   (spell's settings) in two ways (epic `epic-components` I5, 2026-10-07):
 *   - ES2023 (`toSorted()`, `findLast()`) in `Markup` and the converter:  the CLI's `lib` is ES2022
 *   - Solid's JSX:  the definitions import the vocabularies, which reach `$/ui/core` -> `ui`'s `.tsx`
 *   - REFACTOR: once the vocabularies' data lives clear of `$/ui/core` (and the CLI's `lib` is ES2023), import them
 *     plainly
 */
const COMMANDS = "$/epics/tool/PlanDocCommands"
/** `COMMANDS`' twin:  the docs on disk. */
const FILES = "$/epics/tool/PlanDocFiles"

/** Signals `runChild()` passes on to its child:  they come to us alone, not from the terminal. */
const PASSED_SIGNALS: NodeJS.Signals[] = ["SIGTERM", "SIGHUP"]

/**
 * What marks a checkout the `epic` tool can work on (`Git.nearestCheckout()`):  its docs tools.
 * - a worktree cut before P7 of `epic-components` has it too:  its docs are the shared ones either way
 */
const PLAN_DOC_MARKER = "packages/epics/tools/plan-doc.js"

/** Resolves once everything written to stdout and stderr so far is out:  an empty write's callback comes after. */
function flushed(): Promise<void> {
  const streams = [process.stdout, process.stderr]
  return Promise.all(streams.map((stream) => new Promise<void>((done) => stream.write("", () => done())))).then(
    () => undefined
  )
}

/**
 * The running Claude sessions working on epic `epic`, as `epic send` finds its receivers (`Sessions.ofEpic()`):
 * each one's `name`, the address `SendMessage` takes, and its id.
 */
async function sessionsOf(epic: string): Promise<{ name: string; sessionId: string }[]> {
  return new Sessions().ofEpic(epic).map((session) => ({
    name: session.name ?? session.sessionId,
    sessionId: session.sessionId
  }))
}
