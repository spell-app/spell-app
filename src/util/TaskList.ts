import global from "global"

import { Prettify } from "~/global_types"
import { TaskStatus, TaskResolveWith } from "./constants"
import { Task, type TaskProps, type TaskState } from "./Task"

export type TaskListProps = Prettify<
  {
    tasks?: Task[]
    delayBetweenTasks?: number
    resolveWith?: TaskResolveWith
    continueOnError?: boolean
  } & TaskProps
>

export type TaskListState = Prettify<
  {
    index: number
  } & TaskState<any>
>

/**
 * TaskList -- a Task which executes a list of other `Tasks` in sequence.
 *
 * The first task in the sequence will be passed the `initialValue` passed to `taskList.start()`.
 * Each subsequent task will be passed the `result` of the previous task (but see below).
 *
 * Normally if a task in the list fails, we'll stop the taskList and not run subsequent tasks.
 * However, if:
 *  - `taskList.continueOnError === true` or
 *  - `task.optional === true`
 * we'll continue to the next task in the list, passing the failed task's `error` instead.
 *
 * Note that you can add `tasks` to the end of a running taskList and they will get executed,
 * but once it has completed they will not get executed.
 *
 * TODO: number of `concurrentTasks` to do at once
 * TODO: TaskQueue <= endlessly running, handles things put on it in order (or w/concurrency)
 * TODO: TaskList.forEach(list, createTaskForItem)
 * TODO: TaskList.while(condition, createTask)
 * TODO: TaskList.if(condition, task1, task2)
 * TODO: TaskList.confirm(message, okBtn, cancelBtn) <= rejects() if they cancel
 * TODO: TaskList.prompt(message, default, okBtn, cancelBtn) <= passes value to next
 * TODO: https://github.com/wbinnssmith/awesome-promises
 */
export class TaskList extends Task {
  constructor(props: Partial<TaskListProps> = {}) {
    const { tasks, ...otherProps } = props
    super(otherProps)
    if (tasks) this.addTasks(...tasks)
  }

  //-----------------
  // Props
  //-----------------

  /** Queue of `Tasks` to run. Note we can also say `taskList.length` */
  get tasks() {
    return this.getProp("tasks", () => [])
  }
  set tasks(tasks: Task[]) {
    this.setProp("tasks", tasks)
  }

  /** Number of tasks to be executed. */
  get length() {
    return this.tasks.length
  }

  /** Delay between tasks, in milliseconds. */
  get delayBetweenTasks() {
    return this.getProp("delayBetweenTasks", () => 0)
  }
  set delayBetweenTasks(delayBetweenTasks: number) {
    this.setProp("delayBetweenTasks", delayBetweenTasks)
  }

  /**
   * On success, should we `resolve()` with the value of the `LAST` task
   * or the `RESULTS` of all of the tasks?
   */
  get resolveWith() {
    return this.getProp("resolveWith", () => TaskResolveWith.LAST_TASK)
  }
  set resolveWith(resolveWith: TaskResolveWith) {
    this.setProp("resolveWith", resolveWith)
  }

  /**
   * Should we continue when we encounter an error (failed task)?
   * Note that we'll also ignore errors if an individual `task.optional`.
   */
  get continueOnError() {
    return this.getProp("continueOnError", () => false)
  }
  set continueOnError(continueOnError: boolean) {
    this.setProp("continueOnError", continueOnError)
  }

  //-----------------
  // State
  //-----------------

  /** Index of the active task.  `-1` = unstarted. */
  get index() {
    return this.getState("index", () => -1)
  }
  set index(index: number) {
    this.setState("index", index)
  }

  /** Pointer to the active task. if any. */
  get activeTask() {
    return this.tasks[this.index]
  }

  /**
   * Pointer to the last active task.
   * An active task can look at this to inspect the result of the last task.
   */
  get lastTask() {
    return this.tasks[this.index - 1]
  }

  //-----------------
  // Syntactic sugar for results of our tasks
  //-----------------

  /**
   * Return the `results` for each of our executed tasks.
   * Values will be `undefined` if the task failed or has not executed yet.
   */
  get results() {
    return this.tasks.map((task) => task.result)
  }

  /**
   * Return the `errors` of each of our tasks.
   * Item will be `undefined` if the task succeeded or has not executed yet.
   */
  get errors() {
    return this.tasks.map((task) => task.error)
  }

  //-----------------
  // Task manipulation
  //-----------------

  /**
   * Return the list of `tasks` just prior to our `run()`.
   * Override to set tasks dynamically (e.g. see `TaskList.forEach`).
   */
  getTasks() {
    return this.tasks
  }

  /** Add one or more `Tasks` to our queue. */
  addTasks(...newTasks: Task[]) {
    newTasks.forEach((task) => {
      if (!(task instanceof Task)) throw new TypeError("TaskList.addTasks() added non-task")
      // Make the task point back to us!
      task.taskList = this
      this.tasks.push(task)
    })
  }

  //-----------------
  // Execution
  //-----------------

  /** `run()` the TaskList with `intialValue` passed to `start()`. */
  get run() {
    return (initialValue: unknown) => {
      // Reset list of tasks
      this.tasks = this.getTasks()

      // `resetState()` will have been called.
      // `this.taskRun` will be set
      // `this.taskRun.resolve/reject` will be available
      return new Promise((resolve, reject) => {
        const complete = () => {
          console.info("complete", this.name, this.resolveWith, this.lastTask, this.results)
          if (this.resolveWith === TaskResolveWith.LAST_TASK) resolve(this.lastTask?.result)
          else resolve(this.results)
        }
        const processNextTask = async (lastValue: unknown) => {
          // Bail if we were explicitly cancelled
          if (this.wasCancelled) return complete()

          // This shouldn't happen... ???
          if (!this.isActive) {
            console.warn("processNextTask for inActive, non-cancelled task", this)
            return complete()
          }

          // Advance to the next task in the queue
          this.setState("index", this.index + 1)

          // If we ran out of tasks, we're done!
          if (!this.activeTask) return complete()

          let result
          try {
            // Start the task, continuing to the next when it completes
            result = await this.activeTask.start(lastValue)
          } catch (error) {
            if (!this.continueOnError && !this.activeTask.optional) return reject(error)
            result = error
          }

          // Execute the next task on a slight delay to allow the UI to catch up
          return setTimeout(() => processNextTask(result), this.delayBetweenTasks || 0)
        }
        // Get the party started in the next tick
        setTimeout(() => processNextTask(initialValue), 0)
      })
    }
  }

  /**
   * Cancel an active taskList.
   * If we have not started or has already completed, this is a no-op.
   *
   * Note that any side-effects from `tasks` which have already been completed
   * will still be in effect!!!
   *
   * By default, we'll succeed (resolve) with an `undefined` result.
   * You can pass a different `result` and/or `status = FAILURE` to reject.
   */
  cancel(result?: any, status = TaskStatus.SUCCESS) {
    // Cancel our activeTask with the same status as we received.
    if (this.activeTask) this.activeTask.cancel(undefined, status)
    super.cancel(result, status)
  }

  /** Reset the taskList for another run. */
  resetState() {
    super.resetState()
    this.tasks.forEach((task) => task.reset())
  }

  /** Called before we start executing. */
  beforeStart(inputValue: any) {
    if (this.debug) {
      const { name } = this
      console.group(`> TaskList: ${name}\n     `, { taskList: this, inputValue })
    }
  }
  /** Called after we finish executing. Yu can examine `this.hasSucceeded`, `this.result`, etc. */
  afterFinish() {
    if (this.debug) {
      const { name, status, result, error, wasCancelled } = this
      console.info(`< TaskList: ${name}\n     `, { taskList: this, status, result, error, wasCancelled })
    }
    if (this.debug) console.groupEnd()
  }

  //-----------------
  // Factory methods
  //-----------------

  /**
   * Create a TaskList which iterates over `getTask(list[], n)` to get a list of tasks.
   * `list` can be an array or a `function` which returns an array dynamically.
   * All other props will be passed directly to the taskList.
   */
  static forEach<T>({
    list,
    getTask,
    ...props
  }: { list: T[] | (() => T[]); getTask: (input: T) => Task<unknown> } & Omit<TaskListProps, "run">) {
    const inputs = typeof list === "function" ? [...list()] : [...list]
    return new TaskList({
      resolveWith: TaskResolveWith.RESULTS,
      tasks: inputs.map((input) => getTask(input)),
      ...props
    })
  }
}

global.TaskList = TaskList
