import { TextInput } from "@inkjs/ui"
import { Box, Text, useApp, useInput, useStdout } from "ink"
import { useState } from "react"
import chalk from "chalk"

import { CLI } from "$/cli"

/** Keys, for the footer. */
const HELP = "Enter parse · ↑↓ earlier lines · Esc quit"

/****************
 * ### `<ReplScreen>`
 * Live screen for `spell repl`:  type a line, see how spell reads it -- its match tree and javascript -- above,
 * newest last, with the input at the bottom.
 * - `onLine(text)` parses each line -- earlier lines' declarations stay known, see `CLI.parseText()`'s `commit`.
 * - `↑` / `↓` bring back earlier lines;  `Esc` or `Ctrl-C` quits.
 * - Shows as much as fits the terminal -- or `size`, e.g. in tests.
 ****************/
export function ReplScreen({ title, onLine, size }: ReplScreenProps) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const rows = size?.rows ?? stdout.rows ?? 24

  const [entries, setEntries] = useState<CLI.ParsedText[]>([])
  // `TextInput` keeps its own text:  a new `key` resets it, to `draft`
  const [inputKey, setInputKey] = useState(0)
  const [draft, setDraft] = useState("")
  // how far back in `entries` `↑` has gone:  `entries.length` is "not at all"
  const [recall, setRecall] = useState(0)

  useInput((_input, key) => {
    if (key.escape) return exit()
    if (!key.upArrow && !key.downArrow) return
    const to = Math.min(entries.length, Math.max(0, recall + (key.upArrow ? -1 : 1)))
    setRecall(to)
    setDraft(entries[to]?.text ?? "")
    setInputKey(inputKey + 1)
  })

  function submit(text: string) {
    if (!text.trim()) return
    const next = [...entries, onLine(text)]
    setEntries(next)
    setRecall(next.length)
    setDraft("")
    setInputKey(inputKey + 1)
  }

  // header, input and footer take a line each
  const lines = entries.flatMap(entryLines).slice(-Math.max(1, rows - 4))
  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      {lines.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
      <Box>
        <Text color="cyan">{"› "}</Text>
        <TextInput key={inputKey} defaultValue={draft} onSubmit={submit} />
      </Box>
      <Text dimColor>{HELP}</Text>
    </Box>
  )
}

/**
 * `<ReplScreen>` props.
 * - `title`:  first line, e.g. which project's scope lines parse in
 * - `onLine`:  parses one line the user entered
 * - `size`:  rows to fit in, rather than the terminal's -- e.g. in tests
 */
export type ReplScreenProps = {
  title: string
  onLine: (text: string) => CLI.ParsedText
  size?: { rows: number }
}

/** How one parsed line shows:  what was typed, its tree, then its javascript -- or why not, in red. */
export function entryLines({ text, tree, compiled, error }: CLI.ParsedText): string[] {
  const lines = [chalk.cyan(`› ${text}`), ...CLI.colorTree(tree).map((line) => `  ${line}`)]
  if (compiled !== undefined)
    lines.push(...compiled.split("\n").map((line, index) => `${index ? "   " : "=> "}${line}`))
  if (error) lines.push(chalk.red(`  ${error}`))
  return lines
}
