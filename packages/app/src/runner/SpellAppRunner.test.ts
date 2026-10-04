import { describe, expect, test } from "vite-plus/test"

import { dropsPushedCode, editorCompiled, isEditor, pushedSource, type SpellAppSource } from "$/app/runner"

/** What a `<spell-app editor="<selector>">` decides, with no DOM -- see "Fed by an editor" in `SpellAppRunner`. */
describe("<spell-app> fed by an editor", () => {
  const base: SpellAppSource = {
    name: "Solitaire",
    compiledUrl: "/api/projects/compiled/@system:examples:Solitaire",
    scopesUrl: "/api/projects/scopes/@system:examples:Solitaire",
    importUrl: (id) => `/api/projects/compiled/${id}`
  }
  const scopes = { id: "@system:examples:Solitaire", entries: [] }
  const pushed = { projectId: "@system:examples:Solitaire", compiled: "export const x = 1", scopes }

  describe("pushedSource()", () => {
    test("its project's source, with the pushed javascript and scope pack in memory", () => {
      const source = pushedSource(base, pushed)
      expect(source).toMatchObject({ name: "Solitaire", compiledUrl: base.compiledUrl, compiled: pushed.compiled })
      expect(source.scopes).toBe(scopes)
      expect(source.importUrl).toBe(base.importUrl)
    })

    test("a NEW object each time, so the runner re-runs it", () => {
      expect(pushedSource(base, pushed)).not.toBe(pushedSource(base, pushed))
      expect(pushedSource(base, pushed)).not.toBe(base)
    })

    test("the app's `name` wins, if set", () => {
      expect(pushedSource(base, pushed, "Mine").name).toBe("Mine")
      expect(pushedSource(base, pushed, null).name).toBe("Solitaire")
      expect(pushedSource(base, pushed, "").name).toBe("Solitaire")
    })

    test("no pushed scope pack:  its project's, by URL", () => {
      const source = pushedSource(base, { projectId: pushed.projectId, compiled: pushed.compiled })
      expect("scopes" in source).toBe(false)
      expect(source.scopesUrl).toBe(base.scopesUrl)
    })
  })

  describe("dropsPushedCode()", () => {
    test("a change to what it runs, or which editor, drops it", () => {
      for (const attribute of ["project", "src", "scopes", "name", "editor"])
        expect(dropsPushedCode(attribute, null, "x"), attribute).toBe(true)
      expect(dropsPushedCode("editor", "#a", "#b")).toBe(true)
      expect(dropsPushedCode("project", "x", null)).toBe(true)
    })

    test("how it looks does NOT", () => {
      for (const attribute of ["toolbar", "debug", "width", "height", "assets"])
        expect(dropsPushedCode(attribute, null, "x"), attribute).toBe(false)
    })

    test("setting the value it has is NOT a change", () => {
      expect(dropsPushedCode("project", "x", "x")).toBe(false)
      expect(dropsPushedCode("editor", null, null)).toBe(false)
    })
  })

  describe("isEditor()", () => {
    const editor = { matches: (selector: string) => selector === "#ed" }

    test("an element the selector matches", () => {
      expect(isEditor(editor, "#ed")).toBe(true)
      expect(isEditor(editor, "#other")).toBe(false)
    })

    test("NOT something that isn't an element", () => {
      expect(isEditor(null, "#ed")).toBe(false)
      expect(isEditor(undefined, "#ed")).toBe(false)
      expect(isEditor({}, "#ed")).toBe(false)
      expect(isEditor("#ed", "#ed")).toBe(false)
    })

    test("a bad selector matches nothing", () => {
      expect(isEditor({ matches: badSelector }, "#[")).toBe(false)
    })

    test("anything else thrown is thrown", () => {
      expect(() => isEditor({ matches: broken }, "#ed")).toThrow("broken")
    })
  })

  describe("editorCompiled()", () => {
    test("what the editor it finds compiled last", () => {
      expect(editorCompiled(rootFinding({ compiled: pushed }), "#ed")).toBe(pushed)
    })

    test("nothing:  no editor, or it hasn't compiled", () => {
      expect(editorCompiled(rootFinding(null), "#ed")).toBeUndefined()
      expect(editorCompiled(rootFinding({}), "#ed")).toBeUndefined()
    })

    test("a bad selector finds nothing", () => {
      expect(editorCompiled({ querySelector: badSelector }, "#[")).toBeUndefined()
    })

    test("anything else thrown is thrown", () => {
      expect(() => editorCompiled({ querySelector: broken }, "#ed")).toThrow("broken")
    })
  })
})

/** A document or shadow root in which any selector finds `found`. */
function rootFinding(found: unknown) {
  return { querySelector: () => found as Element | null }
}

/** Throws as the DOM does for a selector that isn't CSS:  a `DOMException` named `SyntaxError`. */
function badSelector(): never {
  throw Object.assign(new Error("not a valid selector"), {
    name: "SyntaxError"
  })
}

/** Throws something else. */
function broken(): never {
  throw new Error("broken")
}
