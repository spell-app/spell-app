import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { PY } from "spell-lang/py"
import { SP } from "spell-lang/spell"
import {
  LIBRARY_FIXTURES,
  LIBRARY_GROUP,
  PYTHON_FIXTURES,
  compiledFixture,
  fixtureDeclarations,
  fixtureDraws,
  fixturePath,
  fixtureProjectNames,
  fixtureWords,
  fixtureLanguages,
  fixtureImports
} from "spell-app/spaces/test"

/**
 * Every fixture project in `spaces/@spell/test/` compiled,
 * against the snapshots beside it, in `spaces/@spell/test/<Project>/`:
 * - `<Project>.snapshot.js`:  the javascript (`js/solid` target)
 * - `<Project>.snapshot.declarations.json5`:  its declarations
 * - `<Project>.<lang>.snapshot.js`:  its words, in its language (`solitaire.en.snapshot.js`, `cartas.es.snapshot.js`)
 * - `<Project>.snapshot.tsx`:  the TypeScript (`ts/solid` target)
 * - `<Project>.snapshot.py`:  the Python (the `py` target)
 *   - only for the fixtures in `PYTHON_FIXTURES`
 * - `<Project>.lib.snapshot.ts`:  as a library (the `ts/lib` target)
 *   - only for the fixtures in `LIBRARY_FIXTURES`
 * - `<library>.import.snapshot.js`:  each `@spell/library` project it imports, compiled as it runs against it,
 *   e.g. `cards.import.snapshot.js` beside `solitaire`:  so a page can run the fixture, its import and all
 *   (the runner's browser tests)
 * - Why beside it:  a change shows up as a diff of a real `.js` or `.py` file, in VS Code's Source Control.
 * - New fixture:  copy a project into `spaces/@spell/test/`, then `yarn spell:test:fixtures:bless` writes its
 *   snapshot.
 * - Changed on purpose:  `yarn spell:test:fixtures:bless`, then read the diff before committing it.
 * - See `compiledFixture()` for what's in each.
 */
describe("fixture projects compile to their snapshots", () => {
  test("there are some", () => {
    expect(fixtureProjectNames().length).toBeGreaterThan(0)
  })

  for (const name of fixtureProjectNames()) {
    test(name, async () => {
      await expect(compiledFixture(name)).toMatchFileSnapshot(fixturePath(name, `${name}${SP.SNAPSHOT_JS_SUFFIX}`))
      await expect(fixtureDeclarations(name)).toMatchFileSnapshot(
        fixturePath(name, `${name}.snapshot${SP.DECLARATIONS_JSON_SUFFIX}`)
      )
    })

    // its words, by the names its javascript uses, one file per language its files are in -- see `SP.SpellWords`.
    // `.<lang>.snapshot.js`:  ending as a snapshot does keeps it out of the fixture's files, in the app.
    test(`${name}'s words`, async () => {
      for (const lang of fixtureLanguages(name)) {
        await expect(fixtureWords(name, lang)).toMatchFileSnapshot(
          fixturePath(name, `${name}.${lang}${SP.SNAPSHOT_JS_SUFFIX}`)
        )
      }
    })

    // the `ts/solid` target's, `tsc`-checked by `typescript.test.ts`
    test(`${name} as TypeScript`, async () => {
      await expect(compiledFixture(name, "ts/solid")).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.tsx`))
    })

    // the `py` target's (epic `python-target`):  the fixtures its writer writes so far
    test.runIf(PYTHON_FIXTURES.has(name))(`${name} as Python`, async () => {
      await expect(compiledFixture(name, "py")).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.py`))
    })

    // the Python targets' page, when it draws:
    // the drawing half in javascript (`PY.ElementsWriter`, `.elements.spell.js`);
    // `.elements.snapshot.js`, ending as a snapshot does, so it isn't one of the fixture's files
    test.runIf(PYTHON_FIXTURES.has(name) && fixtureDraws(name))(`${name}'s page, for Python`, async () => {
      await expect(compiledFixture(name, PY.ElementsWriter.instance)).toMatchFileSnapshot(
        fixturePath(name, `${name}.elements${SP.SNAPSHOT_JS_SUFFIX}`)
      )
    })

    // each library it imports, as the program loads it:  `@spell/library/cards` => `cards.import.snapshot.js`
    test(`${name}'s libraries`, async () => {
      for (const imported of Object.values(fixtureImports(name)).filter((it) => it.startsWith(LIBRARY_GROUP))) {
        await expect(compiledFixture(imported)).toMatchFileSnapshot(
          fixturePath(name, `${imported.split("/").at(-1)}.import${SP.SNAPSHOT_JS_SUFFIX}`)
        )
      }
    })

    // as a library (the `ts/lib` target, epic `people-and-orgs` P3):  its classes alone, one TypeScript file
    test.runIf(LIBRARY_FIXTURES.has(name))(`${name} as a library`, async () => {
      await expect(compiledFixture(name, P.LibraryWriter.instance)).toMatchFileSnapshot(
        fixturePath(name, `${name}.lib.snapshot.ts`)
      )
    })
  }
})
