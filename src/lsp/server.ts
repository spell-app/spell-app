/**
 * Language server process for spell:  `yarn start:lsp`, i.e. `tsx src/lsp/server.ts --stdio` -- see `SpellLanguageServer`.
 * - `stdioGuard` comes FIRST, and everything else only after it, via dynamic `import()`.
 *   Stdout carries the protocol, and modules log as they load, e.g. `environment.ts`.
 */
import "./stdioGuard"

const { createConnection, ProposedFeatures } = await import("vscode-languageserver/node")
const { LSP } = await import("~/lsp")

const connection = createConnection(ProposedFeatures.all)
// `createConnection()` sends `console.*` to the editor's log.  Drop `info` / `debug`, which are parser chatter,
// e.g. `TaskList` dumping every parse's results.
console.info = console.debug = () => {}
new LSP.SpellLanguageServer(connection).listen()
