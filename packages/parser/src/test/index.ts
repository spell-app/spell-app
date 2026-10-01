//
//  ## Barrel for shared test helpers that only need the generic parser.
//  Imported by `*.test.ts` files only -- nothing in `src/` proper should depend on this.
//  NOTE: `@spell/spell`'s `src/test/index.ts` re-exports this, so `import { unitTestModuleRules } from "#spell/test"` works too.
//

export { unitTestModuleRules } from "./unitTestModuleRules"
