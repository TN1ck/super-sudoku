import React from "react";
import {createRoot} from "react-dom/client";
import './i18n'; // ou './i18n' selon l’emplacement

// Your top level component
import Root from "./Root";
import "./main.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
