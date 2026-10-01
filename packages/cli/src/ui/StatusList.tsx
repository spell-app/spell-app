import { Box, Text } from "ink"
import { Spinner } from "@inkjs/ui"

import type { CLI } from "#cli"

/****************
 * ### `<StatusList>`
 * Progress of several pieces of work, one row each:  a spinner while running, then ✓ or ✗ with a note,
 * and any `details` (e.g. errors) listed under it.
 ****************/
export function StatusList({ rows }: StatusListProps) {
  return (
    <Box flexDirection="column">
      {rows.map((row, index) => (
        <Box key={index} flexDirection="column">
          {row.state === "running" ? (
            <Spinner label={row.label} />
          ) : (
            <Text>
              <Text color={row.state === "ok" ? "green" : "red"}>{STATE_MARK[row.state]}</Text> {row.label}
              {row.note ? <Text dimColor>{`  ${row.note}`}</Text> : null}
            </Text>
          )}
          {row.details?.map((line, lineIndex) => (
            <Text key={lineIndex} color={row.state === "ok" ? undefined : "red"}>{`    ${line}`}</Text>
          ))}
        </Box>
      ))}
    </Box>
  )
}

/**
 * `<StatusList>` props.
 * - `rows`:  a fresh array each render -- rows are otherwise mutated in place, see `StatusReporter`.
 */
export type StatusListProps = {
  rows: CLI.StatusRow[]
}

/** Mark before a finished row. */
export const STATE_MARK: Record<CLI.StatusState, string> = {
  running: "…",
  ok: "✓",
  errors: "✗",
  failed: "✗"
}
