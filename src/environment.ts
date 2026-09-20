import { fileURLToPath } from "url"
import { resolve } from "path"

const serverBaseFile = fileURLToPath(import.meta.url)
const srcDir = resolve(serverBaseFile, "..")
const staticDir = resolve(srcDir, "..", "static")

/**
 * Normalized environment variables for the server and client setup.
 */
const environment = {
  vitePort: Number(process.env.VITE_PORT) || 3000,
  expressPort: Number(process.env.PORT) || 3001,
  api_server: process.env.API_SERVER || "localhost",
  srcDir,
  staticDir,
  // NOTE: `systemFilesRoot`/`userFilesRoot` both point at `srcDir` for now -- `project-utils.ts` already
  // picks between them by `owner` (`"@system"` vs user), so they're ready to diverge once user files
  // move somewhere else.
  systemFilesRoot: srcDir,
  userFilesRoot: srcDir
}
console.warn({ environment })

export default environment
