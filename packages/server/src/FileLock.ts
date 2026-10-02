import { closeSync, openSync, rmSync, statSync } from "node:fs"

import { SRV } from "$/server"

/**
 * A lock on one file, held as `<file>.lock`, so tools that write the same file take turns:  the page server's
 * page edits, `yarn plan-doc`, `yarn goals`, the app's saves.
 * - created with `open(wx)`:  atomic, so exactly one holder
 * - waits up to `wait` ms (default 20s), then throws a `FileLockError`
 * - a lock older than `stale` ms (default 60s) is a crashed holder's, and is taken over
 * - writers that don't lock (VS Code, an agent's edit tool) aren't stopped:  the page server's `If-Match` check
 *   catches those
 * - From goals' `withLock()` (also copied into `plan-doc.js`).
 */
export class FileLock {
  /** file being guarded */
  readonly file: string

  /** the lock's own file, `<file>.lock` */
  readonly lockFile: string

  /** longest wait for the lock, ms */
  readonly wait: number

  /** age at which a lock is a dead holder's, ms */
  readonly stale: number

  constructor(file: string, { wait = 20_000, stale = 60_000 }: FileLockProps = {}) {
    this.file = file
    this.lockFile = `${file}.lock`
    this.wait = wait
    this.stale = stale
  }

  /** Run `fn` holding the lock on `file`, blocking while waiting. */
  static run<T>(file: string, fn: () => T, props?: FileLockProps): T {
    return new FileLock(file, props).run(fn)
  }

  /** Run async `fn` holding the lock on `file`, without blocking while waiting. */
  static runAsync<T>(file: string, fn: () => Promise<T>, props?: FileLockProps): Promise<T> {
    return new FileLock(file, props).runAsync(fn)
  }

  /** Run `fn` holding the lock;  BLOCKS the thread while waiting (`Atomics.wait`), for sync scripts. */
  run<T>(fn: () => T): T {
    const deadline = Date.now() + this.wait
    while (!this.tryAcquire()) {
      if (Date.now() > deadline) throw this.timeout()
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
    }
    try {
      return fn()
    } finally {
      this.release()
    }
  }

  /** Run async `fn` holding the lock;  waits with timers, so a server keeps serving meanwhile. */
  async runAsync<T>(fn: () => Promise<T>): Promise<T> {
    const deadline = Date.now() + this.wait
    while (!this.tryAcquire()) {
      if (Date.now() > deadline) throw this.timeout()
      await new Promise((done) => setTimeout(done, 50))
    }
    try {
      return await fn()
    } finally {
      this.release()
    }
  }

  /**
   * Take the lock if it's free (or stale);  returns whether we hold it now.
   * - SIDE EFFECT:  removes a stale lock
   */
  tryAcquire(): boolean {
    try {
      closeSync(openSync(this.lockFile, "wx"))
      return true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
      const age = Date.now() - (statSync(this.lockFile, { throwIfNoEntry: false })?.mtimeMs ?? Date.now())
      if (age > this.stale) rmSync(this.lockFile, { force: true })
      return false
    }
  }

  /** Let go of the lock. */
  release(): void {
    rmSync(this.lockFile, { force: true })
  }

  /** the error for a lock held too long */
  private timeout(): SRV.FileLockError {
    return new SRV.FileLockError(`${this.lockFile} held for ${this.wait / 1000}s:  stuck?`)
  }
}

/**
 * `new FileLock()` props.
 * - `wait`:  longest wait, ms;  `stale`:  age at which a lock is taken over, ms
 */
export type FileLockProps = { wait?: number; stale?: number }
