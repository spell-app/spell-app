import type { Migration, MigrationContext } from "./migrations.types"
import { ReaderIsYou } from "./ReaderIsYou"
import { UpdatesAsEpicUpdate } from "./UpdatesAsEpicUpdate"

/****************
 * ### `Migrations`
 * Every MIGRATION of a plan doc's markup, in the order they run:  named, idempotent steps that bring an older doc up
 * to today's (`Migration`).
 * - The plan-doc tool runs them all on every write, before the command's change (`PlanDocFiles.edit()`):
 *   an older doc comes up to date the first time anything edits it, and a migrated one costs a read.
 * - A later phase of epic `epic-workflow` adds `epic migrate`, which runs them on every epic page on command:
 *   it calls `Migrations.run()` (or one step, `Migrations.named()`) on each doc, assembled.
 * - A new step:  a class implementing `Migration` in this folder, its instance added to `all`, last;
 *   it must change nothing on a doc it has migrated already, and keep every word.
 * - STATIC:  the registry.
 ****************/
export class Migrations {
  /** Every step, in the order they run. */
  static readonly all: readonly Migration[] = [new UpdatesAsEpicUpdate(), new ReaderIsYou()]

  /** The step called `name` (`updates-as-epic-update`);  `undefined` for none. */
  static named(name: string): Migration | undefined {
    return Migrations.all.find((step) => step.name === name)
  }

  /**
   * Run every step (or the steps named in `only`) on `document`, assembled, IN PLACE;  returns the names of the steps
   * that changed something, in order (none:  `[]`).
   */
  static run(document: Document, context: MigrationContext, only?: readonly string[]): string[] {
    const steps = only ? Migrations.all.filter((step) => only.includes(step.name)) : Migrations.all
    return steps.filter((step) => step.run(document, context)).map((step) => step.name)
  }
}
