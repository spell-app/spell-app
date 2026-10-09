import { extend } from "$/util/reactive"
import { KnownFormat, type KnownFormatMimeType } from "./constants"
import { $fetch, merge$fetchParms, type $FetchParams, type $FetchRequestParams } from "./$fetch"
import { Loadable, LoadableProps } from "./Loadable"

import { RequestError } from "./ResponseErrors"

/** Shape of a parsed JSON file:  plain object or array. */
export type JSONFileType = Record<string, any> | Array<any>

/** Load a single file from `url`, process according to `format` before returning. */
export class LoadableFile<FileType, SaveResult = any> extends Loadable<FileType, SaveResult> {
  /**
   * How EVERY `LoadableFile` reaches its `url`:  `$fetch()` over HTTP by default.
   * - Replace it to answer in-process, e.g. from disk under node -- see `src/server/disk-fetch.ts`.
   * - Same signature and same result shape as `$fetch()`, `format` / `defaultContents` included.
   */
  static fetch: typeof $fetch = $fetch

  /** Initialize with just a string to set `url` only. */
  constructor(props: LoadableFileProps<FileType> | string) {
    super(typeof props === "string" ? { url: props } : props)
  }

  /**
   * URL to load from.
   * - By default you'd pass this in on new File.
   * - Override with a getter in your subclass to derive it from other properties.
   */
  get url() {
    return extend.getProp<string>(this, "url")
  }
  set url(url) {
    this.override("url", url)
  }

  /**
   * Default contents to use if loading results in a 404 or aborted promise.
   * - If this is defined, a 404 will be counted as a successful `load()`.
   */
  get defaultContents() {
    return extend.getProp<FileType>(this, "defaultContents")
  }
  set defaultContents(defaultContents: FileType | undefined) {
    this.override("defaultContents", defaultContents)
  }

  /**
   * Result type for auto-processing of results.
   * Defaults implicitly in `$fetch()` to TEXT.
   */
  get format() {
    return extend.getProp<KnownFormatMimeType>(this, "format")
  }
  set format(format) {
    this.override("format", format)
  }
  /**
   * Set to `true` to auto-update our `contents` when `save()` succeeds.
   */
  get autoUpdateContentsOnSave() {
    return false
  }

  /**
   * Default load params to pass to `$fetch()`.
   * Default `getLoader()` method mixes these with params passed directly to `load()`.
   */
  get loadParams(): $FetchRequestParams {
    return {
      method: undefined,
      headers: undefined,
      query: undefined,
      requestFormat: undefined
    } as $FetchRequestParams
  }

  /**
   * Default save params to pass to `$fetch()`.
   * Default `getSaver()` method mixes these with params passed directly to `save()`.
   */
  get saveParams() {
    return {
      method: undefined,
      headers: undefined,
      query: undefined,
      requestFormat: undefined
    } as $FetchRequestParams
  }

  /**
   * Load file contents.  `params` is same as arguments to `$fetch()`.
   * - Merges `url` / `defaultContents` / `format` with our `loadParams` getter and per-call `params`.
   * - Note this promise returns `fetch()` results AFTER processing according to `format`.
   * - Throws `RequestError` if no `url` resolves.
   * - Called from `Loadable.load()` -- don't call this directly.
   */
  getLoader(params: $FetchParams) {
    const { url, defaultContents, format, loadParams } = this
    const $params = merge$fetchParms({ url, defaultContents, format }, loadParams, params)
    if (!$params.url) {
      throw new RequestError({
        message: `${this.constructor.name}.getLoader(): you must specify "url".`,
        context: this,
        params: $params
      })
    }
    return LoadableFile.fetch($params) as Promise<FileType>
  }

  /**
   * Save file contents.  Default is to POST our `contents` back to `url` they came from.
   * `params` is same format as `$fetch()` `params`.
   * - By default it will save our `defaultContents` if we've never been loaded.
   * - Merges `url` / `contents` / `format` with our `saveParams` getter and per-call `params`.
   * - Note this promise returns `fetch()` results AFTER processing according to `format`.
   * - SIDE EFFECT: if `autoUpdateContentsOnSave`, updates our `contents` to what we just saved.
   * - Throws `RequestError` if no `url` resolves.
   * - Called from `Loadable.save()` -- don't call this directly.
   */
  getSaver(params: $FetchParams) {
    const { url, contents = this.defaultContents, format, saveParams } = this
    const $params = merge$fetchParms({ url, contents, format }, saveParams, params)
    if (!$params.url) {
      throw new RequestError({
        message: `${this.constructor.name}.getSaver(): you must specify "url".`,
        context: this,
        params: $params
      })
    }
    return LoadableFile.fetch<SaveResult>($params).then((result) => {
      if (this.autoUpdateContentsOnSave && this.contents !== $params.contents) {
        this.contents = $params.contents
      }
      return result
    }) as Promise<SaveResult>
  }

  /**
   * Return url extension, if any.
   * - By default we try to get it from the end of the url path.
   */
  /*@overridable*/
  get extension() {
    const path = this.url?.toLowerCase().split("?")[0].split("#")[0]
    if (!path) return undefined
    const index = path.lastIndexOf(".")
    if (index === -1) return undefined
    return path.slice(index + 1)
  }
  set extension(extension) {
    this.override("extension", extension)
  }
}

/** Constructor props accepted by `LoadableFile` and its subclasses. */
export type LoadableFileProps<FileType> = Prettify<
  {
    /** URL to load from. */
    url?: string
    /** Default contents to use if loading results in a 404 or aborted promise. */
    defaultContents?: FileType
    /** Result type for auto-processing of results. */
    format?: KnownFormatMimeType
  } & LoadableProps<FileType>
>

////////////////
// ## Well-Known File Types
////////////////
// Syntactic sugar for various well-known file types.

/** Loadable text file. */
export class TextFile extends LoadableFile<string> {}

/**
 * Loadable JSON file.
 * NOTE: generic parameter is named `JSONFileType`, shadowing the module-level `JSONFileType` type
 * above -- looks unintentional.
 * TODO: probably meant `extends LoadableFile<JSONFileType>` with no generic of its own?
 */
export class JSONFile<JSONFileType> extends LoadableFile<JSONFileType> {
  /** `$fetch()` load params fixed to JSON in and out. */
  get loadParams() {
    return {
      requestFormat: KnownFormat.json,
      format: KnownFormat.json
    }
  }
  /** `$fetch()` save params fixed to JSON in and out. */
  /*@proto*/
  get saveParams() {
    return {
      requestFormat: KnownFormat.json,
      format: KnownFormat.json
    }
  }
}

/**
 * Loadable JSON5 file.
 * NOTE: generic parameter is named `JSONFileType`, same shadowing gotcha as `JSONFile` above.
 */
export class JSON5File<JSONFileType> extends LoadableFile<JSONFileType> {
  /** `$fetch()` load params fixed to JSON5 in and out. */
  /*@proto*/
  get loadParams() {
    return {
      requestFormat: KnownFormat.json5,
      format: KnownFormat.json5
    }
  }
  /** `$fetch()` save params fixed to JSON5 in and out. */
  /*@proto*/
  get saveParams() {
    return {
      requestFormat: KnownFormat.json5,
      format: KnownFormat.json5
    }
  }
}

/** Loadable image file:  GIF, PNG, JPG or SVG. */
export class ImageFile extends LoadableFile<any> {
  /** Default format according to the file extension, defaulting to `binary`. */
  /*@overridable*/
  get format() {
    switch (this.extension) {
      case "jpg":
      case "jpeg":
        return KnownFormat.jpg
      case "png":
        return KnownFormat.png
      case "gif":
        return KnownFormat.gif
      case "svg":
        return KnownFormat.svg
      default:
        return KnownFormat.binary
    }
  }
  set format(format) {
    this.override("format", format)
  }
}
