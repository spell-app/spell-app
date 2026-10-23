import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "fs"
import JSON5 from "json5"
import { basename, resolve } from "path"

import { hasProjectFile, projectFileFor } from "spell-parser/spell/node/projectFile"
import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { parseSpellProject, type SpellSourceFile } from "spell-parser/spell/test"
import environment from "spell-app/spaces/server/node/environment"

/*
 * The test projects' helpers:  each one read from disk, parsed and compiled headlessly, as a compile would.
 * - Node only, for tests:  imported as `spell-app/spaces/test`, never from spaces' barrel.
 * - spell-parser's `spell-parser/spell/test` parses and compiles the projects a test writes inline (`parseSpellProject()`);
 *   these are the ones on disk, spell-app's own.
 * - Two kinds, each by its name, e.g. `fizzbuzz`, `Solitaire`:
 *   - the FROZEN test projects, `@spell/test` (`FIXTURES_DIR`):  tests' own, never edited to follow anything
 *   - a few built-in EXAMPLES, `@spell/examples` (`EXAMPLE_FIXTURES`):  read where they are, so they're tested as
 *     they are;  their snapshots are tests' own, in `EXAMPLE_SNAPSHOTS_DIR`
 */

/**
 * Frozen projects tests run against, the `@spell/test` group.
 * - Their folder:  `spaces/@spell/test/<project>/` at spell-app's root, e.g. `fizzbuzz`:
 *   spaces' `environment.testFilesRoot`, beside the other built-in groups (epic `spanish` P18).
 *   - spell-parser's until then (epic `repo-split` C11):  every `@spell` group is spell-app's now.
 * - Why:  tests assert exact lines, docstrings and compiled output, and your own projects get edited.
 * - Their snapshots are beside them:  `fizzbuzz.snapshot.js` ...
 * - NEVER update a fixture to follow an example:  it's frozen so tests don't move.
 *   - Change a test's input in the test, or add another fixture:
 *     copy a project in, then `yarn spell:test:fixtures:bless`.  See `compiledFixture()`.
 */
export const FIXTURES_DIR = environment.testFilesRoot

/** The fixtures' group, `@spell/test` (spaces' `PROJECT_GROUPS`). */
export const FIXTURES_GROUP = "@spell/test"

/**
 * The built-in examples tested as they are, by their names in `@spell/examples` (epic `spanish` P21).
 * - Solitaire, and Solitario, its Spanish twin:  each a whole game, its own cards, deck and piles in it.
 * - NOT frozen:  read from `spaces/@spell/examples/<name>/`, where people (and agents) edit them.
 *   - A change to one changes its snapshots:  `yarn spell:test:fixtures:bless`, then read the diff.
 * - Their snapshots are tests', never beside the example:  `EXAMPLE_SNAPSHOTS_DIR`.
 */
export const EXAMPLE_FIXTURES = new Set(["Solitaire", "Solitario"])

/** The examples' group, `@spell/examples`:  where `EXAMPLE_FIXTURES` are read from. */
export const EXAMPLES_GROUP = "@spell/examples"

/**
 * Folder of the snapshots of `EXAMPLE_FIXTURES`:  `tests/spell/__examples__/<name>/`, at spell-app's root.
 * - So an example's folder holds only what a person wrote, and what compiling it writes beside it.
 */
export const EXAMPLE_SNAPSHOTS_DIR = resolve(environment.repoDir, "tests", "spell", "__examples__")

/** Path of `parts` under `FIXTURES_DIR`, e.g. `fixturePath("fizzbuzz", "FizzBuzz.spell")`. */
export function fixturePath(...parts: string[]): string {
  return resolve(FIXTURES_DIR, ...parts)
}

/**
 * Path of snapshot `file` of test project `projectName`:
 * - a frozen fixture's beside it, `spaces/@spell/test/fizzbuzz/fizzbuzz.snapshot.js`
 * - an example's in `EXAMPLE_SNAPSHOTS_DIR`, `tests/spell/__examples__/Solitaire/Solitaire.snapshot.js`
 */
export function snapshotPath(projectName: string, file: string): string {
  if (EXAMPLE_FIXTURES.has(projectName)) return resolve(EXAMPLE_SNAPSHOTS_DIR, projectName, file)
  return fixturePath(projectName, file)
}

/**
 * Project id of test project `projectName`, e.g. `@spell/test/fizzbuzz`, `@spell/examples/Solitaire` --
 * to load it as a `SpellProject`.
 * - Loads from disk in node, after `installDiskFetch()`.
 */
export function fixtureProjectId(projectName: string): string {
  return `${EXAMPLE_FIXTURES.has(projectName) ? EXAMPLES_GROUP : FIXTURES_GROUP}/${projectName}`
}

/**
 * The fixtures the Python writer writes, so far (epic `python-target`).
 * - Their Python snapshots are checked:  `.snapshot.py`, `.snapshot.pyright.txt`, and their page's `.elements.snapshot.js`.
 * - The core contract runs them under Python.
 * - Each phase adds the ones it makes write:  things and lists, pauses, drawing.
 */
export const PYTHON_FIXTURES = new Set([
  "counter",
  "counter-app",
  "fizzbuzz",
  "lists-from-zero",
  "people",
  "Solitaire",
  "thing-references"
])

/**
 * The fixtures compiled as a LIBRARY too (the `ts/lib` target, epic `people-and-orgs` P3).
 * - Their `.lib.snapshot.ts` is checked.
 * - Only fixtures that draw nothing:  a library can't.
 */
export const LIBRARY_FIXTURES = new Set(["people"])

/**
 * Name of each test project:  each folder of `FIXTURES_DIR` with a project file, alphabetically,
 * then `EXAMPLE_FIXTURES`.
 */
export function fixtureProjectNames(): string[] {
  const frozen = readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && hasProjectFile(resolve(FIXTURES_DIR, entry.name)))
    .map((entry) => entry.name)
    .sort()
  return [...frozen, ...EXAMPLE_FIXTURES]
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

/**
 * The human languages fixture `projectName`'s files are written in, by their names, the one it speaks first:
 * `["es"]` for `Solitario`, whose files are `Carta.es.spell` ... -- see `SP.SpellDeclarations.languagesOf()`.
 * - It has a words file in each:  `fixtureWords()`.
 */
export function fixtureLanguages(projectName: string): string[] {
  return SP.SpellDeclarations.languagesOf(compileFixture(projectName).declarations)
}

/**
 * Fixture `projectName`'s words in `lang`, as its `<Project>.<lang>.js` would hold them (`Solitaire.en.js`, `Solitario.es.js`):
 * from its declarations, by javascript's names -- see `SP.SpellWords`.
 * - `lang`:  the one it speaks, by default (`fixtureLanguages()`).
 */
export function fixtureWords(projectName: string, lang = fixtureLanguages(projectName)[0]!): string {
  const words = SP.SpellWords.of(compileFixture(projectName).declarations, P.JSWriter.instance, lang)
  return SP.SpellWords.script(words, projectName)
}

/**
 * Fixture `projectName` compiled as `SpellProject` would:  its `code` and its `declarations`.
 * - Files combine through the SAME `SP.SpellProject.combineCompiled()`, so a class gets members from every file.
 *   They split through the same `SP.SpellDeclarations.split()`.
 * - Its `.css` files compile as `SpellCSSFile` does:  the whole text through the root scope's `css` rule.
 * - Parse errors lead its code, as comments, so a snapshot of it shows them too.
 * - Against the projects it imports, e.g. `counter-app` the counter library, `@spell/test/counter`:
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
  const projectDir = fixtureFolder(projectName)
  const { version, exports, imports, listsStartAt } = readProjectFile(projectDir)
  const parentScope = fixtureImportScope(projectName)
  const sources = loadFixtureProject(projectName)
  // each file's language, by its name:  `Carta.es.spell` is Spanish (epic `spanish` P19)
  const languages = [...new Set(sources.map(({ path }) => SP.Language.forFile(path).lang))]
  const { scope, files } = parseSpellProject(sources, { parentScope })
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
    ...SP.SpellDeclarations.split(marked, scope, { version, exports, languages }),
    draws: SP.SpellProject.draws(parts)
  }
}

/**
 * The projects test project `projectName` imports, by the module its compiled code imports each from.
 * - e.g. `{ "@spell/project/@spell/test/counter": "counter" }`
 * - Each by its name, as the fixture helpers take it.
 * - none:  `{}`
 * - throws if it imports a project that isn't a frozen fixture:
 *   tests read ONLY `FIXTURES_DIR`, and `EXAMPLE_FIXTURES`.
 */
export function fixtureImports(projectName: string): Record<string, string> {
  const fixtures = `${FIXTURES_GROUP}/`
  const imported: Record<string, string> = {}
  for (const { path, active } of readProjectFile(fixtureFolder(projectName)).imports) {
    if (active === false || /\.(spell|css)$/.test(path)) continue
    const projectId = SP.SpellProject.projectIdForImport(path)
    if (!projectId.startsWith(fixtures))
      throw new TypeError(`fixtureImports():  ${projectName} imports ${path}, which isn't a frozen fixture`)
    imported[moduleFor(projectId)] = projectId.slice(fixtures.length)
  }
  return imported
}

/**
 * Path of `parts` in test project `projectName`'s folder:  a frozen fixture's (`FIXTURES_DIR`), or an example's
 * (`EXAMPLE_FIXTURES`), e.g. `fixtureFolder("Solitaire", "Card.spell")`.
 * - NEVER write there:  copy it first (`copyFixtureProject()`).
 */
export function fixtureFolder(projectName: string, ...parts: string[]): string {
  if (!EXAMPLE_FIXTURES.has(projectName)) return fixturePath(projectName, ...parts)
  return resolve(environment.systemFilesRoot, "examples", projectName, ...parts)
}

/**
 * The import layer fixture `projectName` parses under:  the declarations of each project it imports,
 * as `SpellProject.loadImportScope()` loads a compiled import's.
 * - Imports none:  the root scope.
 * - A test parsing a fixture's files itself parses them under it:
 *   `parseSpellProject(loadFixtureProject("counter-app"), { parentScope: fixtureImportScope("counter-app") })`.
 */
export function fixtureImportScope(projectName: string): P.Scope {
  const { imports } = readProjectFile(fixtureFolder(projectName))
  const loaded: SP.DeclarationsImport[] = Object.entries(fixtureImports(projectName)).map(([module, fixture]) => {
    const { path, import: picks } = imports.find(
      (it) => moduleFor(SP.SpellProject.projectIdForImport(it.path)) === module
    )!
    const projectId = SP.SpellProject.projectIdForImport(path)
    return { from: path, projectId, declarations: compileFixture(fixture).declarations, import: picks, module }
  })
  // the root of its files' languages, by their names:  Spanish's for `Carta.es.spell` (epic `spanish` P19)
  const languages = loadFixtureProject(projectName).map(({ path }) => SP.Language.forFile(path))
  const root = SP.Language.rootScopeFor([...new Set(languages)])
  return loaded.length ? SP.SpellDeclarations.importScope(root, loaded) : root
}

/** The module compiled code imports project `projectId` from, e.g. `@spell/project/@spell/test/counter`. */
function moduleFor(projectId: string): string {
  return `${SP.SPELL_PROJECT_MODULE}${encodeURI(projectId)}`
}

/** `{ path, contents }` of each spell file in test project `projectName`, in its project file's order. */
export function loadFixtureProject(projectName: string): SpellSourceFile[] {
  const projectDir = fixtureFolder(projectName)
  return readProjectFile(projectDir)
    .imports.filter(({ path, active }) => active !== false && path.endsWith(".spell"))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(projectDir, `.${path}`), "utf8") }))
}

/**
 * Write test project `projectName` into folder `dir`:  its project file, and each file it lists.
 * - Not its snapshots:  a copy a test may edit, or an editor open, as a person's project.
 * - SIDE EFFECT:  makes `dir`.
 */
export function copyFixtureProject(projectName: string, dir: string): void {
  mkdirSync(dir, { recursive: true })
  const folder = fixtureFolder(projectName)
  for (const { path } of readProjectFile(folder).imports) {
    if (path.startsWith("/")) copyFileSync(resolve(folder, `.${path}`), resolve(dir, `.${path}`))
  }
  copyFileSync(projectFileFor(folder), resolve(dir, basename(projectFileFor(folder))))
}

/**
 * 1-based line of `text` that starts with `start`, its indent left off:  the `nth` (0-based) such line.
 * - So a test names a line of an example by what it says, not by its number:
 *   an edit to the example above it doesn't move the test's line.
 * - throws if there's no such line
 */
export function lineOf(text: string, start: string, nth = 0): number {
  const lines = text.split("\n").flatMap((line, index) => (line.trimStart().startsWith(start) ? [index + 1] : []))
  const line = lines[nth]
  if (line === undefined) throw new Error(`lineOf():  no line #${nth + 1} starts \`${start}\`;  has the text changed?`)
  return line
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
} {
  return JSON5.parse(readFileSync(projectFileFor(projectDir), "utf8"))
}
