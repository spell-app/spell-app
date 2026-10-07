#!/usr/bin/env node
/**
 * Claude Code's `UserPromptSubmit` hook (`.claude/settings.json`):  checks `/isolate`, `/epic` and `/unpark`
 * prompts BEFORE Claude reads them.  Every other prompt passes untouched.
 *
 * ## Why a hook
 * - It runs before Claude does anything, so it can rename the session first, and refuse a prompt that would go
 *   wrong, without losing what Owen typed.
 * - Claude can't run `/rename`, but this hook's `sessionTitle` output does the same (undocumented, CLI 2.1.287;
 *   see `~/.claude/hooks/session-title.mjs`).
 *
 * ## What it does, in order
 * - stdin `{ prompt, cwd, session_id, permission_mode, ... }`
 * - Acts only on `/isolate <name>` (not `/isolate done`), `/epic <name> [plan]` (not `/epic review ...`),
 *   `/epic resume <name>` and `/unpark <name>`.  `review`, `resume`, `color` and `future` are reserved epic names:  a
 *   review runs from any window, and keeps the session's name;  a resume, like `/unpark`, is only renamed (it picks
 *   its window itself);  `/epic color <look>` recolours the window it's typed in, and `/epic future <name> ...`
 *   writes an idea down as a future epic (no worktree):  nothing to gate.
 *   A look right after the name (`/epic x -purple`, epic `windows-and-review` P5) is the window's, not the plan's:
 *   left out of the text saved below.
 *   `<name>` is lower-kebab-cased as the skills do (`"Docs Index"` -> `docs-index`).
 * 1. Plan mode, on `/isolate` or `/epic <name>`:  blocks the prompt.  Why:  plan mode lets Claude write only the
 *    harness plan file, so no worktree can be made, and `ExitPlanMode` would ask Owen to approve a half-made plan.
 * 2. In another worktree, on `/isolate` or `/epic <name>`:  blocks the prompt.  "In" means either:
 *    - `cwd` is under `.claude/worktrees/<other>`
 *    - the session's VS Code window is a worktree's (`workspaces/ongoing/<other>.code-workspace`).  A new session
 *      there starts at the MAIN root, so `cwd` alone misses it.
 *    - Re-entering the SAME `<name>` is fine.
 * 3. Otherwise:  renames the session `<name>` (`hookSpecificOutput.sessionTitle`), unless it already is.  A ✅ title
 *    (its work merged, epic `windows-and-review` P6) isn't `<name>`, so reopening takes the ✅ off;  a ✅ still queued
 *    for it is dropped (`dropDoneTitle()`).  That's
 *    what lets the move to a worktree's window find the old tab by its label (`.claude/hooks/handoff.mjs`).
 * - SIDE EFFECT:  before either block, any text after the name is saved to `<prompts>/<name>.md`, and quoted
 *   back in the reason, so it can be copied.  `/epic <name>` / `/isolate <name>` alone picks it up later.
 *   `<prompts>`:  `$SPELL_PROMPTS_DIR`, else `~/.spell/prompts`.  An older file is kept as `<name>.<time>.md`.
 * - Never fails a prompt:  any error exits 0, the prompt untouched.
 * - Natural-language triggers ("isolate as foo") never reach here:  each skill's step 0 repeats these checks.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, sep } from "node:path"
import { pathToFileURL } from "node:url"

import { LOOKS, Window } from "../../scripts/window.mjs"

// run as the hook;  imported (by its tests), nothing runs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const input = JSON.parse(readFileSync(0, "utf8") || "{}")
    const output = gate(input, Window.current())
    if (output) console.log(JSON.stringify(output))
  } catch (error) {
    console.error(`prompt-gate hook:  ${error.message}`)
  }
}

/**
 * What the hook answers for `input` (its stdin), `window` being the session's window's registry entry (or
 * `null`);  `null` lets the prompt through untouched.
 * - SIDE EFFECT:  saves the prompt's text before blocking it (`savePrompt()`)
 */
export function gate(input, window) {
  const command = parseCommand(input.prompt)
  if (!command) return null
  const { skill, name, text } = command

  if (skill === "isolate" || skill === "epic") {
    if (input.permission_mode === "plan") {
      return block(
        name,
        text,
        `Plan mode is on, so \`/${skill}\` can't make its worktree.  ` +
          `Leave plan mode (shift+tab), then run \`/${skill} ${name}\`` +
          (text ? " alone:  it picks the text up." : ".")
      )
    }
    const other = otherWorktree(input.cwd, window, name)
    if (other) {
      return block(
        name,
        text,
        `You're in worktree \`${other}\`:  \`/${skill}\` there would nest one worktree's work in another.  ` +
          `\`/isolate done\` first, or run \`/${skill} ${name}\` from a package's window ` +
          `(\`workspaces/<pkg>.code-workspace\`)` +
          (text ? ":  it picks the text up." : ".")
      )
    }
  }

  // reopened:  a ✅ queued when its work merged (epic `windows-and-review` P6) and not yet applied must not land now
  dropDoneTitle(input.session_id)
  if (input.session_title === name) return null
  return { hookSpecificOutput: { hookEventName: "UserPromptSubmit", sessionTitle: name } }
}

/**
 * Drop session `id`'s queued title (`~/.claude/session-titles/<id>`, `$SPELL_SESSION_TITLES_DIR` in tests) when it's
 * a ✅ one:  the work it marked done is open again.  Any other queued title stays.
 */
export function dropDoneTitle(id) {
  if (!id) return
  const file = join(process.env.SPELL_SESSION_TITLES_DIR ?? join(homedir(), ".claude", "session-titles"), String(id).replace(/[^\w-]/g, ""))
  try {
    if (readFileSync(file, "utf8").trim().startsWith("✅")) rmSync(file)
  } catch {
    // none queued
  }
}

/**
 * `{ skill, name, text }` for an `/isolate <name>`, `/epic <name> [text]`, `/epic resume <name>` or `/unpark <name>`
 * prompt;  `null` for any other prompt, a missing name, `/isolate done`, `/epic review ...`, `/epic resume` alone or
 * `/unpark ?`.
 * - `skill`:  `"epic resume"` for `/epic resume <name>`
 * - `name`:  the first word, or a quoted phrase, lower-kebab-cased
 * - `text`:  the rest, trimmed (`""` when none)
 * - `color`:  a look right after the name (`-purple`, `window.mjs` `LOOKS`), left out of `text`;  else `null`
 */
export function parseCommand(prompt) {
  const match = /^\s*\/(isolate|epic|unpark)(?:\s+([\s\S]*))?$/.exec(prompt ?? "")
  if (!match) return null
  const [, skill, args = ""] = match
  const quoted = /^(["'])(.+?)\1\s*([\s\S]*)$/.exec(args)
  const [word, rest] = quoted ? [quoted[2], quoted[3]] : splitFirst(args)
  const name = kebab(word)
  if (!name || (skill === "isolate" && name === "done")) return null
  // `/epic review [<name>]` runs from any window and keeps the session's name:  nothing to gate
  if (skill === "epic" && name === "review") return null
  // `/epic color <look>` recolours this window;  `/epic future <name> ...` writes an idea down, from any window, no
  // worktree:  nothing to gate, no rename
  if (skill === "epic" && (name === "color" || name === "future")) return null
  // `/epic resume <name>`:  renamed `<name>`, as `/unpark <name>` is;  alone, it asks which epic
  if (skill === "epic" && name === "resume") {
    const resumed = parseCommand(`/unpark ${rest}`)
    return resumed && { ...resumed, skill: "epic resume" }
  }
  const look = /^\s*-([a-z]+)(?=\s|$)([\s\S]*)$/i.exec(rest)
  const color = look && look[1].toLowerCase() in LOOKS ? look[1].toLowerCase() : null
  return { skill, name, text: (color ? look[2] : rest).trim(), color }
}

/**
 * `name` lower-kebab-cased, as the skills do:  `Docs Index` -> `docs-index`, `vite+` -> `vite-plus`.
 * - `""` when nothing usable is left
 */
export function kebab(name) {
  return name
    .replace(/\+/g, " plus ")
    .toLowerCase()
    .replace(/[^a-z0-9._]+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
}

/**
 * The worktree, other than `name`, that the session is in:  by `cwd`, else by its window;  `null` when none.
 */
export function otherWorktree(cwd, window, name) {
  const marker = `${sep}.claude${sep}worktrees${sep}`
  const at = (cwd ?? "").indexOf(marker)
  const byCwd = at >= 0 ? (cwd.slice(at + marker.length).split(sep)[0] ?? "") : ""
  if (byCwd) return byCwd === name ? null : byCwd
  const file = window?.workspaceFile ?? ""
  const ongoing = /[\\/]workspaces[\\/]ongoing[\\/]([^\\/]+)\.code-workspace$/.exec(file)
  if (ongoing && ongoing[1] !== name) return ongoing[1]
  return null
}

/**
 * The hook's answer blocking a prompt, `why` first.
 * - SIDE EFFECT:  `text` saved first (`savePrompt()`), then quoted in the reason
 */
function block(name, text, why) {
  let reason = why
  if (text) {
    const file = savePrompt(name, text)
    reason += `\n\nYour text is saved in ${file.replace(homedir(), "~")}:\n\n${text}`
  }
  return { decision: "block", reason }
}

/**
 * Save `text` as `<prompts>/<name>.md`;  returns the file.
 * - NEVER loses text:  an older, different file there is renamed `<name>.<time>.md` first
 */
export function savePrompt(name, text) {
  const dir = process.env.SPELL_PROMPTS_DIR || join(homedir(), ".spell", "prompts")
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  const file = join(dir, `${name}.md`)
  if (existsSync(file) && readFileSync(file, "utf8").trim() !== text) {
    renameSync(file, join(dir, `${name}.${new Date().toISOString().replace(/[:.]/g, "-")}.md`))
  }
  writeFileSync(file, `${text}\n`, { mode: 0o600 })
  return file
}

/** `[first word, the rest]` of `args`. */
function splitFirst(args) {
  const match = /^(\S+)\s*([\s\S]*)$/.exec(args.trim())
  return match ? [match[1], match[2]] : ["", ""]
}
