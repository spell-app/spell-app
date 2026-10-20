import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, test } from "vite-plus/test"
import { RuleTester } from "vite-plus/lint/plugins-dev"

import { IMPORT_RULES } from "../../../packages/toolchain/src/lint.imports.ts"

/**
 * The `spell/*` lint rules (`lint.imports.ts`, the toolchain's):  what each flags, and what it lets through.
 * - The rules read where a file IS, so every case names its file, from the repo root (`at()`).
 */

////////////////
// ## The rules
////////////////

RuleTester.describe = describe
RuleTester.it = test

const tester = new RuleTester()

describe("spell/no-cross-package-import", () => {
  tester.run("no-cross-package-import", IMPORT_RULES["no-cross-package-import"], {
    valid: [
      // its own package, by `../`, and other packages by alias or npm name
      at("packages/ui/src/runtime/Focus.ts", `import { E } from "../elements/index.ts"`),
      at("packages/spaces/src/server/node/environment.ts", `import { checkoutOf } from "$/server"`),
      at("packages/app/vite.config.ts", `import env from "@spell-app/spaces/server/node/environment"`),
      // a package and its tests are ONE package
      at("tests/ui/tools/LintPatterns.test.ts", `import { Tool } from "../../../packages/ui/tools/Tool.ts"`),
      at("tests/toolchain/src/a.test.ts", `import { x } from "../../../packages/toolchain/src/lint.ts"`),
      at("packages/ui/vitest.config.ts", `const x = import("../../tests/ui/tests.types.ts")`),
      // the repo root's own files belong to no package
      at("packages/brand/vite.config.ts", `import { x } from "../../vite.config.ts"`),
      at("tests/ui/tools/x.test.ts", `import { x } from "../../../vitest.config.ts"`),
      // a file at the root is in no package itself
      at("vite.config.ts", `import { baseConfig } from "./packages/ui/vite.config.ts"`),
      // a file path, not a module:  no alias reaches it
      at("tests/cli/src/schemas.test.ts", `const f = new URL("../../spaces/@spell/test/x.ts", import.meta.url)`),
      at("tests/lsp/src/server.test.ts", `const dir = resolve(import.meta.dirname, "../../../packages/cli")`),
      // a path built at run time
      at("packages/app/src/a.ts", "const m = await import(`../../ui/src/${name}.ts`)")
    ],
    invalid: [
      climbs(
        "packages/spaces/src/server/node/environment.ts",
        `import { x } from "../../../../server/src/checkout.ts"`
      ),
      climbs("packages/app/vite.shared.ts", `export { CSS_TARGETS } from "../ui/vite.config.ts"`),
      climbs("packages/app/src/a.ts", `export * from "../../core/src/index.ts"`),
      climbs("packages/app/src/a.ts", "const m = await import(`../../ui/src/index.ts`)"),
      climbs("packages/app/src/a.ts", `type T = import("../../ui/src/index.ts").Thing`),
      climbs("packages/cli/src/a.ts", `const ui = require("../../ui/src/index.ts")`),
      climbs("tests/app/src/a.test.ts", `vi.mock("../../../packages/spaces/src/index.ts")`),
      climbs("tests/app/src/a.test.ts", `await vi.importActual("../../../packages/ui/src/index.ts")`),
      climbs("tests/app/src/a.test.ts", `import { helper } from "../../ui/test/helper.ts"`),
      climbs("tests/x/src/a.test.ts", `import.meta.glob(["./*.ts", "!../../../packages/ui/src/skip.ts"])`),
      climbs("packages/ui/src/a.ts", `declare module "../../spell-element/src/vocabulary.types" {}`)
    ]
  })
})

// epic `repo-split` P6:  another repo's package by its npm name;  `$/` inside a repo
describe("spell/no-cross-repo-alias", () => {
  tester.run("no-cross-repo-alias", IMPORT_RULES["no-cross-repo-alias"], {
    valid: [
      // inside one repo:  spell-lang's `spell` and `parser`, spell-app's `app` and `lsp`, a package's own
      at("packages/spell/src/a.ts", `import { P } from "$/parser"`),
      at("packages/app/src/a.ts", `import { LSP } from "$/lsp"`),
      at("tests/ui/components/a.test.ts", `import { ElementFixture } from "$/ui/test/ElementFixture"`),
      // another repo's, by its npm name
      at("packages/app/src/a.ts", `import { E } from "@spell-app/ui/core"`),
      at("packages/ui/src/a.ts", `declare module "@spell-app/spell-element/vocabulary.types" {}`),
      // a string that only names a module:  a page's `packModules` key
      at("packages/app/vite.shared.ts", `const SHARED = ["$/ui/core", "$/spell-element"]`),
      // a file at the root, or in no repo:  left alone
      at("vite.config.ts", `import { x } from "$/ui"`),
      at("packages/nowhere/src/a.ts", `import { x } from "$/ui"`)
    ],
    invalid: [
      crosses("packages/app/src/a.ts", `import { E } from "$/ui/core"`, "@spell-app/ui/core"),
      crosses("packages/ui/src/a.ts", `export * from "$/spell-element"`, "@spell-app/spell-element"),
      crosses("tests/brand/components/a.test.ts", `import { A11y } from "$/ui/test/A11y"`, "@spell-app/ui/test/A11y"),
      crosses(
        "packages/parser/src/a.ts",
        `const m = await import("$/util/spell/Logger")`,
        "@spell-app/util/spell/Logger"
      ),
      crosses("packages/app/src/a.ts", `type T = import("$/spell").SP`, "@spell-app/spell"),
      crosses("tests/app/src/a.test.ts", `vi.mock("$/spell")`, "@spell-app/spell"),
      crosses(
        "packages/ui/src/a.ts",
        `declare module "$/spell-element/vocabulary.types" {}`,
        "@spell-app/spell-element"
      )
    ]
  })
})

////////////////
// ## Helpers
////////////////

/** The repo root. */
const ROOT = fileURLToPath(new URL("../../../", import.meta.url))

/** A case:  `code`, in the file at `file` (from the repo root). */
function at(file: string, code: string) {
  return { code, filename: join(ROOT, file) }
}

/** A case the rule flags once, naming the fix. */
function climbs(file: string, code: string) {
  return { ...at(file, code), errors: [{ message: /climbs out of `(packages|tests)\/[\w-]+` into .*\$\// }] }
}

/** A `no-cross-repo-alias` case, flagged once, its message naming `fix`. */
function crosses(file: string, code: string, fix: string) {
  return { ...at(file, code), errors: [{ message: new RegExp(`import it by its npm name, \`${fix}`) }] }
}
