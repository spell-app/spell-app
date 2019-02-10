// Common imports
import React from "react";
import ReactDOM from 'react-dom';

// Parser
import parser from "../rules/spell/index.js";

function renderApp() {
  const SpellEditor = require("./SpellEditor.jsx").default;
  ReactDOM.render(
    <SpellEditor />,
    document.getElementById('react-root')
  );
};

renderApp();

//module.hot.accept(renderApp);
