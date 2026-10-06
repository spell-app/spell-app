import { Box, Text, render, useInput, type Key as InkKey } from "ink"
import { useEffect, useRef, useState } from "react"
import chalk from "chalk"

import { CLI } from "$/cli"

/** Most completions shown at once. */
const MAX_SHOWN = 10

/** Keys, for the footer. */
const HELP = "type to narrow · Tab complete · ↑↓ choose · Enter pick · Esc cancel"

/**
 * Ask for a project or file at a `<ProjectPrompt>`, on stderr -- resolving to what was picked, or `undefined` if cancelled.
 * - Remembers the pick for next time -- see `recentProjects.ts`.
 */
export function promptForProject(): Promise<string | undefined> {
  const recents = CLI.recentProjects()
  return new Promise((done) => {
    const app = render(<ProjectPrompt choicesFor={(text) => CLI.projectChoices(text, recents)} onDone={finish} />, {
      stdout: process.stderr,
      patchConsole: false,
      exitOnCtrlC: true
    })

    /** Close the prompt -- clearing it off screen -- and hand back `picked`. */
    function finish(picked: string | undefined) {
      app.clear()
      app.unmount()
      if (picked) CLI.rememberProject(picked)
      done(picked)
    }
  })
}

/****************
 * ### `<ProjectPrompt>`
 * Asks which project or file, completing as a shell completes a path -- see `projectChoices.ts`:  recent picks and
 * roots, then a root's projects, then "entire project" and its files.
 * - Typing narrows the list;  `Tab` completes as far as the choices agree -- or, if they agree no further, to the
 *   one chosen;  `↑↓` choose;  `Enter` picks a project or file, or goes into a root or project;  `Esc` cancels.
 * - `Enter` with nothing to choose from picks what's typed, for `resolveProject()` to judge.
 ****************/
export function ProjectPrompt({ choicesFor, onDone }: ProjectPromptProps) {
  const [text, setText] = useState("")
  const [choices, setChoices] = useState<CLI.ProjectChoice[]>([])
  const [selected, setSelected] = useState(0)
  // what `choices` were worked out for -- until it's `text`, keys wait in `queue`
  const [loadedFor, setLoadedFor] = useState<string>()
  const queue = useRef<Key[]>([])
  const [queued, setQueued] = useState(0)

  useEffect(() => {
    let isCurrent = true
    void choicesFor(text).then((next) => {
      if (!isCurrent) return
      setChoices(next)
      setSelected(0)
      setLoadedFor(text)
    })
    return () => {
      isCurrent = false
    }
  }, [text, choicesFor])

  // one key at a time, each once the choices it acts on are in:  keys can arrive several to a chunk, e.g. typed
  // while the first choices load, or pasted -- and `Tab` must complete what was typed BEFORE it
  useEffect(() => {
    if (loadedFor !== text || !queue.current.length) return
    const next = queue.current.shift()!
    setQueued(queue.current.length)
    handle(next)
  }, [loadedFor, text, queued])

  useInput((input, key) => {
    queue.current.push(...keysIn(input, key))
    setQueued(queue.current.length)
  })

  /** Act on `key`, against the current `text` and `choices`. */
  function handle(key: Key) {
    const choice = choices[selected]
    if (key === "escape") return onDone(undefined)
    if (key === "up") return setSelected(Math.max(0, selected - 1))
    if (key === "down") return setSelected(Math.min(choices.length - 1, selected + 1))
    if (key === "tab") {
      const prefix = CLI.commonPrefix(choices.map((it) => it.value))
      return setText(prefix.length > text.length ? prefix : (choice?.value ?? text))
    }
    if (key === "return") {
      if (!choice) return text.trim() ? onDone(text.trim()) : undefined
      return choice.isFinal ? onDone(choice.value) : setText(choice.value)
    }
    if (key === "backspace") return setText(text.slice(0, -1))
    setText(text + key.char)
  }

  // keep the chosen one in view
  const start = Math.max(0, Math.min(selected - MAX_SHOWN + 1, choices.length - MAX_SHOWN))
  const shown = choices.slice(start, start + MAX_SHOWN)
  return (
    <Box flexDirection="column">
      <Text>
        {chalk.bold("Which project or file?  ")}
        {chalk.cyan(text)}
        {"█"}
      </Text>
      {shown.map((choice, index) => {
        const isChosen = start + index === selected
        const label = choice.label ? `${choice.value}  ${chalk.dim(choice.label)}` : choice.value
        const recent = choice.isRecent ? chalk.dim("  (recent)") : ""
        return <Text key={choice.value}>{`${isChosen ? chalk.cyan("❯ ") : "  "}${label}${recent}`}</Text>
      })}
      {choices.length > MAX_SHOWN ? <Text dimColor>{`  ...${choices.length} in all`}</Text> : null}
      {!choices.length && text ? <Text dimColor>{"  nothing matches -- Enter tries it anyway"}</Text> : null}
      <Text dimColor>{HELP}</Text>
    </Box>
  )
}

/** One key the prompt acts on:  a named key, or text typed (`char`:  a run of it). */
type Key = "escape" | "up" | "down" | "tab" | "return" | "backspace" | { char: string }

/**
 * The keys in one `useInput()` call, in order.
 * - Ink names a key only when it arrives alone:  several in one chunk come as plain `input`, e.g. `"@te\t"`, so
 *   tabs, returns and backspaces in it are picked out here.
 */
function keysIn(input: string, key: InkKey): Key[] {
  if (key.escape) return ["escape"]
  if (key.upArrow) return ["up"]
  if (key.downArrow) return ["down"]
  if (key.tab) return ["tab"]
  if (key.return) return ["return"]
  if (key.backspace || key.delete) return ["backspace"]
  if (key.ctrl || key.meta) return []
  // runs of text, and each control key between them
  return input
    .split(/([\t\r\n\u007F\b])/)
    .filter(Boolean)
    .map((part): Key => {
      if (part === "\t") return "tab"
      if (part === "\r" || part === "\n") return "return"
      if (part === "\u007F" || part === "\b") return "backspace"
      return { char: part }
    })
}

/**
 * `<ProjectPrompt>` props.
 * - `choicesFor`:  completions for what's typed so far -- see `CLI.projectChoices()`
 * - `onDone`:  called with the project or file picked, or `undefined` if cancelled
 */
export type ProjectPromptProps = {
  choicesFor: (text: string) => Promise<CLI.ProjectChoice[]>
  onDone: (picked: string | undefined) => void
}
