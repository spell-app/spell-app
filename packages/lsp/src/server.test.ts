import { describe, test, expect, afterAll } from "vite-plus/test"
import { spawn } from "child_process"
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { resolve } from "path"
import { fileURLToPath, pathToFileURL } from "url"
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
  type DocumentSymbol,
  type Hover,
  type PublishDiagnosticsParams
} from "vscode-languageserver/node"

import type { LSP } from "$/lsp"
import { tsxBinary } from "$/spell/test"

/**
 * The language server as an editor runs it:  a separate `yarn start:lsp` process, speaking JSON-RPC over stdio.
 * - Catches anything printing to stdout, which would corrupt the protocol -- see `stdioGuard.ts`.
 */
describe("spell language server over stdio", () => {
  // this package's folder:  `tsx` reads the `tsconfig.json` (aliases) where it runs
  const packageDir = resolve(import.meta.dirname, "..")
  const child = spawn(tsxBinary(), [resolve(import.meta.dirname, "server.ts"), "--stdio"], {
    cwd: packageDir,
    stdio: ["pipe", "pipe", "pipe"]
  })
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
      signatureHelpProvider: { triggerCharacters: [" "] },
      codeActionProvider: { codeActionKinds: ["quickfix"] },
      semanticTokensProvider: { full: { delta: true }, range: true },
      codeLensProvider: { resolveProvider: true }
    })
    await connection.sendNotification("initialized", {})

    const projectDir = resolve(mkdtempSync(resolve(tmpdir(), "spell-stdio-")), "Tiny")
    mkdirSync(projectDir)
    writeFileSync(
      resolve(projectDir, "project.json"),
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

  // NOTE: runs after the test above, on the server it initialized.
  test("`spell/compileProject` compiles, and sends the javascript as `spell/projectCompiled`", async () => {
    const projectDir = resolve(mkdtempSync(resolve(tmpdir(), "spell-stdio-")), "Runs")
    mkdirSync(projectDir)
    writeFileSync(
      resolve(projectDir, "project.json"),
      JSON.stringify({ imports: [{ path: "/main.spell", active: true }] })
    )
    const text = "set foo to 1"
    writeFileSync(resolve(projectDir, "main.spell"), text)
    const uri = pathToFileURL(resolve(projectDir, "main.spell")).href
    await connection.sendNotification("textDocument/didOpen", {
      textDocument: { uri, languageId: "spell", version: 1, text }
    })

    const compiled = new Promise<{ project: string; compiled: string }>((resolveWait) =>
      connection.onNotification("spell/projectCompiled", resolveWait)
    )
    expect(await connection.sendRequest("spell/compileProject", { uri })).toEqual({ ok: true })
    const { project, compiledUri } = (await connection.sendRequest("spell/project", { uri })) as {
      project: string
      compiledUri: string
    }
    const sent = await compiled
    expect(sent).toMatchObject({ project, compiled: expect.stringContaining("foo") })
    // ...and wrote it where `spell/project` says, for editors to watch
    expect(compiledUri).toMatch(/\/Runs\/Runs\.compiled\.js$/)
    expect(readFileSync(fileURLToPath(compiledUri), "utf8")).toBe(sent.compiled)
  }, 30_000)

  test("`spell/scopes` answers the project's live scope tree", async () => {
    const projectDir = resolve(mkdtempSync(resolve(tmpdir(), "spell-stdio-")), "Scoped")
    mkdirSync(projectDir)
    writeFileSync(
      resolve(projectDir, "project.json"),
      JSON.stringify({ imports: [{ path: "/main.spell", active: true }] })
    )
    const text = "a card is a thing\ncards have a suit as one of hearts or spades"
    writeFileSync(resolve(projectDir, "main.spell"), text)
    const uri = pathToFileURL(resolve(projectDir, "main.spell")).href
    await connection.sendNotification("textDocument/didOpen", {
      textDocument: { uri, languageId: "spell", version: 1, text }
    })
    const tree = (await connection.sendRequest("spell/scopes", { uri })) as LSP.ScopeNode
    const project = tree.children.find((child) => child.name === "Scoped")!
    const card = project.children[0]!.children.find((child) => child.name === "Card")!
    expect(card.members.map((member) => member.name)).toContain("suit")
  }, 30_000)

  test("`spell/compileProject` of a project that doesn't parse:  not ok, and sends nothing", async () => {
    const projectDir = resolve(mkdtempSync(resolve(tmpdir(), "spell-stdio-")), "Broken")
    mkdirSync(projectDir)
    writeFileSync(
      resolve(projectDir, "project.json"),
      JSON.stringify({ imports: [{ path: "/main.spell", active: true }] })
    )
    const text = "set foo to 1\nfoo bar baz"
    writeFileSync(resolve(projectDir, "main.spell"), text)
    const uri = pathToFileURL(resolve(projectDir, "main.spell")).href
    await connection.sendNotification("textDocument/didOpen", {
      textDocument: { uri, languageId: "spell", version: 1, text }
    })
    const sent: unknown[] = []
    connection.onNotification("spell/projectCompiled", (params) => {
      sent.push(params)
    })
    // Sent before the answer, if at all -- messages arrive in order.
    expect(await connection.sendRequest("spell/compileProject", { uri })).toEqual({ ok: false })
    expect(sent).toEqual([])
  }, 30_000)
})
