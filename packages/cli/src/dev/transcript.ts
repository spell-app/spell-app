import { readFileSync, statSync } from "fs"
import { basename } from "path"

import { CLI } from "$/cli"

/**
 * What another session has been doing, from its transcript:  for `/wtf <name>`.
 * - `idPrefix`:  a session id, or its first characters;  the newest matching transcript wins
 * - prompts:  what Owen typed, oldest first (slash commands as `/name args`;  tool results, hook output and
 *   reminders dropped);  sidechains (subagents) skipped
 * - `lastReply`:  the session's last reply text
 * - `pending`:  an `AskUserQuestion` no answer has come back for yet
 * - returns `undefined` when no transcript matches
 */
export function digestTranscript(idPrefix: string, home = CLI.claudeHome()): CLI.TranscriptDigest | undefined {
  const paths = CLI.transcripts(home).filter((path) => basename(path).startsWith(idPrefix))
  if (!paths.length) return undefined
  const path = paths.reduce((newest, it) => (statSync(it).mtimeMs > statSync(newest).mtimeMs ? it : newest))
  const digest: CLI.TranscriptDigest = { path, prompts: [], lastReply: null, pending: null }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const entry = CLI.parseJSONLine(line)
    if (entry.isSidechain) continue
    const message = entry.message as { content?: unknown } | undefined
    if (!message || typeof message !== "object") continue
    const blocks = typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content
    if (!Array.isArray(blocks)) continue
    if (entry.type === "user") {
      for (const block of blocks) {
        // any answer clears a waiting question
        if (block?.type === "tool_result") digest.pending = null
        else if (block?.type === "text") {
          const text = CLI.promptText(block.text ?? "")
          if (text)
            digest.prompts.push({ when: typeof entry.timestamp === "string" ? entry.timestamp.slice(0, 16) : "", text })
        }
      }
    } else if (entry.type === "assistant") {
      for (const block of blocks) {
        if (block?.type === "text" && String(block.text ?? "").trim()) digest.lastReply = block.text.trim()
        else if (block?.type === "tool_use" && block.name === "AskUserQuestion") {
          digest.pending = block.input?.questions ?? []
        }
      }
    }
  }
  return digest
}
