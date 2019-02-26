// Common imports
import React from "react";
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";

function renderApp() {
  const { store, setPrefKey } = require("./all.js");
  require("./debug.js");

  setPrefKey("spell_editor");

  const { SpellEditor } = require("./SpellEditor.jsx");
  ReactDOM.render(
    <Provider store={store}>
      <SpellEditor />
    </Provider>,
    document.getElementById('react-root')
  );
};

renderApp();

module.hot.accept(renderApp);
