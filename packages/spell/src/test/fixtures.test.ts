import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"
import { compiledFixture, fixtureDeclarations, fixturePath, fixtureProjectNames } from "$/spell/test"

/**
 * Every fixture project in `projects/test/` compiled, against its snapshot beside it:
 * `projects/test/<Project>/<Project>.snapshot.js`, and its declarations against `<Project>.snapshot.declarations.json`.
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
  }
})
