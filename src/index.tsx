import "babel-polyfill";

import React from "react";
import * as ReactDom from "react-dom";
import Root from "./Root";

export default Root;

// Render your app
if (typeof document !== "undefined") {
  const renderMethod = module.hot ? ReactDom.render : ReactDom.hydrate || ReactDom.render;
  const render = (Comp: any) => {
    renderMethod(<Comp />, document.getElementById("root"));
  };

  // Render!
  render(Root);
}
