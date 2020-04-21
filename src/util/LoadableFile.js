import { KNOWN_FORMATS } from "./constants"
import { proto } from "./decorators"
import { $fetch } from "./$fetch"
import { Saveable } from "./Saveable"
import { SaveError } from "./ResponseErrors"

/** Load a single file from `url`, process according to `format` before returning. */
export class LoadableFile extends Saveable {
  /** URL to load from. Make this a getter in your subclass to base it on other properties. */
  @proto url = undefined
  /** If defined, a 404 load or aborted promise will return these contents as a successful result. */
  @proto defaultContents = undefined
  /** Result type for auto-processing of results.  Defaults implicitly to TEXT */
  @proto format = undefined
  /**
   * Default load params to pass to `$fetch()`.
   * Default `getLoader()` method mixes these with params passed directly to `load()`.
   */
  @proto loadParams = {
    /**  HTTP method to use.  If undefined, we'll use `GET` unless you specify `callParams.body`, in which case we'll use `POST` */
    method: undefined,
    /** Object of default URL headers.  Mixed with headers specified during `load()`. */
    headers: undefined,
    /** Object of default URL params.  Mixed with params specified during `load()`. */
    params: undefined,
    /** Request type.  Use one of the constants above or a string. */
    requestFormat: undefined
  }

  /**
   * Default save params to pass to `$fetch()`.
   * Default `getSaver()` method mixes these with params passed directly to `load()`.
   */
  @proto saveParams = {
    /**  HTTP method to use.  If undefined, we'll use `GET` unless you specify `callParams.body`, in which case we'll use `POST` */
    method: undefined,
    /** Object of default URL headers.  Mixed with headers specified during `load()`. */
    headers: undefined,
    /** Object of default URL params.  Mixed with params specified during `load()`. */
    params: undefined,
    /** Request type.  Use one of the constants above or a string. */
    requestFormat: undefined
  }

  /** Initialize with just a string to set `url` only. */
  constructor(props) {
    super(typeof props === "string" ? { url: props } : props)
  }

  /**
   * DOCME!!!
   * Load file contents.  `params` is same as arguments to `$fetch()`.
   * Note this promise returns `fetch()` results AFTER processing according to `format`
   */
  getLoader(params) {
    const { url, defaultContents, format, loadParams } = this
    return $fetch({ url, defaultContents, format }, loadParams, params)
  }

  /**
   * DOCME!!!
   * Save file contents.  Default is to POST our `contents` back to `url` they came from.
   * `params` is same as arguments to `$fetch()`.
   * Note this promise returns `fetch()` results AFTER processing according to `format`
   */
  getSaver(params) {
    if (!this.isLoaded) {
      return Promise.reject(
        new SaveError({
          url: this.url,
          message: "Attempting to save a file which is not loaded!",
          params
        })
      )
    }
    const { url, contents, format, saveParams } = this
    return $fetch({ url, contents, format }, saveParams, params)
  }
}

/**
 * Syntactic sugar for various well-known file types.
 */

/** Loadable text file. */
export class TextFile extends LoadableFile {}

/** Loadable JSON file. */
export class JSONFile extends LoadableFile {
  @proto requestFormat = KNOWN_FORMATS.json
  @proto format = KNOWN_FORMATS.json
}

/** Loadable JSON5 file. */
export class JSON5File extends LoadableFile {
  @proto requestFormat = KNOWN_FORMATS.json5
  @proto format = KNOWN_FORMATS.json5
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
