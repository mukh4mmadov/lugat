import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import PWAUpdate from "./components/PWAUpdate";
import "./index.css";
import { store } from "./store";
import "./lib/i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <PWAUpdate />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
