// Common imports
import React from "react";
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";


const { store } = require("./all.js");
require("./debug.js");

function renderApp() {
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
