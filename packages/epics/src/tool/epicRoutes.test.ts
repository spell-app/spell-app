/**
 * Tests of the Epics page's routes, in a scratch checkout:  a future epic made from the page (New epic), and the
 * favourites (a card's star), over HTTP.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { PageServer } from "$/server/page"
import { ask } from "$/server/test/serve"

import epicRoutes, { FROM_PAGE, epicName, newEpic, setFavorite } from "./epicRoutes"

const root = mkdtempSync(join(tmpdir(), "epic-routes-"))
mkdirSync(join(root, "epics"))
// the scratch checkout has no docs tools:  the docs index isn't rebuilt, and says so on stderr
vi.spyOn(process.stderr, "write").mockImplementation(() => true)

afterAll(() => rmSync(root, { recursive: true, force: true }))

test("an epic's name:  the title, lower-kebab-cased;  a reserved word gets `-epic`", () => {
  expect(epicName("Docs Index:  the Second Go!")).toBe("docs-index-the-second-go")
  expect(epicName("Review")).toBe("review-epic")
  expect(() => epicName("!!!")).toThrow(/nothing to name/)
})

test("makes a future epic with the prompt quoted, its log saying it came from the page;  a taken name gets `-2`", async () => {
  expect(await newEpic(root, "Phone Review", "Review plan docs from my phone.")).toBe("phone-review")
  const html = readFileSync(join(root, "epics", "phone-review", "phone-review.plan.html"), "utf8")
  expect(html).toMatch(/<epic-page[^>]*\bfuture\b/)
  expect(html).toContain("Review plan docs from my phone.")
  expect(readFileSync(join(root, "epics", "phone-review", "parts", "log.html"), "utf8")).toContain(FROM_PAGE)
  expect(await newEpic(root, "Phone Review", "")).toBe("phone-review-2")
})

////////////////
// ## Favorites (epic `airplane` P8)
////////////////

describe("POST /api/epics/favorite", () => {
  let server: PageServer
  let port: number

  beforeAll(async () => {
    server = new PageServer({ root })
    await epicRoutes.setup({
      root,
      router: server.web.router,
      guard: server.web.guard,
      live: server.web.live!,
      web: server.web,
      info: server.info,
      onListening: () => {},
      onStop: () => {}
    })
    await server.start({ port: 0, routes: false, pidFile: false })
    port = server.info.port
  })

  afterAll(async () => server.stop())

  /** POST `body` from a page this server served (its token, its origin);  the status and the answer */
  async function star(body: unknown, token = server.web.guard.token) {
    const answer = await ask(port, "POST", "/api/epics/favorite", {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", "x-server-token": token, origin: `http://127.0.0.1:${port}` }
    })
    return { status: answer.status, body: JSON.parse(answer.text) }
  }

  test("stars and unstars into ONE shared file, sorted, written whole;  answers every favourite", async () => {
    const file = join(root, "epics", "favorites.json")
    expect(await star({ name: "seo", favorite: true })).toEqual({ status: 200, body: { favorites: ["seo"] } })
    expect((await star({ name: "airplane", favorite: true })).body).toEqual({ favorites: ["airplane", "seo"] })
    // starring twice is still one
    expect((await star({ name: "seo", favorite: true })).body).toEqual({ favorites: ["airplane", "seo"] })
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(["airplane", "seo"])
    expect((await star({ name: "seo", favorite: false })).body).toEqual({ favorites: ["airplane"] })
    expect(await setFavorite(root, "airplane", false)).toEqual([])
    expect(readFileSync(file, "utf8")).toBe("[]\n")
    expect(existsSync(`${file}.tmp`)).toBe(false)
  })

  test("refuses a name that isn't an epic's, a missing flag, and a write without the token", async () => {
    expect((await star({ name: "../etc", favorite: true })).status).toBe(400)
    expect((await star({ name: "seo" })).status).toBe(400)
    expect((await star({ name: "seo", favorite: true }, "forged")).status).toBe(403)
  })
})
