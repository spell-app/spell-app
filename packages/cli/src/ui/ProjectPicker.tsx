import { Box, Text, render, useInput } from "ink"
import { Select } from "@inkjs/ui"

import { SP } from "$/spell"
import type { CLI } from "$/cli"

/** `<ProjectPicker>` value for its "All projects" choice. */
const ALL = "*"

/**
 * Ask which of bare root `root`'s projects to use, e.g. for `spell compile @library`.
 * - Resolves to the ids picked -- every one for "All projects" -- or `[]` if cancelled with `Esc` / `q`.
 * - Draws on stderr, so stdout stays clean for output.
 */
export function pickProjects(root: Extract<CLI.CliProject, { kind: "root" }>): Promise<string[]> {
  return new Promise((done) => {
    const app = render(<ProjectPicker root={root} onPick={pick} />, {
      stdout: process.stderr,
      patchConsole: false,
      exitOnCtrlC: true
    })

    /** Close the picker -- clearing it off screen -- and hand back `projectIds`. */
    function pick(projectIds: string[]) {
      app.clear()
      app.unmount()
      done(projectIds)
    }
  })
}

/****************
 * ### `<ProjectPicker>`
 * Pick-list of a project root's projects, "All projects" first.  Arrow keys + `Enter` pick;  `Esc` / `q` cancel.
 ****************/
export function ProjectPicker({ root, onPick }: ProjectPickerProps) {
  useInput((input, key) => {
    if (key.escape || input === "q") onPick([])
  })

  const options = [
    { label: `All projects (${root.projectIds.length})`, value: ALL },
    ...root.projectIds.map((projectId) => ({ label: labelFor(projectId), value: projectId }))
  ]
  return (
    <Box flexDirection="column">
      <Text bold>{`Which ${root.title} project?`}</Text>
      <Select
        options={options}
        visibleOptionCount={Math.min(options.length, 15)}
        onChange={(value) => onPick(value === ALL ? root.projectIds : [value])}
      />
      <Text dimColor>↑↓ move · Enter pick · Esc cancel</Text>
    </Box>
  )
}

/**
 * `<ProjectPicker>` props.
 * - `root`:  whose projects to offer
 * - `onPick`:  called once, with the ids picked, or `[]` if cancelled
 */
export type ProjectPickerProps = {
  root: Extract<CLI.CliProject, { kind: "root" }>
  onPick: (projectIds: string[]) => void
}

/** Pick-list label for `projectId`:  its name, then the root it's in, e.g. `cards  @system:library`. */
function labelFor(projectId: string): string {
  const location = new SP.SpellLocation(projectId)
  return `${location.projectName}  ${location.projectRoot}`
}
