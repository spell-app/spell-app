import { SP } from "spell-parser/spell"
import { LSP } from "spell-app/lsp"
import type * as UIT from "spell-app/app/ui/ui.types"
import { CodeThemes } from "spell-app/app/ui/monaco/themes/CodeThemes"
import { monaco } from "./monaco"
import { AppAddresses } from "./AppAddresses"
import { SpellHeadings } from "./SpellHeadings"
import { SpellTokensProvider } from "./SpellTokensProvider"
import { SpellModels } from "./SpellModels"
import { SpellLanguageFeatures } from "./SpellLanguageFeatures"

/**
 * Spell in Monaco:  the `spell` language and its features, and the options every `<MonacoEditor>` starts with.
 * - `register()` once, before the first editor -- `<MonacoEditor>` and `models` both do.
 * - Language features come from `LSP.SpellLanguageService`, in-process -- see `SpellLanguageFeatures`.
 * - What to do when a file is edited, or another should be shown, is up to whoever shows editors:
 *   the app, each `<spell-editor>`.  So SEVERAL can listen:  see `onEdit()`, `onOpen()`.
 * - The code's colours are Purple, light or dark as the page is:  `CodeThemes`, which `register()` starts.
 * - Heading comments -- `#`, `##` ... -- are bold by decoration:  see `SpellHeadings`.
 */
export class SpellMonaco {
  /** Language id for spell source. */
  static LANGUAGE = "spell"

  /**
   * Editor options every `<MonacoEditor>` starts with.
   * - No `theme`:  Monaco has one per page, which `CodeThemes` sets;  an editor naming one would reset every editor.
   * - Always TABS in spell, shown 3 wide.
   * - Formats as you type:  a Spanish keyword typed without its accent gets it back (`SpellLanguageFeatures`).
   * - Large text (`fontSize`), and no line numbers:  the app's code editor turns them on from its `...` menu.
   * - No border or cursor mark down the scrollbar:  a hard line beside the pane's soft edge.
   */
  static OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    tabSize: 3,
    insertSpaces: false,
    detectIndentation: false,
    fontFamily: "Lato, Arial, sans-serif",
    fontSize: 17,
    lineNumbers: "off",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    "semanticHighlighting.enabled": true,
    formatOnType: true
  }

  /**
   * How spell edits:  comments, brackets, indenting after a trailing `:`, back out for `else` (`SpellKeywords`).
   * - NOTE: keep in step with the VS Code extension's `vscode/language-configuration.json`:
   *   a test checks they match.
   */
  static CONFIGURATION: monaco.languages.LanguageConfiguration = {
    comments: { lineComment: "//" },
    brackets: [
      ["(", ")"],
      ["[", "]"],
      ["{", "}"]
    ],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: '"', close: '"', notIn: ["string", "comment"] },
      { open: "'", close: "'", notIn: ["string", "comment"] }
    ],
    surroundingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: "{", close: "}" },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ],
    wordPattern: /[\p{L}_][\p{L}\p{M}\d_-]*|-?\d+(\.\d+)?/u,
    indentationRules: {
      increaseIndentPattern: /:\s*$/,
      decreaseIndentPattern: LSP.SpellKeywords.DECREASE_INDENT
    },
    onEnterRules: [{ beforeText: /:\s*$/, action: { indentAction: monaco.languages.IndentAction.Indent } }]
  }

  /** Who hears each edit -- see `onEdit()`. */
  static #editListeners = new Set<(file: SP.AnySpellFile) => void>()
  /** Who may show another file, latest first -- see `onOpen()`. */
  static #openers: SpellMonacoOpener[] = []

  /**
   * Call `listener` after each edit of a model has gone into its file, e.g. to compile soon.
   * - EVERY listener hears EVERY edit:  one showing a single project checks `file.project`.
   * - Returns what stops it.
   */
  static onEdit(listener: (file: SP.AnySpellFile) => void): () => void {
    SpellMonaco.#editListeners.add(listener)
    return () => SpellMonaco.#editListeners.delete(listener)
  }

  /**
   * Let `opener` show another file, e.g. for "go to definition" in another file.
   * - Asked latest first, until one says it did, by returning `true`.
   *   e.g. a `<spell-editor>` only for its own editor, `source`, while the app takes anything.
   * - Returns what stops it.
   */
  static onOpen(opener: SpellMonacoOpener): () => void {
    SpellMonaco.#openers.unshift(opener)
    return () => {
      SpellMonaco.#openers = SpellMonaco.#openers.filter((it) => it !== opener)
    }
  }

  /** Everything `register()` made, once it has. */
  static #registered: SpellMonacoParts | undefined

  /**
   * Models of the files the editor works with -- see `SpellModels`.
   * - SIDE EFFECT:  `register()`s.
   */
  static get models(): SpellModels {
    return SpellMonaco.register().models
  }

  /** Register the `spell` language and its features with Monaco, if we haven't yet. */
  static register(): SpellMonacoParts {
    if (SpellMonaco.#registered) return SpellMonaco.#registered
    const { LANGUAGE } = SpellMonaco
    CodeThemes.register()
    SpellHeadings.watch(LANGUAGE)
    monaco.languages.register({ id: LANGUAGE, extensions: [".spell", ".spellx"], mimetypes: ["text/spell", "text/x-spell"] })
    monaco.languages.setLanguageConfiguration(LANGUAGE, SpellMonaco.CONFIGURATION)
    monaco.languages.setTokensProvider(LANGUAGE, new SpellTokensProvider())
    // `<css>` and `<markdown>` blocks colour with Monaco's own colouring, which loads lazily:
    // colour spell again once it has
    void Promise.all([monaco.editor.colorize("", "css", {}), monaco.editor.colorize("", "markdown", {})])
      .then(() => monaco.languages.setTokensProvider(LANGUAGE, new SpellTokensProvider()))
      .catch((error) => console.warn("SpellMonaco.register():  CSS or markdown colouring didn't load", error))

    const addresses = new AppAddresses()
    const service = new LSP.SpellLanguageService(addresses)
    const models = new SpellModels(service, (file) => SpellMonaco.#editListeners.forEach((listener) => listener(file)))
    const features = new SpellLanguageFeatures({
      service,
      addresses,
      models,
      open: (path, selection, source) => SpellMonaco.#openers.some((opener) => opener(path, selection, source))
    })
    features.register(LANGUAGE)
    SpellMonaco.#registered = { addresses, service, models, features }
    return SpellMonaco.#registered
  }

  /** Monaco language id for a file named `path`, by its extension. */
  static languageForPath(path: string | undefined): string {
    const extension = path?.match(/\.[^./]+$/)?.[0]
    if (SP.isSpellSourceName(extension)) return SpellMonaco.LANGUAGE
    if (extension === ".js" || extension === ".jsx") return "javascript"
    if (extension === ".css") return "css"
    if (extension === ".md") return "markdown"
    return "plaintext"
  }
}

/**
 * Show the file at `path`, selecting `selection` -- `true` if it did.  See `SpellMonaco.onOpen()`.
 * - `source`:  the editor asking, e.g. where "go to definition" was, if we know.
 */
export type SpellMonacoOpener = (
  path: string,
  selection: UIT.EditorSelection | undefined,
  source: monaco.editor.ICodeEditor | undefined
) => boolean

/** Everything `SpellMonaco.register()` makes. */
export type SpellMonacoParts = {
  addresses: AppAddresses
  service: LSP.SpellLanguageService
  models: SpellModels
  features: SpellLanguageFeatures
}
