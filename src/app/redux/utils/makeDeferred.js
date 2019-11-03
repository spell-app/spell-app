//  Return a `Promise` with its `resolve` and `reject` methods exposed on it.
//  This allows the caller to resolve/reject the promise.
export default function makeDeferred() {
  let promise, _resolve, _reject
  promise = new Promise(function(resolve, reject) {
    _resolve = function(result) {
      //       if (promise.state !== "pending")
      //         console.error(`Attempting to resolve ${promise.state} promise with `,result);
      //       else
      //         console.info(`Resolving ${promise.state} promise with `,result);
      promise.state = "resolved"
      resolve(result)
    }
    _reject = function(error) {
      //       if (promise.state !== "pending")
      //         console.error(`Attempting to reject ${promise.state} promise with `,error);
      //       else
      //         console.info(`Rejecting ${promise.state} promise with `,error);
      promise.state = "rejected"
      reject(error)
    }
  })
  promise.state = "pending"
  promise.resolve = _resolve
  promise.reject = _reject
  return promise
}
