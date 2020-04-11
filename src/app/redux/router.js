/* eslint-disable no-use-before-define */
//----------------------------
//
//  Router Reducer for ReduxFactory usage
//
//----------------------------

import React from "react"
import global from "global"

import { BrowserRouter } from "react-router-dom"
import createBrowserHistory from "history/createBrowserHistory"

import {
  ConnectedRouter as _ConnectedRouter,
  routerMiddleware,
  routerReducer,
  push,
  replace,
  goBack,
  goForward
} from "react-router-redux"

import ReduxFactory from "./ReduxFactory"
import { clearAllPrefs } from "./util/prefs"

// Create `history` object we'll use to navigate.
// NOTE: We're ALWAYS using HASH-based history now to minimize web server configuration.
//     It is REQUIRED for cordova in any case.
export const history = createBrowserHistory()

// Wrap `ConnectedRouter` to include history above.
// Use to wrap your top-level RR <Switch> component.
export function ConnectedRouter(props) {
  const router = React.createElement(_ConnectedRouter, { history, ...props })
  return React.createElement(BrowserRouter, null, router)
}

// History factory
const _router = new ReduxFactory({
  domain: "router",

  initialState: {
    // Current url
    url: undefined, // Url as string
    location: undefined, // Current url as react-router `location`

    // Current overlay name / props
    overlayId: undefined,
    overlayProps: undefined
  },

  // Automatically attach `routerMiddleware`
  middlewares: [routerMiddleware(history)],

  // debug
  history,
  push
})
export default _router

// Wrap our `normal` reducer with the `routerReducer` from `react-router-redux`
// The ensures that `reducer.location` will be set to the current location.
// See:  https://github.com/ReactTraining/react-router/tree/master/packages/react-router-redux
_router.wrapReducer(routerReducer)

//----------------------------
//
//  Reload / redraw / restart
//

//  "Hard" restart of the app.
//  Clears all prefernces and then reloads the page.
//  This will start us over at the default page.
export const _restartApp = _router.addAction({
  name: "restartApp",
  handler(router) {
    // Clear ALL preferences.
    clearAllPrefs()
    // Clear the `href` which stores where we are in the app
    // This will force the app to redraw on desktop + Cordova/Android.
    global.location.href = ""
    // Return router so redux doesn't have a fit.
    return router
  }
})

//  Reload the current page.
//  This also forces us to reload all data from the server.
//  We *should* go back to the same page we were on before -- if not, it's a bug!
export const _reloadPage = _router.addAction({
  name: "reloadPage",
  handler(router, url) {
    const currentURL = urlForLocation(router.location)
    this.info("reloadPage()", "\n- url:", url, "\n- currentURL:", currentURL)

    if (url && url !== currentURL) {
      global.location.href = url
    } else {
      // FORCE reload of the same page from the "server".
      global.location.reload(true)
    }
    // Return router so redux doesn't have a fit.
    return router
  }
})

// Force a redraw of the app.
export const _redrawApp = _router.addAction({
  name: "redrawApp",
  handler(router) {
    return { ...router }
  }
})

// Go to some `url`.
//  `pageProps` will be passed to the page (see `/pages/PageRouter.js`)
//
// If `url` is the same as `router.location` (indicating that we're on that page already)
//  does `history.replaceState()`, otherwise does a `history.pushState()`.
export const _goTo = _router.addAction({
  name: "goTo",
  getParams(url) {
    return { url }
  },
  handler(router, { url }) {
    const currentURL = urlForLocation(router.location)
    const isSameURL = url === currentURL
    console.info("_goTo()", "\n-url:", url, "\n-currentURL:", currentURL, "\n-isSameURL:", isSameURL)

    // Navigate on a delay to avoid redux error message
    setTimeout(() => {
      if (isSameURL) history.replace(url)
      else history.push(url)
    }, 0)

    // Remember url
    setLastAppURL(url)

    return { ...router }
  }
})

// `pushHistory` action
export const _pushHistory = _router.addAction({
  name: "pushHistory",
  actionCreator: push
})

// `replaceHistory` action
export const _replaceHistory = _router.addAction({
  name: "replaceHistory",
  actionCreator: replace
})

// `historyGoBack` action
export const _goBack = _router.addAction({
  name: "goBack",
  actionCreator: goBack
})

// `historyGoForward` action
export const _goForward = _router.addAction({
  name: "goForward",
  actionCreator: goForward
})

//----------------------------
//
//  URLs and Overlay storage
//  - `getCurrentAppURL()`    -- url we're showing now
//  - `(g|s)etLastAppURL()`   -- url we were last showing (persists across reload)
//  - `(g|s)etLastOverlay()`  -- `{ overlayId, overlayProps }` for last overlay (persists)
//

// Return the current location as a `url` string.
// BREAKS ENCAPSULATION
export function getCurrentAppURL() {
  const { location } = _router.store.getState().router
  return urlForLocation(location)
}

// Get/set last `url` we were showing as a pref so it survives reload.
export function getLastAppURL() {
  return _router.getPref("lastAppURL")
}
export function setLastAppURL(url = getCurrentAppURL()) {
  _router.setPref("lastAppURL", url)
}

// Get/set last `overlay` we were showing as a pref so it survives reload.
export function getLastOverlay() {
  return _router.getPref("lastAppOverlay")
}
export function setLastOverlay(overlay) {
  _router.setPref("lastAppOverlay", overlay)
}

//----------------------------
//
//  Utility
//

// Given a router `location`, return a simplified `url` for it.
export function urlForLocation(location) {
  if (!location) return ""

  const { pathname = "", search = "", hash = "" } = location
  return `${pathname}${search}${hash}`
}
