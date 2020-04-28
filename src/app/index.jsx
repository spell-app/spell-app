// Common imports
import React from "react"
import ReactDOM from "react-dom"

import "./debug"
import { store } from "./store"
import { SpellEditor } from "./SpellEditor"

function renderApp() {
  ReactDOM.render(
    <SpellEditor />,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
  store.start()
}

renderApp()

// module.hot.accept(renderApp);
