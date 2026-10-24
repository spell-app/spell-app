import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { UIError } from "spell/util"
import "spell-app/spaces"
import { STORAGE_PREFIX, StaticFiles } from "spell-app/app/static/StaticFiles"

/**
 * The editor's static build reads and keeps its files with no server (`StaticFiles`, epic `debut` P9).
 * - The build's files stood in for (`fetch`):  a list, an index, a file.
 * - The browser's storage stood in for:  a `Map` behind `Storage`'s calls.
 */

/** The project the tests read:  one of the examples. */
const PROJECT = "@spell/examples/calculator"

/** What the build wrote, by URL. */
const BUILT: Record<string, string> = {
  "/api/projects/list/@spell/examples.json": JSON.stringify([{ path: PROJECT }]),
  [`/api/projects/index/${PROJECT}.json`]: JSON.stringify({
    manifest: { [`${PROJECT}/Calculator.spell`]: { size: 10 } },
    imports: [{ path: "/Calculator.spell", active: true, contents: "as built" }]
  }),
  [`/spaces/${PROJECT}/Calculator.spell`]: "as built"
}

/** Every URL fetched. */
let fetched: string[] = []

beforeEach(() => {
  fetched = []
  vi.stubGlobal("fetch", async (url: string) => {
    fetched.push(url)
    const body = BUILT[decodeURIComponent(url)]
    return body === undefined ? new Response("not found", { status: 404 }) : new Response(body)
  })
})

afterEach(() => vi.unstubAllGlobals())

describe("StaticFiles", () => {
  test("reads a group's list and a project's index from the build's JSON", async () => {
    const files = new StaticFiles(storage())
    expect(await files.fetch({ url: "/api/projects/list/@spell/examples" })).toEqual([{ path: PROJECT }])
    expect(await files.fetch({ url: "/api/projects/list/owen@spell" })).toEqual([])
    const index = await files.fetch({ url: `/api/projects/index/${PROJECT}` })
    expect(index.imports[0].contents).toBe("as built")
  })

  test("keeps an edit to the project's own file in the browser, and reads it back, in its index too", async () => {
    const kept = storage()
    const files = new StaticFiles(kept)
    await files.fetch({ url: `/api/projects/index/${PROJECT}` })
    expect(await files.fetch({ url: `/api/projects/file/${PROJECT}/Calculator.spell`, contents: "edited" })).toBe(true)
    expect(kept.getItem(`${STORAGE_PREFIX}${PROJECT}/Calculator.spell`)).toBe("edited")

    // a new visit:  the page reloaded
    const again = new StaticFiles(kept)
    const index = await again.fetch({ url: `/api/projects/index/${PROJECT}` })
    expect(index.imports[0].contents).toBe("edited")
    expect(await again.fetch({ url: `/spaces/${PROJECT}/Calculator.spell` })).toBe("edited")
    expect(again.hasEdits(PROJECT)).toBe(true)
  })

  test("keeps what spell built in memory only, for this visit", async () => {
    const kept = storage()
    const files = new StaticFiles(kept)
    await files.fetch({ url: `/api/projects/index/${PROJECT}` })
    await files.fetch({ url: `/api/projects/file/${PROJECT}/calculator.spell.js`, contents: "compiled" })
    expect(await files.fetch({ url: `/spaces/${PROJECT}/calculator.spell.js` })).toBe("compiled")
    expect(kept.length).toBe(0)
  })

  test("Reset forgets the edits:  the file reads as built again", async () => {
    const files = new StaticFiles(storage())
    await files.fetch({ url: `/api/projects/index/${PROJECT}` })
    await files.fetch({ url: `/api/projects/file/${PROJECT}/Calculator.spell`, contents: "edited" })
    files.reset(PROJECT)
    expect(files.hasEdits(PROJECT)).toBe(false)
    expect(await files.fetch({ url: `/spaces/${PROJECT}/Calculator.spell` })).toBe("as built")
  })

  test("refuses what needs a server:  making, renaming, deleting", async () => {
    const files = new StaticFiles(storage())
    await expect(
      files.fetch({ url: "/api/projects/create/project", contents: { projectId: `${PROJECT}2` } })
    ).rejects.toBeInstanceOf(UIError)
    await expect(files.fetch({ url: "/api/projects/remove/file", method: "DELETE" })).rejects.toBeInstanceOf(UIError)
  })
})

/** A `Storage` over a `Map`:  the browser's `localStorage`, stood in for. */
function storage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    key: (index) => [...items.keys()][index] ?? null,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, String(value)),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear()
  }
}
