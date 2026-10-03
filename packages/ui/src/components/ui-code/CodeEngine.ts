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
import cLanguage from "highlight.js/lib/languages/c"
import cppLanguage from "highlight.js/lib/languages/cpp"
import csharpLanguage from "highlight.js/lib/languages/csharp"
import diffLanguage from "highlight.js/lib/languages/diff"
import dockerfileLanguage from "highlight.js/lib/languages/dockerfile"
import goLanguage from "highlight.js/lib/languages/go"
import graphqlLanguage from "highlight.js/lib/languages/graphql"
import iniLanguage from "highlight.js/lib/languages/ini"
import javaLanguage from "highlight.js/lib/languages/java"
import kotlinLanguage from "highlight.js/lib/languages/kotlin"
import lessLanguage from "highlight.js/lib/languages/less"
import luaLanguage from "highlight.js/lib/languages/lua"
import makefileLanguage from "highlight.js/lib/languages/makefile"
import phpLanguage from "highlight.js/lib/languages/php"
import powershellLanguage from "highlight.js/lib/languages/powershell"
import rubyLanguage from "highlight.js/lib/languages/ruby"
import rustLanguage from "highlight.js/lib/languages/rust"
import scssLanguage from "highlight.js/lib/languages/scss"
import shellLanguage from "highlight.js/lib/languages/shell"
import sqlLanguage from "highlight.js/lib/languages/sql"
import swiftLanguage from "highlight.js/lib/languages/swift"

// Import directly:  see the class docs
import { SourceError, type CodeGrammar } from "$/ui/runtime/runtime.types"

/** A highlight.js language function, as its modules export it. */
type LanguageFn = Parameters<typeof core.registerLanguage>[1]

/****************
 * ### `CodeEngine`
 * highlight.js, in `<ui-code>`'s LAZY chunk:  imported by `CodeHighlighter` on the first highlight, so a page pays
 * for it only when it shows code.
 * - Its own instance (`newInstance()`):  a page's global `hljs` (the docs pages load one) is never touched.
 * - The DETECT SET:  what auto-detection chooses from, and what most pages show.  `MORE` languages are in the chunk
 *   too, registered by name on first use (one chunk each would split Rolldown's runtime off, see below).
 * - Languages registered through `UI.code` join here when first used (`register()`).
 * - NEVER a value import but highlight.js and `SourceError`:  the docs bundler builds this file ALONE into a
 *   classic script (`CodeHighlighter.engineLoader`), which mustn't drag the family in again.
 * - Imports `SourceError` straight from `$/ui/runtime/runtime.types` (built into `core.js`), and USES it:  a lazy
 *   chunk that needs Rolldown's helpers (`__name`, from `keepNames`) without depending on core makes Rolldown split
 *   them into a `rolldown-runtime-<hash>.js` EVERY page loads (`yarn measure`'s `runtimeChunks`;  see
 *   `runtime/TemporalPolyfill.ts`).  Straight, not through `$/ui/core`:  the docs bundler builds this file alone, and
 *   `runtime.types` is all it may pull in.
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

  /** highlight.js's name for no colouring (`language="text"`). */
  static readonly PLAINTEXT = "plaintext"

  /** Languages registered on first use, by highlight.js name (in this chunk too:  each its own chunk would
   * split Rolldown's runtime off, see the class docs). */
  static readonly MORE: Readonly<Record<string, LanguageFn>> = {
    c: cLanguage,
    cpp: cppLanguage,
    csharp: csharpLanguage,
    diff: diffLanguage,
    dockerfile: dockerfileLanguage,
    go: goLanguage,
    graphql: graphqlLanguage,
    ini: iniLanguage,
    java: javaLanguage,
    kotlin: kotlinLanguage,
    less: lessLanguage,
    lua: luaLanguage,
    makefile: makefileLanguage,
    php: phpLanguage,
    powershell: powershellLanguage,
    ruby: rubyLanguage,
    rust: rustLanguage,
    scss: scssLanguage,
    shell: shellLanguage,
    sql: sqlLanguage,
    swift: swiftLanguage
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
    this.hljs.registerLanguage(CodeEngine.PLAINTEXT, plaintext)
    this.hljs.configure({ ignoreUnescapedHTML: true })
  }

  /** Add (or replace) grammar `name`;  `detect` makes auto-detection consider it. */
  register(name: string, grammar: CodeGrammar, options: { aliases?: readonly string[]; detect?: boolean } = {}) {
    if (this.grammars.get(name) === grammar) return
    if (typeof grammar !== "function") throw new SourceError("render", `"${name}" isn't a highlight.js grammar`)
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
    const grammar = CodeEngine.MORE[name]
    if (!grammar) return undefined
    this.hljs.registerLanguage(name, grammar)
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
