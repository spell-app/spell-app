import { describe, test, expect } from "vite-plus/test"

import { SP } from "$/spell"

/**
 * `SP.quartApp()`:  a Python spell program's web app, `<Project>.app.py`, and `SP.isUneditedApp()`, which says
 * whether compiling again may rewrite it.  The app itself is run in cli's `quartApp.test.ts`.
 */
const SPEC = { projectName: "Solitaire", program: "Solitaire.compiled.asyncio.py", elements: "Solitaire.elements.js" }

describe("SP.quartApp()", () => {
  test("serves the program, its drawing half, the page side and the WebSocket", () => {
    const app = SP.quartApp(SPEC)
    expect(app).toContain('sessions = SpellSessions(HERE / "Solitaire.compiled.asyncio.py")')
    expect(app).toContain('html = page_html("Solitaire", elements="/Solitaire.elements.js", projects=projects)')
    expect(app).toContain('@app.get("/<name>.elements.js")')
    expect(app).toContain('@app.websocket("/ws")')
    expect(app).toContain("# Your own routes go here")
  })

  test("serves each imported project's drawing half too", () => {
    const app = SP.quartApp({ ...SPEC, projects: { "@spell/project/@test:fixtures:Cards": "Cards.elements.js" } })
    expect(app).toContain('"@spell/project/@test:fixtures:Cards": "/Cards.elements.js",')
    expect(app).toContain('not in ["Solitaire.elements.js", "Cards.elements.js"]')
  })
})

describe("SP.isUneditedApp()", () => {
  test("an app as written, or none at all:  compiling may write it", () => {
    expect(SP.isUneditedApp(SP.quartApp(SPEC))).toBe(true)
    expect(SP.isUneditedApp(undefined)).toBe(true)
    expect(SP.isUneditedApp("")).toBe(true)
  })

  test("an app someone edited, or wrote:  compiling leaves it be", () => {
    const app = SP.quartApp(SPEC)
    expect(SP.isUneditedApp(app.replace("# Your own routes go here", "# mine"))).toBe(false)
    expect(SP.isUneditedApp(app.slice(app.indexOf("\n") + 1))).toBe(false)
    expect(SP.isUneditedApp("from quart import Quart\n")).toBe(false)
  })
})
