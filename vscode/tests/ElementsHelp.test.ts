import { rmSync } from "node:fs"
import { join } from "node:path"
import * as vscode from "vscode"
import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import {
  ATTRIBUTES,
  CARD,
  MODAL_MANIFEST,
  PAGE,
  writeFiles,
  writeJsxFixture
} from "spell-kit/element-tools/jsx-help/test/jsxFixture"
import { ELEMENT_HELP_CODES, ELEMENT_HELP_SOURCE } from "spell-kit/element-tools/tools.types"
import { ElementsHelp } from "../src/ElementsHelp"
import { completionProviders, documentEvents, fakeDocument, resetFakeVscode } from "./fakeVscode"

/**
 * The extension's elements help, over the kit's fixture package (`writeJsxFixture()`), in a stand-in VS Code:
 * `vscode` is `fakeVscode.ts` here (`vitest.config.ts`).
 * - The checks themselves are the kit's `JsxElementHelp`, tested there:
 *   these test what the extension makes of them -- items, ranges, warnings, the log, the timing.
 * - `BROKEN`:  a package whose manifest says `slots: "header"`, a string, so the kit's check THROWS on it.
 */
const FIXTURE = writeJsxFixture()
afterAll(() => rmSync(FIXTURE.root, { recursive: true, force: true }))

const BROKEN = join(FIXTURE.root, "broken")
writeFiles(BROKEN, {
  "package.json": { name: "broken", customElements: "cem.json" },
  "cem.json": { ...MODAL_MANIFEST, modules: brokenModules() },
  "src/page.tsx": PAGE
})

/** How long `checkSoon()` waits, in msec:  `CHECK_DELAY`. */
const CHECK_DELAY = 300

let help: ElementsHelp
beforeEach(() => {
  resetFakeVscode()
  help = new ElementsHelp()
})
afterEach(() => vi.useRealTimers())

describe("ElementsHelp.provideCompletionItems()", () => {
  test("`slot=\"` lists the parent's named slots, in order, replacing the word being typed", () => {
    const document = fakeDocument(FIXTURE.pageFile, PAGE)
    const start = PAGE.indexOf('slot="acions"') + 'slot="'.length
    const items = help.provideCompletionItems(document, document.positionAt(start))
    const range = new vscode.Range(document.positionAt(start), document.positionAt(start + "acions".length))
    expect(items).toEqual([
      {
        label: { label: "header", description: "<fx-modal>" },
        kind: vscode.CompletionItemKind.Value,
        range,
        sortText: "0000",
        detail: 'slot "header" of <fx-modal>',
        documentation: new vscode.MarkdownString("The title bar.")
      },
      {
        label: { label: "actions", description: "<fx-modal>" },
        kind: vscode.CompletionItemKind.Value,
        range,
        sortText: "0001",
        detail: 'slot "actions" of <fx-modal>',
        documentation: new vscode.MarkdownString("Buttons along the bottom.")
      }
    ])
  })

  test("`part=\"` in a component's own folder lists its parts", () => {
    const document = fakeDocument(FIXTURE.cardFile, CARD)
    const items = help.provideCompletionItems(document, document.positionAt(CARD.indexOf("titel")))
    expect(items.map((item) => [item.label, item.detail])).toEqual([
      [{ label: "box", description: "<fx-card>" }, 'part "box" of <fx-card>'],
      [{ label: "title", description: "<fx-card>" }, 'part "title" of <fx-card>']
    ])
  })

  test("outside a slot or part value, nothing", () => {
    const document = fakeDocument(FIXTURE.pageFile, PAGE)
    expect(help.provideCompletionItems(document, document.positionAt(PAGE.indexOf("<fx-modal>")))).toEqual([])
  })
})

describe("ElementsHelp.check()", () => {
  test("a misspelt slot is a WARNING in the Problems list, over the word, from the elements help", () => {
    const document = fakeDocument(FIXTURE.pageFile, PAGE)
    help.check(document)
    const start = PAGE.indexOf("acions")
    expect(help.warnings.get(document.uri)).toEqual([
      warning(
        document,
        start,
        "acions".length,
        ELEMENT_HELP_CODES.unknownSlot,
        '<fx-modal> has no slot "acions";  its slots:  header, actions'
      )
    ])
  })

  test("a misspelt part, in a component's own folder", () => {
    const document = fakeDocument(FIXTURE.cardFile, CARD)
    help.check(document)
    expect(help.warnings.get(document.uri)).toEqual([
      warning(
        document,
        CARD.indexOf("titel"),
        "titel".length,
        ELEMENT_HELP_CODES.unknownPart,
        '<fx-card> has no part "titel";  its parts:  box, title'
      )
    ])
  })

  test("a dashed attribute the tag doesn't have:  one warning each", () => {
    const document = fakeDocument(FIXTURE.attributesFile, ATTRIBUTES)
    help.check(document)
    const found = help.warnings.get(document.uri) ?? []
    expect(found.map((it) => [document.getText(it.range), it.severity, it.source, it.code])).toEqual(
      ["closed-bi", "on-fx-clos", "wild-thing"].map((name) => [
        name,
        vscode.DiagnosticSeverity.Warning,
        ELEMENT_HELP_SOURCE,
        ELEMENT_HELP_CODES.unknownAttribute
      ])
    )
  })

  test("the text as it is in the editor, saved or not", () => {
    const text = PAGE.replace('slot="acions"', 'slot="actions"')
    const document = fakeDocument(FIXTURE.pageFile, text)
    help.check(document)
    expect(help.warnings.get(document.uri)).toEqual([])
  })

  test("a document that isn't a JSX file on disk gets nothing:  no completions, no warnings", () => {
    const documents = [
      fakeDocument(join(FIXTURE.root, "src/page.ts"), PAGE, { languageId: "typescript" }),
      fakeDocument(FIXTURE.pageFile, PAGE, { scheme: "untitled" })
    ]
    for (const document of documents) {
      help.check(document)
      expect(help.warnings.get(document.uri)).toBeUndefined()
      const position = document.positionAt(PAGE.indexOf('slot="acions"') + 'slot="'.length)
      expect(help.provideCompletionItems(document, position)).toEqual([])
    }
  })

  test("a check that THROWS (a broken manifest) is logged, shows nothing, and NEVER throws", () => {
    const error = vi.spyOn(help.log, "error")
    const document = fakeDocument(join(BROKEN, "src/page.tsx"), PAGE)
    expect(() => help.check(document)).not.toThrow()
    expect(help.warnings.get(document.uri)).toEqual([])
    const position = document.positionAt(PAGE.indexOf('slot="acions"') + 'slot="'.length)
    expect(help.provideCompletionItems(document, position)).toEqual([])
    expect(error).toHaveBeenCalledTimes(2)
    expect(error.mock.calls[0]![0]).toMatch(/^failed:  TypeError/)
  })
})

describe("ElementsHelp.checkSoon()", () => {
  test("checks ONCE, when typing pauses for `CHECK_DELAY`", () => {
    vi.useFakeTimers()
    const check = vi.spyOn(help, "check")
    const document = fakeDocument(FIXTURE.pageFile, PAGE)
    help.checkSoon(document)
    vi.advanceTimersByTime(CHECK_DELAY - 1)
    help.checkSoon(document)
    vi.advanceTimersByTime(CHECK_DELAY - 1)
    expect(check).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(check).toHaveBeenCalledTimes(1)
    expect(help.warnings.get(document.uri)).toHaveLength(1)
  })

  test("a document that isn't JSX is never scheduled", () => {
    vi.useFakeTimers()
    const check = vi.spyOn(help, "check")
    help.checkSoon(fakeDocument(join(FIXTURE.root, "src/page.ts"), PAGE, { languageId: "typescript" }))
    vi.advanceTimersByTime(CHECK_DELAY)
    expect(check).not.toHaveBeenCalled()
  })
})

describe("ElementsHelp.forget()", () => {
  test("drops a closed file's warnings, and its pending check", () => {
    vi.useFakeTimers()
    const document = fakeDocument(FIXTURE.pageFile, PAGE)
    help.check(document)
    help.checkSoon(document)
    help.forget(document)
    vi.advanceTimersByTime(CHECK_DELAY)
    expect(help.warnings.get(document.uri)).toBeUndefined()
  })
})

describe("ElementsHelp.register()", () => {
  test("checks the open documents, then follows them as they open, change and close", () => {
    vi.useFakeTimers()
    const page = fakeDocument(FIXTURE.pageFile, PAGE)
    const card = fakeDocument(FIXTURE.cardFile, CARD)
    resetFakeVscode([page])
    const context = { subscriptions: [] as { dispose(): unknown }[] }
    const registered = ElementsHelp.register(context as unknown as vscode.ExtensionContext)

    expect(completionProviders).toEqual([
      {
        selector: [
          { scheme: "file", language: "typescriptreact" },
          { scheme: "file", language: "javascriptreact" }
        ],
        provider: registered,
        triggerCharacters: ['"', "'", "="]
      }
    ])
    expect(registered.warnings.get(page.uri)).toHaveLength(1)

    documentEvents.open.fire(card)
    expect(registered.warnings.get(card.uri)).toHaveLength(1)

    const fixed = fakeDocument(FIXTURE.cardFile, CARD.replace("titel", "title"))
    documentEvents.change.fire({ document: fixed })
    vi.advanceTimersByTime(CHECK_DELAY)
    expect(registered.warnings.get(card.uri)).toEqual([])

    documentEvents.close.fire(page)
    expect(registered.warnings.get(page.uri)).toBeUndefined()

    // disposing the extension clears a pending check:  nothing runs after
    const check = vi.spyOn(registered, "check")
    documentEvents.change.fire({ document: card })
    for (const subscription of context.subscriptions) subscription.dispose()
    vi.advanceTimersByTime(CHECK_DELAY)
    expect(check).not.toHaveBeenCalled()
  })
})

////////////////
// ## Helpers
////////////////

/** The warning `ElementsHelp` shows for `length` characters at offset `start` of `document`. */
function warning(document: vscode.TextDocument, start: number, length: number, code: number, message: string) {
  const range = new vscode.Range(document.positionAt(start), document.positionAt(start + length))
  return Object.assign(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning), {
    source: ELEMENT_HELP_SOURCE,
    code
  })
}

/** `<fx-modal>`'s manifest modules, with its slots a string instead of a list:  the check throws reading them. */
function brokenModules() {
  return MODAL_MANIFEST.modules.map((module) => ({
    ...module,
    declarations: module.declarations.map((declaration) => ({ ...declaration, slots: "header" }))
  }))
}
