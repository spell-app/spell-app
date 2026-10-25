/**
 * The language server's words, in English:
 * the labels around what a hover, a completion or the Template Explorer shows (epic `spanish` P13).
 * - Read through `LspTexts.of(scope).text(key, params)` (`LspTexts.ts`):
 *   the PROJECT's language, not the editor's -- a Spanish program reads Spanish in an English editor.
 * - `{name}` is a placeholder, filled from the params.
 * - Spell's own words (rule names, syntax, types, members) come from the program and its language pack, not here.
 * - Other languages:  `LspTexts.<lang>.ts` beside it, with every key (its type says so).
 */
export const LSP_TEXTS = {
  ////////////////
  // ## Hover (`SpellLanguageService.hover()`)
  ////////////////

  readsAs: "Reads as",
  forExample: "e.g.",
  builtIn: "built in:  **{words}** of {type}",
  variable: "variable",
  as: "as",
  alias: "alias",
  type: "template",
  isA: " is a {superType}",
  stub: "(stub)",
  properties: "properties",
  enumerations: "enumerations",
  constant: "constant",
  method: "action",
  function: "function",
  matches: "matches",
  or: "or",
  compilesTo: "compiles to",
  property: "property",
  ofType: " of {type}",
  aDatatype: "a {datatype}",
  autoDeclared: "declared where it's first set",
  exclusive: "the {datatype} holding it, read-only:  it belongs to one at a time",
  declaredIn: "declared in {where}",

  ////////////////
  // ## Completion (`SpellLanguageService.completion()`)
  ////////////////

  statement: "statement",
  next: "next",
  spellWordFor: "spell's word for <{tag}>",
  typeNamed: "template {name}",
  propertyOf: "property of {types}",

  ////////////////
  // ## Quick fixes (`SpellLanguageService.codeActions()`)
  ////////////////

  define: "Define `{signature}`",

  ////////////////
  // ## The Template Explorer's tree (`ScopeExplorer`)
  ////////////////

  imported: "imported",
  notParsed: "not parsed",
  typeIsA: "is a {superType}"
} as const

/** Key of one of the language server's texts, e.g. `"declaredIn"`. */
export type LspTextKey = keyof typeof LSP_TEXTS

/** One language's language-server texts:  EVERY key, so a missing translation is a type error. */
export type LspTextPack = Readonly<Record<LspTextKey, string>>
