import { describe, expect, test } from "vite-plus/test"

import { ComponentSource } from "../../../app/tools/ComponentSource.ts"

/** A file with a documented component, a helper and a component with no banner. */
const PANEL = `
import type { JSX } from "@solidjs/web"
import { type BoxProps } from "./Box"

/****************
 * ### \`<Panel>\`
 * Lays out \`children\`
 * in a row.
 * - a bullet, not shown
 ****************/
export function Panel(props: PanelProps) {
  return <Box><Pane /></Box>
}

/** Props for \`<Panel>\`. */
export type PanelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & PaneProps & {
  /** The panes. */
  children: JSX.Element
  /** Called with the new sizes. */
  onResize?(sizes: number[], total: number): void
}

/** Not a component:  no banner. */
export function sizesOf(props: PanelProps) {
  return []
}

function Hidden() {
  return <Panel />
}

/** Props for a pane. */
type PaneProps = {
  /** Scrolls. */
  scrolling?: boolean
  /** Its id. */
  id: string
}
`

/** A file whose props type picks from a type in another file. */
const PICKER = `
import type { BoxProps } from "./Box"

/****************
 * ### \`<Picker>\`
 * Picks.
 ****************/
export function Picker(props: Pick<BoxProps, "padded"> & BoxProps) {
  return <LazyThings.Box />
}

render(() => <Picker />, document.body)
`

/** The other file. */
const BOX = `
/** Props for a box. */
export type BoxProps = {
  /** Padding. */
  padded?: boolean
  /** Border. */
  bordered?: boolean
}
`

describe("ComponentSource.components", () => {
  test("lists ONLY exported components with a banner, with its first paragraph on one line", () => {
    const source = new ComponentSource({ file: "src/Panel.tsx", text: PANEL })
    expect(source.components.map(({ name, description }) => ({ name, description }))).toEqual([
      { name: "Panel", description: "Lays out `children` in a row." }
    ])
  })

  test("reads props through intersections, `Omit<>` and local aliases;  a type from outside is one row", () => {
    const [panel] = new ComponentSource({ file: "src/Panel.tsx", text: PANEL }).components
    expect(panel!.props).toEqual([
      {
        name: '...Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">',
        type: 'Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">',
        description: "Every prop of this type too."
      },
      { name: "scrolling", type: "boolean", description: "Scrolls." },
      { name: "id", type: "string", required: true, description: "Its id." },
      { name: "children", type: "JSX.Element", required: true, description: "The panes." },
      { name: "onResize", type: "(sizes: number[], total: number) => void", description: "Called with the new sizes." }
    ])
  })

  test("follows a props type imported from another file of the app, and `Pick<>`s from it", () => {
    const box = new ComponentSource({ file: "src/Box.ts", text: BOX })
    const picker = new ComponentSource({
      file: "src/Picker.tsx",
      text: PICKER,
      findTypeSource: (from, specifier) =>
        from === "src/Picker.tsx" && specifier === "./Box" ? "src/Box.ts" : undefined,
      sourceFor: () => box
    })
    expect(picker.components[0]!.props.map((prop) => prop.name)).toEqual(["padded", "padded", "bordered"])
  })
})

describe("ComponentSource.uses", () => {
  test("lists each capitalized JSX tag with the declaration drawing it;  a dotted tag by its last name", () => {
    expect(new ComponentSource({ file: "src/Panel.tsx", text: PANEL }).uses).toEqual([
      { tag: "Box", by: "Panel" },
      { tag: "Pane", by: "Panel" },
      { tag: "Panel", by: "Hidden" }
    ])
    expect(new ComponentSource({ file: "src/Picker.tsx", text: PICKER }).uses).toEqual([
      { tag: "Box", by: "Picker" },
      { tag: "Picker", by: "Picker" }
    ])
  })
})
