// Common imports
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"

require("./debug.js")

const { store } = require("./all.js")
const { SpellEditor } = require("./SpellEditor.jsx")

function renderApp() {
  ReactDOM.render(
    <Provider store={store}>
      <SpellEditor />
    </Provider>,
    document.getElementById("react-root")
  )
}

renderApp()

//module.hot.accept(renderApp);
