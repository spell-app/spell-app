import { describe, test, expect } from "vite-plus/test"

import { PY } from "$/py"

/**
 * `PY.quartApp()`:  a Python spell program's web app, `<Project>.app.py`, and `PY.isUneditedApp()`, which says
 * whether compiling again may rewrite it.  The app itself is run in cli's `quartApp.test.ts`.
 */
const SPEC = { projectName: "Solitaire", program: "Solitaire.compiled.asyncio.py", elements: "Solitaire.elements.js" }

describe("PY.quartApp()", () => {
  test("serves the program, its drawing half, the page side and the WebSocket", () => {
    const app = PY.quartApp(SPEC)
    expect(app).toContain('sessions = SpellSessions(HERE / "Solitaire.compiled.asyncio.py")')
    expect(app).toContain('html = page_html("Solitaire", elements="/Solitaire.elements.js", projects=projects)')
    expect(app).toContain('@app.get("/<name>.elements.js")')
    expect(app).toContain('@app.websocket("/ws")')
    expect(app).toContain("# Your own routes go here")
  })

  test("serves each imported project's drawing half too", () => {
    const app = PY.quartApp({ ...SPEC, projects: { "@spell/project/@test:fixtures:Cards": "Cards.elements.js" } })
    expect(app).toContain('"@spell/project/@test:fixtures:Cards": "/Cards.elements.js",')
    expect(app).toContain('not in ["Solitaire.elements.js", "Cards.elements.js"]')
  })
})

describe("PY.isUneditedApp()", () => {
  test("an app as written, or none at all:  compiling may write it", () => {
    expect(PY.isUneditedApp(PY.quartApp(SPEC))).toBe(true)
    expect(PY.isUneditedApp(undefined)).toBe(true)
    expect(PY.isUneditedApp("")).toBe(true)
  })

  test("an app someone edited, or wrote:  compiling leaves it be", () => {
    const app = PY.quartApp(SPEC)
    expect(PY.isUneditedApp(app.replace("# Your own routes go here", "# mine"))).toBe(false)
    expect(PY.isUneditedApp(app.slice(app.indexOf("\n") + 1))).toBe(false)
    expect(PY.isUneditedApp("from quart import Quart\n")).toBe(false)
  })
})
