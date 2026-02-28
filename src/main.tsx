import React from "react";
import { SplashScreen } from "@/components";
import { NetworkOfflineBanner } from "@/features";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./styles/globals.css";
import "./styles/themes.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SplashScreen />
    <NetworkOfflineBanner />
    <App />
  </React.StrictMode>
);
