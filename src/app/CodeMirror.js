/**
 * Rudimentary Spell "mode" for spell:
 * - Basically just tokenizes text and colors certain token types.
 * - CodeMirror has a weird re-entrant parsing thing where you might be given
 *   only part of a file to parse, making it hard to use
 *   the current parsing structure to really distinguish everything.
 */
import _ from "lodash"
import CodeMirror from "codemirror"

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

import "./CodeMirror.css"

// Set up JSHINT for displaying compiled JS properly
import "./JSHINT"

import { Token } from "~/parser"
import { spellParser } from "~/languages/spell"
import { store } from "./store"

// Export `<CodeMirror>` component
export { Controlled as CodeMirror } from "react-codemirror2"

export const codeMirrorOptions = {
  theme: "neat", // Owen favors: "solarized", "neo" and "neat"
  indentWithTabs: true,
  indentUnit: 3,
  tabSize: 3
}
export const inputOptions = {
  ...codeMirrorOptions,
  mode: "spell",
  extraKeys: {
    "Cmd-S": () => store.saveFile(),
    "Shift-Cmd-R": () => store.reloadFile(),
    "Cmd-Enter": () => store.compileApp()
  },
  scrollbarStyle: "native"
}

export const outputOptions = {
  ...codeMirrorOptions,
  mode: "javascript",
  readOnly: true,
  // eslint
  gutters: ["CodeMirror-lint-markers"],
  lint: true
}

CodeMirror.defineMode("spell", function (codeMirrorConfig, modeConfig) {
  // Return the token that starts at numeric offset
  function getToken(tokens, offset) {
    return tokens.find((token) => token.offset >= offset)
  }

  function advanceStreamPastToken(stream, token) {
    const { length } = token.raw
    for (let i = 0; i < length; i++) stream.next()
  }

  function getTokenType(token) {
    if (token instanceof Token.Word) {
      //      if (blacklist[token.raw]) return "keyword"
      return "unknown"
    }
    if (token instanceof Token.Symbol) return "operator"
    if (token instanceof Token.Number) return "number"
    if (token instanceof Token.Comment) {
      if (token.commentSymbol === "##") return "comment header"
      return "comment"
    }
    if (token instanceof Token.Text) return "string"
    // if (token instanceof Token.JSXElement) return null
    // if (token instanceof Token.JSXEndTag) return null
    // if (token instanceof Token.JSXAttribute) return null
    // if (token instanceof Token.JSXExpression) return null
    // if (token instanceof Token.Block) return null
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
          state.tokens = spellParser.tokenize(stream.string)
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
      return undefined
    }
  }
})
CodeMirror.defineMIME("text/spell", "spell")
CodeMirror.defineMIME("text/x-spell", "spell")
