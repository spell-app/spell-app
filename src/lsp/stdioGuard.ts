/**
 * SIDE EFFECT:  sends ALL `console` output to stderr, for a process whose stdout carries a protocol --
 * the language server's JSON-RPC, under `--stdio`.
 * - MUST be imported before anything that might log, e.g. `environment.ts` logs on import -- see `server.ts`.
 * - Once connected, `vscode-languageserver` re-points `console.*` at the editor's log itself.
 */
import { Console } from "console"

globalThis.console = new Console({ stdout: process.stderr, stderr: process.stderr }) as unknown as typeof console
