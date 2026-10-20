import { SP } from "$/spell"
import { SPACES } from "$/spaces"
import type { V } from "$/ui/api"
// a leaf of Spell UI without its elements:  the `$/ui` barrel would define every tag
import { PropertyEditorPages } from "$/ui/property"
import { editor, runtimeCore } from "$/app/editor"
import type { SpellRuntime } from "$/app/runner"
import { ClassSchemas } from "$/app/ui/ClassSchemas"

/****************
 * ### `PropertyEditorFiles`
 * A project's property editor PAGES, e.g. `Card.editor.html`, as the editor's "New Property Editor..." makes them
 * (epic `property-editor` P6;  `editor.createPropertyEditor()`).
 *
 * - `typesOf()`:  the types a page can be made for.
 * - `schemaForType()`:  a type's properties, as what `<ui-property-editor>` reads.
 * - `fileNameFor()`:  the page's free name in the project.
 * - `pageFor()`:  the page's text, Spell UI's default page for the schema (`PropertyEditorPages.write()`).
 * - The editor loads this file through a DYNAMIC `import()`:  `editor.ts` stays free of `$/ui`.
 * - STATIC and instance-free:  it keeps nothing between calls.
 ****************/
export class PropertyEditorFiles {
  /** The types `project` declares, in order, from its declarations file;  `[]` before it's ever compiled. */
  static async typesOf(project: SP.SpellProject): Promise<string[]> {
    const declarations = await SP.SpellProject.declarationsOf(project)
    return declarations ? SPACES.TypeSchemas.typesIn(declarations) : []
  }

  /**
   * Type `type`'s properties, as a property editor's schema;  `undefined` if neither source knows the type.
   * - The RUNNING program's class wins, when the editor runs `project` (epic `property-editor` Q18, "both"):
   *   - it lists only the properties a thing STORES, which a person can set (`ClassSchemas`)
   *   - the declarations list worked-out ones too (`name`, `short suit`), with nothing to tell them apart
   * - Else `project`'s declarations file (`SPACES.TypeSchemas`):
   *   every compiled project has one, running or not.
   * - `running`:  the runtime's `core`, while it runs `project`.
   *   Default:  the editor's, when the program it ran last is `project` (`runningCoreFor()`).
   */
  static async schemaForType(
    project: SP.SpellProject,
    type: string,
    running: RunningCore | undefined = runningCoreFor(project)
  ): Promise<V.PropertySchema | undefined> {
    const Class = running?.things.classNamed(type)
    if (Class) return ClassSchemas.fromClass(Class)
    const declarations = await SP.SpellProject.declarationsOf(project)
    return declarations && SPACES.TypeSchemas.fromDeclarations(declarations, type)
  }

  /**
   * Name of `type`'s page in `project`:  `Card.editor.html`, else the first free of `Card2.editor.html` ...
   * - NEVER a page that's there:  a page is for tweaking by hand, so making one again never replaces it.
   *   The check-and-fix tool brings an old page up to date instead.
   * - `project` must be loaded:  it reads its files.
   */
  static fileNameFor(project: SP.SpellProject, type: string): string {
    for (let number = 1; ; number++) {
      const fileName = `${type}${number === 1 ? "" : number}${SP.EDITOR_PAGE_SUFFIX}`
      if (!project.getFile(fileName)) return fileName
    }
  }

  /** Text of `schema`'s default page:  its editor, with one `<ui-property>` per attribute. */
  static pageFor(schema: V.PropertySchema): string {
    return PropertyEditorPages.write(schema, document)
  }
}

/** What `schemaForType()` reads of a running program:  its classes, by name. */
export type RunningCore = {
  /** The program's things, and its classes by name. */
  things: Pick<SpellRuntime["core"]["things"], "classNamed">
}

/** The runtime's `core`, when the program the editor ran last is `project`;  else `undefined`. */
function runningCoreFor(project: SP.SpellProject): RunningCore | undefined {
  return editor.lastExecutedPath === project.path ? runtimeCore() : undefined
}
