import chalk from "chalk"

////////////////
// ## Debug states
////////////////

// Ordered least to most verbose -- `indexOf()` on this array is how `Logger.output()` compares levels.
const DEBUG_LEVELS = ["OFF", "ERROR", "WARN", "INFO", "DEBUG"] as const
/** One of `Logger`'s level names, e.g. `"WARN"`. */
export type DebugLevel = (typeof DEBUG_LEVELS)[number]

/**
 * Create a `logger` instance with its own level/prefix/color, so different subsystems can be tuned
 * independently at runtime.
 *
 * ```
 * class Foo {
 *   logger = new Logger({ prefix: "Foo", level: Logger.INFO })
 *   ...
 *   this.logger.debug("will be skipped")
 *   this.logger.info("will output")
 *   this.logger.warn("will output")
 *   ...
 *   this.logger.level = Logger.DEBUG
 *   this.logger.debug("will now be shown")
 * }
 * ```
 */
export class Logger {
  /** Current log level -- messages more verbose than this are skipped by `output()`. */
  level: DebugLevel = Logger.WARN
  /** Prefix to prepend to all messages, e.g. subsystem name. */
  prefix: string | undefined = undefined
  /** Color to apply to `prefix` in our output, as any CSS color `chalk.hex()` accepts. */
  color: string = "#999"

  /** All of `level`/`prefix`/`color` are optional and fall back to class field defaults above. */
  constructor({ level, prefix, color }: { level?: DebugLevel; prefix?: string; color?: string } = {}) {
    if (level !== undefined) this.level = level
    if (prefix !== undefined) this.prefix = prefix
    if (color !== undefined) this.color = color
  }

  /** Log at `DEBUG` level via `console.log`. */
  public debug = (...args: any[]) => this.output(Logger.DEBUG, "log", args)
  /** Log at `INFO` level via `console.info`. */
  public info = (...args: any[]) => this.output(Logger.INFO, "info", args)
  /** Log at `WARN` level via `console.warn`. */
  public warn = (...args: any[]) => this.output(Logger.WARN, "warn", args)
  /** Log at `ERROR` level via `console.error`. */
  public error = (...args: any[]) => this.output(Logger.ERROR, "error", args)
  /** Open a `console.group()`, gated at `INFO` level. */
  public group = (...args: any[]) => this.output(Logger.INFO, "group", args)
  /** Close a `console.group()` -- NOTE: not level-gated, so always call it if you called `group()`. */
  public groupEnd = () => console.groupEnd()

  /** Shared implementation for `debug`/`info`/`warn`/`error`/`group` -- drops message if too verbose for `level`. */
  private output(outputLevel: DebugLevel, consoleMethod: "log" | "info" | "warn" | "error" | "group", args: any[]) {
    const loggerLevel = DEBUG_LEVELS.indexOf(this.level)
    const messageLevel = DEBUG_LEVELS.indexOf(outputLevel)
    if (messageLevel > loggerLevel) return

    if (this.prefix) args.unshift(chalk.hex(this.color)(this.prefix))
    console[consoleMethod](...args)
  }

  /** No output at all. */
  static readonly OFF = "OFF" as unknown as DebugLevel
  /** Errors only. */
  static readonly ERROR = "ERROR" as unknown as DebugLevel
  /** Errors and warnings. */
  static readonly WARN = "WARN" as unknown as DebugLevel
  /** Errors, warnings, and info. */
  static readonly INFO = "INFO" as unknown as DebugLevel
  /** Everything, including debug messages. */
  static readonly DEBUG = "DEBUG" as unknown as DebugLevel
}
