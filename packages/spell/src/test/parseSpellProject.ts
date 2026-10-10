import { existsSync, readdirSync, readFileSync } from "fs"
import { resolve } from "path"

import environment from "$/spell/node/environment"
import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * Parse + compile a spell project headlessly, the same way `SpellProject` does in the app:
 * - ONE `ProjectScope` with a clone of the root spell parser
 * - every type the files declare stubbed first (`parser.stubDeclaredTypes()`), as `P.IncrementalProject` does
 * - one `FileScope` per file under it, all sharing that parser, parsed in order
 * - ALL files parsed first, THEN all compiled, so lazy compile-time lookups see the whole project
 * - NOTE: skips `SpellFile` / `SpellProject` themselves, as they load contents from the server.
 * - Used as the "same as a full parse" reference for incremental parsing:  compare `summarize()` results.
 * - `parentScope` defaults to the root spell scope -- pass a `P.ImportScope` to parse against imports.
 */
export function parseSpellProject(
  files: SpellSourceFile[],
  { parentScope = SP.SpellParser.rootScope }: { parentScope?: P.Scope } = {}
): ParsedSpellProject {
  const projectScope = new P.ProjectScope({
    name: "test-project",
    path: "/test-project",
    parser: parentScope.parser!.clone({ module: "/test-project" }),
    parentScope
  })

  // every type the files declare, so a line can name one declared further down
  projectScope.parser!.stubDeclaredTypes(
    projectScope,
    files.map(({ contents }) => contents)
  )
  const parsed = files.map(({ path, contents }) => {
    const scope = new P.FileScope({ name: path, path, parentScope: projectScope })
    const start = performance.now()
    const match = scope.parse(contents, "block")
    const parseMsec = performance.now() - start
    return { path, contents, scope, match, parseMsec }
  })

  const parsedFiles = parsed.map(({ path, contents, scope, match, parseMsec }) => {
    const start = performance.now()
    const compiled = (match?.compile() as string | undefined) ?? ""
    const compileMsec = performance.now() - start
    return { path, contents, scope, match, compiled, errors: describeParseErrors(match), parseMsec, compileMsec }
  })

  return { scope: projectScope, files: parsedFiles }
}

/**
 * Frozen projects tests run against -- `projects/test/<Project>/`, e.g. `Solitaire`:  the `@test:fixtures` root.
 * - Why:  tests assert exact lines, docstrings and compiled output, and the live examples get edited.  Tests read
 *   ONLY here -- editing or deleting anything in `projects/system/` or `projects/user/` can't break one.
 * - NEVER update a fixture to follow its example:  it's frozen so tests don't move.  Change a test's input in the
 *   test, or add another fixture -- copy a project in, then `yarn test:fixtures:bless`.  See `compiledFixture()`.
 */
export const FIXTURES_DIR = environment.testFilesRoot

/** Path of `parts` under `FIXTURES_DIR`, e.g. `fixturePath("Solitaire", "Card.spell")`. */
export function fixturePath(...parts: string[]): string {
  return resolve(FIXTURES_DIR, ...parts)
}

/**
 * Project id of fixture `projectName`, e.g. `@test:fixtures:Solitaire` -- to load it as a `SpellProject`.
 * - Loads from disk in node, after `installDiskFetch()`.
 */
export function fixtureProjectId(projectName: string): string {
  return `${SP.SpellProjectRoot.fixtures.path}:${projectName}`
}

/** Name of each fixture project:  each folder of `FIXTURES_DIR` with a `project.json`, alphabetically. */
export function fixtureProjectNames(): string[] {
  return readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(fixturePath(entry.name, SP.PROJECT_FILE)))
    .map((entry) => entry.name)
    .sort()
}

/**
 * Fixture `projectName` compiled as `SpellProject` would write its `<Project>.compiled.js` -- parsed headlessly,
 * with `parseSpellProject()`:  `import`s, then each file's code in `project.json` order.
 * - Its declarations, as its `<Project>.declarations.json`:  `fixtureDeclarations()`.
 * - `target`:  compiled for that target, e.g. `ts/solid` -- see `SP.TARGETS`.
 */
export function compiledFixture(projectName: string, target = SP.RUNNING_TARGET): string {
  return compileFixture(projectName, target).code
}

/** Fixture `projectName`'s declarations, as its `<Project>.declarations.json` would hold them -- see `compileFixture()`. */
export function fixtureDeclarations(projectName: string): string {
  return JSON.stringify(compileFixture(projectName).declarations, null, 2) + "\n"
}

/**
 * Fixture `projectName` compiled as `SpellProject` would:  its `code` and its `declarations`.
 * - Files combine through the SAME `SP.SpellProject.combineCompiled()`, so a class gets members from every file,
 *   and split through the same `SP.SpellDeclarations.split()`.
 * - Its `.css` files compile as `SpellCSSFile` does:  the whole text through the root scope's `css` rule.
 * - Parse errors lead its code, as comments, so a snapshot of it shows them too.
 * - NOT projects it imports:  a fixture is parsed on its own.
 * - `version` / `exports` from its `project.json`, as a compile would.
 * - `target`'s writer writes it, `js/solid`'s by default.
 */
function compileFixture(
  projectName: string,
  target = SP.RUNNING_TARGET
): { code: string; declarations: SP.SpellDeclarationsData } {
  const projectDir = fixturePath(projectName)
  const { version, exports, imports } = readProjectFile(projectDir)
  const { scope, files } = parseSpellProject(loadFixtureProject(projectName))
  const errors = files.flatMap(({ path, errors }) => errors.map((error) => `// PARSE ERROR ${path}:${error}\n`))
  const parts = imports
    .filter(({ path, active }) => active !== false && /\.(spell|css)$/.test(path))
    .map(({ path }) => {
      if (path.endsWith(".css")) return compiledCSS(readFileSync(resolve(projectDir, `.${path}`), "utf8"))
      const file = files.find((it) => it.path === path)!
      return file.match?.AST instanceof P.ASTStatementGroup ? file.match.AST : file.compiled
    })
  const importLines = SP.SpellProject.importHeaderFor(scope)
  const marked =
    errors.join("") + SP.SpellProject.combineCompiled(parts, SP.targetFor(target).writer, importLines) + "\n"
  return SP.SpellDeclarations.split(marked, scope, { version, exports })
}

/** `{ path, contents }` of each spell file in fixture `projectName`, in its `project.json` order -- see `FIXTURES_DIR`. */
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

/** `project.json` of the project in `projectDir`. */
function readProjectFile(projectDir: string): {
  version?: string
  exports?: string[]
  imports: Array<{ path: string; active?: boolean }>
} {
  return JSON.parse(readFileSync(resolve(projectDir, SP.PROJECT_FILE), "utf8"))
}

/**
 * What must NOT change between a full parse and an incremental one:  compiled output + errors per file.
 * - Leaves out timings and `Match` objects.
 */
export function summarize(project: ParsedSpellProject): SpellProjectSummary {
  return project.files.map(({ path, compiled, errors }) => ({ path, compiled, errors }))
}

/** `"<line>:<ch> <message>"` for each parse error in `match`, 1-based line to match editor. */
export function describeParseErrors(match: P.Match | undefined): string[] {
  if (!match) return ["no match"]
  return (SP.Block.getParseErrors(match) ?? []).map((error) => {
    // `.value` is `ASTParseError`-specific -- same lookup as `SpellFile.parse()`.
    const message = (error.AST as unknown as { value?: string } | undefined)?.value ?? error.inputText
    return `${(error.line ?? 0) + 1}:${error.char ?? 0} ${message}`
  })
}

/** One spell file to parse. */
export type SpellSourceFile = {
  /** Project-relative path, e.g. `/Card.spell`. */
  path: string
  /** File text. */
  contents: string
}

/** Result of `parseSpellProject()`. */
export type ParsedSpellProject = {
  /** Shared project scope, e.g. to inspect declared types / rules. */
  scope: P.ProjectScope
  /** Per-file results, in parse order. */
  files: Array<{
    path: string
    contents: string
    scope: P.FileScope
    match: P.Match | undefined
    compiled: string
    errors: string[]
    parseMsec: number
    compileMsec: number
  }>
}

/** Result of `summarize()`. */
export type SpellProjectSummary = Array<{ path: string; compiled: string; errors: string[] }>
