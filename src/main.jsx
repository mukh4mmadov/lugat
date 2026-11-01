import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion } from "framer-motion";
import App from "./App.jsx";
import PWAUpdate from "./components/PWAUpdate";
import "./index.css";
import { store } from "./store";
import { i18nReady } from "./lib/i18n";
import { initWordOverrides } from "./lib/wordOverrides";
import { dataReady } from "./data";
import { captureReferral } from "./lib/growth";

captureReferral();

const motionFeatures = () => import("./lib/motionFeatures").then((module) => module.default);

// Render once the interface language and the lesson words have loaded
// (both are separate chunks); admin word corrections apply on top.
Promise.allSettled([i18nReady, dataReady.then(initWordOverrides)]).then(() => ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LazyMotion features={motionFeatures} strict>
          <App />
          <PWAUpdate />
        </LazyMotion>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
));
