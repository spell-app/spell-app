import { SRV } from "spell/server"
import { CLI } from "spell-app/cli"

/**
 * `spell app preview build | serve` (Owen's names, epic `debut` Q16):  the editor's static build, the public preview.
 * - `build`:  writes it, `app/dist-static/` (`CLI.PreviewSite.build()`), and lists what it holds.
 * - `serve [--port <port>] [--headless]`:  shows the build as a host would, on loopback,
 *   and opens it in a browser, until `Ctrl-C`.
 *   - No page server:  the page reads only the build's files, so it shows what a host would.
 * - Builds only:  no deploy yet (decision Q6).
 * - Returns the exit code.
 */
export async function previewCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.PreviewOptions
): Promise<number> {
  const [verb] = args
  const site = new CLI.PreviewSite()
  if (verb === "build") {
    const status = new CLI.StatusReporter(session.isInteractive)
    const row = status.start("Building the static editor")
    let contents: CLI.PreviewContents
    try {
      contents = await site.build(session)
    } catch (error) {
      status.done(row, "failed", error instanceof Error ? error.message : String(error))
      status.finish()
      return CLI.EXIT.ERRORS
    }
    status.done(row, "ok", site.folder)
    status.finish()
    for (const [group, projectIds] of Object.entries(contents.groups)) {
      session.out(`${group}:  ${projectIds.length ? projectIds.join(", ") : "none yet"}`)
    }
    if (contents.imported.length) session.out(`and what they import:  ${contents.imported.join(", ")}`)
    session.err("`spell app preview serve` shows it as a host would")
    return CLI.EXIT.OK
  }
  if (verb !== "serve") throw new CLI.CliError(`\`spell app preview\` takes build or serve, not '${verb}'`)

  if (options.port !== undefined && (!Number.isInteger(options.port) || options.port < 1 || options.port > 65_534)) {
    throw new CLI.CliError(`--port must be a port number`)
  }
  const { url, server } = await site.serve({ port: options.port })
  session.out(url)
  session.err(`The static editor (${site.folder}) is at ${url} -- Ctrl-C to stop`)
  if (!options.headless) SRV.openBrowser(url)
  await SRV.untilInterrupted(server.server)
  return CLI.EXIT.OK
}
