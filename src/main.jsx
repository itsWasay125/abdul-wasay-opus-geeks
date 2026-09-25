import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/fonts.css";
import "./App.css";
/* Every @media block from App.css, kept in the same cascade position it
   had when it was inline. See the header in that file. */
import "./styles/responsive.css";

/* Ported design system. Loads after App.css so the og-* sections win inside
   their own subtrees; og-port.css is last and carries the port deltas. */
import "./styles/og/og-tokens.css";
import "./styles/og/og-ui.css";
import "./styles/og/og-button.css";
import "./styles/og/og-header.css";
import "./styles/og/og-footer.css";
import "./styles/og/og-liquid-glass.css";
import "./styles/og/og-hero.css";
import "./styles/og/og-toolkit.css";
import "./styles/og/og-about-sections.css";
import "./styles/og/og-spline-banner.css";
import "./styles/og/og-port.css";
import "./styles/og/og-project.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
