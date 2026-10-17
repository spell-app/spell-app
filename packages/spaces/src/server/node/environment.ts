import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// By relative path, `.ts` and all:  app's `vite.config.ts` loads this file, bundled with no alias table.  The
// server's checkout finder, node built-ins only:  the main checkout from any worktree
import { checkoutOf } from "../../../../server/src/checkout.ts"

/** spaces' `src/`:  this file is in `src/server/node/`. */
const spacesSrcDir = resolve(fileURLToPath(import.meta.url), "..", "..", "..")
/** The monorepo's `packages/`. */
const packagesDir = resolve(spacesSrcDir, "..", "..")
/** This checkout's root:  the main one, or a worktree's. */
const repoDir = resolve(packagesDir, "..")
/**
 * Where compiled output goes, `build/` at the repo root (epic `people-and-orgs` P11):  never committed.
 * - Each project's own folder there MIRRORS its path:  `buildFolderFor()`, in `projects/project-utils.ts`.
 *   - under `packages/` or `tests/`:  the same path under `build/`
 *     - `packages/spaces/@spell/examples/solitaire` => `build/spaces/@spell/examples/solitaire`
 *   - under spell-spaces:  under `build/spell-spaces/`, `build/spell-spaces/@spell/owen@/errors`
 * - `SPELL_BUILD_DIR` sets it, e.g. the server's contract test's temporary folder.
 */
const buildDir = process.env.SPELL_BUILD_DIR ? resolve(process.env.SPELL_BUILD_DIR) : resolve(repoDir, "build")
/** `spell`'s `src/`. */
const srcDir = resolve(packagesDir, "spell", "src")
/** `core`'s `src/`:  the runtime, and its built-in types' scope pack (`spellCore.scopes.js`). */
const spellCoreDir = resolve(packagesDir, "core", "src")
/** `app`'s `static/`:  fonts and css the app serves. */
const staticDir = resolve(packagesDir, "app", "static")

/**
 * The MAIN checkout's root, from this checkout's:  the one a worktree's git shares (`SRV.checkoutOf()`), wherever the
 * worktree's folder is.
 * - spell-spaces sits beside it, so every worktree reads the same spaces.
 */
const mainRepoDir = checkoutOf(repoDir)?.main ?? repoDir

/**
 * spell-spaces:  every person's and org's space (decisions Q10, Q24).
 * - ONE folder for main and every worktree, outside git.
 * - By default it's beside the main checkout, `<main checkout>/../spell-spaces`.
 * - `SPELL_SPACES_DIR` sets it, e.g. tests' temporary folder.
 * - Laid out by org, each person's space inside it:  `@spell/owen@/errors/` is `owen@spell/errors`.
 * - The page server's `--spaces <dir>` sets it (P8).
 */
const spellSpacesDir = process.env.SPELL_SPACES_DIR
  ? resolve(process.env.SPELL_SPACES_DIR)
  : resolve(dirname(mainRepoDir), "spell-spaces")

/**
 * The folder holding each `SP.SpaceFolderBase` (`SP.SpellUrls.folderFor()`):
 * - `builtins`:  `packages/spaces/`, holding the `@spell` space's built-in projects, `@spell/examples/` ...
 * - `tests`:  `tests/spaces/`, holding the test projects, `@spell/test/`
 * - `spaces`:  spell-spaces
 * - `SPELL_BUILTINS_DIR` / `SPELL_TESTS_DIR` set the first two:
 *   so the server's contract test (`api.test.ts`) can point the server at a temporary copy, and never write into the repo.
 */
const spaceFolders = {
  builtins: process.env.SPELL_BUILTINS_DIR ? resolve(process.env.SPELL_BUILTINS_DIR) : resolve(packagesDir, "spaces"),
  tests: process.env.SPELL_TESTS_DIR ? resolve(process.env.SPELL_TESTS_DIR) : resolve(repoDir, "tests", "spaces"),
  spaces: spellSpacesDir
}

/**
 * Normalized environment variables for the server and client setup, and the folders spell's projects are in.
 * - Node only:  the editor's server, the language server, the `spell` command, tests.
 */
const environment = {
  vitePort: Number(process.env.VITE_PORT) || 3000,
  expressPort: Number(process.env.PORT) || 3001,
  api_server: process.env.API_SERVER || "localhost",
  srcDir,
  packagesDir,
  repoDir,
  buildDir,
  spellCoreDir,
  staticDir,
  spellSpacesDir,
  spaceFolders,
  /** The built-in projects, e.g. `packages/spaces/@spell/examples/solitaire` -- the `@spell/...` groups. */
  systemFilesRoot: resolve(spaceFolders.builtins, "@spell"),
  /**
   * Frozen projects tests run against, e.g. `tests/spaces/@spell/test/solitaire` -- `@spell/test`.
   * See `$/spell/test`.
   */
  testFilesRoot: resolve(spaceFolders.tests, "@spell", "test"),
  /**
   * This machine's person's own projects, e.g. `<spell-spaces>/@spell/owen@/errors` -- `owen@spell`.
   * - MUST be the folder of `SPACES.LOCAL_PERSON`'s space (a test checks).
   *   - It can't import that name:  this file imports nothing, since vite's configs load it too.
   */
  userFilesRoot: resolve(spellSpacesDir, "@spell", "owen@")
}

console.warn({ environment })

export default environment
