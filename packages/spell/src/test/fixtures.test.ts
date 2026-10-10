import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"
import { compiledFixture, fixtureDeclarations, fixturePath, fixtureProjectNames, fixtureWords } from "$/spell/test"

/**
 * Every fixture project in `projects/test/` compiled, against its snapshot beside it:
 * `projects/test/<Project>/<Project>.snapshot.js`, and its declarations against `<Project>.snapshot.declarations.json`;
 * as TypeScript (the `ts/solid` target), against `<Project>.snapshot.tsx`;  its words against `<Project>.en.snapshot.js`.
 * - Why beside it:  a change shows up as a diff of a real `.js` file, in VS Code's Source Control.
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
  }
})
