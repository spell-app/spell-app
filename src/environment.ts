import { fileURLToPath } from "url"
import { resolve } from "path"

const serverBaseFile = fileURLToPath(import.meta.url)
const srcDir = resolve(serverBaseFile, "..")
const staticDir = resolve(srcDir, "..", "static")

/**
 * Normalized environment variables for the server and client setup.
 */
export default {
  vitePort: process.env.VITE_PORT || 3000,
  expressPort: process.env.PORT || 3001,
  srcDir,
  staticDir,
  systemFilesRoot: srcDir,
  userFilesRoot: srcDir,
}
