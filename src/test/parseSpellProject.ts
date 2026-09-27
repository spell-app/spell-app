import { readFileSync } from "fs"
import { resolve } from "path"

import environment from "~/environment"
import { P } from "~/parser"
import { SP } from "~/languages/spell"

/**
 * Parse + compile a spell project headlessly, the same way `SpellProject` does in the app:
 * - ONE `ProjectScope` with a clone of the root spell parser
 * - one `FileScope` per file under it, all sharing that parser, parsed in order
 * - ALL files parsed first, THEN all compiled, so lazy compile-time lookups see the whole project
 * - NOTE: skips `SpellFile` / `SpellProject` themselves, as they load contents from the server.
 * - Used as the "same as a full parse" reference for incremental parsing:  compare `summarize()` results.
 */
export function parseSpellProject(files: SpellSourceFile[]): ParsedSpellProject {
  const rootScope = SP.SpellParser.rootScope
  const projectScope = new P.ProjectScope({
    name: "test-project",
    path: "/test-project",
    parser: rootScope.parser!.clone({ module: "/test-project" }),
    parentScope: rootScope
  })

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

/** `{ path, contents }` of each spell file in `examples/<projectName>`, in `.imports.json` order. */
export function loadExampleProject(projectName: string): SpellSourceFile[] {
  const projectDir = resolve(environment.srcDir, "examples", projectName)
  const { imports } = JSON.parse(readFileSync(resolve(projectDir, ".imports.json"), "utf8")) as {
    imports: Array<{ path: string; active?: boolean }>
  }
  return imports
    .filter(({ path, active }) => active !== false && path.endsWith(".spell"))
    .map(({ path }) => ({ path, contents: readFileSync(resolve(projectDir, `.${path}`), "utf8") }))
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
  return (SP.getParseErrors(match) ?? []).map((error) => {
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
