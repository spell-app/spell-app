import { readdirSync, readFileSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"

import { SP } from "spell-lang/spell"
import { SPACES } from "spell-app/spaces"
import { PropertyEditorPages, type PageProblem } from "spell-ui/property"
import { CLI } from "spell-app/cli"

/****************
 * ### `EditorPages`
 * A project's EDITOR PAGES, checked against its types, for `spell lint` (epic `property-editor` P6, decision Q17).
 * - An editor page is a property editor's layout, saved as plain markup:  `Card.editor.html`.
 *   - Its root is `<ui-property-editor schema="Card">`, whose `schema` names one of the project's types.
 *   - Inside:  a `<ui-property name>` per property, in `<ui-property-group>`s or not.
 * - The type's properties come from the project's declarations (`SPACES.TypeSchemas`),
 *   compiled just now, in memory:  so a page is checked against the source as it is.
 * - What's wrong with a page, and how to put it right, is Spell UI's `PropertyEditorPages`.
 *   This class finds the pages, reads each into a DOM (linkedom's, in node),
 *   and says where on the page each problem is.
 * - Each problem is a `CLI.Problem`, so `spell lint` prints it as it does any other (`path:line:col  message`).
 ****************/
export class EditorPages {
  /** The run. */
  readonly session: CLI.CliSession
  /** The project whose pages these are. */
  readonly project: SP.SpellProject

  constructor(session: CLI.CliSession, project: SP.SpellProject) {
    this.session = session
    this.project = project
  }

  /** Paths of the project's editor pages:  its folder's `*.editor.html` files, and its sub-folders'. */
  get paths(): string[] {
    const folder = this.project.location.serverPath
    const names = readdirSync(folder, { recursive: true, encoding: "utf8" })
    return names
      .filter((name) => name.endsWith(SP.EDITOR_PAGE_SUFFIX) && !name.split(/[/\\]/).some(isSkippedFolder))
      .sort()
      .map((name) => resolve(folder, name))
  }

  /**
   * Check each page against the project's types;  with `fix`, put each right and write it back.
   * - Returns what's wrong (`problems`) and, with `fix`, what it put right (`fixes`):
   *   a fixed problem is in `fixes` only, where it WAS on the page.
   * - What a fix can't put right stays a problem:  a page with no editor, or naming no type of the project.
   * - NEVER writes a test project's page (`tests/spaces/@spell/test/`):  they stay frozen.
   * - SIDE EFFECT:  compiles the project in memory, writing nothing, when it has pages -- see `declarations()`.
   */
  async check({ fix = false }: { fix?: boolean } = {}): Promise<EditorPageResults> {
    const results: EditorPageResults = { pages: 0, problems: [], fixes: [] }
    const paths = this.paths
    if (!paths.length) return results
    const declarations = await this.declarations()
    const { parseHTML } = await import("linkedom")
    for (const path of paths) {
      results.pages++
      const text = readFileSync(path, "utf8")
      const { document } = parseHTML(`<!doctype html><html><body>${text}</body></html>`)
      const editor = PropertyEditorPages.editorIn(document)
      const problem = (message: string, at = { line: 1, column: 1 }): CLI.Problem => ({
        project: this.project.projectId,
        path,
        ...at,
        message
      })
      if (!editor) {
        results.problems.push(problem(`no <ui-property-editor> on the page`))
        continue
      }
      const editorAt = EditorPages.positionOf(text, EDITOR_START)
      const type = editor.getAttribute("schema")
      if (!type) {
        results.problems.push(
          problem("its <ui-property-editor> has no `schema`:  name one of the project's types", editorAt)
        )
        continue
      }
      const schema = declarations && SPACES.TypeSchemas.fromDeclarations(declarations, type)
      if (!schema) {
        const known = declarations ? SPACES.TypeSchemas.typesIn(declarations).join(", ") : ""
        const message = declarations
          ? `\`schema="${type}"\` names no type of ${this.project.projectName}${known && ` (it has ${known})`}`
          : `can't read ${this.project.projectName}'s types:  it doesn't compile`
        results.problems.push(problem(message, EditorPages.positionOf(text, schemaAttribute(type)) ?? editorAt))
        continue
      }

      const found = PropertyEditorPages.check(editor, schema)
      const located = found.map((it) => problem(it.message, EditorPages.problemAt(text, it) ?? editorAt))
      if (!fix || !found.length) {
        results.problems.push(...located)
        continue
      }
      if (CLI.isTestProject(path)) {
        results.problems.push(...located, problem("won't fix a test project's page:  they stay frozen", editorAt))
        continue
      }
      PropertyEditorPages.fix(editor, schema)
      writeFileSync(path, PropertyEditorPages.text(editor))
      results.fixes.push(...located.map((it, index) => ({ ...it, message: fixedMessage(found[index]!) })))
    }
    return results
  }

  /**
   * Compile each page into a module defining its `<type-editor>` (`PropertyEditorPages.compile()`),
   * beside the project's own output:  `Card.editor.html` => `Card.editor.js` (epic `property-editor` P7, Q19).
   * - Run it after `spell compile` has compiled and SAVED the project:
   *   it reads each page's type from the declarations just saved.
   * - Returns the files written, and a note per page it couldn't compile (no editor, no such type).
   * - SIDE EFFECT:  writes the modules.
   */
  async compile(): Promise<{ wrote: string[]; notes: string[] }> {
    const results = { wrote: [] as string[], notes: [] as string[] }
    const paths = this.paths
    if (!paths.length) return results
    const declarations = SP.SpellDeclarations.read(String(this.project.declarationsFile.contents ?? ""))
    const folder = dirname(this.project.outputFile.location.serverPath)
    const { parseHTML } = await import("linkedom")
    for (const path of paths) {
      const name = path.split(/[/\\]/).pop()!
      const { document } = parseHTML(`<!doctype html><html><body>${readFileSync(path, "utf8")}</body></html>`)
      const editor = PropertyEditorPages.editorIn(document)
      const type = editor?.getAttribute("schema")
      const schema = type && declarations ? SPACES.TypeSchemas.fromDeclarations(declarations, type) : undefined
      if (!editor || !schema) {
        results.notes.push(`${name} not compiled:  ${editor ? `no type \`${type ?? ""}\`` : "no <ui-property-editor>"}`)
        continue
      }
      const target = resolve(folder, name.slice(0, -SP.EDITOR_PAGE_SUFFIX.length) + COMPILED_SUFFIX)
      writeFileSync(target, PropertyEditorPages.compile(editor, schema).text)
      results.wrote.push(target)
    }
    return results
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * The project's declarations:  compiled now, in memory (`save: false`), so they match its source.
   * - A project that won't compile:  what it last compiled to, from its declarations file;  `undefined` if none.
   */
  private async declarations(): Promise<SPACES.Declarations | undefined> {
    try {
      await this.project.compile(undefined, { save: false })
      const compiled = SP.SpellDeclarations.read(String(this.project.declarationsFile.contents ?? ""))
      if (compiled) return compiled
    } catch {
      // its errors are check's own to list:  fall back on its last compile
    }
    return SP.SpellProject.declarationsOf(this.project)
  }

  /**
   * Where `problem` is in page `text`:  its property's `name`, or for a `missing` one, the editor's start tag.
   * - `undefined` if it can't be found, e.g. a name written another way than `name="..."`.
   */
  private static problemAt(text: string, problem: PageProblem): Position | undefined {
    if (problem.kind === "missing") return EditorPages.positionOf(text, EDITOR_START)
    return EditorPages.positionOf(text, propertyName(problem.name))
  }

  /** Where `pattern`'s first match starts in `text`, from 1, past its first group if it has one. */
  private static positionOf(text: string, pattern: RegExp): Position | undefined {
    const match = pattern.exec(text)
    if (!match) return undefined
    const offset = match.index + (match[1]?.length ?? 0)
    const before = text.slice(0, offset).split("\n")
    return { line: before.length, column: before.at(-1)!.length + 1 }
  }
}

/**
 * What `EditorPages.check()` found.
 * - `pages`:  how many it checked
 * - `problems`:  what's wrong, and with `fix`, what it couldn't put right
 * - `fixes`:  what it put right, each a problem saying so (`fixed:  ...`), where it was before the fix
 */
export type EditorPageResults = {
  pages: number
  problems: CLI.Problem[]
  fixes: CLI.Problem[]
}

/** A compiled page's file name ends so:  `Card.editor.js`. */
const COMPILED_SUFFIX = ".editor.js"

/** A line and column, from 1. */
type Position = { line: number; column: number }

/** Folders never searched for pages:  hidden ones, and installed packages. */
function isSkippedFolder(name: string): boolean {
  return name.startsWith(".") || name === "node_modules"
}

/** The editor's start tag, at its `<`. */
const EDITOR_START = /<ui-property-editor\b/

/** A property's `name="<name>"`, at `name`. */
function propertyName(name: string): RegExp {
  return new RegExp(`(<ui-property\\b[^>]*?\\s)name\\s*=\\s*["']${escapeRegExp(name)}["']`)
}

/** The editor's `schema="<type>"`, at `schema`. */
function schemaAttribute(type: string): RegExp {
  return new RegExp(`(<ui-property-editor\\b[^>]*?\\s)schema\\s*=\\s*["']${escapeRegExp(type)}["']`)
}

/** `text` safe inside a regular expression. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** What a fix did about `problem`, in words. */
function fixedMessage(problem: PageProblem): string {
  return `fixed:  ${problem.message} -- ${FIX_DONE[problem.kind]}`
}

/** What `PropertyEditorPages.fix()` does for each kind of problem. */
const FIX_DONE: Record<PageProblem["kind"], string> = {
  dropped: "took it off the page",
  missing: 'added it to the "Other" group',
  control: "took its `as` off, back to its type's own control"
}
