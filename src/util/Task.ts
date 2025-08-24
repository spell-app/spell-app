import global from "global"
import { TaskStatus } from "./constants"
import { Observable, batch } from "./Observable"
import type { TaskList } from "./TaskList"

export type TaskProps<TaskResult = any> = {
  /** Method to `run()` when executing this task. */
  run: (inputValue: unknown) => Promise<TaskResult>
  /** Optional name, for TaskList display. */
  name?: string
  /** Is this task optional?  If so, a failure will not cancel a TaskList. */
  optional?: boolean
  /** Set to `true` to debug task execution. */
  debug?: boolean
  /** Pointer to TaskList which contains us. */
  taskList?: TaskList
}

/** */
export type TaskExecution<TaskResult> = {
  complete: (status: TaskStatus, result: TaskResult | Error) => void
  promise: Promise<unknown>
  resolve: (result: unknown) => void
  reject: (reason: unknown) => void
  cancel?: () => void
}

export type TaskState<TaskResult> = {
  /** Current status. */
  status?: TaskStatus
  /** Last result if successful. */
  result?: TaskResult
  /** Last error if unsuccesful. */
  error?: Error
  /** Current execution context of Task. */
  execution?: TaskExecution<TaskResult>
}

/**
 * A `Task` is the concrete manifestation of an asynchronous process.
 * A `Task` wraps an `async` function (e.g. to load or save a resource) in a persistent object.
 * Unlike a `Promise`, a `Task` can be inspected, `cancel()`ed, `restart()`ed, etc.
 *
 * A `Task` is especially useful as part of a `TaskList` -- a sequence of multiple actions.
 * By setting `task.name`, we can see the state of pending actions in a taskList, what's left to do, etc.
 *
 * To create a task, pass:
 * - `run`          Function which returns a `Promise` to execute the task.
 *                  NOTE: You can pass just a function to set `task.run`.
 * You may also pass:
 * - `name`         String name for the task, e.g. to display as part of the taskList.
 * - `optional`     If `true`, a `TaskList` that's executing us will continue even if we fail.
 *
 * Use `task.start(intialValue)` to execute the task with `intialValue`.
 * This returns a promise that always `resolve()`s or `rejects()`s as normal.
 * After completion:
 *  - `task.result` will be the result of the last successful run.
 *  - `task.error` is the error returned on the last failed run.
 * You can also examine `task.hasSucceded`, `task.wasCancelled` etc to see what happened later.
 *
 * You can call `task.cancel()` to abort a running task, see below for details.
 * Call `task.resetState()` to clear all prior state in prep for calling again. (??)
 *
 * TODO: `retry` to retry N times if we fail.
 * TODO: `failAfter` to fail a promise if it doesn't complete for certain amount of time.
 */
export class Task<TaskResult = any> extends Observable<TaskProps<TaskResult>> {
  /**
   * Construct with `{ run, name?, optional? }`
   * or pass just a function for `{ run }`.
   */
  constructor(props: Partial<TaskProps> | (() => Promise<any>)) {
    if (typeof props === "function") props = { run: props }
    super(props)
    if (typeof this.run !== "function") {
      throw new TypeError("Tasks must be created with an `run` function.")
    }
  }

  //-----------------
  // Props
  //-----------------
  /** (required) Function which returns a `Promise` to execute this task. */
  /*@proto*/
  get run() {
    return this.getProp("run")
  }
  set run(run: (inputValue: unknown) => Promise<TaskResult>) {
    this.setProp("run", run)
  }

  /** Name for this task (which will be displayed by the TaskList while we're executing). */
  get name() {
    return this.getProp("name")
  }
  set name(name: string | undefined) {
    this.setProp("name", name)
  }

  /** If `true`, a TaskList will continue executing even if we fail. */
  get optional() {
    return this.getProp("optional", () => false)
  }
  set optional(optional: boolean) {
    this.override("optional", optional)
  }

  //-----------------
  // State.  Note: these are the values after `reset()`.
  //-----------------
  /** Result set when we `resolve()`. */
  get result() {
    return this.getState("result", () => undefined)
  }
  set result(result: TaskResult | undefined) {
    this.setState("result", result)
  }
  /** Error set when we `reject()`. */
  get error() {
    return this.getState("error", () => undefined)
  }
  set error(error: Error | undefined) {
    this.setState("error", error)
  }

  /* Current status:  `UNSTARTED`, `ACTIVE`, `SUCCESS` or `FAILURE` */
  get status() {
    return this.getState("status", () => TaskStatus.UNSTARTED)
  }
  set status(status: TaskStatus) {
    this.setState("status", status)
  }

  /* Was our last run cancelled? */
  // TODO: status = cancelled?
  get wasCancelled() {
    return this.getState("wasCancelled", () => false)
  }
  set wasCancelled(wasCancelled) {
    this.setState("wasCancelled", wasCancelled)
  }

  /* Current task run */
  get execution() {
    return this.getState("execution", () => undefined)
  }
  set execution(execution: TaskExecution<TaskResult> | undefined) {
    this.setState("execution", execution)
  }

  get taskList() {
    return this.getProp("taskList")
  }
  set taskList(taskList: TaskList | undefined) {
    this.setProp("taskList", taskList)
  }

  //-----------------
  // Syntactic sugar for our `status`
  //-----------------

  get hasStarted() {
    return this.status !== TaskStatus.UNSTARTED
  }
  get isActive() {
    return this.status === TaskStatus.ACTIVE
  }
  get hasSucceeded() {
    return this.status === TaskStatus.SUCCESS
  }
  get hasFailed() {
    return this.status === TaskStatus.FAILURE
  }
  get hasCompleted() {
    return this.hasSucceeded || this.hasFailed
  }

  //-----------------
  // Execution
  //-----------------

  /**
   * Start this task by calling `this.run(inputValue)`.
   * Returns a promise which you can use as normal.
   */
  start(inputValue: unknown) {
    // If we're currently running, just return our active promise.
    // TODO: throw???
    if (this.execution) {
      console.warn("attempting to start() running task", this, "\nexecution:", { ...this.execution })
      return this.execution.promise
    }

    // Reset us to the default state
    this.resetState()

    // Create a `execution` object which holds particulars of the current run.
    const execution = {
      /** Complete this run.  `status` is required, `result` is result or error, depending on status. */
      complete: (status, result) => {
        batch(() => {
          // Forget it if we're not the current execution (e.g. we were cancelled)
          if (execution !== this.execution) return
          this.setState("execution", undefined)
          this.setState("status", status)
          this.setState(status === TaskStatus.SUCCESS ? "result" : "error", result)
          this.afterFinish()
          if (status === TaskStatus.SUCCESS) execution.resolve(this.result)
          else execution.reject(this.error)
        })
      }
    } as TaskExecution<TaskResult>

    this.setState("execution", execution)
    execution.promise = new Promise((resolve, reject) => {
      // squirrel away the resolve/reject methods for `complete()` above
      execution.resolve = resolve
      execution.reject = reject

      try {
        this.setState("status", TaskStatus.ACTIVE)
        this.beforeStart(inputValue)
        let promise = this.run(inputValue)
        // Grab the `cancel` method from the promise, if any
        execution.cancel = (promise as any)?.cancel
        // wrap non-promise value in a promise for consistency below
        if (!promise.then) promise = Promise.resolve(promise)
        // send success or failure to `complete()` above
        promise.then(
          (result) => execution.complete(TaskStatus.SUCCESS, result),
          (error) => execution.complete(TaskStatus.FAILURE, error)
        )
      } catch (errorInExecutor) {
        execution.complete(TaskStatus.FAILURE, errorInExecutor as Error)
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
  cancel(result?: any, status = TaskStatus.SUCCESS) {
    batch(() => {
      const { execution } = this
      if (execution) {
        this.setState("wasCancelled", true)
        // Cancel the task before attempting to cancel the executor
        execution.complete(status, result)
        if (execution.cancel) execution.cancel()
      }
    })
  }

  /** Reset the task so it can be started again. */
  reset() {
    this.cancel()
    return this.resetState()
  }

  /**
   * Restart this task, `cancel()`ing it if it's running.
   * Does default `cancel()` behavior, call `cancel()` manually to do something else.
   */
  restart(inputValue: any) {
    batch(() => {
      this.cancel()
      this.resetState()
    })
    this.start(inputValue)
  }

  //-----------------
  // Debugging
  //-----------------

  /** Set to true to debug to the console as we operate. */
  get debug() {
    return this.getProp("debug", () => false)
  }
  set debug(debug: boolean) {
    this.setProp("debug", debug)
  }

  /** Called before we start executing. */
  beforeStart(inputValue: any) {
    if (this.debug) {
      const { name } = this
      console.info(`> Task: ${name}\n     `, { task: this, inputValue })
    }
  }
  /** Called after we finish executing. Yu can examine `this.hasSucceeded`, `this.result`, etc. */
  afterFinish() {
    if (this.debug) {
      const { name, status, result, error, wasCancelled } = this
      console.info(`< Task: ${name}\n     `, { task: this, status, result, error, wasCancelled })
    }
  }
}

// DEBUG
global.Task = Task
