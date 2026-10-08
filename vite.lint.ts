import type { OxfmtConfig } from "vite-plus/fmt"
import type { OxlintConfig } from "vite-plus/lint"

/**
 * Lint (oxlint) and format (oxfmt) settings every package shares, as `lint` / `fmt` blocks of `vite.config.ts`.
 * - Was `.oxlintrc.json`, `.oxlintrc.react.json` and `.oxfmtrc.json` at the repo root, before Vite+ (`vp lint`,
 *   `vp fmt`, `vp check`) folded them into `vite.config.ts`.
 * - Plain objects, spread by the root's `vite.config.ts` and each package's:  `lint.extends` only takes FILE paths,
 *   and the files are gone.
 * - NOTE: a package's `lint` block does NOT inherit the root's:  oxlint reads the nearest config only, so each
 *   package spreads `packageLint()`.  `vp check` reads the ROOT block only.
 */

////////////////
// ## Lint
////////////////

/**
 * Shared rules:  every package.  `packageLint({ react: true })` adds React's (`reactLint`).
 * - `solid-element` spreads this too, though it's a fork of upstream code:  only `ignorePatterns` differ.
 */
export const lintBase = {
  // MUST be listed:  without it, oxlint adds its DEFAULT plugins (e.g. `unicorn`)
  plugins: ["typescript", "oxc", "import"],

  // `correctness` ~== what `eslint:recommended` + `tseslint:recommended` used to give us.
  categories: { correctness: "error" },

  // Type-aware rules, driven from the config so the CLI and the editor agree without anyone having to remember a
  // flag.  Runs on `oxlint-tsgolint`, which `vite-plus` brings.
  // NOTE: NOT `typeCheck`:  `yarn ts` already runs `tsc`, and a second type check reports every error twice.
  options: { typeAware: true },

  // `vite-plus/prefer-vite-plus-imports`:  `vite-plus/test`, not `vitest` (and so on), so every package gets its
  // tools at the one version `vite-plus` pins.
  jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],

  // NOTE: only rules that DIFFER from the `correctness` defaults belong here.  Anything listed as plain `"error"`
  // was redundant and has been removed -- `categories` already enables it.
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
    // `ui`'s controllers type their vocabulary getters by merging an interface into the class
    // (`export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}`);  the getters are real,
    // installed on the prototype by `UIElement.register()` (epic `wwod-spell-ui`, P14).
    "typescript/no-unsafe-declaration-merging": "off",

    ////////////////
    // ## Type-aware
    ////////////////

    // Passing a method reference is idiomatic throughout this codebase -- `store`/`spellCore` are singletons whose
    // methods reach them by name rather than via `this`, and React components are handed prototype methods on
    // purpose (see `ErrorHandler`).  ~37 hits, all intentional.
    "typescript/unbound-method": "off",
    // spellCore stringifies arbitrary values on purpose (`upperCase(thing)` etc), so this rule fires ~36 times on
    // intended behaviour.  Individual risky spots are suppressed inline.
    "typescript/restrict-template-expressions": "off",

    ////////////////
    // ## Vite+
    ////////////////

    "vite-plus/prefer-vite-plus-imports": "error"
  }
} satisfies OxlintConfig

/**
 * React's rules, for packages with React code:  `spell` (the app), `cli` (Ink screens) and the ones split from
 * `spell`.  Merged AFTER `lintBase`.
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
    // `@risingstack/react-easy-state` components read/write the external `store` during render.  The
    // React-Compiler-era rules model components as pure, so they flag that by design.
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
  "**/src/components/ui-emoji/data",
  "**/src/languages",
  "**/src/components/ui-markdown/md.bundle.js",
  "**/site/dist",
  "**/tools/frameworks/solid/dist",
  "**/tools/results",
  // generated by `spell dev docs update`:  minified @spell-app/ui bundle
  "**/docs/tools/_assets/spell-ui.js",
  "**/docs/tools/_assets/lazy",
  "**/docs/tools/_assets/emoji",
  // packages' own, from their `packageLint()`:  the editor and `vp check` read only this root block
  "packages/app/dist-runner",
  "packages/app/dist-element",
  "packages/app/static",
  "packages/spell/.venv",
  "packages/spell/graphify-out",
  "packages/spell/thoughts",
  "packages/spell/static",
  "packages/spell/projects",
  "packages/spell/vscode-extension/out",
  // its own yarn project, with its own tools
  "packages/vscode",
  // `epics`'s component pack:  generated (`spell dev pack build epics`)
  "packages/epics/pack"
]

/**
 * Rules tests turn off, as an `overrides` entry for the root block and every package's.
 * - `typescript/no-misused-spread`:  WWOD §20 compares a whole instance with `toEqual({ ...instance })`, which the
 *   rule calls a mistake (a spread drops the prototype:  that's the point there).  Epic `wwod-spell-ui`, I22.
 */
export const testLint = {
  files: ["**/*.test.ts", "**/*.test.tsx"],
  rules: { "typescript/no-misused-spread": "off" }
} satisfies NonNullable<OxlintConfig["overrides"]>[number]

/**
 * Packages that get React's rules (`reactLint`):  the ROOT block's `overrides` -- one config for the editor and
 * `vp check`, which never read a package's.  Their `vite.config.ts` says `packageLint({ react: true })`.
 */
export const REACT_PACKAGES = ["app", "cli", "core", "lsp", "parser", "spell", "util"]

/** The root's `lint` block:  `lintBase` everywhere, `reactLint` on top in `REACT_PACKAGES`. */
export function rootLint() {
  return {
    ...lintBase,
    ignorePatterns: rootLintIgnore,
    overrides: [
      {
        files: REACT_PACKAGES.map((name) => `packages/${name}/**`),
        plugins: reactLint.plugins,
        rules: reactLint.rules
      },
      testLint
    ]
  } satisfies OxlintConfig
}

/**
 * A package's `lint` block:  `lintBase`, plus `reactLint` when `react`.
 * - `ignorePatterns`:  the package's own, relative to its folder.  NOT inherited from the root's.
 */
export function packageLint({ react = false, ignorePatterns = ["build", "dist", ".cache"] }: PackageLintProps = {}) {
  return {
    ...lintBase,
    plugins: react ? [...reactLint.plugins, ...lintBase.plugins] : lintBase.plugins,
    ignorePatterns,
    rules: react ? { ...lintBase.rules, ...reactLint.rules } : lintBase.rules,
    overrides: [testLint]
  } satisfies OxlintConfig
}

/** Options of `packageLint()`. */
export type PackageLintProps = {
  /** add React's rules (`reactLint`) */
  react?: boolean
  /** the package's ignore patterns, relative to its folder */
  ignorePatterns?: string[]
}

////////////////
// ## Format
////////////////

/**
 * oxfmt settings, for every package:  `vp fmt` reads the nearest `vite.config.ts` `fmt` block, so a package with
 * its own `vite.config.ts` spreads this.
 */
export const fmtConfig = {
  trailingComma: "none",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 120,
  sortPackageJson: true,
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
    // a package's built `static/` (`app`, `spell`):  from its own folder, and from the root.  NOT `**/static/**`,
    // which also skipped `ui`'s source folder `src/static/` (the static server render)
    "static/**",
    "**/packages/*/static/**",
    "**/projects/**",
    "**/vscode-extension/out/**",
    "**/docs/tools/_assets/spell-ui.js",
    "**/docs/tools/_assets/lazy/**",
    // the emoji chunks `bundle-spell-ui.js` writes:  formatting them would make every build a diff
    "**/docs/tools/_assets/emoji/**",
    "**/src/test/fixtures/**",
    "**/src/graphify-out/**",
    "**/coverage/**",
    "**/reference/**",
    "**/src/icons/data/**",
    "**/src/icons/icon-packs/**",
    "**/src/components/ui-emoji/data/**",
    "**/src/languages/spell.*.js",
    "**/src/components/ui-markdown/md.bundle.js",
    "**/ui/site/_assets/**",
    "**/ui/site/_data/**",
    "**/brand/_data/**",
    // Spell UI's hand-laid-out pages and their `search.json`:  the shared `ui/` at the root (claude-design P6)
    "ui/**",
    "**/vendor/**",
    "**/packages/*/dist/**",
    "**/packages/*/.vitest/**",
    "**/packages/*/*results.json",
    "**/tools/frameworks/solid/dist/**",
    "**/tools/results/**",
    "**/packages/epics/pack/**"
  ]
} satisfies OxfmtConfig
