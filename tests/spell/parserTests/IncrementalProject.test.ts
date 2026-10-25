import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-parser/parser"
import {
  incrementalSpellProject,
  parseSpellProject,
  summarize,
  summarizeIncremental,
  type SpellProjectSummary,
  type SpellSourceFile
} from "spell-parser/spell/test"
import { loadFixtureProject } from "spell-app/spaces/test"

/**
 * `P.IncrementalProject` MUST give exactly what a full parse gives:
 * same compiled output, errors and warnings, for every file, and every token where a fresh tokenize puts it.
 * - Edits every `STEP`th line of each file of Solitaire, the card library's files and its own
 *   (one kind of edit per line, in rotation), then puts
 *   it back.
 * - Over projects written inline:  spell-parser's own `IncrementalProject.test.ts`.
 * - All on ONE project, so state has to stay right across many updates.
 * - `INCREMENTAL_FULL=1` edits every line.
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
  const files = loadFixtureProject("Solitaire")
  const original = summarize(parseSpellProject(files))

  test("item-by-item parse ~== full parse", () => {
    expect(summarizeIncremental(incrementalSpellProject(files))).toEqual(original)
  })

  for (const file of files) {
    test(`edits in ${file.path}`, () => {
      const project = incrementalSpellProject(files)
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
    }, 600_000)
  }

  test("a body can't see names declared after it", () => {
    // `the solitaire` is declared in Solitaire.spell, AFTER Card.spell -- a full parse doesn't know it yet.
    const edited = files.map((it) =>
      it.path === "/Card.spell"
        ? {
            ...it,
            contents: it.contents.replace(
              "\t\tset its direction to up\n",
              "\t\tset its direction to up\n\t\tprint the solitaire\n"
            )
          }
        : it
    )
    expect(edited[0]!.contents).toContain("print the solitaire")
    const project = incrementalSpellProject(files)
    project.update("/Card.spell", edited[0]!.contents)
    expect(summarizeIncremental(project)).toEqual(summarize(parseSpellProject(edited)))
  })

  test("editing a `belongs to one` line:  its owner member follows -- `the pile of a card` comes and goes", () => {
    const cards = files.filter((it) => it.path === "/Card.spell" || it.path === "/Deck.spell")
    const membership = "a pile is a list of cards\na card belongs to one pile\na tableau is a pile"
    const reader = [
      "set card to a new card",
      "to stack a card on a tableau: add the card to the tableau",
      "print the pile of the card",
      "set the pile of the card to 1"
    ].join("\n")
    const pileFiles: SpellSourceFile[] = [
      ...cards,
      { path: "/Pile.spell", contents: membership },
      { path: "/Reader.spell", contents: reader }
    ]
    const project = incrementalSpellProject(pileFiles)
    const errorsOf = () => summarizeIncremental(project).flatMap((file) => file.errors)
    expect(errorsOf()).toEqual([
      "4:0 Can't set the pile of a Card:  it's the Pile holding it -- move it to a Pile instead"
    ])
    const edits = [
      "a pile is a list of cards\na tableau is a pile",
      membership,
      "a heap is a list of cards\na card belongs to one heap\na pile is a list of cards\na card belongs to one pile",
      `${membership}\n// a comment`,
      "a card belongs to one pile\na pile is a list of cards",
      "a tableau is a pile",
      membership
    ]
    for (const contents of edits) {
      pileFiles.splice(2, 1, { path: "/Pile.spell", contents })
      project.update("/Pile.spell", contents)
      expect(summarizeIncremental(project), contents).toEqual(summarize(parseSpellProject(pileFiles)))
    }
  })

  describe("keepLastGood:  a broken line keeps its last working declarations", () => {
    const card = files.findIndex((it) => it.path === "/Card.spell")
    const cardText = files[card]!.contents
    // a top-level action:  a type's outline body is ONE item, which declares the type, so it can't be kept
    const game = files.findIndex((it) => it.path === "/Solitaire.spell")
    const gameText = files[game]!.contents
    // Later lines -- `on card click`'s `play the card` -- call `play ...`.
    const broken = gameText.replace("to play a card\n", "to play (a card:\n")

    test("without it, the broken declaration breaks later lines too", () => {
      expect(broken).not.toBe(gameText)
      const project = incrementalSpellProject(files)
      project.update("/Solitaire.spell", broken)
      const errors = summarizeIncremental(project).flatMap((file) => file.errors)
      expect(errors.length).toBeGreaterThan(1)
    })

    test("with it, only the broken action has errors, and later lines + files are kept", () => {
      const project = incrementalSpellProject(files, true)
      project.update("/Solitaire.spell", broken)
      expect(project.getFile("/Solitaire.spell")!.lastUpdate).toBe("region")
      const summary = summarizeIncremental(project)
      const lines = broken.split("\n")
      const brokenLine = lines.findIndex((line) => line.includes("to play (a card")) + 1
      const nextLine = lines.findIndex((line) => line.startsWith("on card click")) + 1
      // the broken line, and its own body, which no longer knows `the card`:  nothing after it
      const errorLines = summary[game]!.errors.map((error) => Number(error.split(":")[0]))
      expect(errorLines[0]).toBe(brokenLine)
      expect(errorLines.every((line) => line >= brokenLine && line < nextLine)).toBe(true)
      summary.forEach((file, index) => {
        if (index !== game) expect(file, file.path).toEqual(original[index])
      })
    })

    test("every edit, then undone, ends up ~== full parse", () => {
      for (const file of files) {
        const project = incrementalSpellProject(files, true)
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
      const project = incrementalSpellProject(files, true)
      const line = 'a "card" is a view where:'
      // delete the line's text one character at a time, then type it back in
      const steps = Array.from({ length: line.length }, (_, index) => line.slice(0, line.length - index - 1))
      expect(cardText).toContain(line)
      for (const text of [...steps, ...steps.reverse().slice(1), line]) {
        project.update("/Card.spell", cardText.replace(line, text))
      }
      expect(summarizeIncremental(project)).toEqual(original)
    }, 60_000)
  })

  test.skipIf(!process.env.BENCH)("benchmark", () => {
    const cases: Record<string, [path: string, from: string, to: string]> = {
      "body edit, Solitaire.spell": ["/Solitaire.spell", "pause for 500 msec", "pause for 400 msec"],
      "declaration edit, bottom of Solitaire.spell": [
        "/Solitaire.spell",
        "reset the game\nstart",
        "reset the game\n\nstart"
      ],
      "blank line, top of Card.spell": ["/Card.spell", "a card is a thing", "a card is a thing\n"],
      "declaration edit, top of Card.spell": ["/Card.spell", "hearts or spades", "spades or hearts"],
      "comment edit, top of Card.spell": ["/Card.spell", "## definition of a Card", "## definition of a card"],
      "statement edit, top of Solitaire.spell": ["/Solitaire.spell", 'name = "stock"', 'name = "the stock"']
    }
    for (const [name, [path, from, to]] of Object.entries(cases)) {
      const contents = files.find((it) => it.path === path)!.contents
      const edited = contents.replace(from, to)
      expect(edited).not.toEqual(contents)
      const project = incrementalSpellProject(files)
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
 * - NOTE: some edits DO crash a full compile, e.g. a quoted alias of an unknown property -- see `agents/SUSPECTED-BUGS.md`.
 */
function outcome(summarizeIt: () => SpellProjectSummary): SpellProjectSummary | string {
  try {
    return summarizeIt()
  } catch (error) {
    return `THROWS: ${String(error)}`
  }
}

/**
 * Every file's tokens MUST be where a fresh tokenize of its text puts them.
 * - And every token MUST sit over its own text in the file, `line` / `ch` agreeing with `start`:
 *   the ones parsed later out of JSX `{...}` included.
 */
function expectPositions(project: P.IncrementalProject, where: string) {
  for (const { path, parse } of project.files) {
    const tokens = parse.match?.tokens ?? []
    const fresh = parse.parser.tokenizeRoot(parse.text)
    expect(positions(tokens), `${where}: ${path} token positions`).toEqual(positions(fresh ? [fresh] : []))

    const lineStarts = P.getLineStarts(parse.text)
    const misplaced: string[] = []
    P.Tokenizer.forEachToken(tokens, (token) => {
      if (token instanceof P.LineToken || token instanceof P.BlockToken || typeof token.raw !== "string") return
      const { start, raw, line, ch } = token
      const position = P.positionForOffset(lineStarts, start)
      if (parse.text.slice(start, start + raw.length) !== raw || position.line !== line || position.ch !== ch)
        misplaced.push(`${start}:${line}:${ch} ${JSON.stringify(raw)} (${position.line}:${position.ch})`)
    })
    expect(misplaced, `${where}: ${path} tokens not over their text`).toEqual([])
  }
}

/**
 * `start:line:ch` of every token in `tokens`, nested ones included -- EXCEPT tokens parsed later out of JSX
 * `{...}` contents (`JSXExpressionToken.innerTokens`), which a plain tokenize never makes.
 */
function positions(tokens: P.Token[]) {
  const inner = new Set<P.Token>()
  P.Tokenizer.forEachToken(tokens, (token) => {
    if (token instanceof P.JSXExpressionToken && token.innerTokens)
      P.Tokenizer.forEachToken(token.innerTokens, (it) => void inner.add(it))
  })
  const result: string[] = []
  P.Tokenizer.forEachToken(tokens, (token) => {
    if (!inner.has(token)) result.push(`${token.start}:${token.line}:${token.ch}`)
  })
  return result
}
