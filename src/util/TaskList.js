import { forward } from "./decorators"
import { prop, state } from "./Observable"
import { Task } from "./Task"

/**
 * TaskList -- a Task which executes a list of other `Tasks` in sequence.
 *
 * The first task in the sequence will be passed the `initialValue` passed to `taskList.start()`.
 * Each subsequent task will be passed the `result` of the previous task (but see below).
 *
 * Normally if a task in the list fails, we'll stop the taskList and not run subsequent tasks.
 * However, if:
 *  - `taskList.continueOnError === true` or
 *  - `task.isOptional === true`
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
  //-----------------
  // Props
  //-----------------

  /** Queue of `Tasks` to run. Note we can also say `taskList.length` */
  @forward("length")
  @prop
  tasks = []

  /** Delay between tasks, in milliseconds. */
  @prop delayBetweenTasks = 0

  /**
   * Should we continue when we encounter an error (failed task)?
   * Note that we'll also ignore errors if an individual `task.isOptional`.
   */
  @prop continueOnError = false

  //-----------------
  // State
  //-----------------

  /** Index of the active task. */
  @state index = -1

  /** Pointer to the active task. if any. */
  @state activeTask = undefined

  /**
   * Pointer to the last active task.
   * An active task can look at this to inspect the result of the last task.
   */
  @state lastTask = undefined

  //-----------------
  // Syntactic sugar for results of our tasks
  //-----------------

  /**
   * Return the `results` for each of our executed tasks.
   * Values will be `undefined` if the task failed or has not executed yet.
   */
  get results() {
    return this.tasks.map(task => task.result)
  }

  /**
   * Return the `errors` of each of our tasks.
   * Item will be `undefined` if the task succeeded or has not executed yet.
   */
  get errors() {
    return this.tasks.map(task => task.error)
  }

  //-----------------
  // Task manipulation
  //-----------------

  constructor(props = {}) {
    if (typeof props === "function" || props.run)
      throw new TypeError("TaskLists should be created with a list of 'tasks', not an 'run' function.")
    const { tasks, ...otherProps } = props
    super(otherProps)
    if (tasks) this.addTasks(...tasks)
  }

  /** Add one or more `Tasks` to our queue. */
  addTasks(...newTasks) {
    newTasks.forEach(task => {
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
  run(initialValue) {
    // we will have been `reset()`
    // `this.taskRun` will be set
    // `this.taskRun.resolve/reject` will be available
    return new Promise((resolve, reject) => {
      const processNextTask = async lastValue => {
        // Bail if we're not still active (e.g. if we were cancelled)
        if (this.wasCancelled) return resolve(undefined)
        // This shouldn't happen... ???
        if (!this.isActive) {
          console.warn("processNextTask for inActive, non-cancelled task", this)
          return resolve(this.lastTask?.result)
        }

        // Advance to the next task in the queue
        this.set({
          lastTask: this.activeTask,
          index: ++this.index,
          activeTask: this.tasks[this.index]
        })

        // If we ran out of tasks, we're done!
        if (!this.activeTask) return resolve(this.lastTask?.result)

        let result
        try {
          // Start the task, continuing to the next when it completes
          result = await this.activeTask.start(lastValue)
        } catch (error) {
          if (!this.continueOnError && !this.activeTask.isOptional) return reject(error)
          result = error
        }

        // Execute the next task on a slight delay to allow the UI to catch up
        return setTimeout(() => processNextTask(result), this.delayBetweenTasks || 0)
      }
      // Let's get this party started!!!
      processNextTask(initialValue)
    })
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
  cancel(result, status) {
    // Cancel our activeTask with the same status as we received.
    if (this.activeTask) this.activeTask.cancel(undefined, status)
    super.cancel(result, status)
  }

  /** Reset the taskList for another run. */
  reset() {
    super.reset()
    this.tasks.forEach(task => task.reset())
  }
}

global.TaskList = TaskList
