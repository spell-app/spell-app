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
  const { App } = require("./App.jsx");
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('react-root')
  );
};

renderApp();

//module.hot.accept(renderApp);
