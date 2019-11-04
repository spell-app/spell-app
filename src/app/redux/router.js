//----------------------------
//
//  Router Reducer for ReduxFactory usage
//
//----------------------------

import React from "react"

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
import { clearAllPrefs } from "./utils/prefs"

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
    window.location.href = ""
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
      window.location.href = url
    } else {
      // FORCE reload of the same page from the "server".
      window.location.reload(true)
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

// Show the `upload JSON fixtures` page
export const _showUploadJSONPage = _router.addAction({
  name: "showUploadJSONPage",
  ACTION: "GO_TO",
  getParams() {
    return { url: getJSONUploadURL() }
  }
})

//----------------------------
//
//  Server URL
//  For flexibility in the Cordova app, we allow you to override
//    `appConfig.API_SERVER` to point to a different machine.
//  Note that this will only work on desktop if you have
//   'Access-Control-Allow-Origin'  headers set up on the server.
//
export const _setServerURL = _router.addAction({
  name: "setServerURL",
  getParams(url) {
    // Pass through URL string if provided
    if (typeof url === "string" && url) return url

    // Otherwise prompt for url.
    url = _router.getPref("API_SERVER") || appConfig.API_SERVER || ""

    // Convert `{{}}` to native value
    if (url.includes("{{")) url = expandAppConfigURL(url)

    url = prompt("URL to hit for data requests?", url)

    if (url == null) url = undefined
    return url
  },
  handler(router, API_SERVER) {
    // Save in appConfig for non-reduxy things
    appConfig.API_SERVER = API_SERVER
    // Save as preference
    _router.setPref("API_SERVER", API_SERVER)
    // Re-start the app in a tick
    _reloadPage()
    // Return router so redux doesn't have a fit.
    return router
  }
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
//  Overlay actions
//
//  Overlays are displayed by the current top-level `Page` component so that:
//  - they are rendered OUT of the DOM context of the button/whatever that invoked them
//  - there is only one overlay displayed at a time.
//

//  Display an overlay specfied by `overlayId`.
//  NOTE: it's preferred to use the overlay-specific constructors below.
export const _showOverlay = _router.addAction({
  name: "showOverlay",
  getParams(overlayId, overlayProps) {
    return {
      overlayId,
      overlayProps
    }
  },
  handler(router, { overlayId, overlayProps }) {
    const { overlayId: currentOverlayId } = router

    // Sanity check, there should be only one overlay visible at a time
    if (currentOverlayId && currentOverlayId !== overlayId)
      _router.warn(`SHOW_OVERLAY: attempting to open '${overlayId}' when '${currentOverlayId}' is open.`)

    // Remember the overlay as a pref for `resumeAfterActivity` below
    setLastOverlay({ overlayId, overlayProps })

    return {
      ...router,
      overlayId,
      overlayProps
    }
  }
})

//  Hide a particular overlay.
//  If you want to hide WHATEVER overlay is visible, don't pass overlayId.
export const _hideOverlay = _router.addAction({
  name: "hideOverlay",
  handler(router, overlayId) {
    // If no overlay visible, forget it
    if (!router.overlayId) {
      return router
    }

    // Otherwise if they specified a specific overlay, only close for that one.
    if (overlayId && router.overlayId !== overlayId) {
      _router.warn(`HIDE_OVERLAY: attempting to close '${overlayId}' when current overlay is '${router.overlayId}'.`)
      return { ...router }
    }

    // Clear overlay pref
    setLastOverlay(undefined)

    // Return everything other than overlay props
    const { overlayId: openOverlayId, overlayProps, ...newRouterState } = router
    return newRouterState
  }
})

//----------------------------
//
//  Page visibility
//
//  Watch for the `uiHidden` and `uiShown` events and trigger redux actions on change.
//  see: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
//
//  NOTE: We only do this on desktop (NOT on Cordova).
//    On cordova we do this with `resumeAfterActivity`
//

let _lastHiddenTime
export const _uiHidden = _router.addAction({
  name: "uiHidden",
  handler(appState) {
    _lastHiddenTime = Date.now()
    _router.info("app hidden at ", _lastHiddenTime)
    return { ...appState }
  }
})

// UI has been shown on desktop (inactive tab was activated).
// SIDE_EFFECT:  If more than `appConfig.autoRefreshFrequency` msec since hidden,
//         we'll refesh the page to get fresh data.
export const _uiShown = _router.addAction({
  name: "uiShown",
  handler(appState) {
    const hiddenDuration = _lastHiddenTime ? Date.now() - _lastHiddenTime : 0
    _router.info("app shown again after ", hiddenDuration / 1000, " sec")

    // Reload the app if we've been hidden for a while
    if (hiddenDuration > appConfig.autoRefreshFrequency) setTimeout(_reloadPage, 500)

    return { ...appState }
  }
})

// Set up event `visibilityChanged` event for different browsers, but NOT for cordova.
//
// We use this to generate `uiHidden` and `uiShown` events
// when the browser window is shown/hidden.
//
// Figure out right props for this browser
let _hiddenProp, _visibilityChangeEvent
if (typeof document.hidden !== "undefined") {
  // Opera 12.10 and Firefox 18 and later support
  _hiddenProp = "hidden"
  _visibilityChangeEvent = "visibilitychange"
} else if (typeof document.webkitHidden !== "undefined") {
  _hiddenProp = "webkitHidden"
  _visibilityChangeEvent = "webkitvisibilitychange"
}

// Add event handler to invoke `uiHidden` or `uiShown` event
document.addEventListener(
  _visibilityChangeEvent,
  function(event) {
    const hidden = document[_hiddenProp]
    if (hidden) _uiHidden()
    else _uiShown()
  },
  false
)

//----------------------------
//
//  Utility
//

// Given a router `location`, return a simplified `url` for it.
export function urlForLocation(location) {
  if (!location) return ""

  let { pathname = "", search = "", hash = "" } = location
  return `${pathname}${search}${hash}`
}
