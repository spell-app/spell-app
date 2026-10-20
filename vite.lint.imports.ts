import { dirname, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { definePlugin, defineRule, type ESTree, type Rule } from "vite-plus/lint/plugins"

/**
 * `spell`:  an oxlint plugin for the repo's own import rules, in every package and its tests
 * (WWOD §4, "Package aliases, never `../`";  epic `repo-split` P3).
 * - Unlike `spell-ui/*` (`vite.lint.patterns.ts`), which holds component files to Spell UI's patterns,
 *   these hold for EVERY file under `packages/` and `tests/`:  on in `lintBase` (`vite.lint.ts`).
 * - Files at the repo root (`vite.*.ts` ...) aren't in a package:  no rule here looks at them.
 */

////////////////
// ## Rules
////////////////

/** The repo root:  this file's folder. */
const ROOT = dirname(fileURLToPath(import.meta.url))

/** The folders whose sub-folders are packages:  `packages/<name>/` (the code) and `tests/<name>/` (its tests). */
const PACKAGE_FOLDERS = new Set(["packages", "tests"])

/** `vi.*` calls that take a module path:  a mock is an import too. */
const VI_CALLS = new Set(["mock", "doMock", "unmock", "doUnmock", "importActual", "importMock"])

/**
 * A relative import that climbs out of its package into ANOTHER package's folder:
 * `import { checkoutOf } from "../../../../server/src/checkout.ts"`, from `packages/spaces/`.
 * - A package's code (`packages/<a>/`) and its tests (`tests/<a>/`) count as ONE package:
 *   a test may reach its own package's files, and they its test folder.
 * - Looks at every module path a file names:  `import`, `export ... from`, `import()`, `import x = require()`,
 *   `import("...").Type`, `require()`, `vi.mock()` and friends, and `import.meta.glob()`.
 * - NOT a file path read or spawned (`resolve(import.meta.dirname, "../..")`, `new URL("..", import.meta.url)`):
 *   no alias reaches those.
 * - A path into the repo root's own files (`../../vite.lint.ts`) is fine:  they're nobody's package.
 * - Its fix, in its message:  the package's alias (`$/server`, `$/ui/test/...`);  in a file Vite loads as a config,
 *   which has no alias table, the package's npm name (`@spell-app/server/src/checkout.ts`), through its `exports`
 *   when it has them (`@spell-app/ui/vite.config.ts`).
 */
const noCrossPackageImport = defineRule({
  meta: {
    type: "problem",
    docs: { description: "No relative import from one package into another:  import through the package's alias" },
    messages: {
      climb:
        "`{{path}}` climbs out of `{{from}}` into `{{into}}`:  import it through the package, never `../`:  " +
        "its alias (`$/{{name}}`, or an entry point `tsconfig.base.json` lists), or where no alias reaches " +
        "(a Vite config), its npm name (`@spell-app/{{name}}/...`)  " +
        '(WWOD §4, "Package aliases, never `../`")'
    }
  },
  create(context) {
    const file = context.filename
    const from = packageOf(file)
    if (!from) return {}

    /** Report `node` if the path it names lands in another package. */
    const check = (node: ESTree.Node | null | undefined) => {
      const path = node ? stringOf(node) : undefined
      // a glob's `!` leaves files out:  still a path into that folder
      const target = path?.replace(/^!/, "")
      if (!node || !path || !target?.startsWith("../")) return
      const into = packageOf(resolve(dirname(file), target))
      if (into && into.name !== from.name) {
        context.report({
          node,
          messageId: "climb",
          data: { path, from: from.folder, into: into.folder, name: into.name }
        })
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      TSImportType: (node) => check(node.source),
      TSExternalModuleReference: (node) => check(node.expression),
      CallExpression(node) {
        if (!isModuleCall(node.callee)) return
        const [first] = node.arguments
        if (first?.type === "ArrayExpression") for (const element of first.elements) check(element)
        else check(first)
      }
    }
  }
})

////////////////
// ## Helpers
////////////////

/** The package a path is in, by its folder from the root (`packages/ui`, `tests/ui`), if it's in one. */
function packageOf(path: string): { name: string; folder: string } | undefined {
  const parts = relative(ROOT, path).split(sep)
  if (parts.length < 3 || !PACKAGE_FOLDERS.has(parts[0]!)) return undefined
  return { name: parts[1]!, folder: `${parts[0]}/${parts[1]}` }
}

/** The text of a string literal, or of a template literal with nothing put in it. */
function stringOf(node: ESTree.Node): string | undefined {
  if (node.type === "Literal") return typeof node.value === "string" ? node.value : undefined
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0]?.value.cooked ?? undefined
  return undefined
}

/** Does `callee` take a module path:  `require()`, `vi.mock()` ..., `import.meta.glob()`? */
function isModuleCall(callee: ESTree.Node): boolean {
  if (callee.type === "Identifier") return callee.name === "require"
  if (callee.type !== "MemberExpression" || callee.property.type !== "Identifier") return false
  const { object, property } = callee
  if (object.type === "Identifier") return object.name === "vi" && VI_CALLS.has(property.name)
  return object.type === "MetaProperty" && object.meta.name === "import" && property.name === "glob"
}

////////////////
// ## Plugin
////////////////

/** The rules, by name:  `spell/<name>` in a config or a disable comment. */
export const IMPORT_RULES = {
  "no-cross-package-import": noCrossPackageImport
} satisfies Record<string, Rule>

export default definePlugin({ meta: { name: "spell" }, rules: IMPORT_RULES })
