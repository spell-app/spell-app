import chalk from "chalk"

//----------------------------
//
//  Debug states
//
//----------------------------
const DEBUG_LEVELS = ["OFF", "ERROR", "WARN", "INFO", "DEBUG"] as const
export type DebugLevel = (typeof DEBUG_LEVELS)[number]

/**
 * Create a `logger` instance, e.g.
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
 *   this.logger.debug("will now be shwon")
 * }
 * ```
 */
export class Logger {
  /** Current log level. */
  level: DebugLevel = Logger.WARN
  /** Prefix to prepend to all messages. */
  prefix: string | undefined = undefined
  /** Color to apply to prefix in our output. */
  color: string = "#999"

  constructor({ level, prefix, color }: { level?: DebugLevel; prefix?: string; color?: string } = {}) {
    if (level !== undefined) this.level = level
    if (prefix !== undefined) this.prefix = prefix
    if (color !== undefined) this.color = color
  }

  public debug = (...args: any[]) => this.output(Logger.DEBUG, "log", args)
  public info = (...args: any[]) => this.output(Logger.INFO, "info", args)
  public warn = (...args: any[]) => this.output(Logger.WARN, "warn", args)
  public error = (...args: any[]) => this.output(Logger.ERROR, "error", args)
  public group = (...args: any[]) => this.output(Logger.INFO, "group", args)
  public groupEnd = () => console.groupEnd()

  private output(outputLevel: DebugLevel, consoleMethod: "log" | "info" | "warn" | "error" | "group", args: any[]) {
    const loggerLevel = DEBUG_LEVELS.indexOf(this.level)
    const messageLevel = DEBUG_LEVELS.indexOf(outputLevel)
    if (messageLevel > loggerLevel) return

    if (this.prefix) args.unshift(chalk.hex(this.color)(this.prefix))
    console[consoleMethod](...args)
  }

  static readonly OFF = "OFF" as unknown as DebugLevel
  static readonly ERROR = "ERROR" as unknown as DebugLevel
  static readonly WARN = "WARN" as unknown as DebugLevel
  static readonly INFO = "INFO" as unknown as DebugLevel
  static readonly DEBUG = "DEBUG" as unknown as DebugLevel
}
