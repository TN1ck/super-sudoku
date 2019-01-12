import "babel-polyfill";

import React from "react";
import * as ReactDOM from "react-dom";
import {AppContainer} from "react-hot-loader";
import Root from "./Root";

export default Root;

// Render your app
if (typeof document !== "undefined") {
  const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate || ReactDOM.render;
  const render = Comp => {
    renderMethod(
      <AppContainer>
        <Comp />
      </AppContainer>,
      document.getElementById("root"),
    );
  };

  // Render!
  render(Root);

  // Hot Module Replacement
  if (module.hot) {
    module.hot.accept("./Root", () => render(require("./Root").default));
  }
}
