// Common imports
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

require("./debug.js")

const { store } = require("./index.js")
const { SpellEditor } = require("./SpellEditor.jsx")

function renderApp() {
  ReactDOM.render(
    <Provider store={store}>
      <SpellEditor />
    </Provider>,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
}

renderApp()

// module.hot.accept(renderApp);
