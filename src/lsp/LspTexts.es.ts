/**
 * The language server's words in Spanish, for a program written in Spanish (epic `spanish` P13).
 * - Spanish nouns have a gender the labels can't know (`una carta`, `un mazo`):
 *   so `{superType}`, `{datatype}` follow a preposition (`subtipo de Cosa`, `de tipo carta`), never an article.
 * - A first draft, for a native speaker to review.
 */

import type { LspTextPack } from "./LspTexts.en"

export const LSP_TEXTS_ES: LspTextPack = {
  ////////////////
  // ## Hover
  ////////////////

  readsAs: "Se lee",
  forExample: "p. ej.",
  builtIn: "incorporado:  **{words}** de {type}",
  variable: "variable",
  as: "como",
  alias: "alias",
  type: "tipo",
  isA: ", subtipo de {superType}",
  stub: "(esbozo)",
  properties: "propiedades",
  enumerations: "enumeraciones",
  constant: "constante",
  method: "método",
  function: "función",
  matches: "encaja con",
  or: "o",
  compilesTo: "compila a",
  property: "propiedad",
  ofType: " de {type}",
  aDatatype: "de tipo {datatype}",
  autoDeclared: "declarada donde se asigna por primera vez",
  exclusive: "su {datatype}, de solo lectura:  pertenece a uno solo a la vez",
  declaredIn: "declarado en {where}",

  ////////////////
  // ## Completion
  ////////////////

  statement: "sentencia",
  next: "siguiente",
  spellWordFor: "la palabra de spell para <{tag}>",
  typeNamed: "tipo {name}",
  propertyOf: "propiedad de {types}",

  ////////////////
  // ## Quick fixes
  ////////////////

  define: "Definir `{signature}`",

  ////////////////
  // ## The Type Explorer's tree
  ////////////////

  imported: "importado",
  notParsed: "sin analizar",
  typeIsA: "subtipo de {superType}"
}
