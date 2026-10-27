import { afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"
import { render } from "@solidjs/web"

import type { SP } from "spell-parser/spell"
// Import directly:  the test barrel holds node-only helpers
import { compiledSpellProject, incrementalSpellProject } from "spell-parser/spell/test/parseSpellProject"
import { uiReady } from "spell-app/app/solid/loadUI"
import type { NotebookController } from "spell-app/app/solid/notebook/NotebookController"
import { NotebookPage } from "spell-app/app/solid/notebook/NotebookPage"

// Spell UI's pack:  a spellx drawing names its components bare (`<button>`)
import "spell-app/spaces"

/**
 * `<NotebookPage>` in the browser (epic `elemental-spell` P16):  a notebook's page, its cells drawn live by the
 * program's runtime;  an edit draws only its own cell again, saves 600ms after, and a locked notebook never saves:
 * an edit there is a try-out.
 * - The runtime:  `spellRuntime.ts` as vite serves it, imported by its URL, as the runner's tests do;  the program
 *   (the notebook, compiled) runs on it first, as the editor runs it, out of sight.
 * - The project:  an incremental parse of the notebook (`incrementalSpellProject()`), standing in for the editor's;
 *   its file, a plain object that counts its saves.
 */
vi.mock("spell-app/app/editor", () => ({
  editor: {
    loadRuntime: testRuntime,
    showError: (error: unknown) => console.error(error),
    onFileEdited: () => {},
    setScopeExplorer: () => {},
    showFileAt: async () => {}
  }
}))

/** The Counter notebook, as the plan writes it, its section's text left out. */
const COUNTER = [
  '<spell-notebook "counter notebook">',
  "\t# A counter",
  "\tA button that counts its clicks.",
  "",
  '\t<spell-view "counter">',
  '\t\t<property "count">a number</>',
  '\t\t<action "create it">set its count to 0</>',
  '\t\t<action "count up">set its count to its count + 1</>',
  "\t\t<draw><button onClick={count up}>Clicked {its count} times</button></draw>",
  "\t</spell-view>",
  "",
  "\t## Try it",
  '\t<example "one counter">',
  "\t\t<counter/>",
  "\t</example>",
  "",
  "\t## Two of them",
  '\t<example "two counters">',
  "\t\t<counter/>",
  "\t\t<counter/>",
  "\t</example>",
  "</spell-notebook>",
  ""
].join("\n")

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

beforeAll(async () => {
  await uiReady
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<NotebookPage>", () => {
  test("draws each example live, and an edit to its template draws only the cells drawing it", async () => {
    const { host, file, controller } = await mount()
    await until(
      () => resultsOf(host).length === 2,
      () => resultsOf(host).join(" | ")
    )
    expect(resultsOf(host)).toEqual(["Clicked 0 times", "Clicked 0 times Clicked 0 times"])
    // what must stay:  the prose, the sections, the template's editor
    const kept = [...host.querySelectorAll(".NotebookMasthead, .NotebookProse, .NotebookSection, .NotebookCode")]
    const template = keyOf(controller, "template")
    controller.editCell(template, controller.cellFor(template)!.code.replace("Clicked", "Pressed"))
    await until(() => resultsOf(host).every((text) => /Pressed 0 times/.test(text)))
    for (const node of kept) expect(node.isConnected, node.className).toBe(true)
    expect(file.contents).toBe(COUNTER.replace("Clicked", "Pressed"))
  })

  test("\"On this page\":  the docs site's contents in a column, hidden by its Hide;  else a flyout under the title row's icon", async () => {
    const { host, controller } = await mount({ width: 1000 })
    const column = () => host.querySelector<HTMLElement>(".NotebookAside")
    const button = () => host.querySelector<HTMLElement>(".NotebookMasthead .NotebookTocButton")
    const flyout = () => host.querySelector<HTMLElement>(".NotebookTocFlyout")
    const sectionLinks = (toc: Element | null | undefined) =>
      [...(toc?.shadowRoot?.querySelectorAll("[part~=section]") ?? [])].map((item) => item.textContent!.trim())
    await until(() => sectionLinks(column()?.querySelector("ui-docs-toc")).length === 2)
    // room for the column:  Spell UI's `<ui-docs-toc>`, headed by the page's title;  no icon
    expect(sectionLinks(column()!.querySelector("ui-docs-toc"))).toEqual(["Try it", "Two of them"])
    expect(column()!.querySelector("ui-docs-toc")!.getAttribute("header")).toBe("A counter")
    expect(button()).toBeNull()
    // its Hide:  the icon gets it back, as a flyout
    column()!.querySelector<HTMLElement>(".NotebookTocHide")!.click()
    await until(() => !column() && !!button())
    expect(controller.contentsShown()).toBe(false)
    // opening and closing it never moves the page
    const scroller = host.querySelector<HTMLElement>(".NotebookScroller")!
    scroller.scrollTop = 40
    const before = scroller.scrollTop
    button()!.click()
    await until(() => sectionLinks(flyout()?.querySelector("ui-docs-toc")).length === 2)
    expect(scroller.scrollTop).toBe(before)
    // under the icon, never over the pane above the page
    expect(flyout()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(host.getBoundingClientRect().top)
    button()!.click()
    await until(() => !flyout())
    expect(scroller.scrollTop).toBe(before)
    // its "Show contents" pins it back as the column
    button()!.click()
    await until(() => !!flyout()?.querySelector(".NotebookTocShow"))
    flyout()!.querySelector<HTMLElement>(".NotebookTocShow")!.click()
    await until(() => !!column() && !flyout() && !button())
    // a narrow pane:  no column, the icon
    host.style.width = "500px"
    await until(() => !column() && !!button())
  })

  test("saves 600ms after the last edit, once", async () => {
    const { file, controller } = await mount()
    const example = keyOf(controller, "drawing")
    controller.editExample(example, 0, "<counter/>\n<counter/>")
    controller.editExample(
      controller.keys()[controller.keys().indexOf(example)]!,
      0,
      "<counter/>\n<counter/>\n<counter/>"
    )
    expect(file.saves).toBe(0)
    await until(() => file.saves === 1)
    expect(file.contents).toContain('\t<example "one counter">\n\t\t<counter/>\n\t\t<counter/>\n\t\t<counter/>\n')
    expect(controller.status()).toBe("saved")
  })

  test("locked, nothing is ever saved:  an edit is a try-out, drawn but not saved, and its Reset puts it back", async () => {
    const { host, file, controller } = await mount()
    controller.setLocked(true)
    await until(() => file.saves === 1)
    expect(file.contents.split("\n")[0]).toBe('<spell-notebook "counter notebook" locked>')
    expect(controller.canSave()).toBe(false)
    // a try-out:  the example draws again as it's typed, and the file stays as it was
    const example = keyOf(controller, "drawing")
    expect(controller.triedOutExample(example, 0)).toBeUndefined()
    controller.editExample(example, 0, "<counter/>\n<counter/>")
    await until(() => resultsOf(host)[0] === "Clicked 0 times Clicked 0 times")
    await new Promise((resolve) => setTimeout(resolve, 900))
    expect(file.saves).toBe(1)
    expect(controller.status()).toBe("locked")
    // its Reset:  the example's code as the file has it
    expect(controller.triedOutExample(example, 0)).toBe("<counter/>")
    controller.resetExample(example, 0)
    await until(() => resultsOf(host)[0] === "Clicked 0 times")
    expect(controller.triedOutExample(example, 0)).toBeUndefined()
    expect(file.saves).toBe(1)
    // unlocked:  saved again
    controller.setLocked(false)
    await until(() => file.saves === 2)
    expect(file.contents).toBe(COUNTER)
  })
})

/** A notebook file, standing in for the editor's `SP.SpellFile`:  its text, and how many times it's saved. */
type TestFile = { path: string; form: "spellx"; contents: string; match: unknown; saves: number; save(): Promise<void> }

/** The Counter's page, its program running first;  its controller, at the page's debug global. */
async function mount(options: { width?: number } = {}) {
  const runtime = await testRuntime()
  const { code } = compiledSpellProject([{ path: "/Counter.spellx", contents: COUNTER }])
  const appRoot = document.createElement("div")
  document.body.append(appRoot)
  // its imports, as a project's compile writes them above its code
  const header = 'import { core, View, Notebook } from "@spell/core"\n'
  const error = await runtime.runApp(header + code, { appRoot, coreUrl: RUNTIME_URL })
  expect(error).toBeUndefined()

  const incremental = incrementalSpellProject([{ path: "/Counter.spellx", contents: COUNTER }])
  const file: TestFile = {
    path: "/Counter.spellx",
    form: "spellx",
    contents: COUNTER,
    match: incremental.getFile("/Counter.spellx")!.match,
    saves: 0,
    async save() {
      this.saves++
    }
  }
  const project = {
    incremental,
    async updateText(each: TestFile, text: string) {
      each.contents = text
      incremental.update(each.path, text)
      each.match = incremental.getFile(each.path)!.match
      return []
    },
    async parse() {}
  }
  const host = document.createElement("div")
  host.style.height = "800px"
  if (options.width) host.style.width = `${options.width}px`
  document.body.append(host)
  const dispose = render(
    () => <NotebookPage file={file as unknown as SP.SpellFile} project={project as unknown as SP.SpellProject} />,
    host
  )
  cleanups.push(() => {
    dispose()
    host.remove()
    appRoot.remove()
  })
  const controller = (globalThis as unknown as { notebook: NotebookController }).notebook
  return { host, file, controller }
}

/** Each example's result's text, its views' shadow roots and all, in order:  not its description and code panels. */
function resultsOf(host: HTMLElement): string[] {
  const deep = (node: Node): string =>
    node.nodeType === Node.TEXT_NODE
      ? (node.textContent ?? "")
      : [...((node as Element).shadowRoot?.childNodes ?? []), ...node.childNodes].map(deep).join("")
  return [...host.querySelectorAll(".NotebookResult spell-example")].map((example) =>
    [...example.childNodes]
      .filter((node) => !(node as Element).slot)
      .map(deep)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  )
}

/** The key of the first cell of `kind`. */
function keyOf(controller: NotebookController, kind: string): string {
  return controller.cells().find((each) => each.cell.kind === kind)!.key
}

/** Wait until `ready()`, up to 10 seconds;  `what()` says what it found, if it never was. */
async function until(ready: () => boolean, what: () => string = () => "") {
  for (let waited = 0; waited < 10_000; waited += 50) {
    if (ready()) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  expect(ready(), `waited 10 seconds:  ${what()}`).toBe(true)
}

/** The runtime's URL:  also the program's `@spell/core`. */
const RUNTIME_URL = new URL("/src/app/runner/spellRuntime.ts", location.href).href

/** The runtime, as vite serves it. */
async function testRuntime() {
  return (await import(/* @vite-ignore */ RUNTIME_URL)) as typeof import("spell-app/app/runner/spellRuntime")
}
