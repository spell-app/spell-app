/**
 * `yarn cli:install`:  put `spell` on your `PATH`, as a symlink to `bin/spell.mjs` in this checkout.
 * - Links into the first of these that's on your `PATH` and writable:
 *   - `~/.local/bin`
 *   - npm's global `bin` (`npm prefix -g`) -- NOT on `PATH` under volta, which only puts its shims there
 *   - `/usr/local/bin`, `/opt/homebrew/bin`
 * - None of them:  `~/.local/bin`, with a note to add it to `PATH`.
 * - `SPELL_BIN_DIR=/some/dir yarn cli:install` links there instead.
 * - NOT `npm link`:  that runs an npm install over this yarn project.
 * - Run it again after moving this checkout:  the link holds its full path.
 */
import { execSync } from "node:child_process"
import {
  accessSync,
  chmodSync,
  constants,
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  symlinkSync,
  unlinkSync
} from "node:fs"
import { homedir } from "node:os"
import { delimiter, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const target = resolve(dirname(fileURLToPath(import.meta.url)), "..", "bin", "spell.mjs")
const onPath = (process.env.PATH ?? "").split(delimiter)
const localBin = resolve(homedir(), ".local", "bin")
const binDir = process.env.SPELL_BIN_DIR ?? chooseBinDir()
const link = resolve(binDir, "spell")

chmodSync(target, 0o755)
mkdirSync(binDir, { recursive: true })
if (existsSync(link) || isSymlink(link)) {
  if (!isSymlink(link)) {
    console.error(`${link} exists and isn't a symlink -- not replacing it.`)
    process.exit(1)
  }
  unlinkSync(link)
}
symlinkSync(target, link)
console.log(`Linked ${link} -> ${target}`)
if (!onPath.includes(binDir)) {
  console.log(`NOTE: ${binDir} isn't on your PATH -- add it to use \`spell\`.`)
}

/** First folder we can link into that's on `PATH` -- see the header. */
function chooseBinDir() {
  const npmBin = resolve(execSync("npm prefix -g", { encoding: "utf8" }).trim(), "bin")
  const candidates = [localBin, npmBin, "/usr/local/bin", "/opt/homebrew/bin"]
  return candidates.find((dir) => onPath.includes(dir) && isWritable(dir)) ?? localBin
}

/** Can we write into folder `dir`? */
function isWritable(dir) {
  try {
    accessSync(dir, constants.W_OK)
    return true
  } catch {
    return false
  }
}

/** Is there a symlink at `path`, even a broken one? */
function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink() && !!readlinkSync(path)
  } catch {
    return false
  }
}
