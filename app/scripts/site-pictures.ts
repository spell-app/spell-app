/**
 * `yarn site:pictures [name...]`:  the App UI docs set's PICTURES, `docs/_images/<name>.png`,
 * headless screenshots of the running editor app.
 * - For the Solid components that can't be drawn alone on a docs page (they need the whole editor around them):
 *   the editor's page shell, its panes and editors, its menus, dialogs and notices.
 *   The runner's pieces and the explorers are drawn LIVE on their pages instead, inside a `<spell-app>`.
 * - Needs this checkout's editor running:  `spell server start` (repo root) starts it,
 *   and writes its URL to `.spell-server.editor.json`.
 * - Rerun after changing how one of them looks, then look at the pictures and commit them.
 * - Headless Playwright, never a real browser window.
 */
import { readFileSync } from "node:fs"
import path from "node:path"

import { chromium, type Page } from "playwright"

/** `app/`:  the app's build folder, its docs pages in `docs/`. */
const APP = path.resolve(import.meta.dirname, "..")

/** Where the pictures go. */
const IMAGES = path.join(APP, "docs", "_images")

/** The editor's address, from the page server's note at the checkout's root. */
const EDITOR = (JSON.parse(readFileSync(path.join(APP, "..", ".spell-server.editor.json"), "utf8")) as { url: string })
  .url

/** The project the pictures show. */
const PROJECT = "edit/@spell/examples/Solitaire"

/** The window the pictures are taken in. */
const WINDOW = { width: 1280, height: 800 }

/** What a picture shows:  a page of the editor, made ready, then one element of it (or a region of the window). */
type Picture = {
  /** the picture's file name, without `.png`:  its page's name */
  name: string
  /** the editor's page, from its root */
  page: string
  /** what to do first:  open a menu, show a notice ... */
  prepare?: (page: Page) => Promise<void>
  /** the element to picture (its first match) */
  selector?: string
  /** or a region of the window, in CSS pixels */
  clip?: { x: number; y: number; width: number; height: number }
}

/** Every picture, by page. */
const PICTURES: Picture[] = [
  { name: "SpellPage", page: "", selector: ".SpellPage" },
  { name: "SplitPanel", page: PROJECT, selector: ".SplitPanel" },
  { name: "AppRoot", page: PROJECT, selector: ".AppRoot" },
  { name: "AppContainer", page: PROJECT, selector: ".AppContainer" },
  { name: "chrome", page: PROJECT, selector: ".AppMenu" },
  { name: "InputEditor", page: PROJECT, selector: ".InputRoot" },
  { name: "OutputEditor", page: PROJECT, selector: ".OutputRoot" },
  { name: "MonacoEditor", page: PROJECT, selector: ".OutputEditor .MonacoEditor" },
  { name: "ConsoleViewer", page: PROJECT, selector: ".ConsoleRoot" },
  { name: "Actions", page: PROJECT, selector: ".InputRoot .PanelMenu" },
  {
    name: "TreeViewer",
    page: PROJECT,
    prepare: async (page) => {
      await page.locator(".InputEditor .view-line").nth(1).click()
      await page.waitForTimeout(1500)
    },
    selector: ".TreeRoot"
  },
  {
    name: "FileDropdown",
    page: PROJECT,
    prepare: (page) => openDropdown(page, "ui-dropdown.FileDropdown"),
    clip: { x: 0, y: 30, width: 720, height: 420 }
  },
  {
    name: "ProjectDropdown",
    page: PROJECT,
    prepare: (page) => openDropdown(page, "ui-dropdown.ProjectDropdown"),
    clip: { x: 0, y: 0, width: 720, height: 420 }
  },
  {
    name: "Chooser",
    page: PROJECT,
    prepare: async (page) => {
      // the item host is `display: contents`:  click it directly
      await page.locator(".ConsoleRoot .PanelMenu ui-item[link]").nth(4).dispatchEvent("click")
      await page.waitForTimeout(1200)
    },
    clip: { x: 240, y: 150, width: 800, height: 500 }
  },
  {
    name: "Notice",
    page: PROJECT,
    prepare: (page) => showInEditor(page, "notice"),
    clip: { x: 240, y: 0, width: 800, height: 160 }
  },
  {
    name: "ErrorNotice",
    page: PROJECT,
    prepare: (page) => showInEditor(page, "error"),
    clip: { x: 240, y: 0, width: 800, height: 200 }
  }
]

const only = new Set(process.argv.slice(2))
const browser = await chromium.launch()
try {
  for (const picture of PICTURES) {
    if (only.size && !only.has(picture.name)) continue
    const page = await browser.newPage({ viewport: WINDOW })
    await page.goto(new URL(picture.page, EDITOR).href, { waitUntil: "networkidle" })
    await page.waitForTimeout(3000)
    await picture.prepare?.(page)
    const file = path.join(IMAGES, `${picture.name}.png`)
    const clip = picture.clip ?? (await boxOf(page, picture.selector!))
    await page.screenshot({ path: file, clip })
    process.stdout.write(`${path.relative(process.cwd(), file)}\n`)
    await page.close()
  }
} finally {
  await browser.close()
}

/**
 * The box of `selector`'s first match, in CSS pixels.
 * - A `display: contents` element (many `<ui-*>` hosts) has none of its own:  its shadow root's and children's,
 *   together.
 */
async function boxOf(page: Page, selector: string): Promise<{ x: number; y: number; width: number; height: number }> {
  return page.evaluate((selector) => {
    const element = document.querySelector(selector)
    if (!element) throw new Error(`site:pictures:  nothing on the page matches ${selector}`)
    // a loop, not a named helper:  tsx would wrap a named function in a `__name()` the page doesn't have
    const all: DOMRect[] = []
    const queue: Element[] = [element]
    for (let node = queue.shift(); node; node = queue.shift()) {
      const own = node.getBoundingClientRect()
      if (own.width && own.height) all.push(own)
      else queue.push(...(node.shadowRoot?.children ?? []), ...node.children)
    }
    const left = Math.min(...all.map((box) => box.left))
    const top = Math.min(...all.map((box) => box.top))
    const right = Math.max(...all.map((box) => box.right))
    const bottom = Math.max(...all.map((box) => box.bottom))
    return { x: left, y: top, width: right - left, height: bottom - top }
  }, selector)
}

/** Click `selector` (a `<ui-dropdown>`) open, and let its menu show. */
async function openDropdown(page: Page, selector: string): Promise<void> {
  await page.locator(selector).first().click()
  await page.waitForTimeout(800)
}

/** Show a notice or an error over the page, through the editor's debug global (`src/debug.ts`). */
async function showInEditor(page: Page, what: "notice" | "error"): Promise<void> {
  await page.evaluate((what) => {
    const editor = (globalThis as unknown as { editor: EditorMessages }).editor
    if (what === "notice") editor.showNotice("File saved.")
    else editor.showError(new Error("Couldn't load Card.spell:  the server didn't answer."))
  }, what)
  await page.waitForTimeout(800)
}

/** The two calls of the editor's debug global these pictures make. */
type EditorMessages = { showNotice(notice: string): void; showError(error: unknown): void }
