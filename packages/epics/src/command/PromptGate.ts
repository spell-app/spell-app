import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// By relative path, `.ts` and all:  the `UserPromptSubmit` hook loads this file with plain `node` (types stripped)
import { LOOKS, worktreeOf } from "../../../../scripts/window.mjs"
import { TITLE_ICONS } from "./command.types.ts"

/****************
 * ### `PromptGate`
 * The epic rules a prompt is checked against BEFORE Claude reads it:  `/isolate`, `/epic` and `/unpark` prompts.
 * - Every other prompt passes untouched.
 * - The `UserPromptSubmit` hook (`.claude/hooks/prompt-gate.mjs`) is a thin caller:
 *   it reads stdin, asks `PromptGate.gate()`, prints the answer.
 *
 * Why a hook:
 * - It runs before Claude does anything, so it can rename the session first,
 *   and refuse a prompt that would go wrong, without losing what Owen typed.
 * - Claude can't run `/rename`, but the hook's `sessionTitle` output does the same
 *   (undocumented, CLI 2.1.287;  see `~/.claude/hooks/session-title.mjs`).
 *
 * What it does, in order (`gate()`):
 * - Input:  the hook's stdin, `{ prompt, cwd, session_id, session_title, permission_mode, ... }`
 * - Acts only on these (`parseCommand()`):
 *   - `/isolate <name>`, not `/isolate done`
 *   - `/epic <name> [plan]`, not `/epic review ...` or `/epic done` (which is `/isolate done`)
 *   - `/epic resume <name>` and `/unpark <name>`
 *   - `review`, `resume`, `color`, `future`, `phase`, `start` and `request` are reserved epic ids:
 *     - a review runs from any window, and keeps the session's name
 *     - a resume, like `/unpark`, is only renamed (it picks its window itself)
 *     - `/epic color <look>` recolours the window it's typed in:  nothing to gate
 *     - `/epic future <name> ...` writes an idea down as a future epic (no worktree):  only renamed, `📅 <name>`
 *     - `/epic phase [ids] ...` adds a phase to THIS session's epic, `/epic start <phase | ids> ...` works one
 *       (epic `skillz` P4):  nothing to gate, no rename
 *     - `/epic request <epic> <rN>` takes up a request sent from another session (epic `epic-workflow`):
 *       only renamed, `🚧 <epic>`, as a resume is;  refused in a session titled for another epic (step 0)
 *   - A look right after the name (`/epic x -purple`, epic `windows-and-review` P5) is the window's, not the plan's:
 *     left out of the text saved below.
 *   - `<name>` is lower-kebab-cased as the skills do (`"Docs Index"` -> `docs-index`).
 * 0. `/epic review <name>`, first:  blocked in a session titled for a DIFFERENT epic
 *    (`🚧 <other>`:  epic `airplane` P12, Q10 B;  `reviewRefusal()`).  Any other review passes untouched.
 * 1. Plan mode, on `/isolate` or `/epic <name>`:  blocks the prompt.
 *    - Why:  plan mode lets Claude write only the harness plan file, so no worktree can be made,
 *      and `ExitPlanMode` would ask Owen to approve a half-made plan.
 * 2. In another worktree, on `/isolate` or `/epic <name>`:  blocks the prompt (`otherWorktree()`).  "In" means either:
 *    - `cwd` is under `.claude/worktrees/<other>`
 *    - the session's VS Code window is a worktree's (`workspaces/ongoing/<other>.code-workspace`).
 *      A new session there starts at the MAIN root, so `cwd` alone misses it.
 *    - Re-entering the SAME `<name>` is fine.
 *    - `/epic <name>` there is NOT blocked (Owen, 2026-10-07):
 *      typed in another epic's session, it means "open a window for `<name>`".
 *      - Let through, the session NOT renamed (it stays `<other>`'s), with a note (`additionalContext`)
 *        sending Claude to the `/epic` skill's "From another worktree", which asks first.
 * 3. Otherwise:  renames the session `🚧 <name>` (`hookSpecificOutput.sessionTitle`), unless it already is.
 *    - `/epic future <name>`:  `📅 <name>`, and neither block above (it makes no worktree).
 *    - The icons:  `TITLE_ICONS`.
 *    - A ✅ title (its work merged, epic `windows-and-review` P6) isn't `<name>`, so reopening takes the ✅ off;
 *      a ✅ still queued for it is dropped (`dropDoneTitle()`).
 *    - That's what lets the move to a worktree's window find the old tab by its label (`.claude/hooks/handoff.mjs`).
 * - SIDE EFFECT:  before either block (and the note), any text after the name is saved to `<prompts>/<name>.md`.
 *   - It's quoted back in the reason, so it can be copied.
 *   - `/epic <name>` / `/isolate <name>` alone picks it up later.
 *   - `<prompts>`:  `$SPELL_PROMPTS_DIR`, else `~/.spell/prompts`.
 *   - An older file is kept as `<name>.<time>.md`.
 * - Natural-language triggers ("isolate as foo") never reach here:  each skill's step 0 repeats these checks.
 *
 * Its position:  imports only node's own modules, the window script and this folder's types, by relative path,
 * so plain `node` loads it (types stripped);  NEVER an alias, an `enum` or a parameter property.
 * All `static`:  no state, one answer per prompt.
 ****************/
export class PromptGate {
  /**
   * What the hook answers for `input` (its stdin);  `null` lets the prompt through untouched.
   * - `window`:  the session's window's registry entry, or `null`
   * - SIDE EFFECT:  saves the prompt's text before blocking it (`savePrompt()`)
   */
  static gate(input: GateInput, window: GateWindow | null): GateAnswer | null {
    const refused = PromptGate.reviewRefusal(input)
    if (refused) return { decision: "block", reason: refused }
    const command = PromptGate.parseCommand(input.prompt)
    if (!command) return null
    const { skill, name, text } = command
    // a future epic is only written down:  no worktree, so nothing to block;
    // it gets its own icon ... but never over another epic's session:
    // that one keeps its title, the address its requests come to
    // (epic `epic-workflow` I5:  `/epic future output-wasm` retitled `🚧 epic-workflow`)
    if (skill === "epic future") {
      const own = PromptGate.epicOfTitle(input.session_title)
      if (own && own !== name) return null
      return rename(input, `${TITLE_ICONS.future} ${name}`)
    }

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
      const other = PromptGate.otherWorktree(input.cwd, window, name)
      // `/epic <name>` in another epic's session means "open a window for `<name>`" (Owen, 2026-10-07):  Claude asks
      if (other && skill === "epic") return launchNote(other, name, text)
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

    return rename(input, `${TITLE_ICONS.active} ${name}`)
  }

  /**
   * Why `/epic review <name>` (or `/epic request <name> <rN>`) must not run in this session, or `null`:
   * a session titled for a DIFFERENT epic refuses it (epic `airplane` P12, Q10 B;  `request`:  epic `epic-workflow`).
   * - "titled for an epic":  its title starts with one of `TITLE_ICONS` (`🚧 seo`);  the rest is the epic's name
   * - an untitled session, or one titled some other way (a main session's own words):  allowed
   * - `/epic review` alone (this session's own epic) is never refused
   */
  static reviewRefusal(input: GateInput): string | null {
    const match = /^\s*\/epic\s+(review|request)\s+(?:(["'])(.+?)\2|(\S+))/.exec(input.prompt ?? "")
    if (!match) return null
    const verb = match[1]
    const name = PromptGate.kebab(match[3] ?? match[4] ?? "")
    const epic = PromptGate.epicOfTitle(input.session_title)
    if (!name || !epic || epic === name) return null
    return `This session is titled for epic \`${epic}\`, not \`${name}\`:  run \`/epic ${verb} ${name}\` in ${name}'s own session (or a main one).`
  }

  /** The epic session title `title` names (`🚧 seo` -> `seo`), or `null` when it isn't an epic's title. */
  static epicOfTitle(title: string | null | undefined): string | null {
    const text = String(title ?? "").trim()
    for (const icon of Object.values(TITLE_ICONS)) {
      if (text.startsWith(icon)) return PromptGate.kebab(text.slice(icon.length)) || null
    }
    return null
  }

  /**
   * Drop session `id`'s queued title when it's a ✅ one:  the work it marked done is open again.
   * - Any other queued title stays.
   * - The queue:  `~/.claude/session-titles/<id>`, `$SPELL_SESSION_TITLES_DIR` in tests
   */
  static dropDoneTitle(id: string | undefined): void {
    if (!id) return
    const dir = process.env.SPELL_SESSION_TITLES_DIR ?? join(homedir(), ".claude", "session-titles")
    const file = join(dir, String(id).replace(/[^\w-]/g, ""))
    try {
      if (readFileSync(file, "utf8").trim().startsWith(TITLE_ICONS.done)) rmSync(file)
    } catch {
      // none queued
    }
  }

  /**
   * `{ skill, name, text, color }` for an `/isolate <name>`, `/epic <name> [text]`, `/epic resume <name>` or
   * `/unpark <name>` prompt;  `null` for any other prompt, a missing name, `/isolate done`, `/epic done`,
   * `/epic review ...`, `/epic resume` alone or `/unpark ?`.
   * - `skill`:  `"epic resume"` for `/epic resume <name>` (`"epic future"`, `"epic request"` likewise)
   * - `name`:  the first word, or a quoted phrase, lower-kebab-cased
   * - `text`:  the rest, trimmed (`""` when none)
   * - `color`:  a look right after the name (`-purple`, `window.mjs` `LOOKS`), left out of `text`;  else `null`
   */
  static parseCommand(prompt: string | undefined): GateCommand | null {
    const match = /^\s*\/(isolate|epic|unpark)(?:\s+([\s\S]*))?$/.exec(prompt ?? "")
    if (!match) return null
    const skill = match[1]!
    const args = match[2] ?? ""
    const quoted = /^(["'])(.+?)\1\s*([\s\S]*)$/.exec(args)
    const [word, rest] = quoted ? [quoted[2]!, quoted[3]!] : splitFirst(args)
    const name = PromptGate.kebab(word)
    // `/isolate done` and `/epic done` (the same steps) leave a worktree:  nothing to gate, no rename
    if (!name || name === "done") return null
    // `/epic review [<name>]` runs from any window and keeps the session's name:  nothing to gate
    if (skill === "epic" && name === "review") return null
    // `/epic color <look>` recolours this window:  nothing to gate, no rename
    if (skill === "epic" && name === "color") return null
    // `/epic phase [ids] ...` / `/epic start <phase | ids> ...` act on THIS session's epic (epic `skillz` P4):
    // it's already named, isolated and planned:  nothing to gate, no rename
    if (skill === "epic" && (name === "phase" || name === "start")) return null
    // `/epic future <name> ...` writes an idea down, from any window, no worktree:
    // renamed `📅 <name>`, never blocked
    // `/epic request <epic> <rN>`:  a request sent from another session (epic `epic-workflow`):
    // renamed `<epic>`, as a resume is, so later requests reach this session;
    // alone, nothing to gate:  it's this session's own epic's
    // `/epic resume <name>`:  renamed `<name>`, as `/unpark <name>` is;  alone, it asks which epic
    if (skill === "epic" && (name === "future" || name === "request" || name === "resume")) {
      const named = PromptGate.parseCommand(`/unpark ${rest}`)
      return named && { ...named, skill: `epic ${name}` }
    }
    const look = /^\s*-([a-z]+)(?=\s|$)([\s\S]*)$/i.exec(rest)
    const color = look && look[1]!.toLowerCase() in LOOKS ? look[1]!.toLowerCase() : null
    return { skill, name, text: (color ? look![2]! : rest).trim(), color }
  }

  /**
   * `name` lower-kebab-cased, as the skills do:  `Docs Index` -> `docs-index`, `vite+` -> `vite-plus`.
   * - `""` when nothing usable is left
   */
  static kebab(name: string): string {
    return name
      .replace(/\+/g, " plus ")
      .toLowerCase()
      .replace(/[^a-z0-9._]+/g, "-")
      .replace(/^[-._]+|[-._]+$/g, "")
  }

  /** The worktree, other than `name`, that the session is in:  by `cwd`, else by its window;  `null` when none. */
  static otherWorktree(cwd: string | undefined, window: GateWindow | null, name: string): string | null {
    // the worktrees' folder from the repo's `.epic/config.json5` (`worktreesFolder`)
    const byCwd = worktreeOf(cwd)
    if (byCwd) return byCwd === name ? null : byCwd
    const file = window?.workspaceFile ?? ""
    const ongoing = /[\\/]workspaces[\\/]ongoing[\\/]([^\\/]+)\.code-workspace$/.exec(file)
    if (ongoing && ongoing[1] !== name) return ongoing[1]!
    return null
  }

  /**
   * Save `text` as `<prompts>/<name>.md`;  returns the file.
   * - NEVER loses text:  an older, different file there is renamed `<name>.<time>.md` first
   */
  static savePrompt(name: string, text: string): string {
    const dir = process.env.SPELL_PROMPTS_DIR || join(homedir(), ".spell", "prompts")
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    const file = join(dir, `${name}.md`)
    if (existsSync(file) && readFileSync(file, "utf8").trim() !== text) {
      renameSync(file, join(dir, `${name}.${new Date().toISOString().replace(/[:.]/g, "-")}.md`))
    }
    writeFileSync(file, `${text}\n`, { mode: 0o600 })
    return file
  }
}

/** The hook's stdin, the fields read here. */
export type GateInput = {
  prompt?: string
  cwd?: string
  session_id?: string
  session_title?: string | null
  permission_mode?: string
}

/** The session's window's registry entry (`Window.current()`), the field read here. */
export type GateWindow = { workspaceFile?: string | null }

/** What the hook prints:  a block with its reason, or the session's new title / a note for Claude. */
export type GateAnswer =
  | { decision: "block"; reason: string }
  | {
      hookSpecificOutput: { hookEventName: "UserPromptSubmit"; sessionTitle?: string; additionalContext?: string }
    }

/** A gated prompt, `parseCommand()`'s answer:  see there. */
export type GateCommand = { skill: string; name: string; text: string; color: string | null }

/**
 * Title the session `title` (`hookSpecificOutput.sessionTitle`), unless it already is;  `null`:  nothing to do.
 * - reopened:  a ✅ queued when its work merged (epic `windows-and-review` P6) and not yet applied must not land now
 */
function rename(input: GateInput, title: string): GateAnswer | null {
  PromptGate.dropDoneTitle(input.session_id)
  if (input.session_title === title) return null
  return { hookSpecificOutput: { hookEventName: "UserPromptSubmit", sessionTitle: title } }
}

/**
 * The hook's answer to `/epic <name> [text]` typed in worktree `other`'s session:
 * let through, NOT renamed (the session stays `other`'s),
 * with a note telling Claude to offer a new window for `<name>` instead.
 * - SIDE EFFECT:  `text` saved first (`savePrompt()`), so the new window's `/epic <name>` picks it up
 */
function launchNote(other: string, name: string, text: string): GateAnswer {
  const saved = text ? `  Its text is saved in ${PromptGate.savePrompt(name, text).replace(homedir(), "~")}.` : ""
  const note =
    `This session works in worktree \`${other}\`:  \`/epic ${name}\` must NOT run here.  Owen means "open a new ` +
    `window for epic \`${name}\`".${saved}  Follow the /epic skill's "From another worktree":  ask him first.`
  return { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: note } }
}

/**
 * The hook's answer blocking a prompt, `why` first.
 * - SIDE EFFECT:  `text` saved first (`savePrompt()`), then quoted in the reason
 */
function block(name: string, text: string, why: string): GateAnswer {
  let reason = why
  if (text) {
    const file = PromptGate.savePrompt(name, text)
    reason += `\n\nYour text is saved in ${file.replace(homedir(), "~")}:\n\n${text}`
  }
  return { decision: "block", reason }
}

/** `[first word, the rest]` of `args`. */
function splitFirst(args: string): [string, string] {
  const match = /^(\S+)\s*([\s\S]*)$/.exec(args.trim())
  return match ? [match[1]!, match[2]!] : ["", ""]
}
