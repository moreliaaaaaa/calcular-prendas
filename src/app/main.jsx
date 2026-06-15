import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/modules/base.css";
import "../styles/react-fixes.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
