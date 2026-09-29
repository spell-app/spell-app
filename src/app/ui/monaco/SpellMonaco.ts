import type { SP } from "~/languages/spell"
import { LSP } from "~/lsp"
import type * as UIT from "~/app/ui/ui.types"
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
 * - What to do when a file is edited, or another should be shown, is the app's:  set `hooks`.
 * - Theme is Monaco's default `vs`.  Heading comments -- `#`, `##` ... -- are bold by decoration:  see `SpellHeadings`.
 */
export class SpellMonaco {
  /** Language id for spell source. */
  static LANGUAGE = "spell"

  /**
   * Editor options every `<MonacoEditor>` starts with.
   * - Always TABS in spell, shown 3 wide.
   */
  static OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "vs",
    automaticLayout: true,
    tabSize: 3,
    insertSpaces: false,
    detectIndentation: false,
    fontFamily: "Lato, Arial, sans-serif",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    "semanticHighlighting.enabled": true
  }

  /**
   * How spell edits:  comments, brackets, indenting after a trailing `:`.
   * - NOTE: keep in step with the VS Code extension's `vscode-extension/language-configuration.json`.
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
    wordPattern: /[A-Za-z_][\w-]*|-?\d+(\.\d+)?/,
    indentationRules: {
      increaseIndentPattern: /:\s*$/,
      decreaseIndentPattern: /^\s*(otherwise|else)\b/
    },
    onEnterRules: [{ beforeText: /:\s*$/, action: { indentAction: monaco.languages.IndentAction.Indent } }]
  }

  /**
   * What the app does when:
   * - `onEdit`:  a file was edited, and has taken the text, e.g. compile soon
   * - `open`:  another file should be shown, e.g. "go to definition" in another file
   * - Read when each happens, so set them any time.
   */
  static hooks: SpellMonacoHooks = {
    onEdit() {},
    open() {}
  }

  /** Everything `register()` made, once it has. */
  static #registered: SpellMonacoParts | undefined

  /** Models of the files the editor works with -- see `SpellModels`.  SIDE EFFECT:  `register()`s. */
  static get models(): SpellModels {
    return SpellMonaco.register().models
  }

  /** Register the `spell` language and its features with Monaco, if we haven't yet. */
  static register(): SpellMonacoParts {
    if (SpellMonaco.#registered) return SpellMonaco.#registered
    const { LANGUAGE } = SpellMonaco
    SpellHeadings.watch(LANGUAGE)
    monaco.languages.register({ id: LANGUAGE, extensions: [".spell"], mimetypes: ["text/spell", "text/x-spell"] })
    monaco.languages.setLanguageConfiguration(LANGUAGE, SpellMonaco.CONFIGURATION)
    monaco.languages.setTokensProvider(LANGUAGE, new SpellTokensProvider())

    const addresses = new AppAddresses()
    const service = new LSP.SpellLanguageService(addresses)
    const models = new SpellModels(service, (file) => SpellMonaco.hooks.onEdit(file))
    const features = new SpellLanguageFeatures({
      service,
      addresses,
      models,
      open: (path, selection) => SpellMonaco.hooks.open(path, selection)
    })
    features.register(LANGUAGE)
    SpellMonaco.#registered = { addresses, service, models, features }
    return SpellMonaco.#registered
  }

  /** Monaco language id for a file named `path`, by its extension. */
  static languageForPath(path: string | undefined): string {
    const extension = path?.match(/\.[^./]+$/)?.[0]
    if (extension === ".spell") return SpellMonaco.LANGUAGE
    if (extension === ".js" || extension === ".jsx") return "javascript"
    if (extension === ".css") return "css"
    if (extension === ".md") return "markdown"
    return "plaintext"
  }
}

/** What the app does when a file is edited, or another should be shown -- see `SpellMonaco.hooks`. */
export type SpellMonacoHooks = {
  /** `file` was edited, and has taken the text. */
  onEdit(file: SP.AnySpellFile): void
  /** Show the file at `path`, selecting `selection`. */
  open(path: string, selection?: UIT.EditorSelection): void
}

/** Everything `SpellMonaco.register()` makes. */
export type SpellMonacoParts = {
  addresses: AppAddresses
  service: LSP.SpellLanguageService
  models: SpellModels
  features: SpellLanguageFeatures
}
