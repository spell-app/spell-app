import chalk from "chalk"
import { existsSync, readFileSync, readdirSync } from "fs"
import { homedir } from "os"
import { join } from "path"

import { CLI } from "$/cli"
import { COMMANDS_JSON } from "$/cli/dev/dev.types"
import { contentFolderOf } from "@spell-app/assembler/contentFolder"
import { DataFile } from "@spell-app/assembler/DataFile"

export { COMMANDS_JSON }

/**
 * `spell dev commands [list|check]`:  every command the repo has, against the commands page.
 * - the commands:  yarn scripts, `spell` commands, skills
 * - the page's data:  `commands.json5` (`guides/dev/commands/`, in the shared content folder), which maps each command
 *   to the operations it does
 * - `list` (default):  every command, with whether the page names it (`✓` / `✗`)
 * - `check`:  just the problems:  commands the page never names, and names on the page no command has
 *   - exits 1 if there are any
 *   - run it after adding, renaming or removing a command (root `yarn commands:check`)
 * - `--json`:  `{ commands: [{ name, surface, named }], missing, stale }`
 * - Which checkout:  the nearest one from the current folder up (`CLI.findCheckout()`), so a worktree checks its own.
 *   Its page's data:  in the repo's content folder (`contentFolderOf()`), with no link at the checkout's root.
 * - What counts:  `commandSources()`;  what the page names:  `pageNames()`.
 */
export async function commandsCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.CommandsOptions
): Promise<number> {
  const [verb = "list"] = args
  if (verb !== "list" && verb !== "check") throw new CLI.CliError(`unknown verb '${verb}':  list or check`)
  const root = CLI.findCheckout("tsconfig.base.json")
  const content = contentFolderOf(root) ?? root
  const file = join(content, COMMANDS_JSON)
  const data = DataFile.read<CommandsData>(file)
  if (!data) throw new CLI.CliError(`no ${COMMANDS_JSON} in ${content}`)
  const commands = commandSources(root, data.sources)
  const named = pageNames(data)
  const missing = commands.filter((command) => !named.has(command.name)).map((command) => command.name)
  const known = new Set(commands.map((command) => command.name))
  // the page is shared by every checkout (epic `shared-content`):  a yarn row of a package THIS checkout lacks (a
  // branch's new package, not merged yet) is another branch's, not stale
  const here = packageNames(root)
  const unknown = [...named].filter((name) => !known.has(name)).sort()
  const elsewhere = unknown.filter((name) => isYarnName(name) && !here.has(name.split(" ")[0]!))
  const stale = unknown.filter((name) => !elsewhere.includes(name))
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
    if (elsewhere.length) {
      const packages = [...new Set(elsewhere.map((name) => name.split(" ")[0]))].join(", ")
      session.err(chalk.dim(`(${elsewhere.length} rows for packages this checkout doesn't have:  ${packages})`))
    }
    if (ok) session.err(chalk.green(`${commands.length} commands, every one on the commands page`))
    else session.err(`fix:  ${DataFile.found(file)} (rows' cli / skill / yarn names)`)
  }
  return verb === "check" && !ok ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

/** The yarn package names checkout `root` has, as the page writes them:  `root`, `ui-site`, each `packages/*`. */
function packageNames(root: string): Set<string> {
  const names = new Set(["root", "ui-site"])
  for (const name of readdirSync(join(root, "packages"))) {
    if (existsSync(join(root, "packages", name, "package.json"))) names.add(name)
  }
  return names
}

/** A yarn command's page name, `<package> <script>`:  not a skill (`/name`), a `spell` or an `epic` command. */
function isYarnName(name: string): boolean {
  return !name.startsWith("/") && !name.startsWith("spell ") && !name.startsWith("epic ")
}

/**
 * Every command in checkout `root`, sorted by surface then name, each in the page's name form.
 * - yarn:  `<package> <script>` for the root's `package.json` (`root`), each `packages/*` one (its folder's name)
 *   and `packages/ui/site`'s (`ui-site`);  keys starting with `/` are section labels, not scripts
 * - CLI:  `spell <command>` / `spell dev <command>` / `epic <verb>`, read from `CLI_SOURCES`'
 *   `program.command(...)` / `dev.command(...)` / `epic.command(...)` calls.  NOTE: the SOURCE, not this process's
 *   commander program:  the checkout checked may not be the one `spell` runs from.
 * - skills:  `/<name>` for each `SKILL.md` in `SKILL_FOLDERS` (the repo's `.claude/skills/*`, spell-epic's
 *   `skills/*`), plus `sources.userSkills` found in `~/.claude/skills`;  minus `sources.ignore`
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
  for (const file of CLI_SOURCES) {
    const path = join(root, file)
    if (!existsSync(path)) continue
    for (const [, owner, name] of readFileSync(path, "utf8").matchAll(
      /\b(program|dev|epic)\s*\.command\("([\w-]+)"/g
    )) {
      found.push({ surface: "cli", name: `${OWNER_PREFIX[owner as keyof typeof OWNER_PREFIX]}${name}` })
    }
  }
  for (const folder of SKILL_FOLDERS.map((each) => join(root, each))) {
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

/**
 * The files, from a checkout's root, whose `program.command(...)` / `dev.command(...)` / `epic.command(...)` calls
 * are the CLI's commands.
 * - `devProgram.ts`:  the `spell dev` tree, since 2026-10-04;  `main.ts` held it before
 * - `EpicProgram.ts`:  the `epic` command's verbs, spell-epic's, through the checkout's `spell-epic` link
 *   (epic `epic-eject` I5;  `packages/epics/src/command/` since P5, `packages/cli/src/epicProgram.ts` before)
 */
const CLI_SOURCES = [
  "packages/cli/src/main.ts",
  "packages/cli/src/devProgram.ts",
  "spell-epic/src/command/EpicProgram.ts"
]

/**
 * The folders, from a checkout's root, whose `<name>/SKILL.md` are skills:  the repo's own, and the epic skills,
 * spell-epic's plugin's, through the checkout's `spell-epic` link (epic `epic-eject` I5).
 */
const SKILL_FOLDERS = [join(".claude", "skills"), join("spell-epic", "skills")]

/** Each receiver's commands, as the page names them:  `program.command("compile")` is `spell compile`. */
const OWNER_PREFIX = { program: "spell ", dev: "spell dev ", epic: "epic " }

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
 * The parts of `commands.json5` this reads;  its full shape:  spell-epic's `src/tools/_assets/commands.js`'s header.
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
