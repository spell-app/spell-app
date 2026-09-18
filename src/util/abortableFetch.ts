import global from "global"

/** Return `true` if an Error is the result of an `AbortController.abort()` call. */
export function isAbortError(error: Error) {
  if (error.name === "AbortError") return true
  return false
}

/**
 * `fetch()` a resource, attaching a non-standard `promise.cancel()` method,
 * which will attempt to abort the server request
 * and reject the `fetch()` promise with an "AbortError".
 * Use `isAbortError()` above to determine if the response was cancelled.
 * See https://developer.mozilla.org/en-US/docs/Web/API/AbortController
 *
 * We attempt to propagate the `.cancel()` method to subsequent promises
 * made via `.then()`, `.catch()` etc.  However, this propagation is fragile
 * and in particular doesn't survive being returnd by an `async` function.
 *
 * So this works:
 *    function loadIt() {
 *      return abortableFetch(...)
 *    }
 *    const promise = loadIt()
 *    promise.cancel() <<<< `cancel` will abort the fetch if it has not completed.
 *
 * And this works:
 *    function loadIt() {
 *      return abortableFetch(...)
 *    }
 *    const promise = loadIt().then(...).catch(...).finally(...)
 *    promise.cancel() <<<< `cancel` will abort the fetch if it has not completed.
 *
 * But this does not:
 *    async function loadIt() {
 *      return abortableFetch(...)
 *    }
 *    const promise = loadIt()
 *    promise.cancel() <<<<< `cancel` will not be defined
 */
export function abortableFetch(url: string, fetchParams: RequestInit = {}) {
  // Semaphore set first thing when `fetch()` completes.
  let completed = false
  const abortController = new global.AbortController()

  function wrapPromise(promise: Promise<unknown>) {
    // console.warn("wrapping promise", promise)
    return Object.assign(promise, {
      cancel() {
        if (!completed) {
          console.warn(`Cancelling abortable fetch to ${url}:`)
          abortController.abort()
        }
        return this
      },
      then(onResolved: (value: any) => unknown, onRejected: (reason: any) => unknown) {
        return wrapPromise(Promise.prototype.then.apply(this, [onResolved, onRejected]))
      },
      catch(onRejected: (reason: any) => unknown) {
        return wrapPromise(Promise.prototype.catch.apply(this, [onRejected]))
      },
      finally(onFinally: () => void) {
        return wrapPromise(Promise.prototype.finally.apply(this, [onFinally]))
      }
    })
  }
  fetchParams.signal = abortController.signal
  const promise = fetch(url, fetchParams)
  // Set the `completed` semaphore when fetch completes, before anything else happens.
  void promise.finally(() => {
    completed = true
  })
  return wrapPromise(promise)
}
