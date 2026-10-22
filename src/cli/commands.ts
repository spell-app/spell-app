/**
 * spell-app's `spell` commands (its `package.json`'s `"spell": { "commands" }`, epic `repo-split` Q33):
 * - `spell app create <name>`:  a new spell project, in your space
 * - `spell app serve [project]`:  the editor and its page server, opened in a browser
 * - `spell app vscode [build|install]`:  the VS Code extension
 * - `spell projects [group]`:  the project groups, or one group's projects
 * - Under `app` on purpose (Owen's names, 2026-10-21), not only on a clash as Q33 has it.
 * - The language commands are spell-lang's list;  their work comes from here, through `hooks.ts`.
 * - Loads fast:  nothing of spell until a command runs.
 * - NOTE: `spell commands` reads this file's TEXT, for each `spell.command(...)` and `<group>.command(...)` call:
 *   keep each command's name a literal at its call.
 */
import type { Command } from "commander"

import { CLI } from "spell-kit/cli"
import { loadApp } from "./hooks"

export default function appCommands(spell: Command): void {
  const app = spell.command("app").description("the spell app:  a new project, the editor, the VS Code extension")

  app
    .command("create")
    .description("make a spell project:  <name>/__project.json5 and a starter <name>.spell")
    .argument("<name>", "the project's name, e.g. Snake")
    .option("--in <folder>", "make it in this folder -- default owen@spell's, your space in spell-spaces")
    .action((name: string, _options, command: Command) =>
      CLI.runCommand(async () => (await loadApp()).appCommands.create([name], command.optsWithGlobals()))
    )

  app
    .command("serve")
    .description("run the spell app -- editor and server, which saves to disk -- and open it, until Ctrl-C")
    .argument(
      "[project]",
      "open the editor on this, e.g. @spell/examples/drawable-solitaire -- default the project here, else the chooser"
    )
    .option(
      "--port <port>",
      "the editor's port, for a page server this starts -- default 3000, else any free one",
      (value) => Number(value)
    )
    .option("--headless", "don't open a browser:  just print the URL")
    .action((project: string | undefined, _options, command: Command) =>
      CLI.runCommand(async () =>
        (await loadApp()).appCommands.serve(project ? [project] : [], command.optsWithGlobals())
      )
    )

  const vscode = app
    .command("vscode")
    .description("the VS Code extension:  build its .vsix, install it into VS Code -- no verb does both")
    .option("--force", "build or install even from a branch behind main (which downgrades every window)")
    .action((options: { force?: boolean }) => vscodeCommand(undefined, options))

  vscode
    .command("build")
    .description("build the extension's .vsix")
    .option("--force", "even from a branch behind main")
    .action((_options, command: Command) => vscodeCommand("build", command.optsWithGlobals()))

  vscode
    .command("install")
    .description("install the built .vsix into VS Code")
    .option("--force", "even from a branch behind main")
    .action((_options, command: Command) => vscodeCommand("install", command.optsWithGlobals()))

  spell
    .command("projects")
    .description("list the project groups -- or, given one, the projects in it")
    .argument("[group]", "a project group, e.g. @spell/library or owen@spell")
    .option("--json", "print the list as JSON")
    .action((group: string | undefined, _options, command: Command) =>
      CLI.runCommand(async () =>
        (await loadApp()).appCommands.projects(group ? [group] : [], command.optsWithGlobals())
      )
    )
}

/** `spell app vscode [verb]`:  loads no spell (`vscodeCommand.ts`). */
function vscodeCommand(verb: string | undefined, options: { force?: boolean }): Promise<never> {
  return CLI.runCommand(async () => (await import("spell-app/cli/commands/vscodeCommand")).vscodeCommand(verb, options))
}
