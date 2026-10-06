//
//  ## Master import file for shared test helpers.
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//

export { unitTestModuleRules } from "$/parser/test"
export { tsxBinary } from "./tsxBinary"
export {
  parseSpellProject,
  loadFixtureProject,
  fixturePath,
  fixtureProjectId,
  fixtureProjectNames,
  compiledFixture,
  fixtureDeclarations,
  FIXTURES_DIR,
  summarize,
  describeParseErrors
} from "./parseSpellProject"
export type { SpellSourceFile, ParsedSpellProject, SpellProjectSummary } from "./parseSpellProject"
