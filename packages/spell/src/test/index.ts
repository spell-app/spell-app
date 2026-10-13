//
//  ## Master import file for shared test helpers.
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//

export { unitTestModuleRules } from "$/parser/test"
export { tsxBinary } from "./tsxBinary"
export { solidSample } from "./samples"
export { runSpell } from "./runSpell"
export {
  parseSpellProject,
  loadFixtureProject,
  fixturePath,
  fixtureProjectId,
  fixtureProjectNames,
  compiledFixture,
  fixtureDeclarations,
  fixtureDraws,
  fixtureWords,
  fixtureImports,
  FIXTURES_DIR,
  PYTHON_FIXTURES,
  LIBRARY_FIXTURES,
  summarize,
  describeParseErrors,
  describeWarnings
} from "./parseSpellProject"
export type { SpellSourceFile, ParsedSpellProject, SpellProjectSummary } from "./parseSpellProject"
