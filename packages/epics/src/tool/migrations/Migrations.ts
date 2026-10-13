import { LinksAgree } from "./LinksAgree"
import type { Migration, MigrationContext } from "./migrations.types"
import { ReaderIsYou } from "./ReaderIsYou"
import { UpdatesAsEpicUpdate } from "./UpdatesAsEpicUpdate"

/****************
 * ### `Migrations`
 * Every MIGRATION of an epic page's markup, in the order they run (oldest first):  named, dated, idempotent steps
 * that bring an older page up to today's (`Migration`).  The epic page's share of the steps by page kind (J44 of
 * epic `epic-workflow`);  the docs package holds the other kinds' (`packages/epics/tools/migrate.js`).
 * - `spell dev plan-doc migrate` runs them on every epic page on command (`MigrateCommands`), under each page's lock
 * - every write runs the cheap ones too (`everyEdit`), before the command's change (`PlanDocFiles.edit()`):
 *   an older doc comes up to date the first time anything edits it, and a migrated one costs a read
 * - A new step:  a class implementing `Migration` in this folder, its instance added to `all`, LAST, in the same
 *   commit as the markup change it follows (epics' `AGENTS.md`, "Rules");
 *   it must change nothing on a doc it has migrated already, and keep every word.
 * - STATIC:  the registry.
 ****************/
export class Migrations {
  /** Every step, in the order they run:  oldest first. */
  static readonly all: readonly Migration[] = [new UpdatesAsEpicUpdate(), new ReaderIsYou(), new LinksAgree()]

  /** The steps every edit runs too (`PlanDoc.migrate()`):  the cheap markup ones. */
  static get everyEdit(): readonly Migration[] {
    return Migrations.all.filter((step) => step.everyEdit)
  }

  /** The step called `name` (`updates-as-epic-update`);  `undefined` for none. */
  static named(name: string): Migration | undefined {
    return Migrations.all.find((step) => step.name === name)
  }

  /**
   * Run every step (or the steps named in `only`) on `document`, assembled, IN PLACE;  returns the names of the steps
   * that changed something, in order (none:  `[]`).
   * - `steps`:  which to choose from (default:  `all`)
   */
  static run(
    document: Document,
    context: MigrationContext,
    only?: readonly string[],
    steps: readonly Migration[] = Migrations.all
  ): string[] {
    const chosen = only ? steps.filter((step) => only.includes(step.name)) : steps
    return chosen.filter((step) => step.run(document, context)).map((step) => step.name)
  }
}
