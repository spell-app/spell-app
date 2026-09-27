import { describe, test, expect } from "vitest"

import { P } from "~/parser"
import { SP } from "~/languages/spell"
import {
  describeParseErrors,
  loadExampleProject,
  parseSpellProject,
  summarize,
  type SpellProjectSummary,
  type SpellSourceFile
} from "~/test"

/**
 * `P.IncrementalProject` MUST give exactly what a full parse gives:  same compiled output + errors, for every file,
 * and every token where a fresh tokenize puts it.
 * - Edits every `STEP`th line of each Solitaire file -- one kind of edit per line, in rotation -- then puts it back,
 *   all on ONE project, so state has to stay right across many updates.  `INCREMENTAL_FULL=1` edits every line.
 */
const STEP = process.env.INCREMENTAL_FULL ? 1 : 7

/** Kinds of edit to make to one line of `lines`, in place. */
const EDITS: Record<string, (lines: string[], index: number) => void> = {
  "insert a character": (lines, index) => (lines[index] += "x"),
  "delete a character": (lines, index) => (lines[index] = lines[index]!.slice(0, -1)),
  "delete the line": (lines, index) => void lines.splice(index, 1),
  "duplicate the line": (lines, index) => void lines.splice(index, 0, lines[index]!)
}

describe("incremental parsing ~== full parse", () => {
  const files = loadExampleProject("Solitaire")
  const original = summarize(parseSpellProject(files))

  test("item-by-item parse ~== full parse", () => {
    expect(summarizeIncremental(newProject(files))).toEqual(original)
  })

  for (const file of files) {
    test(
      `edits in ${file.path}`,
      () => {
        const project = newProject(files)
        const lines = file.contents.split("\n")
        const counts = { same: 0, body: 0, region: 0, rewound: 0, threw: 0 }
        for (let index = 0, edit = 0; index < lines.length; index += STEP) {
          const [name, applyEdit] = Object.entries(EDITS)[edit++ % 4]!
          const edited = [...lines]
          applyEdit(edited, index)
          const where = `${file.path} line ${index + 1}, ${name}`

          const editedFiles = files.map((it) => (it.path === file.path ? { ...it, contents: edited.join("\n") } : it))
          const result = outcome(() => {
            project.update(file.path, edited.join("\n"))
            return summarizeIncremental(project)
          })
          expect(result, where).toEqual(outcome(() => summarize(parseSpellProject(editedFiles))))
          if (typeof result === "string") counts.threw++
          else {
            counts[project.getFile(file.path)!.lastUpdate!]++
            expectPositions(project, where)
          }

          // ...and back again.
          project.update(file.path, file.contents)
          expect(summarizeIncremental(project), `${where}, undone`).toEqual(original)
        }
        console.log(`INCREMENTAL ${file.path}: ${JSON.stringify(counts)}`)
      },
      600_000
    )
  }

  test("a body can't see names declared after it", () => {
    // `all-piles` is declared in Solitaire.spell, AFTER Card.spell -- a full parse doesn't know it yet.
    const edited = files.map((it) =>
      it.path === "/Card.spell"
        ? { ...it, contents: it.contents.replace("\tset its direction to up\n", "\tset its direction to up\n\tprint all-piles\n") }
        : it
    )
    const project = newProject(files)
    project.update("/Card.spell", edited[0]!.contents)
    expect(summarizeIncremental(project)).toEqual(summarize(parseSpellProject(edited)))
  })

  describe("keepLastGood:  a broken line keeps its last working declarations", () => {
    const card = files.findIndex((it) => it.path === "/Card.spell")
    const cardText = files[card]!.contents
    // Later lines -- in Card.spell AND Solitaire.spell -- call `turn ... face up`.
    const broken = cardText.replace("to turn (a card) face up:", "to turn (a card face up:")

    test("without it, the broken declaration breaks later lines too", () => {
      const project = newProject(files)
      project.update("/Card.spell", broken)
      const errors = summarizeIncremental(project).flatMap((file) => file.errors)
      expect(errors.length).toBeGreaterThan(1)
    })

    test("with it, only the broken line has an error, and later lines + files are kept", () => {
      const project = newProject(files, true)
      project.update("/Card.spell", broken)
      expect(project.getFile("/Card.spell")!.lastUpdate).toBe("region")
      const summary = summarizeIncremental(project)
      const brokenLine = broken.split("\n").findIndex((line) => line.includes("(a card face up:")) + 1
      expect(summary[card]!.errors).toHaveLength(1)
      expect(summary[card]!.errors[0]).toMatch(new RegExp(`^${brokenLine}:`))
      summary.forEach((file, index) => {
        if (index !== card) expect(file, file.path).toEqual(original[index])
      })
    })

    test("every edit, then undone, ends up ~== full parse", () => {
      for (const file of files) {
        const project = newProject(files, true)
        const lines = file.contents.split("\n")
        for (let index = 0, edit = 0; index < lines.length; index += STEP) {
          const [name, applyEdit] = Object.entries(EDITS)[edit++ % 4]!
          const edited = [...lines]
          applyEdit(edited, index)
          try {
            project.update(file.path, edited.join("\n"))
          } catch {
            // crashes a full parse too -- see `outcome()`
          }
          project.update(file.path, file.contents)
          expect(summarizeIncremental(project), `${file.path} line ${index + 1}, ${name}, undone`).toEqual(original)
        }
      }
    }, 600_000)

    test("typing through broken states, then back, ends up ~== full parse", () => {
      const project = newProject(files, true)
      const line = "a card is a thing"
      // delete the line's text one character at a time, then type it back in
      const steps = [...line].map((_char, index) => line.slice(0, line.length - index - 1))
      for (const text of [...steps, ...steps.reverse().slice(1), line]) {
        project.update("/Card.spell", cardText.replace(line, text))
      }
      expect(summarizeIncremental(project)).toEqual(original)
    })
  })

  test.skipIf(!process.env.BENCH)("benchmark", () => {
    const cases: Record<string, [path: string, from: string, to: string]> = {
      "body edit, Solitaire.spell": ["/Solitaire.spell", "pause for 500 msec", "pause for 400 msec"],
      "declaration edit, bottom of Solitaire.spell": ["/Solitaire.spell", "reset the game\nstart", "reset the game\n\nstart"],
      "blank line, top of Card.spell": ["/Card.spell", "a card is a thing", "a card is a thing\n"],
      "declaration edit, top of Card.spell": ["/Card.spell", "hearts or spades", "spades or hearts"],
      "comment edit, top of Card.spell": ["/Card.spell", "## definition of a Card", "## definition of a card"],
      "statement edit, top of Solitaire.spell": ["/Solitaire.spell", 'name = "stock"', 'name = "the stock"']
    }
    for (const [name, [path, from, to]] of Object.entries(cases)) {
      const contents = files.find((it) => it.path === path)!.contents
      const edited = contents.replace(from, to)
      expect(edited).not.toEqual(contents)
      const project = newProject(files)
      const times: number[] = []
      for (let run = 0; run < 21; run++) {
        const start = performance.now()
        project.update(path, run % 2 ? contents : edited)
        times.push(performance.now() - start)
      }
      times.sort((a, b) => a - b)
      console.log(`BENCH incremental ${name}: ${times[10]!.toFixed(1)}ms (median of 21)`)
    }
  })
})

/**
 * `summarize()`'s result, or what it threw -- so "both crash the same way" counts as the same.
 * - NOTE: some edits DO crash a full compile, e.g. a quoted alias of an unknown property -- see `SUSPECTED-BUGS.md`.
 */
function outcome(summarizeIt: () => SpellProjectSummary): SpellProjectSummary | string {
  try {
    return summarizeIt()
  } catch (error) {
    return `THROWS: ${String(error)}`
  }
}

/** Fresh `P.IncrementalProject` of `files`, set up as `parseSpellProject()` sets up a project.  See `keepLastGood`. */
function newProject(files: SpellSourceFile[], keepLastGood = false) {
  const rootScope = SP.SpellParser.rootScope
  const scope = new P.ProjectScope({
    name: "test-project",
    path: "/test-project",
    parser: rootScope.parser!.clone({ module: "/test-project" }),
    parentScope: rootScope
  })
  return new P.IncrementalProject({
    scope,
    keepLastGood,
    files: files.map(({ path, contents }) => ({ path, text: contents }))
  })
}

/** Same as `summarize()`, for an `IncrementalProject`. */
function summarizeIncremental(project: P.IncrementalProject): SpellProjectSummary {
  return project.files.map(({ path, parse }) => ({
    path,
    compiled: (parse.match?.compile() as string | undefined) ?? "",
    errors: describeParseErrors(parse.match)
  }))
}

/** Every file's tokens MUST be where a fresh tokenize of its text puts them. */
function expectPositions(project: P.IncrementalProject, where: string) {
  for (const { path, parse } of project.files) {
    const fresh = parse.parser.tokenizeRoot(parse.text)
    expect(positions(parse.match?.tokens ?? []), `${where}: ${path} token positions`).toEqual(
      positions(fresh ? [fresh] : [])
    )
  }
}

/** `offset:line:ch` of every token in `tokens`, nested ones included. */
function positions(tokens: P.Token[]) {
  const result: string[] = []
  P.Tokenizer.forEachToken(tokens, ({ offset, line, ch }) => void result.push(`${offset}:${line}:${ch}`))
  return result
}
