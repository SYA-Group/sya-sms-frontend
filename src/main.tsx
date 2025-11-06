import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "modern-normalize/modern-normalize.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </StrictMode>
);
