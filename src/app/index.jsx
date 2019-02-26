// Common imports
import React from "react";
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";

import {
  store,
  setPrefKey
} from "./all.js";

import "./debug.js";

setPrefKey("spell_editor");

function renderApp() {
  const SpellEditor = require("./SpellEditor.jsx").default;
  ReactDOM.render(
    <Provider store={store}>
      <SpellEditor />
    </Provider>,
    document.getElementById('react-root')
  );
};

renderApp();

//module.hot.accept(renderApp);
