// Common imports
import React from "react"
import ReactDOM from "react-dom"

require("./debug.js")

const { SpellEditor } = require("./SpellEditor.jsx")

function renderApp() {
  ReactDOM.render(
    <SpellEditor />,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
}

renderApp()

// module.hot.accept(renderApp);
