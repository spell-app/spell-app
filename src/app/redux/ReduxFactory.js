//----------------------------
//
//  Generic utility class to make it easier to set up redux for a certain domain.
//
//  In your main `store` file, YOU MUST use the factories to set up your store
//  via `ReduxFactory.createStore()`.
//
//  For each redux domain, have a file which does:
//    // create the factory
//    export default const myDomain = new ReduxFactory("myDomain");
//
//    // Create an action.
//    // `myAction` is the name of the action CREATOR
//    // and we will automatically have define an action HANDLER of `MY_ACTION`.
//    myDomain.addAction({
//      name: "myAction",
//      getParams(...inputParams) {
//        // munge `inputParams` into a single `actionParams` value passed to `handler()`
//        // OPTIONAL: if not provided, actionParams will be the first argument to the function.
//      },
//      handler(state, actionParams) {
//        // munge `state` according to `actionParams` and return a new copy of `state`
//        return {...state};
//      }
//    });
//
//    // Create an asynchronous action
//    // `myAsyncAction` is the name of the action CREATOR
//    // and we will automatically have define an action HANDLER of `MY_ASYNC_ACTION`.
//    myDomain.addAsyncAction({
//      name: "myAsyncAction",
//      getParams(...params) {
//        // munge `inputParams` into a single `actionParams` value passed to `promise()`
//        // OPTIONAL: if not provided, actionParams will be the first argument to the function.
//      },
//      async promise(state, actionParams) {
//        // Do whatever async stuff you like, using `await somethingThatReturnsAPromise()`
//        // to pretend like things are happening synchronously.
//        // `state` is the current domain state, which you MUST NOT MODIFY.
//        // A normal return value will be passed  as `result` to `onSuccess()`.
//        // An exception (returned or thrown) will be passed as `error` to `onError()` instead.
//        return true;
//      },
//      onLoading(state, actionParams) {
//        // OPTIONAL:  Action is about to execute,
//        //      return a munged copy of `state` to indicate loading.
//        // NOTE: If you undo any state modifications here in `onError`!
//        return {...state};
//      },
//      onSuccess(state, result, actionParams) {
//        // REQUIRED:  Use `result` and possibly `actionParams`
//        // to return a munged copy of `state`.
//        return {...state}
//      },
//      onError(state, error, actionParams) {
//        // REQUIRED:  Use `error` and possibly `actionParams`
//        // to return a munged copy of `state`.
//        return {...state}
//      }
//    });
//
//    It's inevitable that you'll have some state that you don't want to put through redux,
//    for example, you might want to store the id of the currently focused field,
//    but you don't want SETTING THAT FIELD ID to cause the page to redraw.
//    In these cases you can use these functions in an action:
//
//    myDomain.getUntrackedState(prop)
//    myDomain.setUntrackedState(prop, value)     // set value = `undefined` to clear
//
//    or
//
//    myDomain.getPref(prop, default)
//    myDomain.setPref(prop, value)     // set value = `undefined` to clear
//
//
//----------------------------

import _forEach from "lodash/forEach"
import _snakeCase from "lodash/snakeCase"
import { isNode } from "browser-or-node"
import { applyMiddleware, bindActionCreators, combineReducers, compose, createStore } from "redux"

import { addDebugMethods, DebugLevel } from "../../utils/addDebugMethods"
import makeDeferred from "./utils/makeDeferred"
import { getPref, setPref } from "./utils/prefs"

// Special action stub to pass back to ignore an action.
export const IGNORE_ACTION = { type: "__IGNORE_ACTION__", promise: Promise.resolve() }

export default class ReduxFactory {
  initialState = {} // Initial state of our store.
  // Override on construction: `new ReduxFactor({ initialState: {...} })`.

  call = {} // Map of `{ <actionName>: <actionInvoker> }`
  // Use this to invoke an action, returning a promise which will:
  //    - resolve when the actions completes with the action promise result, or
  //    - reject with the action promise error on failure.
  // You can safely do this in another action handler
  //  or during the promise setup to another async action.
  //
  //  e.g.   `myFactory.call.someMethod(with, params).then(...)`

  _actionCreators = {} // Map of `{ <name>: <actionCreator> }

  _actionHandlers = {} // Map of `{ <ACTION>: <actionHandler> }

  _asyncActions = {} // Map of `{ <asyncActions>: { <details> }`

  middlewares = [] // Array of middleware functions to use during `createStore()`.
  // NOTE: if provided, DO NOT wrap functions with `applyMiddleware()`!

  constructor(props) {
    Object.assign(this, props)
    if (!this.domain) throw new TypeError("new ReduxFactory(): you must pass 'domain' prop on construction.")

    // Make this instance debuggable with its domain as debug message prefix.
    addDebugMethods(this, this.domain, ReduxFactory.DEBUG_LEVEL)

    // If we were passed a list of `actions`, set them up using `addAction` and `addAsyncAction`
    const { actions } = this
    if (actions) {
      delete this.actions
      actions.forEach(actionSetup => {
        if (actionSetup.promise) this.addAsyncAction(actionSetup)
        else this.addAction(actionSetup)
      })
    }
  }

  //----------------------------
  //
  //  Reducers, ActionCreators and ActionHandlers (`addAction()` and `addAsyncAction()`)
  //
  //----------------------------

  // Create reducer which dispatches according to our `_actionHandlers`.
  reducer = (state = this.initialState, action) => {
    const actionHandler = this._actionHandlers[action.type]
    if (actionHandler) return actionHandler(state, action)

    // No handler found, just return unmodified state.
    return state
  }

  // Wrap the normal reducer created above with an `otherReducer`:
  //  `otherReducer(state, action)` will be called first,
  //  THEN the `normal` reducer.
  wrapReducer(otherReducer) {
    const originalReducer = this.reducer
    this.reducer = (state, action) => {
      state = otherReducer(state, action)
      return originalReducer(state, action)
    }
  }

  // Add an action `handler` for a named `ACTION`
  // `handler` signature is `(state, action)`
  // If watching a async action, `action` will be `{ type, params, result }`
  addActionHandler({ ACTION, handler }) {
    this._actionHandlers[ACTION] = handler
  }

  //----------------------------
  //
  //  Actions (`addAction()`)
  //
  //----------------------------

  // Create a normal action creator/handler pair in a compact form.
  // Returns a function which will invoke the actionCreator on a short delay.
  // See usage info at the top of this file.
  addAction(actionParams) {
    let {
      name: actionName, // (REQUIRED) Name of the method that kicks things off

      getParams, // (OPTIONAL) Function whose purpose is to transform
      //  argments passed in to a single `params` object
      //  provided to the action to be dispatched.
      //  If you don't provide one, we'll use the first argument to the function.
      //
      //  NOTE: in the params, do NOT pass `{ type: <ACTION> }`,
      //  it will be added automatically, outside of this returned params.

      actionCreator, // (OPTIONAL) Function which returns full action.
      //  NOTE: If using this, you MUST pass `ACTION` in the method result.
      //  NOTE: If using this, `once` is ignored.

      handler, // (OPTIONAL) Action handler called when the action is sent.
      // Signature:  `handler(state, params)`
      //
      // You don't need to pass one if your event is delegating
      //  to a different handler (e.g. if you're passing another `ACTION`).

      ACTION, // (OPTIONAL) Name for the event created.
      // If you don't specify one, we'll derive from `actionName`.

      once, // (OPTIONAL) `true` to execute the action only once.
      // `function` to execute action once per parameters
      //  using `this.once(params)` to return hash value
      //  used to determine if these parameters have been used.

      init, // (OPTIONAL) Function to call ONCE, WHEN THE ACTION IS BEING SET UP.
      // Use this to, e.g. initialize global event handlers.
      // It will be called as `init(factory, actionParams)`.

      async // (OPTIONAL) You can re-use another action with different parameters
      // by passing `ACTION` and `getParams` only.  By default, these will
      // be non-async.  Pass `async:true` to ensure they are asyn.
    } = actionParams

    // Make sure we have required parameters
    this.assert(actionName, "addAction(): 'name' parameter is required.")
    this.assert(
      handler || ACTION || actionCreator,
      `addAction(${actionName}): one of 'handler', 'ACTION' or 'actionCreator' is required.`
    )

    // Convert case of ACTION as per redux standard
    ACTION = _snakeCase(ACTION || actionName).toUpperCase()

    // Create/register the actionCreator.
    if (!actionCreator)
      actionCreator = this.getActionCreator(actionName, ACTION, getParams, once, async && "ADD_PROMISE")

    this._actionCreators[actionName] = actionCreator

    // Register actionHandler if provided.
    // (If not provided, we assume that we're calling a different ACTION)
    if (handler) {
      handler = handler.bind(this)
      this._actionHandlers[ACTION] = (state, action) => handler(state, action.params)
    }

    // Create an action invoker.
    const invoker = this.getActionInvoker(actionName)
    this.call[actionName] = invoker

    if (init) init(this, actionParams)

    // Return a function which will invoke the action after a short delay.
    return invoker
  }

  //----------------------------
  //
  //  Promise-based actions
  //
  //----------------------------

  // Create a promise-based action in a compact form.
  // Returns a function which invokes the actionCreator on a short delay,
  //  returning a promise which will resolve with the new domain state.
  //
  // TODOC
  addAsyncAction(actionParams) {
    let {
      name: actionName, // (REQUIRED) Name of the method that kicks things off

      getParams, // (OPTIONAL) Function whose purpose is to transform
      //  argments passed in to a single `params` object
      //  provided to the action to be dispatched.
      //
      //  NOTE: do NOT pass `{ type: <ACTION> }`,
      //  it will be added automatically, outside of this returned params.

      promise: actionPromise, // (REQUIRED) Actual `async` function which does the asynchronous work.
      //
      // Signature `async function actionPromise(params)` where `params`
      //  is the result of `getParams()` above.
      //
      // Successful promise `result` will be passed to `onSuccess`.
      // Failure promise `error` will be passed to `onError`.

      onLoading, // (OPTIONAL) Called automatically BEFORE the `actionPromise` function is called.
      // Signature:  `onLoading(state, params)`
      // Result will be the new redux state.

      onSuccess, // (REQUIRED) Called automatically when the `actionPromise` resolves
      // Signature:  `onSuccess(state, result, params)`
      // Result will be the new redux state.

      onError, // (REQUIRED) Called automatically when the `actionPromise` rejects
      // Signature:  `onError(state, error, params)`
      // Result will be the new redux state.

      ACTION = actionName, // Name for events.  We'll snake/uppercase below.
      // If you don't specify them, we'll derive from `actionName`.
      DONE_ACTION = `${ACTION}_DONE`,

      once // (OPTIONAL) `true` to execute the action only once.
      // `function` to execute action once per parameters
      //  using `this.once(params)` to return hash value
      //  used to determine if these parameters have been used.
    } = actionParams

    // Make sure we have required parameters
    this.assert(actionName, "addPromise(): 'name' parameter is required.", actionParams)
    this.assert(actionPromise, "addPromise(): 'promise' parameter is required.", actionParams)
    this.assert(onSuccess, "addPromise(): 'onSuccess' parameter is required.", actionParams)
    this.assert(onError, "addPromise(): 'onError' parameter is required.", actionParams)

    // Convert case of ACTIONS as per redux standard
    ACTION = _snakeCase(ACTION).toUpperCase()
    DONE_ACTION = _snakeCase(DONE_ACTION).toUpperCase()

    // Bind the methods to the factory
    actionPromise = actionPromise.bind(this)
    if (onLoading) onLoading = onLoading.bind(this)
    onSuccess = onSuccess.bind(this)
    onError = onError.bind(this)

    // Create/register the actionCreator.
    const actionCreator = this.getActionCreator(actionName, ACTION, getParams, once, "ADD_PROMISE")
    // Create action handler function.
    const actionHandler = (state, action) => {
      this.info(`Calling asyncAction ${actionName}, params:`, action.params, action)
      const { params } = action

      // Save current `dispatch` method in the action
      const dispatch = (action.dispatch = this.dispatch)

      // Create a new promise with pointers to its own `resolve` and `reject` methods.
      // This allows us to resolve/reject later.
      if (!action.deferred) action.deferred = makeDeferred()

      const DONE = {
        type: DONE_ACTION,
        params,
        deferred: action.deferred,
        dispatch
      }

      // If we have an `onLoading` handler, call it FIRST
      // If it throws, we'll jump to the error and skip the actionPromise
      if (onLoading) {
        try {
          state = onLoading(state, params)
          this.debug(`${actionName}.onLoading() returned state:`, state)
        } catch (error) {
          DONE.error = error
          DONE.phase = "onLoading"
          dispatch(DONE)
          return state
        }
      }

      let callPromise
      try {
        // Call actionPromise, passing in the `state` and call `params`
        // NOTE: modifications to `state` in `actionPromise` WILL NOT STICK!
        const result = actionPromise(state, params)
        this.debug(`${actionName}.actionPromise() returned result:`, result)
        // if an `Error` is returned directly, throw it so we can catch it below
        if (result instanceof Error) throw result
        // Otherwise ensure we have a promise with the result
        else callPromise = Promise.resolve(result)
      } catch (error) {
        // If we got an error calling the promise function,
        this.debug(`${actionName}.actionPromise() rejected with error:`, error)
        callPromise = Promise.reject(error)
      }

      callPromise
        // If callPromise succeeds, dispatch with `result`
        .then(result => {
          if (result instanceof Error) throw result

          this.info(
            `Completed asyncAction '${actionName}' with result:`,
            typeof result === "string" ? `${result.substr(0, 200)}...}` : result
          )
          DONE.result = result
          dispatch(DONE)
        })

        // If callPromise fails, dispatch with `error`
        .catch(error => {
          this.error(`Error in promise ${actionName}:\n  ${error.message}`, error)
          DONE.error = error
          DONE.phase = "promise"
          dispatch(DONE)
        })

      // Return state
      return state
    }

    const doneHandler = (state, action) => {
      this.debug(`${actionName}.doneHandler called with \n- state: `, state, "\n- action", action)
      let { result, error, params, deferred, dispatch, phase } = action
      // If no error
      if (!error) {
        try {
          // call onSuccess and resolve deferred if we're all good
          state = onSuccess(state, result, params)
          if (deferred && deferred.resolve) setTimeout(() => deferred.resolve(result))
          return state
        } catch (e) {
          error = e
          phase = "onSuccess"
        }
      }

      if (error) {
        try {
          state = onError(state, error, params)
        } catch (e) {
          error = e
          phase = "onError"
        }

        // Dispatch the ASYNC_ERROR handler FIRST...
        setTimeout(() => {
          dispatch({
            type: ReduxFactory.ASYNC_ERROR,
            error,
            actionName,
            phase,
            params
          })
        }, 0)

        // Then reject the deferred result
        if (deferred && deferred.reject) setTimeout(() => deferred.reject(error), 0)
      }
      return state
    }

    // Register action creator / handlers
    this._actionCreators[actionName] = actionCreator
    this._actionHandlers[ACTION] = actionHandler
    this._actionHandlers[DONE_ACTION] = doneHandler

    // Create an action invoker.
    const invoker = this.getActionInvoker(actionName)
    this.call[actionName] = invoker

    // Save promise setup for testing (see `mockAsyncAction()`)
    this._asyncActions[actionName] = {
      actionName,
      actionCreator,
      once,
      actionPromise,
      onLoading,
      onSuccess,
      onError,
      actionHandler,
      doneHandler,
      invoker,
      ACTION,
      DONE_ACTION
    }

    // Return the `invoker` function
    return invoker
  }

  // Helper for testing async actions.
  // Returns promise which yields a `mock` object which you can use
  // to test if promise action and it's `onLoading`, `onSuccess` and `onError` handlers
  // worked as expected.
  //
  // Call with params:
  //  - `actionName`  Action name
  //  - `testParams`
  //    - `state`   OPTIONAL: Initial state to pass to promise.  Defaults to `{}`.
  //    - `args`  OPTIONAL: Array of arguments to action creator.  Defaults to `[]`.
  //
  // Returns `mock` object with:
  //  - `action`    Action name
  //  - `cancelled`   True if action was cancelled (e.g. via `once`)
  //  - `dispatched`  Array of actions dispatched before action resolves().
  //  - `result`    Result of action promise IFF promise resolves.
  //  - `error`     Result of action promise IFF promise rejects.
  //
  // Throws if action can't be found.
  async mockAsyncAction(actionName, testParams = {}) {
    let { state = {}, args = [] } = testParams
    const invoker = this.call[actionName]
    this.assert(invoker, `mockAsyncAction(${actionName}): action invoker not not found`)

    const mock = {
      action: actionName,
      dispatched: []
    }
    this.mockDispatch(actionName, state, mock)

    // Call the invoker and wait for it to complete
    try {
      mock.result = await invoker(...args)
    } catch (e) {
      mock.error = e
    }
    mock.cancelled = mock.dispatched.length === 0

    // Return the mock after the invoker completes
    return mock
  }

  // Mock the `dispatch` method on this object:
  //  - `initialState` starts with initialState
  //  - `mock` is the mock object, we'll add all actions `dispatched` to it
  //    as well as the state after each action (as `ACTION_NAME`)
  // NOTE: this PERMANENTLY CHANGES this object.  Use `restoreDispatch` to undo.
  mockDispatch(actionName, initialState, mock) {
    let state = initialState
    this.dispatch = action => {
      // Record action that was dispatched (ignoring `promise` and `dispatch`)
      const { dispatch, deferred, ...mockAction } = action
      this.debug(`mockAsyncAction(${actionName}): got action `, mockAction)

      mock.dispatched.push(mockAction)

      // Dispatch any actions we know about
      const handler = this._actionHandlers[action.type]
      if (handler) {
        //        mockAction.initialState = state;
        state = handler(state, action)
        //        mockAction.afterState = state;
        mock[action.type] = state
      }
    }
  }

  // Restore dispatch method after `mockDispatch`.
  restoreDispatch() {
    this.assert(this.store, "restoreDispatch(): this.store is not defined")
    this.assert(this.store.dispatch, "restoreDispatch(): this.store.dispatch is not defined")
    this.dispatch = this.store.dispatch
  }

  //----------------------------
  //
  //  Utility functions
  //
  //----------------------------

  // Return an action creator function.
  //  - `ACTION` is the action name
  //  - `getParams` takes action creator arguments and returns `params` payload for the action.
  //  - If `once` is `true`, the action will only be executed once no matter how many times you call it.
  //  - If `once` is a function, `this.once(params)` should return a hash key
  //    which will be used to ensure the function is only called once.
  getActionCreator(actionName, ACTION, getParams, once, addPromise) {
    // Default `getParams` to just return first arg passed in as params.
    if (!getParams) getParams = arg => arg

    // Convert `once = true` to return `undefined` as the key.
    if (once === true) once = () => undefined

    return (...args) => {
      // Call action `getParams` function to massage arguments into action params
      // Calls in the context of the factory.
      const params = getParams.apply(this, args)
      if (params === IGNORE_ACTION) return IGNORE_ACTION

      if (once) {
        const callHashKey = once.call(this, params)
        if (this.hasCalled(actionName, callHashKey)) {
          this.debug(
            `getActionCreator(${actionName}): cancelling for hash key ${this._getCallSignature(
              actionName,
              callHashKey
            )}`
          )
          return IGNORE_ACTION
        }

        this.isCalling(actionName, callHashKey)
      }
      const action = { type: ACTION, params }
      if (addPromise) action.deferred = makeDeferred()
      return action
    }
  }

  // Return a function which invokes a named `action` after a short delay.
  // Returns a promise which will resolve/reject after the action completes:
  //  - if the action throws or returns an Error directly, rejects the promise
  //  - if the action returns a promise, terminates when that promise finishes.
  //  - Otherwise resolves immediately.
  getActionInvoker(actionName) {
    return (...args) => {
      const actionCreator = this._actionCreators[actionName]
      const { dispatch } = this

      try {
        this.assert(actionCreator, `Invoking ${actionName}: action not found`)
        this.assert(dispatch, `invoking ${actionName}: this.dispatch not set`)
      } catch (e) {
        return Promise.reject(e)
      }

      // Return a promise which dispatches the action on a delay.
      return new Promise((resolve, reject) => {
        let action
        // Get the action itself immediately
        try {
          action = actionCreator.apply(this, args)
        } catch (e) {
          // this.warn("actionCreator returned ", e);
          reject(e)
        }
        // If we got `IGNORE_ACTION` back, `once` has cancelled the action.
        // Just return a resolved promise
        if (action === IGNORE_ACTION) {
          return resolve()
        }

        if (action.deferred) {
          action.deferred.then(resolve, reject)
        } else {
          resolve()
        }

        if (isNode) dispatch(action)
        else setTimeout(() => dispatch(action), 0)
      })
    }
  }

  // Return call signature for a `once` call.
  _getCallSignature(actionName, callHashKey) {
    if (callHashKey === undefined) return actionName
    return `${actionName}$${callHashKey}`
  }

  // Registry of things which have already been called.
  CALL_REGISTRY = {}

  // Have we previously called an `action`?
  hasCalled(actionName, callHashKey) {
    const callSignature = this._getCallSignature(actionName, callHashKey)
    return this.CALL_REGISTRY[callSignature]
  }

  // Note that we have are calling an action.
  // `actionName` is the human-friendly name (e.g. `loadPeople`)
  // `callHashKey` is what you'd send back to an action `once` param,
  //  or `undefined` if this applies to all calls of the action.
  isCalling(actionName, callHashKey) {
    const callSignature = this._getCallSignature(actionName, callHashKey)
    this.CALL_REGISTRY[callSignature] = true
  }

  // Reset "hasCalled" reference for `actionName` and `callHashKey`
  resetCall(actionName, callHashKey) {
    const callSignature = this._getCallSignature(actionName, callHashKey)
    delete this.CALL_REGISTRY[callSignature]
  }

  // Reset all calls for use in units tets.
  resetAllCalls() {
    this.CALL_REGISTRY = {}
  }

  //----------------------------
  //
  //  Store helpers
  //
  //----------------------------

  //  Create a store and set everything up.
  //  NOTE: Currently you MUST use this to set up your store if you want to use `ReduxFactory` at all!
  //
  //  Params:
  //  - `factories`       Map of `{ <domain>: <ReduxFactory instance> }`
  //  - `reducers`      Map of misc `{ <domain>: <reducer function> }` for other reducers.
  //  - `initialStoreState`   Initial store state to pass to redux `createStore()`
  //              Initial state defined in `factories`/`reducers` above will override this.
  //  - `middlewares`     Array of middleware functions to apply to the store.
  //              Middlewares will be `composed()` automatically,
  //              and should NOT have `applyMiddlewares()` added to them.
  //              NOTE: any `middlewares` in `factories` will also be added.
  //  - `actionCreators`    Map of random `{ <methodName>: <actionCreator>}` for non-factory action creators.
  //  - `useDevtools`     Set to `true` (default) to add redux devtools automatically.
  static createStore({
    factories = {},
    reducers = {},
    initialStoreState,
    middlewares = [],
    actionCreators = {},
    useDevtools = true
  }) {
    // Create master reducerMap,
    //  starting with a duplicate of `reducers` passed in
    //  and adding reducers for all `domains`
    const reducerMap = { ...reducers }
    _forEach(factories, (factory, domain) => {
      reducerMap[domain] = factory.reducer
    })

    // Set up middlewares passed in with `applyMiddlewares()` and such.
    // Add middlewares defined in factories
    _forEach(factories, (factory, domain) => {
      if (factory.middlewares && factory.middlewares.length) {
        middlewares = middlewares.concat(factory.middlewares)
      }
    })

    // Add error middleware
    middlewares.push(ReduxFactory.asyncErrorMiddleware)

    // Call `applyMiddleware()` to middlewares
    let appliedMiddleware = applyMiddleware(...middlewares)

    // Add redux devtools middleware if appropriate
    if (useDevtools && typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__) {
      appliedMiddleware = compose(
        appliedMiddleware,
        window.__REDUX_DEVTOOLS_EXTENSION__()
      )
    }

    const store = createStore(combineReducers(reducerMap), initialStoreState, appliedMiddleware)

    // Assign to ReduxFactory (assuming that, like the highlander, there can be only one).
    ReduxFactory.store = store

    // Collect actions, bind and assign to store.actions
    store.actions = {}
    store.callSoon = {}

    // Initialize each factory
    const allActions = { ...actionCreators }
    _forEach(factories, (factory, domain) => {
      // Point back to the store and dispatch functions
      factory.store = store
      factory.dispatch = store.dispatch

      // Add to `allActions` map
      Object.assign(allActions, factory._actionCreators)

      // Have factory point to all `actions` and `call` map.
      factory.actions = store.actions
      factory.callSoon = store.callSoon
    })

    // Set up bound action creators for ALL actions for ALL factories
    Object.assign(store.actions, bindActionCreators(allActions, store.dispatch))

    // Set up `call` map which calls the above actions on a delay.
    // Use this to call actions "soon" from within a reducer, success handler, etc.
    Object.keys(store.actions).forEach(key => {
      store.callSoon[key] = function(...args) {
        setTimeout(function() {
          store.actions[key](...args)
        }, 0)
      }
    })

    // Set actions and callSoon on ReduxFactory for uniform access (???)
    ReduxFactory.actions = store.actions
    ReduxFactory.callSoon = store.callSoon

    // log initial store state
    ReduxFactory.debug("Initial store state: ", store.getState())

    // Add `store` and `actions` globals to window for debugging.
    // NOTE: it is NOT SAFE to assume these will be available in your code!!!
    if (typeof window !== "undefined") {
      window.store = store
      window.actions = store.actions
    }

    return store
  }

  // DEBUG: Return the current value of our `domain` in the `store`.
  // NOTE: requires `store` to be set up via `createStore()` above.
  getState() {
    if (!this.store) throw new TypeError("reduxFacotry.getState(): factory must have a 'store' set.")
    if (!this.domain) throw new TypeError("reduxFacotry.getState(): factory must have a 'domain' set.")
    return this.store.getState()[this.domain]
  }

  // Action type for generic saga error handler.
  static ASYNC_ERROR = "ASYNC_ERROR"

  // Add an error handler to catch generic saga errors.
  // All error registered saga error handlers will be called one after another
  //  if there's an error during execution of a saga action.
  //
  // Handler signature:
  //    `handler(dispatch, { storeState, error, params, sagaName })`
  //
  static ASYNC_ERROR_HANDLERS = []
  static addAsyncErrorHandler(handler) {
    ReduxFactory.ASYNC_ERROR_HANDLERS.push(handler)
  }
  // Generic async error middleware function.
  // Automatically added to store in `createStore()`.
  // Add error handlers with `ReduxFactory.addAsyncErrorHandler()`
  static asyncErrorMiddleware = store => next => action => {
    if (action.type === ReduxFactory.ASYNC_ERROR) {
      ReduxFactory.ASYNC_ERROR_HANDLERS.forEach(handler => {
        try {
          handler(store, action)
        } catch (e) {
          ReduxFactory.error("Error in saga error handler", e)
        }
      })
    }
    return next(action)
  }

  //----------------------------
  //
  //  Untracked state
  //  State which doesn't go through redux, because doing so would cause an app redraw
  //  which would be bad for some reason
  //
  //----------------------------

  // Return a piece of untracked state under `key`.
  getUntrackedState(key, defaultValue) {
    const value = this.UNTRACKED_STATE && this.UNTRACKED_STATE[key]
    if (value !== undefined) return value
    return defaultValue
  }

  // Set a untracked state of `key` to `value`.
  // Pass `undefined` for value to clear the state.
  setUntrackedState(key, value) {
    if (!this.UNTRACKED_STATE) this.UNTRACKED_STATE = {}

    if (value === undefined) delete this.UNTRACKED_STATE[key]
    else this.UNTRACKED_STATE[key] = value

    this.debug("setUntrackedState", this.UNTRACKED_STATE)
  }

  //----------------------------
  //
  //  Preferences
  //  Preferences are stored in localStorage to survive browser reloads.
  //
  //  Getting/setting prefs DOES NOT update our redux state.
  //  If you ALSO want to update redux state, do that yourself.
  //
  //----------------------------

  // Return a stored `pref` value.
  getPref(pref, defaultValue) {
    const value = getPref(pref)
    if (value !== undefined) return value
    return defaultValue
  }

  // Set a `pref` to `value`.
  // Pass `undefined` for value to clear the state.
  setPref(pref, value) {
    setPref(pref, value)
  }
}

// Make class debuggable
// We'll make isntances debuggable automatically on construction
addDebugMethods(ReduxFactory, "ReduxFactory", DebugLevel.WARN)
