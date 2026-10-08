/**
 * Child process of `spell static`:  renders pages through `ui`'s static server render, on an SSR-only Vite server.
 * - Started by `staticCommand.ts` as `node --import tsx renderStatic.ts`, with an IPC channel.
 * - Why a child, and Vite:  `ui`'s components are Solid JSX, which must compile for the server (`generate: "ssr"`)
 *   against `@solidjs/web`'s server build;  `tsx` can't, so the render runs in Vite's SSR module loader
 *   (`StaticRenderer`, the same setup as `yarn test:visual --static`).  A separate process keeps Vite, the server
 *   `UI` runtime it installs on `globalThis` and its console out of the CLI.
 * - Talks in `CLI.StaticMessage`s:  says `ready` once Vite is up, takes ONE `job`, answers a `page` per page (in
 *   order), then a `stylesheet` per shared sheet, then `done`, and exits.
 * - NEVER imports `$/cli`'s values:  this process needs only `ui`.
 */
import { StaticRenderer } from "$/ui/tools/StaticRenderer"
import type { StaticDocumentModule } from "$/ui/tools/tools.types"
import type { CLI } from "$/cli"

const server = await StaticRenderer.start()

process.once("message", (job: CLI.StaticMessage) => void run(job))
await send({ kind: "ready" })

/** Render `job`'s pages, answer each, then close Vite and let the process end. */
async function run(job: CLI.StaticMessage) {
  try {
    if (job.kind !== "job") throw new Error(`renderStatic:  expected a job, got ${job.kind}`)
    const module = (await server.ssrLoadModule(StaticRenderer.DOCUMENT)) as StaticDocumentModule
    const tags: string[][] = []
    for (const [index, page] of job.pages.entries()) {
      try {
        const result = await module.StaticDocument.render(page.html, page.options)
        tags[index] = result.tags
        await send({ kind: "page", index, result })
      } catch (error) {
        await send({ kind: "page", index, error: describe(error) })
      }
    }
    for (const sheet of job.sheets) {
      const used = sheet.pages.flatMap((index) => tags[index] ?? [])
      const result = module.StaticDocument.stylesheet(used, { minify: job.minify, coverage: sheet.coverage })
      await send({ kind: "stylesheet", path: sheet.path, result })
    }
    await send({ kind: "done" })
  } catch (error) {
    await send({ kind: "failed", error: describe(error) })
  } finally {
    await server.close()
    process.disconnect()
  }
}

/** Send `message` to `spell static`;  resolves once it's gone. */
function send(message: CLI.StaticMessage): Promise<void> {
  return new Promise((done) => process.send!(message, () => done()))
}

/** `error`'s stack, its frames mapped back to the source by Vite. */
function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  server.ssrFixStacktrace(error)
  return error.stack ?? error.message
}
