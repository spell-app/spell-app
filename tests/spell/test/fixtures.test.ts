import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { PY } from "spell-lang/py"
import { SP } from "spell-lang/spell"
import {
  LIBRARY_FIXTURES,
  PYTHON_FIXTURES,
  compiledFixture,
  fixtureDeclarations,
  fixtureDraws,
  fixtureProjectNames,
  fixtureWords,
  fixtureLanguages,
  snapshotPath
} from "spell-app/spaces/test"

/**
 * Every test project compiled, against its snapshots (`snapshotPath()`):
 * - the frozen fixtures, in `spaces/@spell/test/`:  their snapshots beside them, in `spaces/@spell/test/<Project>/`
 * - the examples tested as they are (`EXAMPLE_FIXTURES`, Solitaire and Solitario):
 *   their snapshots in `tests/spell/__examples__/<Project>/`, never beside the example
 *   - a change to the example changes them:  bless, then read the diff
 *
 * Each one's:
 * - `<Project>.snapshot.js`:  the javascript (`js/solid` target)
 * - `<Project>.snapshot.declarations.json5`:  its declarations
 * - `<Project>.<lang>.snapshot.js`:  its words, in its language (`Solitaire.en.snapshot.js`, `Solitario.es.snapshot.js`)
 * - `<Project>.snapshot.tsx`:  the TypeScript (`ts/solid` target)
 * - `<Project>.snapshot.py`:  the Python (the `py` target)
 *   - only for the fixtures in `PYTHON_FIXTURES`
 * - `<Project>.lib.snapshot.ts`:  as a library (the `ts/lib` target)
 *   - only for the fixtures in `LIBRARY_FIXTURES`
 *
 * A project one imports is a frozen fixture too, e.g. `counter-app`'s counter library, `counter`:
 * its own snapshots are what the runner's browser tests load as the import.
 * - Why real files:  a change shows up as a diff of a real `.js` or `.py` file, in VS Code's Source Control.
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
      await expect(compiledFixture(name)).toMatchFileSnapshot(snapshotPath(name, `${name}${SP.SNAPSHOT_JS_SUFFIX}`))
      await expect(fixtureDeclarations(name)).toMatchFileSnapshot(
        snapshotPath(name, `${name}.snapshot${SP.DECLARATIONS_JSON_SUFFIX}`)
      )
    })

    // its words, by the names its javascript uses, one file per language its files are in -- see `SP.SpellWords`.
    // `.<lang>.snapshot.js`:  ending as a snapshot does keeps it out of the fixture's files, in the app.
    test(`${name}'s words`, async () => {
      for (const lang of fixtureLanguages(name)) {
        await expect(fixtureWords(name, lang)).toMatchFileSnapshot(
          snapshotPath(name, `${name}.${lang}${SP.SNAPSHOT_JS_SUFFIX}`)
        )
      }
    })

    // the `ts/solid` target's, `tsc`-checked by `typescript.test.ts`
    test(`${name} as TypeScript`, async () => {
      await expect(compiledFixture(name, "ts/solid")).toMatchFileSnapshot(snapshotPath(name, `${name}.snapshot.tsx`))
    })

    // the `py` target's (epic `python-target`):  the fixtures its writer writes so far
    test.runIf(PYTHON_FIXTURES.has(name))(`${name} as Python`, async () => {
      await expect(compiledFixture(name, "py")).toMatchFileSnapshot(snapshotPath(name, `${name}.snapshot.py`))
    })

    // the Python targets' page, when it draws:
    // the drawing half in javascript (`PY.ElementsWriter`, `.elements.spell.js`);
    // `.elements.snapshot.js`, ending as a snapshot does, so it isn't one of the fixture's files
    test.runIf(PYTHON_FIXTURES.has(name) && fixtureDraws(name))(`${name}'s page, for Python`, async () => {
      await expect(compiledFixture(name, PY.ElementsWriter.instance)).toMatchFileSnapshot(
        snapshotPath(name, `${name}.elements${SP.SNAPSHOT_JS_SUFFIX}`)
      )
    })

    // as a library (the `ts/lib` target, epic `people-and-orgs` P3):  its classes alone, one TypeScript file
    test.runIf(LIBRARY_FIXTURES.has(name))(`${name} as a library`, async () => {
      await expect(compiledFixture(name, P.LibraryWriter.instance)).toMatchFileSnapshot(
        snapshotPath(name, `${name}.lib.snapshot.ts`)
      )
    })
  }
})
