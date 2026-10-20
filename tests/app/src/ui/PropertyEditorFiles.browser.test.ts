import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { declareProp, Observable } from "$/util"
import { SP } from "$/spell"
import { SPACES } from "$/spaces"
import { editor, type EditorStore } from "$/app/editor"
import { PropertyEditorFiles, type RunningCore } from "$/app/ui/PropertyEditorFiles"

/**
 * A project's property editor pages (epic `property-editor` P6):  a type's schema, both ways, and the editor's
 * "New Property Editor..." writing one.
 * - In the browser:  the page is written on its `document`.
 * - The project is a stand-in, its declarations handed back by a spy on `SP.SpellProject.declarationsOf()`;
 *   the server is never asked:  `SPACES.ProjectFiles.create()` records what it was given.
 */

/** A compiled project's declarations:  a `Card` and a `Pile`. */
const DECLARATIONS: SP.SpellDeclarationsData = {
  spellVersion: SP.SPELL_VERSION,
  provides: ["Card", "Pile"],
  statements: [
    { type: "Card", superType: "Thing" },
    { property: "rank", of: "Card", enumeration: ["ace", "king"] },
    { property: "is_face_up", asWritten: "is face up", of: "Card", datatype: "choice" },
    { property: "short_rank", asWritten: "short rank", of: "Card", datatype: "text" },
    { type: "Pile", superType: "List" }
  ]
}

/** The running program's `Card`:  it stores two properties, and works `short rank` out. */
class Card extends Observable {}
declareProp(Card, "rank", { type: "text", oneOf: ["ace", "king"] })
declareProp(Card, "isFaceUp", { type: "choice", default: false })

/** A running program which knows `Card`. */
const RUNNING = {
  things: { classNamed: (name: string) => (name === "Card" ? Card : undefined) }
} as unknown as RunningCore

/** A stand-in project, with files named `fileNames`. */
function project(fileNames: string[] = []): SP.SpellProject {
  return {
    path: "@spell/examples/cards",
    Type: "Example",
    title: "Cards",
    getFile: (fileName: string) => (fileNames.includes(fileName) ? {} : undefined)
  } as unknown as SP.SpellProject
}

/** SIDE EFFECT:  `declarationsOf()` hands back `declarations` (`undefined`:  never compiled), for this test. */
function useDeclarations(declarations: SP.SpellDeclarationsData | undefined) {
  return vi.spyOn(SP.SpellProject, "declarationsOf").mockResolvedValue(declarations)
}

/** Restores what a test changed of `editor`. */
const cleanups: (() => void)[] = []

afterEach(() => {
  vi.restoreAllMocks()
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("PropertyEditorFiles.schemaForType()", () => {
  test("the running program's class wins:  only the properties a thing stores", async () => {
    const declarationsOf = useDeclarations(DECLARATIONS)
    const schema = await PropertyEditorFiles.schemaForType(project(), "Card", RUNNING)
    expect(schema!.name).toBe("Card")
    expect(schema!.attributes.map((spec) => [spec.name, spec.type])).toEqual([
      ["rank", "choice"],
      ["isFaceUp", "boolean"]
    ])
    expect(declarationsOf).not.toHaveBeenCalled()
  })

  test("no running program:  the project's declarations, worked-out properties and all", async () => {
    useDeclarations(DECLARATIONS)
    const schema = await PropertyEditorFiles.schemaForType(project(), "Card", undefined)
    expect(schema!.attributes.map((spec) => [spec.name, spec.type])).toEqual([
      ["rank", "choice"],
      ["is_face_up", "boolean"],
      ["short_rank", "text"]
    ])
  })

  test("a running program that doesn't know the type:  the declarations", async () => {
    useDeclarations(DECLARATIONS)
    const schema = await PropertyEditorFiles.schemaForType(project(), "Pile", RUNNING)
    expect(schema).toEqual({ name: "Pile", attributes: [] })
  })

  test("by default, the editor's runtime only while it runs this project:  not another's", async () => {
    useDeclarations(DECLARATIONS)
    setEditor("lastExecutedPath", "@spell/examples/other")
    const schema = await PropertyEditorFiles.schemaForType(project(), "Card")
    expect(schema!.attributes.map((spec) => spec.name)).toEqual(["rank", "is_face_up", "short_rank"])
  })

  test("a type nobody knows, or a project never compiled:  `undefined`", async () => {
    useDeclarations(DECLARATIONS)
    expect(await PropertyEditorFiles.schemaForType(project(), "Deck", RUNNING)).toBeUndefined()
    useDeclarations(undefined)
    expect(await PropertyEditorFiles.schemaForType(project(), "Card", undefined)).toBeUndefined()
  })
})

describe("PropertyEditorFiles", () => {
  test("typesOf():  the types the declarations list, in order;  none before it's compiled", async () => {
    useDeclarations(DECLARATIONS)
    expect(await PropertyEditorFiles.typesOf(project())).toEqual(["Card", "Pile"])
    useDeclarations(undefined)
    expect(await PropertyEditorFiles.typesOf(project())).toEqual([])
  })

  test("fileNameFor():  `Card.editor.html`, else the first free number:  never a page that's there", () => {
    expect(PropertyEditorFiles.fileNameFor(project(), "Card")).toBe("Card.editor.html")
    const taken = project(["Card.editor.html", "Card2.editor.html"])
    expect(PropertyEditorFiles.fileNameFor(taken, "Card")).toBe("Card3.editor.html")
  })
})

describe("editor.createPropertyEditor()", () => {
  test("asks which type, then writes its default page into the project", async () => {
    useDeclarations(DECLARATIONS)
    setEditor("project", project(["Card.editor.html"]))
    setEditor("lastExecutedPath", undefined)
    const choose = spyOnEditor("choose", () => Promise.resolve("Card"))
    const created = useCreate()

    await editor.createPropertyEditor()
    expect(choose.mock.calls[0]![0]).toMatchObject({ options: ["Card", "Pile"], defaultValue: "Card" })
    expect(created).toEqual([
      [
        "Card2.editor.html",
        [
          '<ui-property-editor schema="Card" label="Card">',
          '  <ui-property name="rank"></ui-property>',
          '  <ui-property name="is_face_up"></ui-property>',
          '  <ui-property name="short_rank"></ui-property>',
          "</ui-property-editor>",
          ""
        ].join("\n")
      ]
    ])
  })

  test("cancelled:  nothing written, nothing shown", async () => {
    useDeclarations(DECLARATIONS)
    setEditor("project", project())
    spyOnEditor("choose", () => Promise.resolve(undefined))
    const showError = spyOnEditor("showError")
    const created = useCreate()
    await editor.createPropertyEditor()
    expect(created).toEqual([])
    expect(showError).not.toHaveBeenCalled()
  })

  test("a project with no types yet:  says to compile it, asks nothing", async () => {
    useDeclarations(undefined)
    setEditor("project", project())
    const choose = spyOnEditor("choose")
    const showError = spyOnEditor("showError")
    const created = useCreate()
    await editor.createPropertyEditor()
    expect(choose).not.toHaveBeenCalled()
    expect(created).toEqual([])
    expect(String(showError.mock.calls[0]![0])).toMatch(/has no types yet:  compile it first/)
  })
})

/** SIDE EFFECT:  `SPACES.ProjectFiles.create()` records each `[filePath, contents]` it's given, and creates nothing. */
function useCreate(): [string | undefined, string | undefined][] {
  const created: [string | undefined, string | undefined][] = []
  vi.spyOn(SPACES.ProjectFiles.prototype, "create").mockImplementation(async (filePath, contents) => {
    created.push([filePath, contents])
    return undefined
  })
  return created
}

/** Set `editor[key]`, restored after the test. */
function setEditor<K extends keyof EditorStore>(key: K, value: EditorStore[K]) {
  const before = editor[key]
  editor[key] = value
  cleanups.push(() => (editor[key] = before))
}

/** Replace `editor[key]` with a spy (calling `implementation`), restored after the test. */
function spyOnEditor<K extends keyof EditorStore>(key: K, implementation?: (...args: never[]) => unknown) {
  const spy = vi.fn(implementation)
  setEditor(key, spy as unknown as EditorStore[K])
  return spy
}
