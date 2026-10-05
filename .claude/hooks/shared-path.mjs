#!/usr/bin/env node
/**
 * Claude Code's `PreToolUse` hook on Edit / Write / NotebookEdit (`.claude/settings.json`):  an edit through one of
 * the shared content links (`packages/docs/content`, `goals`, `agents`;  epic `shared-content`) is DENIED, with the
 * file's real path in the shared repo to use instead.  Claude retries there.
 * - Why:  a WORKTREE session's Edit / Write refuses a path through a link ("spelled in a form that cannot be safely
 *   resolved"), and refuses it too when a hook rewrites it (`updatedInput`:  "Edit the worktree copy ... instead of
 *   the shared-checkout path"), but takes the real path (`/Users/.../spell-app-dev/...`) as given.  The main session
 *   doesn't mind;  sending it to the real path too keeps one rule.
 * - stdin `{ tool_name, tool_input: { file_path | notebook_path }, ... }`.  Denies only when some folder on the path
 *   is a link whose target is inside the shared repo;  prints nothing otherwise.
 * - Always exits 0:  a hook that fails never blocks an edit.
 */
import { lstatSync, readFileSync, realpathSync } from "node:fs"
import { dirname, join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * The MAIN checkout:  this hook's (`.claude/hooks/` is two folders down), or the one above it when the hook is a
 * worktree's copy (`<main>/.claude/worktrees/<w>`).  The shared repo's `dir` is relative to it.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..").replace(/[\\/]\.claude[\\/]worktrees[\\/][^\\/]+$/, "")

try {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}")
  const key = input.tool_input?.notebook_path !== undefined ? "notebook_path" : "file_path"
  const path = input.tool_input?.[key]
  const real = typeof path === "string" ? throughLink(path) : undefined
  if (real) {
    const reason =
      `Shared content (epic shared-content):  ${path} goes through a link into the shared repo, which an edit can't ` +
      `go through.  Edit the real file instead, the same file every checkout sees:  ${real}`
    console.log(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason }
      })
    )
  }
} catch {
  // never block an edit
}
process.exit(0)

/**
 * `path` with its first linked folder resolved, when that link points into the shared repo;  else `undefined`.
 * - the file itself needn't exist (Write makes it):  only its folders are checked
 */
function throughLink(path) {
  const shared = realOrSelf(sharedDir())
  const parts = resolve(path).split(sep)
  for (let i = 2; i < parts.length; i++) {
    const folder = parts.slice(0, i).join(sep)
    if (!lstatSync(folder, { throwIfNoEntry: false })?.isSymbolicLink()) continue
    const target = realOrSelf(folder)
    if (target !== shared && !target.startsWith(`${shared}${sep}`)) return undefined
    return join(target, ...parts.slice(i))
  }
  return undefined
}

/** The shared repo:  `"shared": { "dir" }` in the main checkout's `package.json` (default `../spell-app-dev`). */
function sharedDir() {
  try {
    const dir = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).shared?.dir ?? "../spell-app-dev"
    return resolve(ROOT, dir)
  } catch {
    return resolve(ROOT, "../spell-app-dev")
  }
}

/** `path` with every link resolved, or `path` itself when it doesn't exist. */
function realOrSelf(path) {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}
