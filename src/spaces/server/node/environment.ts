import { fileURLToPath } from "url"
import { dirname, join, resolve } from "path"

// The server's checkout finder, node built-ins only:  the main checkout from any worktree.
// By the server package's npm name, as every import is (WWOD §4).
// - NOTE: imports nothing of spell-app's:  app's `vite.config.ts` loads this file.
import { checkoutOf } from "spell-kit/server/checkout"

/** spaces' folder, `src/spaces/`:  this file is in `src/spaces/server/node/`. */
const spacesSrcDir = resolve(fileURLToPath(import.meta.url), "..", "..", "..")
/**
 * This checkout's root:  the main one, or a worktree's.
 * - spell-app's code is in its one `src/`, a folder each (`src/app/`, `src/spaces/` ...), since epic `repo-split` P14
 *   (folders at the root since P8, `packages/` before).
 */
const repoDir = resolve(spacesSrcDir, "..", "..")
/**
 * Where the app's build folder (`app/`) and the `@spell` space's projects (`spaces/`) are:  the repo's root
 * (`packagesDir` kept its name from when they were in `packages/`).
 */
const packagesDir = repoDir
/**
 * Where compiled output goes, `build/` at the repo root (epic `people-and-orgs` P11):  never committed.
 * - Each project's own folder there MIRRORS its path:  `buildFolderFor()`, in `projects/project-utils.ts`.
 *   - under this repo:  the same path under `build/`
 *     - `spaces/@spell/examples/Solitaire` => `build/spaces/@spell/examples/Solitaire`
 *     - the frozen test projects too:  `spaces/@spell/test/fizzbuzz` => `build/spaces/@spell/test/fizzbuzz`
 *   - under spell.spaces:  under `build/spell-spaces/`, `build/spell-spaces/@spell/owen@/errors`
 * - `SPELL_BUILD_DIR` sets it, e.g. the server's contract test's temporary folder.
 */
const buildDir = process.env.SPELL_BUILD_DIR ? resolve(process.env.SPELL_BUILD_DIR) : resolve(repoDir, "build")
/**
 * The folder of an installed package's main entry, through `node_modules`:  `spell-lang/spell` => spell-lang's
 * `src/spell/`.
 * - By package, never by a path into another repo:  spell-lang sits beside this repo only in the top repo `spell`.
 */
function entryFolder(name: string): string {
  return dirname(fileURLToPath(import.meta.resolve(name)))
}
/**
 * The folder of installed package `name`:  its `package.json`'s (every package of ours exports it);  for a sub-path of
 * a package (`spell-lang/py`), that folder in its `src/`:  a sub-path names a path under `src/`, as every import name
 * does (epic `repo-split` P14, Q47).
 * - e.g. `spell-lang/py` => spell-lang's `src/py/`, whose `core/` is the Python core;  `spell-lang` => its root
 * - Unscoped names only, as all of ours are.
 */
function packageFolder(name: string): string {
  const [own = name, ...path] = name.split("/")
  const root = dirname(fileURLToPath(import.meta.resolve(`${own}/package.json`)))
  return path.length ? join(root, "src", ...path) : root
}
/** `spell`'s `src/` (spell-lang's). */
const srcDir = entryFolder("spell-lang/spell")
/** `core`'s `src/` (spell-lang's):  the runtime, and its built-in types' scope pack (`core.scopes.js`). */
const coreDir = entryFolder("spell-lang/core")
/** `app`'s `static/`:  fonts and css the app serves. */
const staticDir = resolve(packagesDir, "app", "static")

/**
 * The MAIN checkout's root, from this checkout's:  the one a worktree's git shares (`SRV.checkoutOf()`).
 * - found wherever the worktree's folder is
 * - spell.spaces sits in the kit, so every worktree reads the same spaces.
 */
const mainRepoDir = checkoutOf(repoDir)?.main ?? repoDir

/**
 * spell.spaces:  every person's and org's space (decisions Q10, Q24).
 * - ONE folder for main and every worktree, outside git.
 * - By default it's beside the main checkout, `<main checkout>/../spell.spaces`:  in the top repo `spell`
 *   (`~/www/spell/spell.spaces`, epic `repo-split` J5;  `../spell-spaces` before).
 * - `SPELL_SPACES_DIR` sets it, e.g. tests' temporary folder.
 * - Laid out by org, each person's space inside it:  `@spell/owen@/errors/` is `owen@spell/errors`.
 * - The page server's `--spaces <dir>` sets it (P8).
 */
const spellSpacesDir = process.env.SPELL_SPACES_DIR
  ? resolve(process.env.SPELL_SPACES_DIR)
  : resolve(dirname(mainRepoDir), "spell.spaces")

/**
 * The folder holding each `SP.SpaceFolderBase` (`SP.SpellUrls.folderFor()`):
 * - `builtins`:  `spaces/`, holding the `@spell` space's projects:  the built-in groups (`@spell/examples/` ...) and the
 *   frozen test projects, `@spell/test/` (spell-lang's `tests/spaces/` until epic `spanish` P18)
 * - `spaces`:  spell.spaces
 * - `SPELL_BUILTINS_DIR` sets the first:
 *   so the server's contract test (`api.test.ts`) can point the server at a temporary copy, and never write into the repo.
 */
const spaceFolders = {
  builtins: process.env.SPELL_BUILTINS_DIR ? resolve(process.env.SPELL_BUILTINS_DIR) : resolve(packagesDir, "spaces"),
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
  coreDir,
  staticDir,
  spellSpacesDir,
  packageFolder,
  spaceFolders,
  /** The built-in projects, e.g. `spaces/@spell/examples/Solitaire` -- the `@spell/...` groups. */
  systemFilesRoot: resolve(spaceFolders.builtins, "@spell"),
  /**
   * Frozen projects tests run against, e.g. `spaces/@spell/test/fizzbuzz` -- `@spell/test`.
   * See `spell-app/spaces/test`.
   */
  testFilesRoot: resolve(spaceFolders.builtins, "@spell", "test"),
  /**
   * This machine's person's own projects, e.g. `<spell.spaces>/@spell/owen@/errors` -- `owen@spell`.
   * - MUST be the folder of `SPACES.LOCAL_PERSON`'s space (a test checks).
   *   - It can't import that name:  this file imports nothing, since vite's configs load it too.
   */
  userFilesRoot: resolve(spellSpacesDir, "@spell", "owen@")
}

export default environment
