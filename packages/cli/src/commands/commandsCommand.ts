import chalk from "chalk"
import { existsSync, readFileSync, readdirSync } from "fs"
import { homedir } from "os"
import { join } from "path"

import { CLI } from "$/cli"

/** The commands page's data, relative to a checkout's root. */
export const COMMANDS_JSON = join("packages", "docs", "content", "dev", "commands", "commands.json")

/**
 * `spell dev commands [list|check]`:  every command the repo has -- yarn scripts, `spell` commands, skills -- against
 * the commands page's `commands.json` (`packages/docs/content/dev/commands/`), which maps each to the operations it does.
 * - `list` (default):  every command, with whether the page names it (`✓` / `✗`)
 * - `check`:  just the problems:  commands the page never names, and names on the page no command has;  exits 1
 *   if there are any.  Run it after adding, renaming or removing a command (root `yarn commands:check`).
 * - `--json`:  `{ commands: [{ name, surface, named }], missing, stale }`
 * - Which checkout:  the nearest one from the current folder up (`CLI.findCheckout()`), so a worktree checks its own.
 * - What counts:  `commandSources()`;  what the page names:  `pageNames()`.
 */
export async function commandsCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.CommandsOptions
): Promise<number> {
  const [verb = "list"] = args
  if (verb !== "list" && verb !== "check") throw new CLI.CliError(`unknown verb '${verb}':  list or check`)
  const root = CLI.findCheckout(COMMANDS_JSON)
  const file = join(root, COMMANDS_JSON)
  if (!existsSync(file)) throw new CLI.CliError(`no ${COMMANDS_JSON} in ${root}`)
  const data = JSON.parse(readFileSync(file, "utf8")) as CommandsData
  const commands = commandSources(root, data.sources)
  const named = pageNames(data)
  const missing = commands.filter((command) => !named.has(command.name)).map((command) => command.name)
  const known = new Set(commands.map((command) => command.name))
  const stale = [...named].filter((name) => !known.has(name)).sort()
  const ok = missing.length === 0 && stale.length === 0

  if (options.json) {
    const listed = commands.map((command) => ({ ...command, named: named.has(command.name) }))
    session.out(JSON.stringify({ commands: listed, missing, stale }, null, 2))
  } else if (verb === "list") {
    for (const command of commands) {
      const mark = named.has(command.name) ? chalk.green("✓") : chalk.red("✗")
      session.out(`${mark} ${command.surface.padEnd(5)}  ${command.name}`)
    }
    if (stale.length) session.out(`\n${chalk.red("on the page, but no such command:")}\n  ${stale.join("\n  ")}`)
  } else {
    if (missing.length) session.out(`${chalk.red("not on the commands page:")}\n  ${missing.join("\n  ")}`)
    if (stale.length) session.out(`${chalk.red("on the commands page, but no such command:")}\n  ${stale.join("\n  ")}`)
    if (ok) session.err(chalk.green(`${commands.length} commands, every one on the commands page`))
    else session.err(`fix:  ${join(root, COMMANDS_JSON)} (rows' cli / skill / yarn names)`)
  }
  return verb === "check" && !ok ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

/**
 * Every command in checkout `root`, sorted by surface then name, each in the page's name form.
 * - yarn:  `<package> <script>` for the root's `package.json` (`root`), each `packages/*` one (its folder's name)
 *   and `packages/ui/site`'s (`ui-site`);  keys starting with `/` are section labels, not scripts
 * - CLI:  `spell <command>` / `spell dev <command>`, read from `packages/cli/src/main.ts`'s
 *   `program.command(...)` / `dev.command(...)` calls.  NOTE: the SOURCE, not this process's commander program:
 *   the checkout checked may not be the one `spell` runs from.
 * - skills:  `/<name>` for each `SKILL.md` in `.claude/skills/*` and `packages/docs/tools/goals/skills/*`, plus
 *   `sources.userSkills` found in `~/.claude/skills`;  minus `sources.ignore`
 */
export function commandSources(root: string, sources: CommandsData["sources"] = {}, home = homedir()): CommandSource[] {
  const found: CommandSource[] = []
  const packages = [["root", "package.json"]]
  for (const name of readdirSync(join(root, "packages"))) packages.push([name, join("packages", name, "package.json")])
  packages.push(["ui-site", join("packages", "ui", "site", "package.json")])
  for (const [name, path] of packages) {
    if (!existsSync(join(root, path))) continue
    const { scripts = {} } = JSON.parse(readFileSync(join(root, path), "utf8")) as { scripts?: Record<string, string> }
    for (const script of Object.keys(scripts)) {
      if (!script.startsWith("/")) found.push({ surface: "yarn", name: `${name} ${script}` })
    }
  }
  const main = join(root, "packages", "cli", "src", "main.ts")
  if (existsSync(main)) {
    for (const [, owner, name] of readFileSync(main, "utf8").matchAll(/\b(program|dev)\s*\.command\("([\w-]+)"/g)) {
      found.push({ surface: "cli", name: owner === "dev" ? `spell dev ${name}` : `spell ${name}` })
    }
  }
  const skillFolders = [join(root, ".claude", "skills"), join(root, "packages", "docs", "tools", "goals", "skills")]
  for (const folder of skillFolders) {
    if (!existsSync(folder)) continue
    for (const name of readdirSync(folder)) {
      if (existsSync(join(folder, name, "SKILL.md"))) found.push({ surface: "skill", name: `/${name}` })
    }
  }
  for (const name of sources.userSkills ?? []) {
    if (existsSync(join(home, ".claude", "skills", name, "SKILL.md")))
      found.push({ surface: "skill", name: `/${name}` })
  }
  const ignore = new Set(sources.ignore ?? [])
  const unique = new Map(found.filter((it) => !ignore.has(it.name)).map((it) => [it.name, it]))
  const order = { cli: 0, skill: 1, yarn: 2 }
  return [...unique.values()].sort((a, b) => order[a.surface] - order[b.surface] || a.name.localeCompare(b.name))
}

/** Every command name the page's rows give, in any surface's `names`. */
export function pageNames(data: CommandsData): Set<string> {
  const names = new Set<string>()
  for (const family of data.families ?? []) {
    for (const row of family.rows ?? []) {
      for (const cell of [row.cli, row.skill, row.yarn]) for (const name of [cell?.names ?? []].flat()) names.add(name)
    }
  }
  return names
}

/**
 * The parts of `commands.json` this reads;  its full shape:  `packages/docs/tools/_assets/commands.js`'s header.
 * - `sources.userSkills`:  skills in `~/.claude/skills` that count, e.g. `session`
 * - `sources.ignore`:  commands that need no row, e.g. `/solid-2` (reference only, runs nothing)
 */
export type CommandsData = {
  sources?: { userSkills?: string[]; ignore?: string[] }
  families?: { rows?: { cli?: CommandCell; skill?: CommandCell; yarn?: CommandCell }[] }[]
}

/** One surface's cell of a row:  the commands that do the operation. */
type CommandCell = { names?: string | string[] }

/** One command the repo has:  which surface, and its name in the page's form (`root plan-doc`, `/epic`). */
export type CommandSource = { surface: "cli" | "skill" | "yarn"; name: string }
