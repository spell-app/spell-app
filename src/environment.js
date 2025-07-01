import { fileURLToPath } from "url"
import { resolve } from "path"

const serverBaseFile = fileURLToPath(import.meta.url)
const srcDir = resolve(serverBaseFile, "..")
const staticDir = resolve(srcDir, "..", "static")

/**
 * Normalized environment variables for the server and client setup.
 */
const environment = {
  vitePort: process.env.VITE_PORT || 3000,
  expressPort: process.env.PORT || 3001,
  api_server: process.env.API_SERVER || "localhost",
  srcDir,
  staticDir,
  systemFilesRoot: srcDir,
  userFilesRoot: srcDir
}
console.warn({ environment })

export default environment

