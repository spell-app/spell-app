/**
 * Run a server until `Ctrl-C`.
 */
import type { Server } from "node:http"

/**
 * Resolve once `SIGINT` (`Ctrl-C`) or `SIGTERM` arrives, after `onStop()` and closing `server`.
 * - drops open connections (SSE streams, keep-alives), or `close()` would wait for them forever
 */
export function untilInterrupted(server: Server, onStop?: () => unknown): Promise<void> {
  return new Promise((done) => {
    process.once("SIGINT", stop)
    process.once("SIGTERM", stop)

    /** stop once:  hook, connections, server */
    async function stop() {
      process.off("SIGINT", stop)
      process.off("SIGTERM", stop)
      await onStop?.()
      server.closeAllConnections()
      server.close(() => done())
    }
  })
}
