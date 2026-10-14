import { describe, test, expect } from "vite-plus/test"

import { PY } from "$/py"

/**
 * `PY.quartApp()`:  a Python spell program's web app, `<Project>.app.py`;
 * and `PY.isUneditedApp()`, which says whether compiling again may rewrite it.
 * - The app itself is run in cli's `quartApp.test.ts`.
 */
const SPEC = {
  projectName: "Solitaire",
  program: "Solitaire.spell.py",
  elements: "Solitaire.elements.spell.js",
  outputs: "."
}

describe("PY.quartApp()", () => {
  test("serves the program, its drawing half, the page side and the WebSocket", () => {
    const app = PY.quartApp(SPEC)
    expect(app).toContain("OUTPUTS = HERE\n")
    expect(app).toContain('sessions = SpellSessions(OUTPUTS / "Solitaire.spell.py")')
    expect(app).toContain('html = page_html("Solitaire", elements="/Solitaire.elements.spell.js", projects=projects)')
    expect(app).toContain('@app.get("/<name>.elements.spell.js")')
    expect(app).toContain('@app.websocket("/ws")')
    expect(app).toContain("# Your own routes go here")
  })

  test("finds the program and its drawing half in their build folder, from its own", () => {
    const app = PY.quartApp({ ...SPEC, outputs: "spaces/@spell/examples/solitaire" })
    expect(app).toContain('OUTPUTS = built_folder("spaces/@spell/examples/solitaire")')
    expect(app).toContain("assets_folder, built_folder, fresh")
    expect(app).toContain('sessions = SpellSessions(OUTPUTS / "Solitaire.spell.py")')
    expect(app).toContain('send_from_directory(OUTPUTS, f"{name}.elements.spell.js"')
  })

  test("serves each imported project's drawing half too", () => {
    const app = PY.quartApp({ ...SPEC, projects: { "@spell/project/@spell/test/cards": "Cards.elements.spell.js" } })
    expect(app).toContain('"@spell/project/@spell/test/cards": "/Cards.elements.spell.js",')
    expect(app).toContain('not in ["Solitaire.elements.spell.js", "Cards.elements.spell.js"]')
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
