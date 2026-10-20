import type { OxfmtConfig } from "vite-plus/fmt"
import type { OxlintConfig } from "vite-plus/lint"
import { fileURLToPath } from "node:url"

/**
 * Lint (oxlint) and format (oxfmt) settings every package shares, as `lint` / `fmt` blocks of `vite.config.ts`.
 * - Was `.oxlintrc.json`, `.oxlintrc.react.json` and `.oxfmtrc.json` at the repo root,
 *   before Vite+ (`vp lint`, `vp fmt`, `vp check`) folded them into `vite.config.ts`.
 * - Plain objects, spread by the root's `vite.config.ts` and each package's:
 *   `lint.extends` only takes FILE paths, and the files are gone.
 * - NOTE: a package's `lint` block does NOT inherit the root's:
 *   oxlint reads the nearest config only, so each package spreads `packageLint()`.
 *   `vp check` reads the ROOT block only.
 */

////////////////
// ## Lint
////////////////

/**
 * Shared rules:  every package.
 * - `packageLint({ react: true })` adds React's (`reactLint`).
 */
export const lintBase = {
  // MUST be listed:  without it, oxlint adds its DEFAULT plugins (e.g. `unicorn`)
  plugins: ["typescript", "oxc", "import"],

  // `correctness` ~== what `eslint:recommended` + `tseslint:recommended` used to give us.
  categories: { correctness: "error" },

  // Type-aware rules, driven from the config,
  // so the CLI and the editor agree without anyone having to remember a flag.
  // - Runs on `oxlint-tsgolint`, which `vite-plus` brings.
  // - NOTE: NOT `typeCheck`:  `yarn ts` already runs `tsc`, and a second type check reports every error twice.
  options: { typeAware: true },

  // `vite-plus/prefer-vite-plus-imports`:  `vite-plus/test`, not `vitest` (and so on),
  // so every package gets its tools at the one version `vite-plus` pins.
  // `spell-ui/*`:  Spell UI's patterns in component files (`patternLint()`);
  // loaded everywhere, on in `PATTERN_FOLDERS`.
  // `spell/*`:  the repo's own import rules (`vite.lint.imports.ts`), on everywhere (below).
  jsPlugins: [
    { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
    { name: "spell-ui", specifier: fileURLToPath(new URL("./vite.lint.patterns.ts", import.meta.url)) },
    { name: "spell", specifier: fileURLToPath(new URL("./vite.lint.imports.ts", import.meta.url)) }
  ],

  // NOTE: only rules that DIFFER from the `correctness` defaults belong here.
  // Anything listed as plain `"error"` was redundant and has been removed -- `categories` already enables it.
  rules: {
    ////////////////
    // ## Core / TypeScript
    ////////////////

    // `tsc` already reports these via `noUnusedLocals` -- avoid duplicate diagnostics.
    "no-unused-vars": "off",
    "typescript/no-unused-vars": "off",
    // spell is a dynamic language runtime;  `any` is deliberate at its JS/spell bridges.
    "typescript/no-explicit-any": "off",

    "prefer-const": ["error", { destructuring: "all" }],
    // `ui`'s components type their attribute getters by merging an interface into the class
    // (`export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}`);
    // the getters are real, put on the class by `UIComponent.register()` (epic `wwod-spell-ui`, P14).
    "typescript/no-unsafe-declaration-merging": "off",

    ////////////////
    // ## Type-aware
    ////////////////

    // Passing a method reference is idiomatic throughout this codebase --
    // `store`/`core` are singletons whose methods reach them by name rather than via `this`,
    // and React components are handed prototype methods on purpose (see `ErrorHandler`).
    // ~37 hits, all intentional.
    "typescript/unbound-method": "off",
    // core stringifies arbitrary values on purpose (`upperCase(thing)` etc),
    // so this rule fires ~36 times on intended behaviour.
    // Individual risky spots are suppressed inline.
    "typescript/restrict-template-expressions": "off",

    ////////////////
    // ## Vite+
    ////////////////

    "vite-plus/prefer-vite-plus-imports": "error",

    ////////////////
    // ## Ours
    ////////////////

    // A relative import from one package (or its tests) into another's folder:  `$/server`, never
    // `../../../../server/src/...` (WWOD §4).
    // - HERE, not in an `overrides` entry:  it holds for every package and its tests, so the root's block and every
    //   package's (`packageLint()`) get it with the rest of `lintBase`, and it's on in tests too (`testLint` leaves it).
    // - It skips the repo root's own files itself:  they're in no package.
    "spell/no-cross-package-import": "error"
  }
} satisfies OxlintConfig

/**
 * React's rules, for packages with React code:
 * `spell` (the app), `cli` (Ink screens) and the ones split from `spell`.
 * Merged AFTER `lintBase`.
 * - NEVER for `ui`:  it's Solid, where React's rules misfire (e.g. `jsx-key`).
 */
export const reactLint = {
  plugins: ["react"],
  rules: {
    // MUST stay listed:  unlike the other correctness rules, this one is NOT enabled by the category alone.
    // Verified -- delete this line and conditional hooks stop being reported.
    "react-hooks/rules-of-hooks": "error",
    // Deliberately a warning rather than an error:  dep-array fixes are judgement calls.
    "react-hooks/exhaustive-deps": "warn",
    // Automatic JSX runtime (`"jsx": "react-jsx"`), so `React` need not be in scope.
    "react/react-in-jsx-scope": "off",
    // `@risingstack/react-easy-state` components read/write the external `store` during render.
    // The React-Compiler-era rules model components as pure, so they flag that by design.
    "react/immutability": "off",
    "react/exhaustive-effect-dependencies": "off"
  }
} satisfies OxlintConfig

/**
 * Vendored, generated and scratch trees, for the ROOT's `lint` block.
 * - `**`-prefixed:  read relative to the config's folder, they must match in any package.
 * - Mirrors `fmtConfig.ignorePatterns`.
 */
export const rootLintIgnore = [
  "build",
  "dist",
  ".cache",
  ".yarn",
  ".vitest",
  "vendor",
  "reference",
  "coverage",
  "**/src/icons/icon-packs",
  "**/src/icons/data",
  "**/components/ui-emoji/data",
  "**/site/dist",
  "**/tools/frameworks/solid/dist",
  "**/tools/results",
  // the epic engine, spell-epic, through the checkout's link (epic `epic-eject` I5):  linted in its own repo
  "spell-epic",
  // packages' own, from their `packageLint()`:  the editor and `vp check` read only this root block
  "packages/app/dist-runner",
  "packages/app/dist-element",
  "packages/app/static",
  "packages/spell/.venv",
  "packages/spell/graphify-out",
  "packages/spell/thoughts",
  "packages/spell/static",
  // the `@spell` space's projects (and the test projects):  spell source, and what compiling writes beside it
  "packages/spaces/@spell",
  "tests/spaces/@spell",
  "packages/spell/vscode-extension/out",
  // its own yarn project, with its own tools
  "packages/vscode",
  // `brand`'s component pack:  generated (`spell dev pack build brand`)
  "packages/brand/components/__pack"
]

/**
 * Rules tests turn off, as an `overrides` entry for the root block and every package's.
 * - `typescript/no-misused-spread`:  WWOD §20 compares a whole instance with `toEqual({ ...instance })`,
 *   which the rule calls a mistake (a spread drops the prototype:  that's the point there;
 *   epic `wwod-spell-ui`, I22).
 */
export const testLint = {
  files: ["**/*.test.ts", "**/*.test.tsx"],
  rules: { "typescript/no-misused-spread": "off", ...patternRules("off") }
} satisfies NonNullable<OxlintConfig["overrides"]>[number]

/**
 * The folders of COMPONENT files, by package (its folder under `packages/`):
 * `patternLint()` turns the `spell-ui/*` rules on there.
 * - Every set's elements, all written on `$/spell-element`, held to the same patterns, each in its package's
 *   `components/`:  Spell UI's (and its docs site's widgets, `src/docs-components/`), the brand's, and
 *   the app's own (`<spell-app>`, `<spell-editor>`).
 *   - The epics' elements are spell-epic's (epic `epic-eject` I5), held to the same rules there.
 * - Not:
 *   - `app`'s `src/`:  WWOD §17's function components (Owen:  "other than app components")
 *   - the element core (`$/spell-element`, and `ui`'s `src/elements/`):  the decorators and helpers themselves
 *   - tests (`testLint`)
 */
export const PATTERN_FOLDERS: Record<string, string[]> = {
  ui: ["components", "src/docs-components"],
  brand: ["components"],
  app: ["components"]
}

/**
 * The `spell-ui/*` rules (`vite.lint.patterns.ts`), as an `overrides` entry:
 * a component file doing by hand what one of Spell UI's decorators or helpers does
 * (`packages/ui/AGENTS.md`, "Solid authoring").
 * - Each message names the decorator or helper to use instead.
 * - A use that stays says why:  `// oxlint-disable-next-line spell-ui/no-untrack -- <why>`.
 * - `prefix`:  where the packages are, seen from the config's folder:
 *   - `"packages/"` for the root's block
 *   - `""` for a package's own (`packageLint({ name })`), which lists only its own folders (`names`)
 */
export function patternLint(prefix: string, names = Object.keys(PATTERN_FOLDERS)) {
  const folders = names.flatMap((name) =>
    (PATTERN_FOLDERS[name] ?? []).map((folder) => (prefix ? `${prefix}${name}/${folder}` : folder))
  )
  return {
    files: folders.flatMap((folder) => [`${folder}/**/*.ts`, `${folder}/**/*.tsx`]),
    rules: patternRules("error")
  } satisfies NonNullable<OxlintConfig["overrides"]>[number]
}

/** Every `spell-ui/*` rule, set to `level`. */
function patternRules(level: "error" | "off") {
  return {
    "spell-ui/no-solid-effect": level,
    "spell-ui/no-mutation-observer": level,
    "spell-ui/no-dom-element-listener": level,
    "spell-ui/no-untrack": level,
    "spell-ui/no-raw-timer": level,
    "spell-ui/no-function-component": level
  } as const
}

/**
 * Packages that get React's rules (`reactLint`):  the ROOT block's `overrides` --
 * one config for the editor and `vp check`, which never read a package's.
 * Their `vite.config.ts` says `packageLint({ react: true })`.
 */
export const REACT_PACKAGES = ["app", "cli", "core", "lsp", "parser", "spell", "util"]

/** The root's `lint` block:  `lintBase` everywhere, `reactLint` on top in `REACT_PACKAGES`. */
export function rootLint() {
  return {
    ...lintBase,
    ignorePatterns: rootLintIgnore,
    overrides: [
      {
        // and their tests, in the repo's tests/ folder at the same paths (epic `people-and-orgs` P10)
        files: REACT_PACKAGES.flatMap((name) => [`packages/${name}/**`, `tests/${name}/**`]),
        plugins: reactLint.plugins,
        rules: reactLint.rules
      },
      patternLint("packages/"),
      testLint
    ]
  } satisfies OxlintConfig
}

/**
 * A package's `lint` block:  `lintBase`, plus `reactLint` when `react`.
 * - `ignorePatterns`:  the package's own, relative to its folder;  NOT inherited from the root's.
 *   - Plus every component pack's generated folder, `components/__pack/` (`spell dev pack build`), always.
 * - `name`:  its folder under `packages/`, for the `spell-ui/*` rules in its `PATTERN_FOLDERS`.
 */
export function packageLint({
  react = false,
  ignorePatterns = ["build", "dist", ".cache"],
  name
}: PackageLintProps = {}) {
  return {
    ...lintBase,
    plugins: react ? [...reactLint.plugins, ...lintBase.plugins] : lintBase.plugins,
    ignorePatterns: [...ignorePatterns, PACK_FOLDER],
    rules: react ? { ...lintBase.rules, ...reactLint.rules } : lintBase.rules,
    overrides: name && PATTERN_FOLDERS[name] ? [patternLint("", [name]), testLint] : [testLint]
  } satisfies OxlintConfig
}

/** A component pack's generated folder in its package (`spell dev pack build`):  never linted. */
const PACK_FOLDER = "components/__pack"

/** Options of `packageLint()`. */
export type PackageLintProps = {
  /** add React's rules (`reactLint`) */
  react?: boolean
  /** the package's ignore patterns, relative to its folder */
  ignorePatterns?: string[]
  /** its folder under `packages/` (`"ui"`):  turns the `spell-ui/*` rules on in its `PATTERN_FOLDERS` */
  name?: string
}

////////////////
// ## Format
////////////////

/**
 * oxfmt settings, for every package:
 * `vp fmt` reads the nearest `vite.config.ts` `fmt` block, so a package with its own `vite.config.ts` spreads this.
 */
export const fmtConfig = {
  trailingComma: "none",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 120,
  sortPackageJson: true,
  // spell's JSON5 stays the JSON-compatible part (epic `people-and-orgs` P12):  keys in double quotes, as written, so
  // Python's `json` reads it and VS Code checks it against its schema;  oxfmt would unquote them (`"as-needed"`)
  overrides: [{ files: ["*.json5"], options: { quoteProps: "preserve" } }],
  ignorePatterns: [
    "**/.output.js",
    "**/*.md",
    "**/*.scopes.js",
    "**/build/**",
    "**/dist/**",
    "**/.cache/**",
    "**/.venv/**",
    "**/.yarn/**",
    "**/.claude/**",
    "**/.vitest/**",
    "**/graphify-out/**",
    "**/thoughts/**",
    // a package's built `static/` (`app`, `spell`):  from its own folder, and from the root.
    // NOT `**/static/**`, which also skipped `ui`'s source folder `src/static/` (the static server render)
    "static/**",
    "**/packages/*/static/**",
    // spell projects:  the `@spell` space's built-ins (`packages/spaces/@spell/`) and the test projects
    "**/spaces/@spell/**",
    "**/vscode-extension/out/**",
    // the epic engine, spell-epic, through the checkout's link (epic `epic-eject` I5):  formatted in its own repo
    "spell-epic/**",
    "**/src/test/fixtures/**",
    "**/src/graphify-out/**",
    "**/coverage/**",
    "**/reference/**",
    "**/src/icons/data/**",
    "**/src/icons/icon-packs/**",
    "**/components/ui-emoji/data/**",
    "**/ui/site/_assets/**",
    // the brand set's data, ALL of it (`yarn site:data` in `packages/brand`):  `pages.json5` too, which it rewrites
    "**/brand/docs/__data/**",
    // App UI's generated data (`yarn site:data` in `packages/app`;  `.json5` since epic `epic-workflow` P20):  the bytes
    // stay the generator's.
    // `**/docs/...`:  matched from the root AND from the package, whose `vp fmt .` runs there
    "**/docs/__data/components.json5",
    "**/docs/__data/search.json5",
    // Spell UI's hand-laid-out pages, their parts and data (`packages/ui/docs/`;
    // the shared `ui/` at the root until epic `people-and-orgs` P18:  until it merges, that folder too)
    "**/ui/docs/**",
    "ui/**",
    "**/vendor/**",
    "**/packages/*/dist/**",
    "**/packages/*/.vitest/**",
    "**/packages/*/*results.json",
    "**/tools/frameworks/solid/dist/**",
    "**/tools/results/**",
    // every component pack's generated folder (`spell dev pack build`):  `**/` first, so a package's own
    // `vp fmt components` skips it too
    "**/components/__pack/**"
  ]
} satisfies OxfmtConfig
