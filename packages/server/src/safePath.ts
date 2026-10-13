/**
 * Turn a URL path into a file under a root folder -- never anything outside it.
 * - Was three slightly different checks, one of them without a dot-file block:
 *   `relative().startsWith("..")`, `normalize` + `startsWith`, `startsWith(root + sep)`.
 */
import { existsSync, statSync, type Stats } from "node:fs"
import { isAbsolute, join, relative, resolve, sep } from "node:path"

import { SRV } from "$/server"

/**
 * Where a URL path led:
 * - `file`:  serve it (`stat` is its stats)
 * - `redirect`:  a folder asked for without its trailing `/`:
 *   answer 301 to this path, so the page's relative links resolve inside the folder
 * - `status`:  answer this error instead -- 400 bad encoding, 403 hidden or outside, 404 missing
 */
export type Resolved =
  | { file: string; stat: Stats }
  | { redirect: string }
  | { status: 400 | 403 | 404; message: string }

/**
 * Options for `resolveInside()`.
 * - `dotFiles`:  allow names starting with `.` (default:  403)
 * - `index`:  file a folder resolves to (default `index.html`);  `false`:  folders 404
 */
export type ResolveOptions = { dotFiles?: boolean; index?: string | false }

/**
 * The file under `root` that URL path `urlPath` names (still percent-encoded, e.g. `/a%20b/c.html`).
 * - each segment is decoded on its own, so an encoded `/` (`%2F`) can't build a path;  it's a 400
 * - `..` / `.` segments and NUL bytes are refused;  so is any name starting with `.`, unless `dotFiles`
 * - the result is checked to be inside `root` after resolving, as a last line
 * - SIDE EFFECT:  `stat`s the disk
 */
export function resolveInside(root: string, urlPath: string, options: ResolveOptions = {}): Resolved {
  const { dotFiles = false, index = "index.html" } = options
  let file: string
  try {
    file = fileInside(root, urlPath, { dotFiles })
  } catch (error) {
    if (!(error instanceof SRV.HttpError)) throw error
    return { status: error.status as 400 | 403, message: error.message }
  }
  const stat = statSync(file, { throwIfNoEntry: false })
  if (!stat) return { status: 404, message: `not found:  ${urlPath}` }
  if (stat.isFile()) return { file, stat }
  if (!stat.isDirectory() || index === false) return { status: 404, message: `not found:  ${urlPath}` }
  if (!urlPath.endsWith("/")) return { redirect: `${urlPath}/` }
  const indexFile = join(file, index)
  const indexStat = existsSync(indexFile) ? statSync(indexFile) : undefined
  if (!indexStat?.isFile()) return { status: 404, message: `no ${index} in:  ${urlPath}` }
  return { file: indexFile, stat: indexStat }
}

/**
 * The path under `root` that URL path `urlPath` names, by `resolveInside()`'s rules, whether or not it's there:
 * what `FileOperations` creates, or moves something to.
 * - NEVER follows links:  `path.resolve()`, not `realpath()`,
 *   so a folder linked in from elsewhere (the shared content folders) is still inside
 * - NEVER touches the disk
 * - throws `HttpError(400)` for a bad encoding, `HttpError(403)` for `..`, `.` or a dot file (unless `dotFiles`)
 */
export function fileInside(root: string, urlPath: string, { dotFiles = false }: { dotFiles?: boolean } = {}): string {
  const segments: string[] = []
  for (const raw of urlPath.split("/")) {
    if (raw === "") continue
    let segment: string
    try {
      segment = decodeURIComponent(raw)
    } catch {
      throw new SRV.HttpError(400, `bad path:  ${urlPath}`)
    }
    if (/[/\\\0]/.test(segment)) throw new SRV.HttpError(400, `bad path:  ${urlPath}`)
    if (segment === "." || segment === "..") throw new SRV.HttpError(403, `outside the root:  ${urlPath}`)
    if (!dotFiles && segment.startsWith(".")) throw new SRV.HttpError(403, `hidden file:  ${urlPath}`)
    segments.push(segment)
  }
  const base = resolve(root)
  const file = resolve(base, ...segments)
  if (!isInside(base, file)) throw new SRV.HttpError(403, `outside the root:  ${urlPath}`)
  return file
}

/** Whether `file` is `root` or under it;  both absolute and resolved. */
export function isInside(root: string, file: string): boolean {
  if (file === root) return true
  const inside = relative(root, file)
  return inside !== "" && !inside.startsWith(`..${sep}`) && inside !== ".." && !isAbsolute(inside)
}
