import { dirname, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { definePlugin, defineRule, type ESTree, type Rule } from "vite-plus/lint/plugins"

/**
 * `spell`:  an oxlint plugin for the repo's own import rules, in every package and its tests
 * (WWOD §4, "Package aliases, never `../`";  epic `repo-split` P3 and P6).
 * - Unlike `spell-ui/*` (`lint.patterns.ts`), which holds component files to Spell UI's patterns,
 *   these hold for EVERY file under `packages/` and `tests/`:  on in `lintBase` (`lint.ts`).
 * - Files at the repo root (`vite.config.ts` ...) aren't in a package:  no rule here looks at them.
 */

////////////////
// ## Rules
////////////////

/**
 * The repo root, whose `packages/` and `tests/` the rules read:  this file is in `packages/toolchain/src/`.
 * - Until epic `repo-split` P8 cuts the repos;  then each repo's root holds its packages.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

/** The folders whose sub-folders are packages:  `packages/<name>/` (the code) and `tests/<name>/` (its tests). */
const PACKAGE_FOLDERS = new Set(["packages", "tests"])

/** `vi.*` calls that take a module path:  a mock is an import too. */
const VI_CALLS = new Set(["mock", "doMock", "unmock", "doUnmock", "importActual", "importMock"])

/**
 * A relative import that climbs out of its package into ANOTHER package's folder:
 * `import { checkoutOf } from "../../../../server/src/checkout.ts"`, from `packages/spaces/`.
 * - A package's code (`packages/<a>/`) and its tests (`tests/<a>/`) count as ONE package:
 *   a test may reach its own package's files, and they its test folder.
 * - Looks at every module path a file names (`moduleVisitor()`).
 * - NOT a file path read or spawned (`resolve(import.meta.dirname, "../..")`, `new URL("..", import.meta.url)`):
 *   no alias reaches those.
 * - A path into the repo root's own files (`../../vite.config.ts`) is fine:  they're nobody's package.
 * - Its fix, in its message:  the package's alias inside its repo (`$/parser`, from `spell`);  its npm name from
 *   another repo (`no-cross-repo-alias`), and in a file Vite loads as a config, which has no alias table
 *   (`@spell-app/server/checkout`, `@spell-app/ui/vite.config.ts`):  an entry its `package.json` `exports` names.
 */
const noCrossPackageImport = defineRule({
  meta: {
    type: "problem",
    docs: { description: "No relative import from one package into another:  import through the package's alias" },
    messages: {
      climb:
        "`{{path}}` climbs out of `{{from}}` into `{{into}}`:  import it through the package, never `../`:  " +
        "from its own repo, its alias (`$/{{name}}`, or an entry point `tsconfig.base.json` lists);  from another " +
        "repo, or where no alias reaches (a Vite config), its npm name (`@spell-app/{{name}}/...`, its `exports`)  " +
        '(WWOD §4, "Package aliases, never `../`")'
    }
  },
  create(context) {
    const file = context.filename
    const from = packageOf(file)
    if (!from) return {}

    return moduleVisitor((node, path) => {
      // a glob's `!` leaves files out:  still a path into that folder
      const target = path.replace(/^!/, "")
      if (!target.startsWith("../")) return
      const into = packageOf(resolve(dirname(file), target))
      if (into && into.name !== from.name) {
        context.report({
          node,
          messageId: "climb",
          data: { path, from: from.folder, into: into.folder, name: into.name }
        })
      }
    })
  }
})

/**
 * The repos the packages go to (epic `repo-split` P8), by package folder:  each `packages/<name>/`, and its tests.
 * - Inside ONE repo, a package names another by its alias (`$/parser`, from `spell`);  from ANOTHER repo, by its npm
 *   name (`@spell-app/ui/core`, from the app), as it will once the repos are cut.
 * - A package missing here is in no repo yet:  the rule leaves its imports alone.
 * - `epics`:  spell-epic, a repo already (`$/epics`, through the checkout's link).
 */
export const REPO_OF: Readonly<Record<string, string>> = {
  util: "spell-util",
  toolchain: "spell-util",
  server: "spell-server",
  assembler: "spell-server",
  "spell-element": "spell-element",
  parser: "spell-lang",
  markdown: "spell-lang",
  core: "spell-lang",
  py: "spell-lang",
  spell: "spell-lang",
  ui: "spell-ui",
  brand: "spell-brand",
  app: "spell-app",
  spaces: "spell-app",
  lsp: "spell-app",
  cli: "spell-app",
  vscode: "spell-app",
  "page-server": "spell-app",
  epics: "spell-epic"
}

/**
 * A `$/` alias naming a package of ANOTHER repo (`REPO_OF`):  `import { E } from "$/spell-element"`, from Spell UI.
 * - Its fix, in its message:  the package's npm name, `@spell-app/spell-element`, an entry its `package.json`
 *   `exports` names (a family's barrel is its published entry:  `@spell-app/ui/ui-code`).
 * - Looks at every module path a file names, as `no-cross-package-import` does.
 * - NOT a string that only NAMES a module:  a page's `SpellUI.packModules` keys (`"$/ui/core"`) stay `$/` names.
 */
const noCrossRepoAlias = defineRule({
  meta: {
    type: "problem",
    docs: { description: "No `$/` alias into another repo's package:  import it by its npm name" },
    messages: {
      alias:
        "`{{path}}` is `{{name}}`'s alias, from `{{from}}` ({{fromRepo}}) into {{intoRepo}}:  import it by its npm " +
        'name, `@spell-app/{{rest}}`, an entry of its `package.json` `exports`  (WWOD §4, "Package names across repos")'
    }
  },
  create(context) {
    const from = packageOf(context.filename)
    const fromRepo = from && REPO_OF[from.name]
    if (!from || !fromRepo) return {}
    return moduleVisitor((node, path) => {
      const name = /^\$\/([^/?]+)/.exec(path)?.[1]
      const intoRepo = name && REPO_OF[name]
      if (intoRepo && intoRepo !== fromRepo) {
        context.report({
          node,
          messageId: "alias",
          data: { path, name, from: from.folder, fromRepo, intoRepo, rest: path.slice(2) }
        })
      }
    })
  }
})

////////////////
// ## Helpers
////////////////

/**
 * A visitor calling `check(node, path)` for every module path a file names:  `import`, `export ... from`,
 * `import()`, `import x = require()`, `import("...").Type`, `require()`, `vi.mock()` and friends,
 * `import.meta.glob()`, and `declare module "..."` (an augmentation names its module too).
 */
function moduleVisitor(check: (node: ESTree.Node, path: string) => void) {
  const visit = (node: ESTree.Node | null | undefined) => {
    const path = node ? stringOf(node) : undefined
    if (node && path) check(node, path)
  }
  return {
    ImportDeclaration: (node: ESTree.ImportDeclaration) => visit(node.source),
    ExportNamedDeclaration: (node: ESTree.ExportNamedDeclaration) => visit(node.source),
    ExportAllDeclaration: (node: ESTree.ExportAllDeclaration) => visit(node.source),
    ImportExpression: (node: ESTree.ImportExpression) => visit(node.source),
    TSImportType: (node: ESTree.TSImportType) => visit(node.source),
    TSExternalModuleReference: (node: ESTree.TSExternalModuleReference) => visit(node.expression),
    TSModuleDeclaration: (node: ESTree.TSModuleDeclaration) => {
      if (node.id.type === "Literal") visit(node.id)
    },
    CallExpression(node: ESTree.CallExpression) {
      if (!isModuleCall(node.callee)) return
      const [first] = node.arguments
      if (first?.type === "ArrayExpression") for (const element of first.elements) visit(element)
      else visit(first)
    }
  }
}

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
  "no-cross-package-import": noCrossPackageImport,
  "no-cross-repo-alias": noCrossRepoAlias
} satisfies Record<string, Rule>

export default definePlugin({ meta: { name: "spell" }, rules: IMPORT_RULES })
