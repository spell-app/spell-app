import core from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import css from "highlight.js/lib/languages/css"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import markdown from "highlight.js/lib/languages/markdown"
import plaintext from "highlight.js/lib/languages/plaintext"
import python from "highlight.js/lib/languages/python"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"

import type { CodeGrammar } from "$/ui/core"

import { PLAINTEXT } from "./ui-code.types"

/** A highlight.js language function, as its modules export it. */
type LanguageFn = Parameters<typeof core.registerLanguage>[1]

/****************
 * ### `CodeEngine`
 * highlight.js, in `<ui-code>`'s LAZY chunk:  imported by `CodeHighlighter` on the first highlight, so a page pays
 * for it only when it shows code.
 * - Its own instance (`newInstance()`):  a page's global `hljs` (the docs pages load one) is never touched.
 * - The DETECT SET is built in (~20 kB):  what auto-detection chooses from, and what most pages show.  Every other
 *   language in `MORE` loads by name on first use, one chunk each (literal `import()`s:  the docs' single-file
 *   bundle can see them, and no variable `import()` drags Rolldown's helper into the chunk).
 * - Languages registered through `UI.code` join here when first used (`register()`).
 ****************/
export class CodeEngine {
  /** Built-in languages auto-detection chooses from. */
  static readonly DETECT_SET: Readonly<Record<string, LanguageFn>> = {
    bash,
    css,
    javascript,
    json,
    markdown,
    python,
    typescript,
    xml,
    yaml
  }

  /** Languages loaded on first use, by highlight.js name. */
  static readonly MORE: Readonly<Record<string, () => Promise<{ default: LanguageFn }>>> = {
    c: () => import("highlight.js/lib/languages/c"),
    cpp: () => import("highlight.js/lib/languages/cpp"),
    csharp: () => import("highlight.js/lib/languages/csharp"),
    diff: () => import("highlight.js/lib/languages/diff"),
    dockerfile: () => import("highlight.js/lib/languages/dockerfile"),
    go: () => import("highlight.js/lib/languages/go"),
    graphql: () => import("highlight.js/lib/languages/graphql"),
    ini: () => import("highlight.js/lib/languages/ini"),
    java: () => import("highlight.js/lib/languages/java"),
    kotlin: () => import("highlight.js/lib/languages/kotlin"),
    less: () => import("highlight.js/lib/languages/less"),
    lua: () => import("highlight.js/lib/languages/lua"),
    makefile: () => import("highlight.js/lib/languages/makefile"),
    php: () => import("highlight.js/lib/languages/php"),
    powershell: () => import("highlight.js/lib/languages/powershell"),
    ruby: () => import("highlight.js/lib/languages/ruby"),
    rust: () => import("highlight.js/lib/languages/rust"),
    scss: () => import("highlight.js/lib/languages/scss"),
    shell: () => import("highlight.js/lib/languages/shell"),
    sql: () => import("highlight.js/lib/languages/sql"),
    swift: () => import("highlight.js/lib/languages/swift")
  }

  /** Other names for `MORE` languages, before they're loaded (loaded ones answer their own aliases). */
  static readonly MORE_ALIASES: Readonly<Record<string, string>> = {
    "c++": "cpp",
    cs: "csharp",
    "c#": "csharp",
    docker: "dockerfile",
    golang: "go",
    gql: "graphql",
    toml: "ini",
    kt: "kotlin",
    make: "makefile",
    ps1: "powershell",
    rb: "ruby",
    rs: "rust",
    console: "shell"
  }

  /** The one engine;  AFTER the statics above, which its constructor reads. */
  static readonly instance = new CodeEngine()

  /** The highlight.js instance. */
  private readonly hljs = core.newInstance()

  /** Names auto-detection chooses from:  the detect set, plus registered detectable languages. */
  private readonly detectable = new Set(Object.keys(CodeEngine.DETECT_SET))

  /** Registered grammars by name, so a re-register with the SAME grammar is free. */
  private readonly grammars = new Map<string, CodeGrammar>()

  private constructor() {
    for (const [name, language] of Object.entries(CodeEngine.DETECT_SET)) this.hljs.registerLanguage(name, language)
    this.hljs.registerLanguage(PLAINTEXT, plaintext)
    this.hljs.configure({ ignoreUnescapedHTML: true })
  }

  /** Add (or replace) grammar `name`;  `detect` makes auto-detection consider it. */
  register(name: string, grammar: CodeGrammar, options: { aliases?: readonly string[]; detect?: boolean } = {}) {
    if (this.grammars.get(name) === grammar) return
    this.grammars.set(name, grammar)
    this.hljs.registerLanguage(name, grammar as LanguageFn)
    if (options.aliases?.length) this.hljs.registerAliases([...options.aliases], { languageName: name })
    if (options.detect) this.detectable.add(name)
  }

  /**
   * highlight.js's name for `language` (a name or alias), loading it from `MORE` when needed;  `undefined` when
   * highlight.js has no such language.
   */
  async ensure(language: string): Promise<string | undefined> {
    const key = language.toLowerCase()
    const known = this.hljs.getLanguage(key)
    if (known) return this.canonical(key)
    const name = CodeEngine.MORE_ALIASES[key] ?? key
    const loader = CodeEngine.MORE[name]
    if (!loader) return undefined
    this.hljs.registerLanguage(name, (await loader()).default)
    return name
  }

  /** `code` as HTML, coloured as `language` (a loaded name). */
  highlight(code: string, language: string): string {
    return this.hljs.highlight(code, { language, ignoreIllegals: true }).value
  }

  /** `code` coloured as its best guess among the detectable languages;  `undefined` language when nothing fits. */
  detect(code: string): { html: string; language?: string } {
    const result = this.hljs.highlightAuto(code, [...this.detectable])
    return { html: result.value, language: result.language }
  }

  /** The registered name behind name or alias `key`. */
  private canonical(key: string): string {
    if (this.hljs.listLanguages().includes(key)) return key
    for (const name of this.hljs.listLanguages()) {
      if (this.hljs.getLanguage(name) === this.hljs.getLanguage(key)) return name
    }
    return key
  }
}
