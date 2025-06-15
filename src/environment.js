import { fileURLToPath } from "url"
import { dirname, join, resolve } from "path"

const serverBaseFile = fileURLToPath(import.meta.url)
const srcDir = resolve(serverBaseFile, "..")

/**
 * Normalized environment variables for the server and client setup.
 */
export default {
  vitePort: process.env.VITE_PORT || 3000,
  expressPort: process.env.PORT || 3001,
  srcDir,
  systemFilesRoot: srcDir,
  userFilesRoot: srcDir
}
