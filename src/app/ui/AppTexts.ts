import type { E } from "spell-kit/element"
import { Observable, once, state } from "spell-kit/util"
import type { I18n } from "spell-ui/core"

import { APP_TEXTS, type AppTextKey, type AppTextPack } from "./AppTexts.en"

/** The language every lookup ends at:  the texts' own, `APP_TEXTS`. */
const ENGLISH = "en"

/****************
 * ### `AppTexts`
 * The editor's words, in the page's language:  every menu item, notice and pane title the app shows people
 * (epic `spanish` P13).
 * - Read one with `appTexts.text(key, params)`:  `appTexts.text("save")` => `Save`, or `Guardar` on a Spanish page.
 *   - The keys and their English:  `APP_TEXTS` (`AppTexts.en.ts`).
 *   - Another language:  `AppTexts.<lang>.ts`, a LAZY chunk only a page in that language loads.
 * - The page's language:  the document's `lang`, else the browser's -- as Spell UI's `UI.i18n.locale` does.
 * - Read through Spell UI's `UI.i18n`, once its runtime has loaded:
 *   - scoped as `APP_TEXTS_SCOPE`, so a key of ours never rewords one of Spell UI's (`save`, `cancel`)
 *   - before it loads, and under node, the English is read straight from `APP_TEXTS`
 * - The first text read starts `load()`:  Spell UI's runtime, then the page language's texts.
 *   - It makes Spell UI speak the language too (`RootLoader.useLanguage()`), so its own texts match ours.
 * - Reactive:  `text()` reads `lang`, a spell cell, so a Solid reader redraws when another language's texts arrive.
 * - Position in the import graph:  NO value import of Solid or `spell-ui`, so `editor.ts`, the runners and
 *   `<spell-app>` can all read it.
 *   - Spell UI comes in through dynamic `import()`s.
 *   - Imported by path, `spell-app/app/ui/AppTexts`:  the `UI` barrel is types only.
 * - ONE instance per page bundle, `appTexts`, below.
 ****************/
export class AppTexts extends Observable {
  /** Language the texts are in now, e.g. `es`:  English until another language's texts have loaded. */
  @state accessor lang = ENGLISH

  /** The page's `UI.i18n`, once Spell UI's runtime has loaded and holds our texts;  until then, `APP_TEXTS`. */
  private i18n: I18n | undefined

  /**
   * Text `key` in the page's language, each `{name}` in it filled from `params`.
   * - A placeholder with no param stays as written, `{name}`, so the gap shows.
   * - SIDE EFFECT:  the first call starts `load()`.
   * - NEVER throws.
   */
  text(key: AppTextKey, params?: AppTextParams): string {
    void this.load()
    // a spell cell:  a Solid reader redraws when another language's texts arrive
    if (this.lang && this.i18n) return this.i18n.t(key, params, APP_TEXTS_SCOPE)
    return fillText(APP_TEXTS[key], params)
  }

  /**
   * A project group's words, as params for a text that names it:  `appTexts.text("createdApp", { ...words, name })`.
   * - `type` (`example`), `Type` (`Example`), `theType` (`the example`):  each language's text picks the ones it needs.
   * - `title` (`Examples`), `titleLower` (`examples`), `description`.
   * - `group`:  a project group, `SPACES.SpellProjectRoot`, or a project, which names its group's words.
   * - A group the texts don't know keeps its own English words.
   */
  groupWords(group: ProjectGroupWords | undefined): GroupWords {
    const type = group?.type ?? DEFAULT_GROUP_TYPE
    const known = `type.${type}` in APP_TEXTS
    const word = (prefix: GroupTextPrefix, fallback: string | undefined) =>
      known ? this.text(`${prefix}.${type}` as AppTextKey) : (fallback ?? "")
    const title = word("title", group?.title)
    return {
      type: word("type", group?.type),
      Type: word("Type", group?.Type),
      theType: word("theType", group?.type && `the ${group.type}`),
      title,
      titleLower: title.toLocaleLowerCase(this.lang),
      description: word("description", group?.description)
    }
  }

  /**
   * `read()`, redrawn when the page language's texts arrive:  for a web component's own text, which
   * `translationForKey()` looks up, and which no spell cell tracks.
   * - e.g. `appTexts.inLanguage(() => this.translationForKey("nothingToRun"))`, read in JSX.
   * - SIDE EFFECT:  starts `load()`, as `text()` does.
   */
  inLanguage<T>(read: () => T): T {
    void this.load()
    void this.lang
    return read()
  }

  /**
   * Load Spell UI's runtime and the page language's texts, then read every text through `UI.i18n`.
   * - Runs once:  every caller shares the first call's promise.
   * - English:  just our texts, registered with `UI.i18n`.
   * - Another language, when we have its texts (`LANGUAGES`):
   *   - Spell UI's own (`RootLoader.useLanguage()`), which also makes it `UI.i18n.locale`
   *   - then ours, and the web components' (`AppTexts.<lang>.ts`, a lazy chunk)
   *   - then `lang`, so every reader redraws in it
   * - Nothing to load under node (no `customElements`):  the texts stay `APP_TEXTS`' English.
   * - NEVER throws:  a language that fails to load is logged, and the editor stays in English.
   */
  @once load(): Promise<void> {
    if (typeof customElements === "undefined") return Promise.resolve()
    return this.loadLanguage().catch((error: unknown) =>
      console.error(`AppTexts.load():  the editor's texts in "${pageLanguage()}" didn't load;  staying English`, error)
    )
  }

  /**
   * Give the page a `lang` when it names none:  the browser's language.
   * - The editor app's entry calls it before anything draws, so Spell UI's `<ui-root>` and screen readers agree with
   *   the texts.
   * - NEVER from code a host page loads (`<spell-app>`):  the host's document is its own.
   */
  static namePageLanguage(): void {
    const root = globalThis.document?.documentElement
    if (root && !root.lang) root.lang = pageLanguage()
  }

  ////////////////
  // ## Loading
  ////////////////

  /** `load()`'s work, which may throw. */
  private async loadLanguage(): Promise<void> {
    const lang = pageLanguage()
    const code = languageOf(lang)
    const loadPack = Object.hasOwn(LANGUAGES, code) ? LANGUAGES[code] : undefined
    const [{ UI }, { RootLoader }] = await Promise.all([import("spell-ui/core"), import("spell-ui/components/ui-root")])
    const ui = await UI.load()
    ui.i18n.register(ENGLISH, APP_TEXTS, APP_TEXTS_SCOPE)
    if (loadPack) {
      // oxlint-disable-next-line react-hooks/rules-of-hooks -- Spell UI's `useLanguage()` is no React hook
      const [pack] = await Promise.all([loadPack(), RootLoader.useLanguage(lang)])
      ui.i18n.register(pack.lang, pack.texts, APP_TEXTS_SCOPE)
      for (const tag of pack.tags) ui.i18n.register(pack.lang, tag.texts, tag.tag)
    }
    this.i18n = ui.i18n
    this.lang = loadPack ? code : ENGLISH
  }
}

/** The page's ONE `AppTexts`:  the editor's words, in its language. */
export const appTexts = new AppTexts()

////////////////
// ## Types and helpers
////////////////

/** Where our texts sit in `UI.i18n`:  a scope of their own, as a component's are under its tag. */
export const APP_TEXTS_SCOPE = "spell-app/app"

/** A project group's `type` when there's none to name, e.g. before the editor shows a project:  `Project`. */
const DEFAULT_GROUP_TYPE = "project"

/**
 * The languages we have the editor's texts in, beyond English:  language code => its lazy chunk.
 * - The page loads one only when it's in that language (`AppTexts.load()`).
 */
const LANGUAGES: Readonly<Record<string, () => Promise<AppLanguagePack>>> = {
  es: () => import("./AppTexts.es").then(({ appTextsEs }) => appTextsEs)
}

/** The page's language:  the document's `lang`, else the browser's, else English, e.g. `es-MX`. */
function pageLanguage(): string {
  return globalThis.document?.documentElement.lang || globalThis.navigator?.language || ENGLISH
}

/** The language part of `lang`, lowercase:  `es` for `es-MX`. */
function languageOf(lang: string): string {
  return lang.split("-")[0]!.toLowerCase()
}

/** `text` with each `{name}` filled from `params`;  one with no param stays as written. */
function fillText(text: string, params: AppTextParams | undefined): string {
  if (!params) return text
  return text.replace(PLACEHOLDER, (whole, name: string) => (name in params ? String(params[name]) : whole))
}

/** A named placeholder in a text, `{type}`. */
const PLACEHOLDER = /\{(\w+)\}/g

/** Values for a text's `{name}` placeholders. */
export type AppTextParams = Readonly<Record<string, string | number>>

/** The keys of each project group's words in `APP_TEXTS`, `<prefix>.<type>`. */
type GroupTextPrefix = "type" | "Type" | "theType" | "title" | "description"

/** A project group's words, as `groupWords()` gives them. */
export type GroupWords = {
  /** Its kind of project, lowercase, e.g. `example`. */
  type: string
  /** Its kind of project, capitalized, e.g. `Example`. */
  Type: string
  /** Its kind of project with its article, e.g. `the example`, `la guía`. */
  theType: string
  /** Its title, e.g. `Examples`. */
  title: string
  /** Its title, lowercase, e.g. `examples`. */
  titleLower: string
  /** What's in it, e.g. `Example projects`. */
  description: string
}

/** What `groupWords()` reads of a project group, or of a project:  its English words, `type` its key. */
export type ProjectGroupWords = {
  /** Its kind of project, e.g. `example`:  the key of its words in `APP_TEXTS`. */
  type?: string
  /** `type`, capitalized. */
  Type?: string
  /** Its title, e.g. `Examples`. */
  title?: string
  /** What's in it. */
  description?: string
}

/**
 * A web component's texts in one language, in a file beside its vocabulary (`SpellApp.es.ts`).
 * - Texts only:  the app's tags keep their English names in every language.
 * - `V`:  its vocabulary, so a text it doesn't have is a type error.
 */
export type AppTagTexts<V extends E.ComponentVocabulary = E.ComponentVocabulary> = {
  /** Language code, e.g. `es`. */
  lang: string
  /** Its tag, e.g. `spell-app`. */
  tag: V["tag"]
  /** Text key => its text in `lang`:  every one its vocabulary has. */
  texts: Readonly<Record<E.TextKey<V>, string>>
}

/** Everything the app shows in one language:  `AppTexts.<lang>.ts`. */
export type AppLanguagePack = {
  /** Language code, e.g. `es`. */
  lang: string
  /** The editor's own texts. */
  texts: AppTextPack
  /** Each web component's. */
  tags: readonly AppTagTexts[]
}

export type { AppTextKey, AppTextPack } from "./AppTexts.en"
