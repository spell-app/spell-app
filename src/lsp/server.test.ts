import { describe, test, expect, afterAll } from "vitest"
import { spawn } from "child_process"
import { mkdtempSync, mkdirSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { pathToFileURL } from "url"
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
  type DocumentSymbol,
  type Hover,
  type PublishDiagnosticsParams
} from "vscode-languageserver/node"

import environment from "~/environment"

/**
 * The language server as an editor runs it:  a separate `yarn start:lsp` process, speaking JSON-RPC over stdio.
 * - Catches anything printing to stdout, which would corrupt the protocol -- see `stdioGuard.ts`.
 */
describe("spell language server over stdio", () => {
  const repoRoot = resolve(environment.srcDir, "..")
  const child = spawn(
    resolve(repoRoot, "node_modules/.bin/tsx"),
    [resolve(environment.srcDir, "lsp/server.ts"), "--stdio"],
    {
      cwd: repoRoot,
      stdio: ["pipe", "pipe", "pipe"]
    }
  )
  const connection = createMessageConnection(
    new StreamMessageReader(child.stdout),
    new StreamMessageWriter(child.stdin)
  )
  const published = new Map<string, PublishDiagnosticsParams>()
  const waiting = new Map<string, () => void>()
  connection.onNotification("textDocument/publishDiagnostics", (params: PublishDiagnosticsParams) => {
    published.set(params.uri, params)
    waiting.get(params.uri)?.()
  })
  connection.listen()

  afterAll(async () => {
    await connection.sendRequest("shutdown").catch(() => undefined)
    await connection.sendNotification("exit")
    connection.dispose()
    child.kill()
  })

  test("initialize, open a file, get its diagnostics, outline and a hover", async () => {
    const init = (await connection.sendRequest("initialize", {
      processId: process.pid,
      rootUri: null,
      capabilities: {}
    })) as {
      capabilities: Record<string, unknown>
    }
    expect(init.capabilities).toMatchObject({
      documentSymbolProvider: true,
      foldingRangeProvider: true,
      hoverProvider: true,
      documentFormattingProvider: true,
      semanticTokensProvider: { full: true, range: true }
    })
    await connection.sendNotification("initialized", {})

    const projectDir = resolve(mkdtempSync(resolve(tmpdir(), "spell-stdio-")), "Tiny")
    mkdirSync(projectDir)
    writeFileSync(
      resolve(projectDir, ".imports.json"),
      JSON.stringify({ imports: [{ path: "/main.spell", active: true }] })
    )
    const text = "set foo to 1\nfoo bar baz"
    writeFileSync(resolve(projectDir, "main.spell"), text)
    const uri = pathToFileURL(resolve(projectDir, "main.spell")).href

    const diagnostics = new Promise<void>((resolveWait) => waiting.set(uri, resolveWait))
    await connection.sendNotification("textDocument/didOpen", {
      textDocument: { uri, languageId: "spell", version: 1, text }
    })
    await diagnostics
    expect(published.get(uri)?.diagnostics.map(({ range, message }) => ({ line: range.start.line, message }))).toEqual([
      { line: 1, message: `Don't understand "foo bar baz"` }
    ])

    const symbols = (await connection.sendRequest("textDocument/documentSymbol", {
      textDocument: { uri }
    })) as DocumentSymbol[]
    expect(symbols.map(({ name }) => name)).toEqual(["foo"])

    const hover = (await connection.sendRequest("textDocument/hover", {
      textDocument: { uri },
      position: { line: 0, character: 5 }
    })) as Hover
    expect((hover.contents as { value: string }).value).toContain("variable **foo**")
  }, 30_000)
})
