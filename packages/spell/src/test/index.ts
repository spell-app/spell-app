//
//  ## Master import file for shared test helpers.
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//

export { unitTestModuleRules } from "./unitTestModuleRules"
export { tsxBinary } from "./tsxBinary"
export {
  parseSpellProject,
  loadFixtureProject,
  fixturePath,
  fixtureProjectId,
  fixtureProjectNames,
  compiledFixture,
  FIXTURES_DIR,
  summarize,
  describeParseErrors
} from "./parseSpellProject"
export type { SpellSourceFile, ParsedSpellProject, SpellProjectSummary } from "./parseSpellProject"
