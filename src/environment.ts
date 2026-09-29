import { fileURLToPath } from "url"
import { resolve } from "path"

const serverBaseFile = fileURLToPath(import.meta.url)
const srcDir = resolve(serverBaseFile, "..")
const staticDir = resolve(srcDir, "..", "static")
/** Every spell project on disk:  `system/` (examples, guides, library), `user/`, and `test/` (fixtures). */
const projectsDir = resolve(srcDir, "..", "projects")

/**
 * Normalized environment variables for the server and client setup.
 */
const environment = {
  vitePort: Number(process.env.VITE_PORT) || 3000,
  expressPort: Number(process.env.PORT) || 3001,
  api_server: process.env.API_SERVER || "localhost",
  srcDir,
  staticDir,
  projectsDir,
  /** Projects we ship, e.g. `projects/system/examples/Solitaire` -- `@system:...` roots.  See `project-utils.ts`. */
  systemFilesRoot: resolve(projectsDir, "system"),
  /** Projects users make, e.g. `projects/user/Errors` -- `@user:projects`. */
  userFilesRoot: resolve(projectsDir, "user"),
  /** Frozen projects tests run against, e.g. `projects/test/Solitaire` -- `@test:fixtures`.  See `~/test`. */
  testFilesRoot: resolve(projectsDir, "test")
}
console.warn({ environment })

export default environment
