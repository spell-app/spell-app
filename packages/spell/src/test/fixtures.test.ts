import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { PY } from "$/py"
import { SP } from "$/spell"
import { declarationsFor } from "$/spell/node/typecheck"
import {
  LIBRARY_FIXTURES,
  PYTHON_FIXTURES,
  compiledFixture,
  fixtureDeclarations,
  fixtureDraws,
  fixturePath,
  fixtureProjectNames,
  fixtureWords
} from "$/spell/test"

/**
 * Every fixture project in `projects/test/` compiled, against the snapshots beside it,
 * in `projects/test/<Project>/`:
 * - `<Project>.snapshot.js`:  the javascript (`js/solid` target)
 * - `<Project>.snapshot.declarations.json`:  its declarations
 * - `<Project>.en.snapshot.js`:  its words
 * - `<Project>.snapshot.tsx`:  the TypeScript (`ts/solid` target)
 * - `<Project>.snapshot.py`:  the Python (the `py` target)
 *   - only for the fixtures in `PYTHON_FIXTURES`
 * - `<Project>.lib.snapshot.js` and `.lib.snapshot.d.ts`:  as a library (the `js/lib` target), and its types
 *   - only for the fixtures in `LIBRARY_FIXTURES`
 * - Why beside it:  a change shows up as a diff of a real `.js` or `.py` file, in VS Code's Source Control.
 * - New fixture:  copy a project into `projects/test/`, then `yarn test:fixtures:bless` writes its snapshot.
 * - Changed on purpose:  `yarn test:fixtures:bless`, then read the diff before committing it.
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

    // its words, by the names its javascript uses -- see `SP.SpellWords`.
    // `.en.snapshot.js`:  ending as a snapshot does keeps it out of the fixture's files, in the app.
    test(`${name}'s words`, async () => {
      await expect(fixtureWords(name)).toMatchFileSnapshot(fixturePath(name, `${name}.en${SP.SNAPSHOT_JS_SUFFIX}`))
    })

    // the `ts/solid` target's, `tsc`-checked by `typescript.test.ts`
    test(`${name} as TypeScript`, async () => {
      await expect(compiledFixture(name, "ts/solid")).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.tsx`))
    })

    // the `py` target's (epic `python-target`):  the fixtures its writer writes so far
    test.runIf(PYTHON_FIXTURES.has(name))(`${name} as Python`, async () => {
      await expect(compiledFixture(name, "py")).toMatchFileSnapshot(fixturePath(name, `${name}.snapshot.py`))
    })

    // the Python targets' page, when it draws:  the drawing half in javascript (`PY.ElementsWriter`, `.elements.js`);
    // `.elements.snapshot.js`, ending as a snapshot does, so it isn't one of the fixture's files
    test.runIf(PYTHON_FIXTURES.has(name) && fixtureDraws(name))(`${name}'s page, for Python`, async () => {
      await expect(compiledFixture(name, PY.ElementsWriter.instance)).toMatchFileSnapshot(
        fixturePath(name, `${name}.elements${SP.SNAPSHOT_JS_SUFFIX}`)
      )
    })

    // as a library (the `js/lib` target, epic `people-and-orgs` P3):  its classes alone, and the `.d.ts` `tsc` makes
    // from its TypeScript (`declarationsFor()`) -- as `spell compile` writes them
    test.runIf(LIBRARY_FIXTURES.has(name))(`${name} as a library`, async () => {
      await expect(compiledFixture(name, P.LibraryWriter.instance)).toMatchFileSnapshot(
        fixturePath(name, `${name}.lib${SP.SNAPSHOT_JS_SUFFIX}`)
      )
      const source = compiledFixture(name, P.LibraryTSWriter.instance)
      const types = (await declarationsFor({ [`${name}.lib.ts`]: source }))[`${name}.lib.ts`]
      await expect(types).toMatchFileSnapshot(fixturePath(name, `${name}.lib.snapshot.d.ts`))
    })
  }
})
