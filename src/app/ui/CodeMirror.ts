/**
 * Rudimentary Spell "mode" for spell:
 * - Basically just tokenizes text and colors certain token types.
 * - CodeMirror has a weird re-entrant parsing thing where you might be given
 *   only part of a file to parse, making it hard to use
 *   the current parsing structure to really distinguish everything.
 */
import CodeMirror from "codemirror"
import type { StringStream } from "codemirror"

// Import codemirror setup
import "codemirror/lib/codemirror.css"
import "codemirror/theme/neo.css"
import "codemirror/theme/neat.css"
import "codemirror/theme/solarized.css"
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/markdown/markdown"

import "codemirror/addon/lint/lint"
import "codemirror/addon/lint/lint.css"
import "codemirror/addon/lint/javascript-lint"

import { P } from "~/parser"
import { SP } from "~/languages/spell"
import { store } from "~/app/store"

// NOTE: kept last so it wins the cascade over codemirror's own stylesheets above.
import "./CodeMirror.css"

// Set up JSHINT for displaying compiled JS properly
// REFACTOR: this was breaking page display
// import "./CodeMirror-JSHINT"

// Export `<CodeMirror>` component
export { Controlled as CodeMirror } from "react-codemirror2"

export const codeMirrorOptions: SpellCodeMirrorOptions = {
  theme: "neat", // Owen favors: "solarized", "neo" and "neat"
  indentWithTabs: true,
  indentUnit: 3,
  tabSize: 3
}
export const inputOptions: SpellCodeMirrorOptions = {
  ...codeMirrorOptions,
  mode: "spell",
  extraKeys: {
    "Cmd-S": () => void store.saveFile(),
    "Shift-Cmd-R": () => void store.reloadFile(),
    "Cmd-Enter": () => void store.compileApp()
  },
  scrollbarStyle: "native"
}

export const outputOptions: SpellCodeMirrorOptions = {
  ...codeMirrorOptions,
  mode: "javascript",
  readOnly: true,
  // eslint
  gutters: ["CodeMirror-lint-markers"],
  lint: true
}

CodeMirror.defineMode("spell", (): CodeMirror.Mode<SpellModeState> => {
  // Return the token that starts at numeric offset
  function getToken(tokens: P.Token[] | undefined, offset: number): P.Token | undefined {
    return tokens?.find((token) => token.offset >= offset)
  }

  function advanceStreamPastToken(stream: StringStream, token: P.Token): void {
    const length = token.raw?.length || 0
    for (let i = 0; i < length; i++) stream.next()
  }

  function getTokenType(token: P.Token): string | null {
    if (token instanceof P.Tokens.Word) {
      //      if (blacklist[token.raw]) return "keyword"
      return "unknown"
    }
    if (token instanceof P.Tokens.Symbol) return "operator"
    if (token instanceof P.Tokens.Number) return "number"
    if (token instanceof P.Tokens.Comment) {
      if (token.commentSymbol === "##") return "comment header"
      return "comment"
    }
    if (token instanceof P.Tokens.Text) return "string"
    // if (token instanceof Tokens.JSXElement) return null
    // if (token instanceof Tokens.JSXEndTag) return null
    // if (token instanceof Tokens.JSXAttribute) return null
    // if (token instanceof Tokens.JSXExpression) return null
    // if (token instanceof Tokens.Block) return null
    return null
  }

  return {
    startState() {
      return {
        // spell string for the current line
        string: undefined,
        // list of tokens for the current line
        tokens: undefined
      }
    },

    copyState(state) {
      return { ...state }
    },

    token(stream, state) {
      try {
        // update state tokens if string changes
        if (stream.string !== state.string) {
          state.string = stream.string
          // "" ruleName: we're tokenizing line-by-line, not the whole "block", so we don't want
          // `SP.spellParser.tokenize()`'s indented-block-breaking behavior (only triggered for "block").
          state.tokens = SP.spellParser.tokenize(stream.string, "")
        } else {
          //        console.info(stream)
        }
        // eat whitespace outside of tokens
        const startPosition = stream.pos
        stream.eatSpace()
        if (stream.pos !== startPosition) return null

        const token = getToken(state.tokens, stream.pos)
        if (token) {
          // console.info("matched ", token, length)
          advanceStreamPastToken(stream, token)
          return getTokenType(token)
        }
        stream.skipToEnd()
      } catch (e) {
        // log error and just forget parsing the rest
        console.warn("Spell CodeMirror.token(): got token error:", e)
        stream.skipToEnd()
      }
      return null
    }
  }
})
CodeMirror.defineMIME("text/spell", "spell")
CodeMirror.defineMIME("text/x-spell", "spell")

/**
 * `codemirror/addon/lint/lint` adds a `lint` option that isn't part of the base
 * `@types/codemirror` `EditorConfiguration` type.
 */
export type SpellCodeMirrorOptions = CodeMirror.EditorConfiguration & {
  lint?: boolean
}

/** State for our "spell" CodeMirror mode, cached per line. */
export type SpellModeState = {
  /** spell string for the current line */
  string: string | undefined
  /** list of tokens for the current line */
  tokens: P.Token[] | undefined
}
