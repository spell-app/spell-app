//
//  ## The test helpers of spell-app's tests:  the frozen test projects (`@spell/test`).
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//  - Inline projects, the samples and the rest:  spell-lang's `spell-lang/spell/test`.
//

export {
  loadFixtureProject,
  loadFixtureWithLibraries,
  copyFixtureWithLibraries,
  fixturePath,
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
  LIBRARY_GROUP,
  FIXTURES_DIR,
  PYTHON_FIXTURES,
  LIBRARY_FIXTURES
} from "./fixtures"
