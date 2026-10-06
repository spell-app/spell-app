import { describe, expect, test, vi } from "vite-plus/test"

/**
 * Barrel / circular-import smoke tests for `$/ui/static` (WWOD §8 › "Barrels").
 * - Every file of the folder imports the barrel back as `SSR`, so the barrel sits in a cycle with all of them:  a
 *   value read while a file EVALUATES would come back `undefined`, and `tsc` would never say so.
 * - So enter by every route (the barrel, then each file first) and check every export is live, flat and under `SSR`.
 * - In the `ssr` project:  the folder is node only.
 */

////////////////
// ## Fixtures
////////////////

/** Values the barrel MUST expose:  every class and constant of the folder (types erase). */
const VALUES = [
  // `./static.types.server`
  "ROOT_ATTRIBUTE",
  "SLOTTED_ATTRIBUTE",
  "LIST_ITEM_ATTRIBUTE",
  "STATE_ATTRIBUTE",
  "ROOT",
  "SLOTTED",
  "LIST_ITEM",
  "REACH",
  // classes
  "ServerIds",
  "ServerHost",
  "StaticSelectors",
  "ServerRuntime",
  "StaticFlattener",
  "StaticInteractions",
  "StaticPageStyles",
  "StaticStylesheet",
  "StaticRender",
  "StaticCatalog",
  // self-namespace
  "SSR"
] as const

/** Ways in:  the barrel, then each of its files imported BEFORE it. */
const ENTRIES = [
  "$/ui/static",
  "$/ui/static/static.types.server",
  "$/ui/static/ServerIds.server",
  "$/ui/static/ServerHost.server",
  "$/ui/static/StaticSelectors.server",
  "$/ui/static/ServerRuntime.server",
  "$/ui/static/StaticFlattener.server",
  "$/ui/static/StaticInteractions.server",
  "$/ui/static/StaticPageStyles.server",
  "$/ui/static/StaticStylesheet.server",
  "$/ui/static/StaticRender.server",
  "$/ui/static/StaticCatalog.server"
]

/**
 * `$/ui/static` imported fresh, after `entry`, as an indexable record.
 * - SIDE EFFECT:  resets the module registry.
 */
async function freshBarrel(entry: string): Promise<Record<string, any>> {
  vi.resetModules()
  await import(/* @vite-ignore */ entry)
  return (await import("$/ui/static")) as Record<string, any>
}

/** Names `barrel` fails to expose:  flattened, and under `SSR`. */
function missingFrom(barrel: Record<string, any>) {
  const missing = VALUES.filter((name) => barrel[name] === undefined)
  const underSSR = barrel.SSR ? VALUES.filter((name) => barrel.SSR[name] === undefined) : ["<SSR is not bound>"]
  const undefinedExports = Object.keys(barrel).filter((name) => barrel[name] === undefined)
  return { missing, underSSR, undefinedExports }
}

////////////////
// ## Tests
////////////////

describe("$/ui/static barrel", () => {
  test.each(ENTRIES)(
    "entered at %s, every export is DEFINED, flat and under SSR",
    async (entry) => {
      expect(missingFrom(await freshBarrel(entry))).toEqual({ missing: [], underSSR: [], undefinedExports: [] })
    },
    60_000
  )

  test("SSR hands back the same bindings as the flat exports", async () => {
    const barrel = await freshBarrel("$/ui/static")
    for (const name of VALUES) if (name !== "SSR") expect(barrel.SSR[name], name).toBe(barrel[name])
  })

  test("the module constants that read marks got them, not undefined", async () => {
    const { StaticStylesheet, ROOT, SLOTTED } = await freshBarrel("$/ui/static/StaticStylesheet.server")
    const css = StaticStylesheet.scope(".ui.button { color: red }", ROOT)
    expect(css).not.toContain("undefined")
    expect(css).toContain(SLOTTED)
  })
})
