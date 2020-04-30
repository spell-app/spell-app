import { UNSTARTED, ACTIVE, SUCCESS, FAILURE } from "./constants"
import { readonly, asType } from "./decorators"
import { Observable, prop, state, batch } from "./Observable"

/**
 * A `Task` is the concrete manifestation of an asynchronous process.
 * A `Task` wraps an `async` function (e.g. to load or save a resource) in a persistent object.
 * Unlike a `Promise`, a `Task` can be inspected, `cancel()`ed, `restart()`ed, etc.
 *
 * A `Task` is especially useful as part of a `TaskList` -- a sequence of multiple actions.
 * By setting `task.name`, we can see which actions need to be performed in the taskList and their current status.
 *
 * To create a task, pass:
 * - `run`          Function which returns a `Promise` to execute the task.
 * You may also pass:
 * - `name`             String name for the task, recommended for taskList display.
 * - `isOptional`       If `true`, a `TaskList` that's executing us will continue even if we fail.
 *
 * Use `task.start(intialValue)` to execute the task with `intialValue`.
 * This returns a promise that always `resolve()`s or `rejects()`s as normal.
 *  - `task.result` will be the result of the last successful run.
 *  - `task.error` is the error returned on the last failed run.
 * You can also examine `task.hasSucceded`, `task.wasCancelled` etc to figure out exactly what happened later.
 *
 * You can call `task.cancel()` to abort a running task, see below.
 * Call `task.reset()` to clear all prior state in prep for calling again. (??)
 *
 * TODO: `retry` to retry N times if we fail.
 * TODO: `failAfter` to fail a promise if it doesn't complete for certain amount of time.
 */
export class Task extends Observable {
  //-----------------
  // Props
  //-----------------
  /** (required) Function which returns a `Promise` to execute this task. */
  @asType(Function) run
  /** Name for this task (which will be displayed by the TaskList while we're executing). */
  @prop name = undefined
  /** If `true`, a TaskList will continue executing even if we fail. */
  @prop isOptional = false

  /**
   * Construct with `{ run, name?, isOptional? }`
   * or pass just a function for `{ run }`.
   */
  constructor(props) {
    if (typeof props === "function") props = { run: props }
    super(props)
    if (typeof this.run !== "function") {
      this.run = value => {
        return new Promise(resolve => setTimeout(() => resolve(value), 2000))
      }
      // throw new TypeError("Tasks must be created with an `run` function.")
    }
  }

  //-----------------
  // State.  Note: these are the values after `reset()`.
  //-----------------
  /** Result set when we `resolve()`. */
  @state result = undefined
  /** Error set when we `reject()`. */
  @state error = undefined

  /* Current status:  `UNSTARTED`, `ACTIVE`, `SUCCESS` or `FAILURE` */
  @state @readonly status = UNSTARTED
  /* Was our last run cancelled? */
  @state @readonly wasCancelled = false
  /* Current task run */
  @state @readonly execution = undefined

  //-----------------
  // Syntactic sugar for our `status`
  //-----------------

  get hasStarted() {
    return this.status !== UNSTARTED
  }
  get isActive() {
    return this.status === ACTIVE
  }
  get hasSucceeded() {
    return this.status === SUCCESS
  }
  get hasFailed() {
    return this.status === FAILURE
  }
  get hasCompleted() {
    return this.hasSucceeded || this.hasFailed
  }

  //-----------------
  // Execution
  //-----------------

  /**
   * Start this task by calling `this.run(intialValue)`.
   * Returns a promise which you can use as normal.
   */
  start(intialValue) {
    // If we're currently running, just return our active promise.
    // TODO: throw???
    if (this.execution) {
      console.warn("attempting to start() running task", this, "\nexecution:", { ...this.execution })
      return this.execution.promise
    }

    // Reset us to the default state
    this.reset()

    // Create a `execution` object which holds particulars of the current run.
    const execution = {
      /** Complete this run.  `status` is required, `result` is result or error, depending on status. */
      complete: (status, result) => {
        batch(() => {
          // Forget it if we're not the current execution (e.g. we were cancelled)
          if (execution !== this.execution) return
          this.set({
            "_state.execution": undefined,
            "_state.status": status,
            [status === SUCCESS ? "result" : "error"]: result
          })
          if (status === SUCCESS) execution.resolve(this.result)
          else execution.reject(this.error)
        })
      }
    }
    this.set("_state.execution", execution)
    execution.promise = new Promise((resolve, reject) => {
      // squirrel away the resolve/reject methods for `complete()` above
      execution.resolve = resolve
      execution.reject = reject

      try {
        this.set("_state.status", ACTIVE)
        const promise = Promise.race([this.run(intialValue)])
        // Grab the `cancel` method from the promise, if any
        execution.cancel = promise.cancel
        // send success or failure to `complete()` above
        promise.then(
          result => execution.complete(SUCCESS, result),
          error => execution.complete(FAILURE, error)
        )
      } catch (errorInExecutor) {
        execution.complete(FAILURE, errorInExecutor)
      }
    })
    // This is the actual promise you'll wait on.
    return execution.promise
  }

  /**
   * Cancel an active task.
   * If the task has not started or has already completed, this is a no-op.
   *
   * By default, we'll succeed (resolve) with an `undefined` result.
   * You can pass a different `result` and/or `status = FAILURE` to reject.
   *
   * Note that there's no guarantee that `cancel()`ing a task will actually
   * stop any side effects that have already been enacted by the task!
   */
  cancel(result, status = SUCCESS) {
    batch(() => {
      const { execution } = this
      if (execution) {
        this.set("_state.wasCancelled", true)
        // Cancel the task before attempting to cancel the executor
        execution.complete(status, result)
        if (execution.cancel) execution.cancel()
      }
    })
  }

  /**
   * Restart this task, `cancel()`ing it if it's running.
   * Does default `cancel()` behavior, call `cancel()` manually to do something else.
   */
  restart(initialValue) {
    batch(() => {
      this.cancel()
      this.reset()
    })
    this.start(initialValue)
  }
}

// DEBUG
global.Task = Task
