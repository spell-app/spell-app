import { Box, Text, useApp, useInput } from "ink"

import { CLI } from "~/cli"

/****************
 * ### `<WatchScreen>`
 * Live screen for `spell watch`:  one row per project watched -- a spinner while it works, then ✓ or ✗ with
 * when, and its errors listed under it.  `q` stops watching;  so does `Ctrl-C`.
 * - Just draws:  `watchCommand` rerenders it with fresh `rows` as projects change.
 ****************/
export function WatchScreen({ rows, verb }: WatchScreenProps) {
  const { exit } = useApp()
  useInput((input) => {
    if (input === "q") exit()
  })
  return (
    <Box flexDirection="column">
      <Text bold>{`Watching ${rows.length} project${rows.length === 1 ? "" : "s"} -- ${verb} on every save`}</Text>
      <CLI.StatusList rows={rows} />
      <Text dimColor>q to stop</Text>
    </Box>
  )
}

/**
 * `<WatchScreen>` props.
 * - `rows`:  one per project, in a fresh array each render
 * - `verb`:  what happens on each save, e.g. `recompiling`
 */
export type WatchScreenProps = {
  rows: CLI.StatusRow[]
  verb: string
}
