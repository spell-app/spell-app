import { fileURLToPath } from "url"
import { resolve } from "path"

/** `spell`'s `src/`:  this file is in `src/node/`. */
const srcDir = resolve(fileURLToPath(import.meta.url), "..", "..")
/** The monorepo's `packages/`. */
const packagesDir = resolve(srcDir, "..", "..")
/** `core`'s `src/`:  the runtime, and its built-in types' scope pack (`spellCore.scopes.js`). */
const spellCoreDir = resolve(packagesDir, "core", "src")
/** `app`'s `static/`:  fonts and css the app serves. */
const staticDir = resolve(packagesDir, "app", "static")
/**
 * Every spell project on disk:  `system/` (examples, guides, library), `user/`, and `test/` (fixtures).
 * - `SPELL_PROJECTS_DIR` env var overrides it, so the server's contract test (`api.test.ts`) can point the
 *   server at a temp copy and never write into the real projects.
 */
const projectsDir = process.env.SPELL_PROJECTS_DIR ? resolve(process.env.SPELL_PROJECTS_DIR) : resolve(srcDir, "..", "projects")

/**
 * Normalized environment variables for the server and client setup.
 */
const environment = {
  vitePort: Number(process.env.VITE_PORT) || 3000,
  expressPort: Number(process.env.PORT) || 3001,
  api_server: process.env.API_SERVER || "localhost",
  srcDir,
  packagesDir,
  spellCoreDir,
  staticDir,
  projectsDir,
  /** Projects we ship, e.g. `projects/system/examples/Solitaire` -- `@system:...` roots.  See `project-utils.ts`. */
  systemFilesRoot: resolve(projectsDir, "system"),
  /** Projects users make, e.g. `projects/user/Errors` -- `@user:projects`. */
  userFilesRoot: resolve(projectsDir, "user"),
  /** Frozen projects tests run against, e.g. `projects/test/Solitaire` -- `@test:fixtures`.  See `$/spell/test`. */
  testFilesRoot: resolve(projectsDir, "test")
}
console.warn({ environment })

export default environment
