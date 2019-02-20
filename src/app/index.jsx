// Common imports
import "@babel/polyfill";
import React from "react";
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";

import store from "../redux/store.js";
import "./debug.js";
import { setPrefKey } from "../utils/prefs.js";

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
