import { OPTIONAL, KNOWN_FORMATS } from "./constants"
import { proto } from "./decorators"
import { $fetch } from "./$fetch"
import { Saveable } from "./Saveable"

/** Load a single file from `url`, process according to `format` before returning. */
export class LoadableFile extends Saveable {
  /** URL to load from. */
  @proto url = undefined
  /**  HTTP method to use.  If undefined, we'll use `GET` unless you specify `callParams.body`, in which case we'll use `POST` */
  @proto requestMethod = undefined
  /** Object of default URL headers.  Mixed with headers specified during `load()`. */
  @proto defaultHeaders = undefined
  /** Object of default URL params.  Mixed with params specified during `load()`. */
  @proto defaultParams = undefined
  /** If defined, a 404 load or aborted promise will return these contents as a successful result. */
  @proto defaultContents = undefined
  /** Request type.  Use one of the constants above or a string. */
  @proto inputFormat = undefined
  /** Result type for auto-processing of results.  Defaults implicitly to TEXT */
  @proto format = undefined

  /** Initialize with just a string to set `url` only. */
  constructor(props) {
    super(typeof props === "string" ? { url: props } : props)
    this.assertType("url", "string")
    this.assertType("defaultParams", Object, OPTIONAL)
    this.assertType("defaultHeaders", Object, OPTIONAL)
    this.assertType("requestType", "string", OPTIONAL)
    this.assertType("format", "string", OPTIONAL)
  }

  /** Load file contents.  `callParams` consists of:
   * - headers
   * - params
   * - body
   * Note this promise returns `fetch()` results AFTER processing according to `format`
   */
  getLoader(callParams = {}) {
    const {
      url = this.url,
      headers,
      params,
      body,
      method = this.requestMethod,
      inputFormat = this.inputFormat,
      format = this.format,
      defaultContents = this.defaultContents
    } = callParams

    const $params = {
      params: this.defaultParams || params ? { ...this.defaultParams, ...params } : undefined,
      body,
      method,
      headers: this.defaultHeaders || headers ? { ...this.defaultHeaders, ...headers } : undefined,
      format,
      inputFormat,
      defaultContents
    }
    return $fetch(url, $params)
  }
}

/**
 * Syntactic sugar for various well-known file types.
 */

/** Loadable text file. */
export class TextFile extends LoadableFile {}

/** Loadable JSON file. */
export class JSONFile extends LoadableFile {
  @proto inputFormat = JSON
  @proto format = JSON
}

/** Loadable image file:  GIF, PNG, JPG or SVG. */
export class ImageFile extends LoadableFile {
  /** Default format according to the file extension, defaulting to `binary`. */
  set format(value) {
    this._format = value
  }
  get format() {
    if (this._format) return this._format
    switch (this.extension) {
      case "jpg":
      case "jpeg":
        return KNOWN_FORMATS.jpg
      case "png":
        return KNOWN_FORMATS.png
      case "gif":
        return KNOWN_FORMATS.gif
      case "svg":
        return KNOWN_FORMATS.svg
      default:
        return KNOWN_FORMATS.binary
    }
  }

  /** Return url extension, if any. */
  get extension() {
    const url = this.url
      .toLowerCase()
      .split("?")[0]
      .split("#")[0]
    const index = url.lastIndexOf(".")
    if (index === -1) return undefined
    return url.slice(index + 1)
  }
}
