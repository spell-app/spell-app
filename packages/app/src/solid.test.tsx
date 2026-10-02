import { describe, test, expect } from "vitest"
import { createSignal, flush } from "solid-js"
import { renderToString } from "@solidjs/web"

import type { UIT } from "$/ui"

/**
 * Smoke test for the app's Solid tooling (`vite.shared.ts`), while React and Solid live side by side.
 * - This file has NO `@jsxImportSource react` marker, so it's Solid:  compiled by the Solid plugin, type-checked
 *   against `@solidjs/web`'s JSX.  A React file next to it (`ThingExplorer.test.tsx`) still runs under React.
 * - Node, so `@solidjs/web` is its server build:  `renderToString`, no DOM.
 * - `import type` from `$/ui`:  makes `tsc` check `@spell-app/ui`'s Solid source under the app's `tsconfig.json`.
 */

/** A Solid component around a `<ui-button>`:  its label from a prop, read where used. */
function SaveButton(props: { label: string }) {
  return <ui-button primary="">{props.label}</ui-button>
}

describe("Solid in the app", () => {
  test("a Solid component renders a `<ui-button>` to a string", () => {
    const html = renderToString(() => <SaveButton label="Save" />)
    expect(html).toContain("<ui-button")
    expect(html).toContain("primary")
    expect(html).toContain("Save")
  })

  test("node runs Solid's SERVER build:  writes are NOT staged here", () => {
    // Pins a trap:  in the browser a read right after a write returns the OLD value until `flush()`.  Tests of
    // client reactivity (P4's cells bridge) need the browser conditions, not this project.
    const [count, setCount] = createSignal(1)
    setCount(2)
    expect(count()).toBe(2)
    flush()
    expect(count()).toBe(2)
  })

  test("`$/ui`'s types reach the app", () => {
    const value: UIT.DropdownValue | undefined = undefined
    expect(value).toBeUndefined()
  })
})
