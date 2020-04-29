import global from "global"

/** Return `true` if an Error is the result of an `AbortController.abort()` call. */
export function isAbortError(error) {
  if (error.name === "AbortError") return true
  if (error.error && error.error.name === "AbortError") return true
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
export function abortableFetch(url, fetchParams = {}) {
  // Semaphore set first thing when `fetch()` completes.
  let completed = false
  const abortController = new global.AbortController()
  function hookup(newPromise) {
    // console.warn("hooking up", newPromise)
    return Object.assign(newPromise, {
      cancel() {
        if (!completed) {
          console.warn(`Cancelling abortable fetch to ${url}:`)
          abortController.abort()
        }
        return this
      },
      then(...args) {
        return hookup(Promise.prototype.then.apply(this, args))
      },
      catch(...args) {
        return hookup(Promise.prototype.catch.apply(this, args))
      },
      finally(...args) {
        return hookup(Promise.prototype.finally.apply(this, args))
      }
    })
  }
  fetchParams.signal = abortController.signal
  const promise = fetch(url, fetchParams)
  // Set the `completed` semaphore when fetch completes, before anything else happens.
  promise.finally(() => {
    completed = true
  })
  return hookup(promise)
}
