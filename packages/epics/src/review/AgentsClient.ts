import { AGENTS_API, AGENTS_FILE, agentsOf, type RunningAgent, type ServerLinkOptions } from "./review.types"
import { ServerLink } from "./ServerLink"

/****************
 * ### `AgentsClient`
 * A plan doc's RUNNING AGENTS, as the page sees them (epic `skillz` P3):  the epic's list, read from and written to
 * the page server's agents routes (`packages/docs/tools/agentRoutes.ts`), one client per page (`forPage()`).
 * `<epic-page>` draws its "Agents running" panel from it (`<epic-agents>`).
 * - listed ONLY when the page is a plan doc served with a token and the list answers (`listed`):  never from
 *   `file://`, nor from a server without the route
 * - every reply is the whole list:  a redirect's answer replaces what's shown
 * - a redirect:  Owen's note to one agent (`POST redirect { page, name, note }`), written through its `ServerLink`
 *   (the token, and its one refresh when the page server restarted)
 * - re-reads the list every `REVIEW_POLL_MS` while the page is visible, when it becomes visible, and when the page
 *   server says the list's file changed (`agents.json`, beside the plan doc):  `watch()`, as the review inbox does
 * - Node-safe at import, and without `watch()`:  no `window` / `document` touched;  `fetch` comes in through
 *   `ServerLinkOptions`, so tests stub it
 * - Position in the import graph:  its peers (types, `ServerLink`) only.  NEVER imports Solid, Spell UI or the
 *   `$/epics` barrel:  the panel bridges its changes (`subscribe()`) into its own signal.
 ****************/
export class AgentsClient {
  /** The running agents as last read or written, oldest first. */
  agents: RunningAgent[] = []

  /** Served with a token, and the list answered:  the panel shows while an agent runs. */
  listed = false

  /** Bumped on every change:  readers compare it, the panel tracks it. */
  version = 0

  /** The page server, as the list is written to it:  the write token, its refresh, the watch. */
  private readonly link: ServerLink

  /** Called on every change. */
  private readonly listeners = new Set<() => void>()

  /** Redirects in flight:  a poll's answer can't overwrite what they're about to. */
  private writing = 0

  /** `start()`'s promise:  one start per client. */
  private starting: Promise<boolean> | undefined

  constructor(private readonly options: ServerLinkOptions) {
    this.link = new ServerLink(options)
  }

  ////////////////
  // ## The page's client
  ////////////////

  /** The page's client, once made. */
  private static current: AgentsClient | undefined

  /**
   * The page's client, made and started on the first call (browser only), and `watch()`ing the page once listed.
   * - SIDE EFFECT:  the first call reads the list and starts polling
   */
  static forPage(): AgentsClient {
    if (AgentsClient.current) return AgentsClient.current
    const client = new AgentsClient(ServerLink.pageOptions())
    AgentsClient.current = client
    void client
      .start()
      .then((listed) => listed && client.watch(window))
      .catch((error: unknown) => console.error("AgentsClient:  couldn't start", error))
    return client
  }

  /** Make `client` the page's from now on (`undefined`:  the next `forPage()` makes one):  tests, on a stubbed fetch. */
  static adopt(client: AgentsClient | undefined) {
    AgentsClient.current = client
  }

  ////////////////
  // ## Start and refresh
  ////////////////

  /**
   * Read the list;  if it answers, the page is listed.  True when listed.  Once per client.
   * - only a plan doc served with a token (`ServerLink.servesPlanDoc`):  else it never asks
   * - NEVER throws
   */
  start(): Promise<boolean> {
    this.starting ??= this.begin()
    return this.starting
  }

  /** `start()`'s work. */
  private async begin(): Promise<boolean> {
    if (!this.link.servesPlanDoc || !(await this.load())) return false
    this.listed = true
    this.changed()
    return true
  }

  /** Keep the list fresh on `window`'s page (`ServerLink.watch()`, on `agents.json`).  Returns the undo. */
  watch(window: Window): () => void {
    const listFile = this.link.file.replace(/[^/]*$/, AGENTS_FILE)
    return this.link.watch(window, listFile, () => void this.refresh())
  }

  /**
   * Read the list again (a poll, the page server's word) unless a redirect is in flight;  true when it answered.
   * - NEVER throws
   */
  async refresh(): Promise<boolean> {
    if (this.writing) return false
    const read = await this.load()
    if (read) this.changed()
    return read
  }

  ////////////////
  // ## Listening
  ////////////////

  /** Call `listener` on every change (a read, a redirect);  returns the undo. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  ////////////////
  // ## Redirect
  ////////////////

  /**
   * Send Owen's `note` to running agent `name` (`POST redirect`):  it waits in the list, untold, until a session
   * passes it on.  The reply, the list after, is shown.
   * - throws a `ServerWriteError` saying why, for people:  an empty or long note, an agent gone, no server
   */
  async redirect(name: string, note: string): Promise<void> {
    this.writing++
    try {
      this.agents = agentsOf(await this.link.post(`${AGENTS_API}/redirect`, { page: this.options.page, name, note }))
    } finally {
      this.writing--
    }
    this.changed()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Everyone told something changed. */
  private changed() {
    this.version++
    for (const listener of this.listeners) listener()
  }

  /** Read the list;  true when it answered (a redirect in flight wins:  its answer is newer). */
  private async load(): Promise<boolean> {
    try {
      const response = await this.options.fetch(`${AGENTS_API}?page=${encodeURIComponent(this.options.page)}`, {
        cache: "no-store"
      })
      if (!response.ok) return false
      const read = agentsOf(await response.json())
      if (!this.writing) this.agents = read
      return true
    } catch {
      return false
    }
  }
}
