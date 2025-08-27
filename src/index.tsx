import React from "react";
import {createRoot} from "react-dom/client";
import './i18n';

// Your top level component
import Root from "./Root";
import "./main.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
