import { URI } from "monaco-editor/base/common/uri"

import { SP } from "#spell"
import type { LSP } from "#lsp"
import type { monaco } from "./monaco"

/**
 * How the app's Monaco editor addresses files:  `spell:/<file.path>`, e.g. `spell:/@system:examples:Solitaire/Card.spell`.
 * - Every file the editor shows gets a model at this URI -- see `SpellModels`.
 * - Only files we already know:  `fileFor()` looks in `SpellFile.registry`, it never makes one.
 */
export class AppAddresses implements LSP.FileAddresses {
  /** URI scheme for the app's files. */
  static SCHEME = "spell"

  /** URI for the file at `path`, of any kind. */
  static uriOf(path: string): string {
    return URI.from({ scheme: AppAddresses.SCHEME, path: `/${path}` }).toString()
  }

  /** `file.path` a URI is for, or `undefined` if it isn't one of ours. */
  static pathOf(uri: string | monaco.Uri): string | undefined {
    const parsed = typeof uri === "string" ? URI.parse(uri) : uri
    return parsed.scheme === AppAddresses.SCHEME ? parsed.path.slice(1) : undefined
  }

  fileFor(uri: string): SP.SpellFile | undefined {
    const path = AppAddresses.pathOf(uri)
    return path === undefined ? undefined : SP.SpellFile.registry.get(path)
  }

  uriFor(file: SP.SpellFile | SP.SpellJSFile): string {
    return AppAddresses.uriOf(file.path)
  }
}
