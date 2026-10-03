import { CODE_LANGUAGES_EVENT, type CodeLanguage } from "./runtime.types"

/**
 * The languages `<ui-code>` knows beyond its built-in ones, as `UI.code`.
 * - `register(name, language)`:  a highlight.js grammar, a highlighter of our own, or a `load()` that fetches either
 *   on first use (spell's pre-compiled bundle, `language="spell/es"`).
 * - A name may carry a VARIANT after a `/`:  `spell/es` is language `spell`, variant `es`;  `find()` splits it.
 * - Only the registry lives here (it's in the runtime chunk);  highlight.js itself loads with `ui-code`'s own chunk.
 * - `languageBase`:  where `ui-code` finds the language files it ships (`spell.<lang>.js`);  default beside the
 *   module, set it when the files are served elsewhere.
 * - `version` goes up on every `register()`, and `document` gets `CODE_LANGUAGES_EVENT`, so an element showing a
 *   now-registered language highlights again.
 */
export class CodeLanguages {
  /** where the shipped language files are served;  `undefined` = beside `ui-code`'s module */
  languageBase?: string

  /** bumped by each `register()` */
  version = 0

  /** name or alias -> language, lowercase */
  private readonly languages = new Map<string, CodeLanguage & { name: string }>()

  /** Add (or replace) language `name`, with its `aliases`. */
  register(name: string, language: CodeLanguage) {
    const entry = { ...language, name: name.toLowerCase() }
    for (const key of [name, ...(language.aliases ?? [])]) this.languages.set(key.toLowerCase(), entry)
    this.version++
    globalThis.document?.dispatchEvent(new Event(CODE_LANGUAGES_EVENT))
  }

  /**
   * Language `name` (`spell`, `spell/es`, an alias), with its variant;  `undefined` when not registered.
   * - The whole name is tried first, so a language may be registered under a name with a `/`.
   */
  find(name: string): { language: CodeLanguage & { name: string }; variant?: string } | undefined {
    const key = name.toLowerCase()
    const whole = this.languages.get(key)
    if (whole) return { language: whole }
    const slash = key.indexOf("/")
    if (slash < 0) return undefined
    const language = this.languages.get(key.slice(0, slash))
    return language ? { language, variant: key.slice(slash + 1) } : undefined
  }

  /** Registered languages that take part in auto-detection, by name. */
  detectable(): (CodeLanguage & { name: string })[] {
    return [...new Set(this.languages.values())].filter((language) => language.detect && language.grammar)
  }
}
