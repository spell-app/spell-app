import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

/**
 * Airplane mode (epic `airplane`):  Owen is working with no Claude, on a plane, and every mark, note and request he
 * leaves on a page waits for `/airplane land`.
 * - ONE switch per machine:  `~/.spell/airplane.json`, `{ on: true, since }`;  no file:  off
 *   - `spell dev airplane on | off` (`packages/docs/tools/airplane.ts`) flips it;  `/airplane` and `/airplane land`
 *     call those
 * - The page server tells every page as it serves it (`window.SPELL_SERVER.airplane`):  the review controls then
 *   say "queued for when you land", never "start `/epic review`"
 * - Read on every call:  the switch changes while servers run, and tests point it elsewhere
 */
export class AirplaneMode {
  /** The switch's file:  `$SPELL_AIRPLANE_FILE`, else `~/.spell/airplane.json`. */
  static get file(): string {
    return process.env.SPELL_AIRPLANE_FILE || join(homedir(), ".spell", "airplane.json")
  }

  /** The switch as it stands:  `undefined` when off (no file, or one that doesn't parse). */
  static read(): AirplaneState | undefined {
    if (!existsSync(AirplaneMode.file)) return undefined
    try {
      const state = JSON.parse(readFileSync(AirplaneMode.file, "utf8")) as AirplaneState
      return state.on ? state : undefined
    } catch {
      return undefined
    }
  }

  /** Whether airplane mode is on. */
  static get isOn(): boolean {
    return !!AirplaneMode.read()
  }

  /**
   * Turn airplane mode on (from now) or off;  returns the state before.
   * - written atomically:  a page server reading it mid-write sees the old file or the new one
   */
  static turn(on: boolean, now = new Date()): AirplaneState | undefined {
    const before = AirplaneMode.read()
    const file = AirplaneMode.file
    if (!on) {
      rmSync(file, { force: true })
      return before
    }
    mkdirSync(dirname(file), { recursive: true })
    const state: AirplaneState = { on: true, since: before?.since ?? now.toISOString() }
    writeFileSync(`${file}.tmp`, `${JSON.stringify(state, null, 2)}\n`)
    renameSync(`${file}.tmp`, file)
    return before
  }
}

/** Airplane mode, on:  since when (ISO time). */
export type AirplaneState = { on: true; since: string }
