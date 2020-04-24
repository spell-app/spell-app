import { KNOWN_FORMATS } from "./constants"
import { proto, overrideable } from "./decorators"
import { $fetch, merge$fetchParms } from "./$fetch"
import { Saveable } from "./Saveable"

/** Load a single file from `url`, process according to `format` before returning. */
export class LoadableFile extends Saveable {
  /** URL to load from. Make this a getter in your subclass to base it on other properties. */
  @proto url = undefined
  /** If defined, a 404 load or aborted promise will return these contents as a successful result. */
  @proto defaultContents = undefined
  /** Result type for auto-processing of results.  Defaults implicitly in`$fetch()` to TEXT */
  @proto format = undefined
  /** If true, on successful save, we auto-update `#load.contents` with specified `contents`. */
  @proto autoUpdateContentsOnSave = false

  /**
   * Default load params to pass to `$fetch()`.
   * Default `getLoader()` method mixes these with params passed directly to `load()`.
   */
  @proto loadParams = {
    /**  HTTP method to use.  If undefined, we'll use `GET` unless you specify `callParams.body`, in which case we'll use `POST` */
    method: undefined,
    /** Object of default URL headers.  Mixed with headers specified during `load()`. */
    headers: undefined,
    /** Object of default URL query params.  Mixed with query specified during `load()`. */
    query: undefined,
    /** Request type.  Use one of the constants above or a string. */
    requestFormat: undefined
  }

  /**
   * Default save params to pass to `$fetch()`.
   * Default `getSaver()` method mixes these with params passed directly to `save()`.
   */
  @proto saveParams = {
    /**  HTTP method to use.  If undefined, we'll use `GET` unless you specify `callParams.body`, in which case we'll use `POST` */
    method: undefined,
    /** Object of default URL headers.  Mixed with headers specified during `save()`. */
    headers: undefined,
    /** Object of default URL query params.  Mixed with query specified during `save()`. */
    query: undefined,
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
    const $params = merge$fetchParms({ url, defaultContents, format }, loadParams, params)
    return $fetch($params)
  }

  /**
   * DOCME!!!
   * Save file contents.  Default is to POST our `contents` back to `url` they came from.
   * `params` is same format as `$fetch()` `params`.
   * By default it will save our `defaultContents` if we've never been loaded.
   * Note this promise returns `fetch()` results AFTER processing according to `format`
   */
  getSaver(params) {
    const { url, contents = this.defaultContents, format, saveParams } = this
    const $params = merge$fetchParms({ url, contents, format }, saveParams, params)
    return $fetch($params).then(result => {
      if (this.autoUpdateContentsOnSave && this.contents !== $params.contents) {
        this.contents = $params.contents
      }
    })
  }

  /** Return url extension, if any. */
  @overrideable get extension() {
    const url = this.url
      .toLowerCase()
      .split("?")[0]
      .split("#")[0]
    const index = url.lastIndexOf(".")
    if (index === -1) return undefined
    return url.slice(index + 1)
  }
}

/**
 * Syntactic sugar for various well-known file types.
 */

/** Loadable text file. */
export class TextFile extends LoadableFile {
  /** If you call `save(<text>)` we'll use those as the `contents`. */
  getSaver(params) {
    if (typeof params === "string") params = { contents: params }
    return super.getSaver(params)
  }
}

/** Loadable JSON file. */
export class JSONFile extends TextFile {
  @proto loadParams = {
    requestFormat: KNOWN_FORMATS.json,
    format: KNOWN_FORMATS.json
  }
  @proto saveParams = {
    requestFormat: KNOWN_FORMATS.json,
    format: KNOWN_FORMATS.json
  }
}

/** Loadable JSON5 file. */
export class JSON5File extends TextFile {
  @proto loadParams = {
    requestFormat: KNOWN_FORMATS.json5,
    format: KNOWN_FORMATS.json5
  }
  @proto saveParams = {
    requestFormat: KNOWN_FORMATS.json5,
    format: KNOWN_FORMATS.json5
  }
}

/** Loadable image file:  GIF, PNG, JPG or SVG. */
export class ImageFile extends LoadableFile {
  /** Default format according to the file extension, defaulting to `binary`. */
  @overrideable get format() {
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
}
