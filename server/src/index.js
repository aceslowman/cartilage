import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import RootStore from "./stores/RootStore";
import GLStore from "./stores/GLStore";

import "regenerator-runtime/runtime.js";

const root = RootStore.create({
  gl: GLStore.create({ viewer: { viewType: "Globe" } }),
  alerts: {},
});

ReactDOM.render(<App store={root} />, document.getElementById("APP"));
