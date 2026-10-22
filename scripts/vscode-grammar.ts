/**
 * `yarn tsx scripts/vscode-grammar.ts [--check]`:  writes the keyword lists of the VS Code extension's grammar
 * from spell's language packs, every language in one (epic `spanish` P10).
 * - The grammar is [spell.tmLanguage.json](../vscode/syntaxes/spell.tmLanguage.json):
 *   its coarse colouring, until the language server's arrives.
 * - Rewrites only its `keyword` entry -- see `LSP.SpellKeywords.grammarKeywords()`;  the rest is written by hand.
 * - `--check`:  writes nothing;  exits 1 if the grammar is out of date.
 *   The lsp tests check it too (`SpellKeywords.test.ts`).
 * - Writes the entry where it is, the rest of the file as it was laid out.
 * - A new language pack, or a keyword changed in one:  run it, then rebuild the extension (`spell app vscode`).
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { SP } from "spell-lang/spell"
import { LSP } from "spell-app/lsp"

/** The grammar this keeps current. */
const GRAMMAR = path.resolve(import.meta.dirname, "../vscode/syntaxes/spell.tmLanguage.json")

/** Where its keyword entry starts. */
const KEYWORD_ENTRY = '"keyword": {'

const grammar = JSON.parse(readFileSync(GRAMMAR, "utf8")) as { repository: Record<string, unknown> }
const keyword = LSP.SpellKeywords.grammarKeywords([...SP.Language.all.values()])
const isCurrent = JSON.stringify(grammar.repository.keyword) === JSON.stringify(keyword)

if (process.argv.includes("--check")) {
  console.info(isCurrent ? "The grammar's keywords are up to date." : `Out of date:  ${GRAMMAR}`)
  process.exitCode = isCurrent ? 0 : 1
} else if (isCurrent) {
  console.info("The grammar's keywords are up to date.")
} else {
  writeFileSync(GRAMMAR, withKeyword(readFileSync(GRAMMAR, "utf8"), keyword))
  console.info(`Wrote ${GRAMMAR}`)
}

/**
 * The grammar's `text` with its `keyword` entry, the last in its `repository`, replaced by `keyword`.
 * - throws if there's no `keyword` entry to replace
 */
function withKeyword(text: string, keyword: LSP.TextMateKeywords): string {
  const start = text.indexOf(KEYWORD_ENTRY)
  if (start === -1) throw new TypeError(`vscode-grammar:  no ${KEYWORD_ENTRY} entry in ${GRAMMAR}`)
  // the entry runs to the `}` closing the repository, on a line of its own
  const end = text.indexOf("\n  }\n", start)
  const entry = JSON.stringify(keyword, null, 2).replaceAll("\n", "\n    ")
  return `${text.slice(0, start)}"keyword": ${entry}${text.slice(end)}`
}
