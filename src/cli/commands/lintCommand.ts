import { writeFileSync } from "fs"

import { P } from "spell-parser/parser"
import { SP } from "spell-parser/spell"
import { CLI } from "spell-app/cli"

/**
 * `spell lint [projects...]`:  parse each project or file and list its errors -- writes nothing of its own.
 * - `spell check` until epic `repo-split` P13.
 * - Errors go to STDOUT, one per line (`path:line:col  message`), so they can be piped, e.g. to `grep`.
 *   `--json` prints them as a JSON array of `CLI.Problem`s instead.
 * - Progress and a count per project go to stderr.
 * - A `.spell` file:  parses its whole project -- it can't parse alone -- but lists only ITS errors.
 * - A project's EDITOR PAGES (`Card.editor.html`) too, against its types, after its spell
 *   (decision Q17;  `CLI.EditorPages`).
 * - `--fix`:  puts right what it can, writes it back,
 *   then lists what it did, one line each (`... fixed:  ...`), on stdout (with `--json`, on stderr):
 *   - each retired word in the spell, e.g. `drawable thing` => `view` -- see `fixRetiredWords()`
 *   - a `.spellx` file's HTML habits, e.g. `<ui-button>` => `<button>` -- see `fixHtmlHabits()`
 *   - each editor page
 *   - What it can't put right is still an error.
 * - A `.spellx` file's HTML habit it can't put right, `on-click=`, is an error -- see `htmlHabitsIn()`.
 * - SIDE EFFECT:  compiles any project they import which has never been compiled --
 *   see `CliSession.compileImports()`.
 * - Returns the exit code:  `EXIT.ERRORS` if there were any.
 */
export async function lintCommand(session: CLI.CliSession, args: string[], options: CLI.LintOptions): Promise<number> {
  const resolvedProjects = await session.projects(args)
  const status = new CLI.StatusReporter(session.isInteractive)
  const problems: CLI.Problem[] = []
  const fixes: CLI.Problem[] = []
  try {
    for (const resolved of resolvedProjects) {
      if (resolved.kind === "file") {
        if (options.fix) fixes.push(...(await fixRetiredWords(session, resolved.file.project, resolved.file)))
        if (options.fix) fixes.push(...(await fixHtmlHabits(session, resolved.file.project, resolved.file)))
        problems.push(...(await checkProject(session, resolved.file.project, resolved.file, status)))
        problems.push(...htmlHabitsIn(resolved.file.project, resolved.file))
        continue
      }
      if (options.fix) fixes.push(...(await fixRetiredWords(session, resolved.project)))
      if (options.fix) fixes.push(...(await fixHtmlHabits(session, resolved.project)))
      problems.push(...(await checkProject(session, resolved.project, undefined, status)))
      problems.push(...htmlHabitsIn(resolved.project))
      const pages = await checkPages(session, resolved.project, status, options)
      problems.push(...pages.problems)
      fixes.push(...pages.fixes)
    }
  } finally {
    status.finish()
  }

  for (const fix of fixes) {
    if (options.json) session.err(session.problemLine(fix))
    else session.out(session.problemLine(fix))
  }
  if (options.json) session.out(JSON.stringify(problems, null, 2))
  else for (const problem of problems) session.out(session.problemLine(problem))
  return problems.length ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

/** Parse `project`, and return its problems -- only `file`'s, if given. */
async function checkProject(
  session: CLI.CliSession,
  project: SP.SpellProject,
  file: SP.SpellFile | undefined,
  status: CLI.StatusReporter
): Promise<CLI.Problem[]> {
  const row = status.start(file ? `${file.file}  (${project.projectId})` : project.projectId)
  try {
    await session.parse(project, status)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    status.done(row, "failed", message)
    return [{ project: project.projectId, message }]
  }
  return session.report(status, row, project, { file, list: false })
}

/**
 * With `--fix`:  put each RETIRED word in `project` right -- only `file`'s, if given --
 * e.g. `a card is a drawable thing` => `a card is a view`,
 * and write each changed file back (epic `elemental-spell`, Q61).
 * - The parser marks each one as an error whose `data.replacement` is its new word:
 *   see `SpellType.retiredWordErrorsIn()`.
 * - A word written with a capital keeps it:  `Drawable thing` => `View`.
 * - Not a test project's files:  they stay frozen, as their editor pages do.
 * - SIDE EFFECT:  parses `project`, then hands it each file's new text, so what's listed after is what's left.
 * - Returns what it fixed, each a problem saying so, where the word was.
 */
async function fixRetiredWords(
  session: CLI.CliSession,
  project: SP.SpellProject,
  file?: SP.SpellFile
): Promise<CLI.Problem[]> {
  await session.parse(project)
  const fixes: CLI.Problem[] = []
  // its files load as it parses:  read them after
  for (const spellFile of file ? [file] : project.spellFiles) {
    const path = spellFile.location.serverPath
    const text = spellFile.contents
    if (!spellFile.match || text === undefined || CLI.isTestProject(path)) continue
    // each one's place and new word, last first:  a fix never moves one still to make
    const retired = (SP.Block.getParseErrors(spellFile.match) ?? [])
      .flatMap(({ start, end, data: { replacement } }) =>
        typeof replacement === "string" && start !== undefined && end !== undefined ? [{ start, end, replacement }] : []
      )
      .sort((a, b) => b.start - a.start)
    const edits = retired.map(({ start, end, replacement }) => {
      const written = text.slice(start, end)
      const word = /^[A-ZÁÉÍÓÚÑ]/.test(written) ? replacement[0]!.toUpperCase() + replacement.slice(1) : replacement
      return { start, end, text: word, message: `fixed:  "${written}" is now "${word}"` }
    })
    fixes.push(...(await writeEdits(project, spellFile, edits)))
  }
  return fixes
}

/**
 * With `--fix`:  put each HTML habit in `project`'s `.spellx` files right -- only `file`'s, if given --
 * and write each changed file back (epic `elemental-spell` P8):
 * a component written by its tag, where spellx names it bare, `<ui-button>Go</ui-button>` => `<button>Go</button>`.
 * - Only a tag the file's packs give that bare name (`SP.ComponentPacks`):  `<solitaire-card>` stays.
 * - A named closer is renamed with its tag;  a `</>` is left alone.
 * - Not a test project's files:  they stay frozen.
 * - SIDE EFFECT:  parses `project`, then hands it each file's new text.
 * - Returns what it fixed, each a problem saying so, where it was.
 */
async function fixHtmlHabits(
  session: CLI.CliSession,
  project: SP.SpellProject,
  file?: SP.SpellFile
): Promise<CLI.Problem[]> {
  await session.parse(project)
  const fixes: CLI.Problem[] = []
  for (const spellFile of file ? [file] : project.spellFiles) {
    if (spellFile.form !== "spellx" || !spellFile.match || CLI.isTestProject(spellFile.location.serverPath)) continue
    const { lang } = spellFile.language
    const edits: TextEdit[] = []
    P.Tokenizer.forEachToken(spellFile.match.tokens, (token) => {
      if (!(token instanceof P.JSXElementToken) || !token.tagName.includes("-")) return
      const { tagName } = token
      const bare = tagName.slice(tagName.indexOf("-") + 1)
      if (SP.ComponentPacks.tagFor(bare, lang) !== tagName) return
      const message = `fixed:  <${tagName}> is <${bare}> in spellx`
      edits.push({ start: token.start + 1, end: token.start + 1 + tagName.length, text: bare, message })
      if (token.raw?.endsWith(`</${tagName}>`)) {
        edits.push({ start: token.end - tagName.length - 1, end: token.end - 1, text: bare })
      }
    })
    fixes.push(...(await writeEdits(project, spellFile, edits)))
  }
  return fixes
}

/**
 * The HTML habits in `project`'s `.spellx` files that `--fix` can't put right -- only `file`'s, if given:
 * an element's `on-click=` (or any `on-...=`), which spellx handles in its template, with `<on click>...</>`.
 * - Each a problem, where it is;  read from the files as last parsed.
 */
function htmlHabitsIn(project: SP.SpellProject, file?: SP.SpellFile): CLI.Problem[] {
  const problems: CLI.Problem[] = []
  for (const spellFile of file ? [file] : project.spellFiles) {
    const text = spellFile.contents
    if (spellFile.form !== "spellx" || !spellFile.match || text === undefined) continue
    P.Tokenizer.forEachToken(spellFile.match.tokens, (token) => {
      if (!(token instanceof P.JSXElementToken)) return
      for (const attribute of token.attributes ?? []) {
        if (!/^on-/.test(attribute.name)) continue
        const event = attribute.name.slice(3).replaceAll("-", " ")
        problems.push({
          project: project.projectId,
          path: spellFile.location.serverPath,
          ...lineAndColumnOf(text, attribute.start),
          message: `${attribute.name}= is HTML's habit:  in spellx, handle it in the template, with <on ${event}>...</>`
        })
      }
    })
  }
  return problems
}

/** An edit to a file's text, and what to say of it once made (none:  part of the edit before it). */
type TextEdit = { start: number; end: number; text: string; message?: string }

/**
 * Make `edits` to `spellFile`'s text, write it back and hand `project` the new text;  what each did, as problems.
 * - Last first:  an edit never moves one still to make.
 */
async function writeEdits(
  project: SP.SpellProject,
  spellFile: SP.SpellFile,
  edits: TextEdit[]
): Promise<CLI.Problem[]> {
  const text = spellFile.contents
  if (!edits.length || text === undefined) return []
  const path = spellFile.location.serverPath
  const fixes: CLI.Problem[] = []
  let fixed = text
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    fixed = fixed.slice(0, edit.start) + edit.text + fixed.slice(edit.end)
    if (edit.message) {
      fixes.push({ project: project.projectId, path, ...lineAndColumnOf(text, edit.start), message: edit.message })
    }
  }
  writeFileSync(path, fixed)
  await project.updateText(spellFile, fixed)
  return fixes.reverse()
}

/** 1-based line and column of offset `start` in `text`. */
function lineAndColumnOf(text: string, start: number): { line: number; column: number } {
  const lines = text.slice(0, start).split("\n")
  return { line: lines.length, column: lines.at(-1)!.length + 1 }
}

/**
 * Check `project`'s editor pages against its types -- and with `--fix`, put them right:  see `CLI.EditorPages`.
 * - A row of its own on `status`, only when the project has pages.
 */
async function checkPages(
  session: CLI.CliSession,
  project: SP.SpellProject,
  status: CLI.StatusReporter,
  { fix }: CLI.LintOptions
): Promise<CLI.EditorPageResults> {
  const editorPages = new CLI.EditorPages(session, project)
  if (!editorPages.paths.length) return { pages: 0, problems: [], fixes: [] }
  const row = status.start(`${project.projectId}  (editor pages)`)
  const results = await editorPages.check({ fix })
  const { pages, problems, fixes } = results
  const note = [
    `${pages} page${pages === 1 ? "" : "s"}`,
    problems.length && `${problems.length} error${problems.length === 1 ? "" : "s"}`,
    fixes.length && `fixed ${fixes.length}`
  ]
  status.done(row, problems.length ? "errors" : "ok", note.filter(Boolean).join(" · "))
  return results
}
