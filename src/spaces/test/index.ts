//
//  ## The test helpers of spell-app's tests:  the frozen test projects (`@spell/test`), and the examples tested as they are.
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//  - Inline projects, the samples and the rest:  spell-parser's `spell-parser/spell/test`.
//

export {
  loadFixtureProject,
  copyFixtureProject,
  lineOf,
  fixturePath,
  fixtureFolder,
  snapshotPath,
  fixtureProjectId,
  FIXTURES_GROUP,
  fixtureProjectNames,
  compiledFixture,
  fixtureDeclarations,
  fixtureDraws,
  fixtureWords,
  fixtureLanguages,
  fixtureImports,
  fixtureImportScope,
  FIXTURES_DIR,
  EXAMPLE_FIXTURES,
  EXAMPLES_GROUP,
  EXAMPLE_SNAPSHOTS_DIR,
  PYTHON_FIXTURES,
  LIBRARY_FIXTURES
} from "./fixtures"
