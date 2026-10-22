import { readdirSync, readFileSync } from "fs"
import JSON5 from "json5"
import { resolve } from "path"

import { hasProjectFile, projectFileFor } from "spell-lang/spell/node/projectFile"
import { P } from "spell-lang/parser"
import { SP } from "spell-lang/spell"
import { parseSpellProject, type SpellSourceFile } from "spell-lang/spell/test"
import environment from "spell-app/spaces/server/node/environment"

/*
 * The frozen test projects' helpers:  each one read from disk, parsed and compiled headlessly, as a compile would.
 * - Node only, for tests:  imported as `spell-app/spaces/test`, never from spaces' barrel.
 * - spell-lang's `spell-lang/spell/test` parses and compiles the projects a test writes inline (`parseSpellProject()`);
 *   these are the ones on disk, spell-app's own.
 */

/**
 * Frozen projects tests run against, the `@spell/test` group.
 * - Their folder:  `spaces/@spell/test/<project>/` at spell-app's root, e.g. `solitaire`:
 *   spaces' `environment.testFilesRoot`, beside the other built-in groups (epic `spanish` P18).
 *   - spell-lang's until then (epic `repo-split` C11):  every `@spell` group is spell-app's now,
 *     so a test project may import the card library.
 * - Why:  tests assert exact lines, docstrings and compiled output, and the live examples get edited.
 * - Tests read ONLY here.
 *   So editing or deleting a built-in example (`spaces/@spell/examples/` ...) or your own project (spell.spaces)
 *   can't break one.
 * - NEVER update a fixture to follow its example:  it's frozen so tests don't move.
 *   - Change a test's input in the test, or add another fixture:
 *     copy a project in, then `yarn spell:test:fixtures:bless`.  See `compiledFixture()`.
 */
export const FIXTURES_DIR = environment.testFilesRoot

/** The fixtures' group, `@spell/test` (spaces' `PROJECT_GROUPS`). */
export const FIXTURES_GROUP = "@spell/test"

/** Path of `parts` under `FIXTURES_DIR`, e.g. `fixturePath("solitaire", "Card.spell")`. */
export function fixturePath(...parts: string[]): string {
  return resolve(FIXTURES_DIR, ...parts)
}

/**
 * Project id of fixture `projectName`, e.g. `@spell/test/solitaire` -- to load it as a `SpellProject`.
 * - Loads from disk in node, after `installDiskFetch()`.
 */
export function fixtureProjectId(projectName: string): string {
  return `${FIXTURES_GROUP}/${projectName}`
}

/**
 * The fixtures the Python writer writes, so far (epic `python-target`).
 * - Their Python snapshots are checked:  `.snapshot.py`, `.snapshot.pyright.txt`, and their page's `.elements.snapshot.js`.
 * - The core contract runs them under Python.
 * - Each phase adds the ones it makes write:  things and lists, pauses, drawing.
 */
export const PYTHON_FIXTURES = new Set([
  "card-table",
  "cards",
  "cards-from-zero",
  "drawable-solitaire",
  "fizzbuzz",
  "klondike",
  "outline-solitaire",
  "people",
  "solitaire",
  "thing-references"
])

/**
 * The fixtures compiled as a LIBRARY too (the `ts/lib` target, epic `people-and-orgs` P3).
 * - Their `.lib.snapshot.ts` is checked.
 * - Only fixtures that draw nothing:  a library can't.
 */
export const LIBRARY_FIXTURES = new Set(["people"])

/** Name of each fixture project:  each folder of `FIXTURES_DIR` with a project file, alphabetically. */
export function fixtureProjectNames(): string[] {
  return readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && hasProjectFile(resolve(FIXTURES_DIR, entry.name)))
    .map((entry) => entry.name)
    .sort()
}

/**
 * Fixture `projectName` compiled as `SpellProject` would write its `<Project>.spell.js`.
 * - Parsed headlessly, with `parseSpellProject()`:  `import`s, then each file's code in `project.json` order.
 * - Its declarations, as its `<Project>.declarations.json5`:  `fixtureDeclarations()`.
 * - `target`:  compiled for that target, e.g. `ts/solid` (see `SP.TARGETS`);
 *   or a writer itself, e.g. a test's own.
 */
export function compiledFixture(projectName: string, target: string | P.ProgramWriter = SP.RUNNING_TARGET): string {
  return compileFixture(projectName, target).code
}

/** Does fixture `projectName` draw:  hold a drawing (JSX) anywhere?  Then a Python target writes its page too. */
export function fixtureDraws(projectName: string): boolean {
  return compileFixture(projectName).draws
}

/** Fixture `projectName`'s declarations, as its `<Project>.declarations.json5` would hold them -- see `compileFixture()`. */
export function fixtureDeclarations(projectName: string): string {
  return JSON.stringify(compileFixture(projectName).declarations, null, 2) + "\n"
}

/** The human language fixture `projectName` is written in, from its project file:  `en` when it names none. */
export function fixtureLanguage(projectName: string): string {
  return readProjectFile(fixturePath(projectName)).language ?? "en"
}

/**
 * Fixture `projectName`'s words, as its `<Project>.<lang>.js` would hold them (`cards.en.js`, `cartas.es.js`):
 * from its declarations, by javascript's names -- see `SP.SpellWords`.
 */
export function fixtureWords(projectName: string): string {
  return SP.SpellWords.script(SP.SpellWords.of(compileFixture(projectName).declarations), projectName)
}

/**
 * Fixture `projectName` compiled as `SpellProject` would:  its `code` and its `declarations`.
 * - Files combine through the SAME `SP.SpellProject.combineCompiled()`, so a class gets members from every file.
 *   They split through the same `SP.SpellDeclarations.split()`.
 * - Its `.css` files compile as `SpellCSSFile` does:  the whole text through the root scope's `css` rule.
 * - Parse errors lead its code, as comments, so a snapshot of it shows them too.
 * - Against the fixtures it imports, e.g. `@spell/test/cards`:
 *   - their declarations, as a compiled import's (see `fixtureImportScope()`)
 *   - NOT their code:  that's theirs
 * - `version` / `exports` / `listsStartAt` from its `project.json`, as a compile would.
 * - `target`'s writer writes it, `js/solid`'s by default -- or `target` itself, a writer.
 * - `draws`:  does it hold a drawing -- see `SP.SpellProject.draws()`.
 */
function compileFixture(
  projectName: string,
  target: string | P.ProgramWriter = SP.RUNNING_TARGET
): { code: string; declarations: SP.SpellDeclarationsData; draws: boolean } {
  const projectDir = fixturePath(projectName)
  const { version, exports, imports, listsStartAt, language } = readProjectFile(projectDir)
  const parentScope = fixtureImportScope(projectName)
  const { scope, files } = parseSpellProject(loadFixtureProject(projectName), { parentScope })
  const errors = files.flatMap(({ path, errors }) => errors.map((error) => `// PARSE ERROR ${path}:${error}\n`))
  const parts = imports
    .filter(({ path, active }) => active !== false && /\.(spell|css)$/.test(path))
    .map(({ path }) => {
      if (path.endsWith(".css")) return compiledCSS(readFileSync(resolve(projectDir, `.${path}`), "utf8"))
      const file = files.find((it) => it.path === path)!
      return file.match?.AST instanceof P.ASTStatementGroup ? file.match.AST : file.compiled
    })
  const writer = typeof target === "string" ? SP.targetFor(target).writer : target
  const importLines = SP.SpellProject.importHeaderFor(scope, writer)
  const marked =
    errors.join("") +
    scope.parser!.inPlay(() => SP.SpellProject.combineCompiled(parts, writer, importLines, scope, { listsStartAt })) +
    "\n"
  return {
    ...SP.SpellDeclarations.split(marked, scope, { version, exports, language }),
    draws: SP.SpellProject.draws(parts)
  }
}

/**
 * The fixtures fixture `projectName` imports, by the module its compiled code imports each from.
 * - e.g. `{ "@spell/project/@spell/test/cards": "Cards" }`
 * - none:  `{}`
 * - throws if it imports a project that isn't a fixture:  tests read ONLY `FIXTURES_DIR`.
 */
export function fixtureImports(projectName: string): Record<string, string> {
  const fixtures = `${FIXTURES_GROUP}/`
  const imported: Record<string, string> = {}
  for (const { path, active } of readProjectFile(fixturePath(projectName)).imports) {
    if (active === false || /\.(spell|css)$/.test(path)) continue
    const projectId = SP.SpellProject.projectIdForImport(path)
    if (!projectId.startsWith(fixtures)) {
      throw new TypeError(`fixtureImports():  fixture ${projectName} imports ${path}, which isn't a fixture`)
    }
    imported[moduleFor(projectId)] = projectId.slice(fixtures.length)
  }
  return imported
}

/**
 * The import layer fixture `projectName` parses under:  the declarations of each fixture it imports,
 * as `SpellProject.loadImportScope()` loads a compiled import's.
 * - Imports none:  the root scope.
 */
function fixtureImportScope(projectName: string): P.Scope {
  const { imports } = readProjectFile(fixturePath(projectName))
  const loaded: SP.DeclarationsImport[] = Object.entries(fixtureImports(projectName)).map(([module, fixture]) => {
    const { path, import: picks } = imports.find(
      (it) => moduleFor(SP.SpellProject.projectIdForImport(it.path)) === module
    )!
    const projectId = SP.SpellProject.projectIdForImport(path)
    return { from: path, projectId, declarations: compileFixture(fixture).declarations, import: picks, module }
  })
  // the fixture's language's root:  its project file says which, English if none
  const root = SP.Language.for(readProjectFile(fixturePath(projectName)).language).rootScope
  return loaded.length ? SP.SpellDeclarations.importScope(root, loaded) : root
}

/** The module compiled code imports project `projectId` from, e.g. `@spell/project/@spell/test/cards`. */
function moduleFor(projectId: string): string {
  return `${SP.SPELL_PROJECT_MODULE}${encodeURI(projectId)}`
}

/** `{ path, contents }` of each spell file in fixture `projectName`, in its project file's order -- see `FIXTURES_DIR`. */
export function loadFixtureProject(projectName: string): SpellSourceFile[] {
  const projectDir = fixturePath(projectName)
  return readProjectFile(projectDir)
    .imports.filter(({ path, active }) => active !== false && path.endsWith(".spell"))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(projectDir, `.${path}`), "utf8") }))
}

/** CSS `contents` compiled as `SpellCSSFile.compile()` does:  one `P.TextToken`, through the root scope's `css` rule. */
function compiledCSS(contents: string): string {
  const scope = SP.SpellParser.rootScope
  const token = new P.TextToken({ value: contents, raw: contents, start: 0 })
  return String(scope.parser!.parse([token], "css", scope)?.compile())
}

/** The project file of the project in `projectDir`, read:  `__project.json5`, or an old `project.json`. */
function readProjectFile(projectDir: string): {
  version?: string
  exports?: string[]
  imports: Array<{ path: string; active?: boolean; import?: string[] }>
  listsStartAt?: 0 | 1
  language?: string
} {
  return JSON5.parse(readFileSync(projectFileFor(projectDir), "utf8"))
}
