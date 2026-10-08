/**
 * Content types by file extension:  ONE table for every server in the repo.
 * - Source-ish files (`.ts`, `.md`, `.spell` ...) are `text/plain`,
 *   so a browser shows them rather than downloading them.
 * - Was copied four times (`cli`'s `serve.ts`, `ui`'s `StaticServer`, goals' `server.js`, VS Code's `DocPreview`).
 */
import { extname } from "node:path"

/** Content type for each extension, lower-case, with its dot. */
export const TYPES: Record<string, string> = {
  // pages and code
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".wasm": "application/wasm",
  // source, shown as text
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".jsx": "text/plain; charset=utf-8",
  ".json5": "text/plain; charset=utf-8",
  ".spell": "text/plain; charset=utf-8",
  ".yml": "text/plain; charset=utf-8",
  ".yaml": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".sh": "text/plain; charset=utf-8",
  // images
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  // fonts
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
  // media and documents
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".zip": "application/zip"
}

/** What anything not in `TYPES` is served as. */
export const UNKNOWN_TYPE = "application/octet-stream"

/** Content type of `path`, by its extension, e.g. `typeFor("a/b.css")` === `"text/css; charset=utf-8"`. */
export function typeFor(path: string): string {
  return TYPES[extname(path).toLowerCase()] ?? UNKNOWN_TYPE
}

/**
 * Content type for a short name or extension, as Express's `res.type()` takes them:
 * - `"json"` / `".json"` -> `TYPES[".json"]`
 * - anything with a `/` (`"text/javascript"`) is already a type, and returned as is
 */
export function typeNamed(name: string): string {
  if (name.includes("/")) return name
  return TYPES[name.startsWith(".") ? name : `.${name}`] ?? UNKNOWN_TYPE
}

/** Whether `type` is text, so a body of it is a string with a charset. */
export function isTextType(type: string): boolean {
  return /^text\/|[/+](json|javascript|xml)\b|charset=/.test(type)
}
