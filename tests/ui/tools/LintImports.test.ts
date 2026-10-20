import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, test } from "vite-plus/test"
import { RuleTester } from "vite-plus/lint/plugins-dev"

import { IMPORT_RULES } from "../../../vite.lint.imports.ts"

/**
 * The `spell/*` lint rules (`vite.lint.imports.ts`, at the repo root):  what each flags, and what it lets through.
 * - Here, beside the `spell-ui/*` rules' tests (`LintPatterns.test.ts`):  the root has no test project.
 * - The rule reads where a file IS, so every case names its file, from the repo root (`at()`).
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
      at("packages/app/vite.config.ts", `import env from "@spell-app/spaces/src/server/node/environment.ts"`),
      // a package and its tests are ONE package
      at("tests/ui/tools/LintPatterns.test.ts", `import { Tool } from "../../../packages/ui/tools/Tool.ts"`),
      at("packages/ui/vitest.config.ts", `const x = import("../../tests/ui/tests.types.ts")`),
      // the repo root's own files belong to no package
      at("packages/brand/vite.config.ts", `import { packageLint } from "../../vite.lint.ts"`),
      at("tests/ui/tools/LintImports.test.ts", `import { IMPORT_RULES } from "../../../vite.lint.imports.ts"`),
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
      climbs("tests/x/src/a.test.ts", `import.meta.glob(["./*.ts", "!../../../packages/ui/src/skip.ts"])`)
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
