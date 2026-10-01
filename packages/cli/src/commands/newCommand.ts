import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs"
import { resolve } from "path"

import environment from "$/spell/node/environment"
import { SP } from "$/spell"
import { CLI } from "$/cli"

/**
 * `spell new <name>`:  make a spell project -- folder `<name>/`, holding `project.json` and a starter
 * `<name>.spell` which prints a hello, so `spell run` shows something straight away.
 * - In `--in <folder>`, or by default `@user`'s folder, `projects/user/`.
 * - Writes the files itself:  `projectUtils.createProject()` would go through `getIndex()`, which adds an
 *   `Untitled.spell`.
 * - Refuses a folder that's already there with anything in it.
 * - Returns the exit code.
 */
export async function newCommand(session: CLI.CliSession, args: string[], options: CLI.NewOptions): Promise<number> {
  const [name = ""] = args
  if (!/^[A-Za-z][\w-]*$/.test(name)) {
    throw new CLI.CliError(`'${name}' won't do as a project name:  a letter, then letters, digits, - or _`)
  }
  const parent = options.in ? resolve(options.in) : environment.userFilesRoot
  if (!existsSync(parent)) throw new CLI.CliError(`No such folder:  ${options.in ?? parent}`)
  const folder = resolve(parent, name)
  if (existsSync(folder) && readdirSync(folder).length) {
    const what = existsSync(resolve(folder, SP.PROJECT_FILE)) ? "a project" : "files"
    throw new CLI.CliError(`${session.relative(folder)} already holds ${what}`)
  }

  mkdirSync(folder, { recursive: true })
  const manifest = { imports: [{ path: `/${name}.spell`, active: true }] }
  writeFileSync(resolve(folder, SP.PROJECT_FILE), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(resolve(folder, `${name}.spell`), `// ${name}:  a new spell project\nprint "hello from ${name}"\n`)

  session.out(session.relative(folder))
  session.err(`Made ${name}:  try  spell run ${session.relative(folder)}`)
  return CLI.EXIT.OK
}
